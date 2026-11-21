import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ok, parseBody } from "@/lib/api-utils";

const patchSchema = z.object({
  title: z.string().min(2).max(160).optional(),
  description: z.string().min(10).max(3000).optional(),
  category: z.string().max(60).optional(),
  imageUrl: z.string().max(500).optional().nullable(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  isOnline: z.boolean().optional(),
  onlineUrl: z.string().max(300).optional().nullable(),
  capacity: z.number().int().min(1).max(10000).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]).optional(),
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
    imageUrl: data.imageUrl,
    location: data.location,
    isOnline: data.isOnline,
    onlineUrl: data.onlineUrl,
    capacity: data.capacity,
    status: data.status,
  };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

  const updated = await db.event.update({ where: { id }, data: updateData });
  return ok(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;

  await db.event.delete({ where: { id } });
  return ok({ success: true });
}
