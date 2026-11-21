import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ok, parseBody } from "@/lib/api-utils";

const patchSchema = z.object({
  url: z.string().max(500).optional(),
  type: z.enum(["IMAGE", "VIDEO"]).optional(),
  category: z.string().max(60).optional(),
  title: z.string().max(120).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  order: z.number().int().min(0).max(999).optional(),
  isPublished: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;

  const parsed = await parseBody(request, patchSchema);
  if (parsed.response) return parsed.response;

  const updated = await db.galleryMedia.update({ where: { id }, data: parsed.data });
  return ok(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;

  await db.galleryMedia.delete({ where: { id } });
  return ok({ success: true });
}
