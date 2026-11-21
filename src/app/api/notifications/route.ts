import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, ok, parseBody } from "@/lib/api-utils";

const readSchema = z.object({
  ids: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});

// GET /api/notifications
export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const items = await db.notification.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await db.notification.count({
    where: { userId: auth.user.id, isRead: false },
  });

  return ok({ items, unreadCount });
}

// POST /api/notifications — marquer comme lu
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const parsed = await parseBody(request, readSchema);
  if (parsed.response) return parsed.response;

  if (parsed.data.all) {
    await db.notification.updateMany({
      where: { userId: auth.user.id, isRead: false },
      data: { isRead: true },
    });
  } else if (parsed.data.ids?.length) {
    await db.notification.updateMany({
      where: { userId: auth.user.id, id: { in: parsed.data.ids } },
      data: { isRead: true },
    });
  }

  return ok({ success: true });
}
