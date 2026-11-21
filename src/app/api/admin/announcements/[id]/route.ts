import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ok, parseBody } from "@/lib/api-utils";

const patchSchema = z.object({
  title: z.string().min(2).max(160).optional(),
  body: z.string().min(5).max(3000).optional(),
  imageUrl: z.string().max(500).optional().nullable(),
  isPublished: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;

  const parsed = await parseBody(request, patchSchema);
  if (parsed.response) return parsed.response;

  const updated = await db.announcement.update({ where: { id }, data: parsed.data });

  if (parsed.data.isPublished) {
    // Notifier tous les membres actifs d'une nouvelle annonce
    const members = await db.user.findMany({
      where: { isBlocked: false },
      select: { id: true },
      take: 500,
    });
    if (members.length <= 100) {
      await db.notification.createMany({
        data: members
          .filter((m) => m.id !== auth.user.id)
          .map((m) => ({
            userId: m.id,
            type: "ANNOUNCEMENT",
            title: `Annonce OCD : ${updated.title}`,
            linkUrl: "/espace",
          })),
      });
    }
  }

  return ok(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;

  await db.announcement.delete({ where: { id } });
  return ok({ success: true });
}
