import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ok, parseBody } from "@/lib/api-utils";

const announcementSchema = z.object({
  title: z.string().min(2).max(160),
  body: z.string().min(5).max(3000),
  imageUrl: z.string().max(500).optional().nullable(),
  isPublished: z.boolean().default(false),
});

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const items = await db.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });
  return ok({ items });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const parsed = await parseBody(request, announcementSchema);
  if (parsed.response) return parsed.response;

  const created = await db.announcement.create({
    data: { ...parsed.data, authorId: auth.user.id, imageUrl: parsed.data.imageUrl || null },
  });
  return ok(created, 201);
}
