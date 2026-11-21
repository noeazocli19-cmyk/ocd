import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, ok, fail, parseBody } from "@/lib/api-utils";

const updatePostSchema = z.object({
  content: z.string().min(1).max(3000).optional(),
  category: z.string().max(40).optional(),
  imageUrl: z.string().max(500).nullable().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id } = await params;

  const parsed = await parseBody(request, updatePostSchema);
  if (parsed.response) return parsed.response;

  const post = await db.post.findUnique({ where: { id } });
  if (!post) return fail("Publication introuvable.", 404);
  if (post.userId !== auth.user.id) return fail("Tu ne peux modifier que tes publications.", 403);

  const updated = await db.post.update({ where: { id }, data: parsed.data });
  return ok(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id } = await params;

  const post = await db.post.findUnique({ where: { id } });
  if (!post) return fail("Publication introuvable.", 404);

  const isOwner = post.userId === auth.user.id;
  const isModerator = ["MODERATOR", "ADMIN", "SUPER_ADMIN"].includes(auth.user.role);
  if (!isOwner && !isModerator) return fail("Action non autorisée.", 403);

  await db.post.delete({ where: { id } });
  return ok({ success: true });
}
