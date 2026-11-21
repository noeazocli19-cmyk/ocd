import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ok, fail, parseBody } from "@/lib/api-utils";

const patchSchema = z.object({
  title: z.string().min(2).max(160).optional(),
  description: z.string().min(10).max(3000).optional(),
  category: z.string().max(60).optional(),
  date: z.string().optional().nullable(),
  status: z.enum(["EN_COURS", "REALISE", "A_VENIR"]).optional(),
  imageUrl: z.string().max(500).optional().nullable(),
  videoUrl: z.string().max(500).optional().nullable(),
  results: z.array(z.object({ label: z.string().max(120), value: z.string().max(60) })).max(8).optional().nullable(),
  isPublished: z.boolean().optional(),
  order: z.number().int().min(0).max(999).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;

  const parsed = await parseBody(request, patchSchema);
  if (parsed.response) return parsed.response;
  const data = parsed.data;

  const updateData: Record<string, unknown> = {
    title: data.title,
    description: data.description,
    category: data.category,
    status: data.status,
    imageUrl: data.imageUrl,
    videoUrl: data.videoUrl,
    isPublished: data.isPublished,
    order: data.order,
  };
  if (data.date !== undefined) updateData.date = data.date ? new Date(data.date) : null;
  if (data.results !== undefined) updateData.results = data.results ? JSON.stringify(data.results) : null;
  Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

  const updated = await db.achievement.update({ where: { id }, data: updateData });
  return ok(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;

  await db.achievement.delete({ where: { id } });
  return ok({ success: true });
}
