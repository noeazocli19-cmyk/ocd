import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, ok, fail, parseBody } from "@/lib/api-utils";

const commentSchema = z.object({
  content: z.string().min(1, "Le commentaire ne peut pas être vide.").max(1000),
  parentId: z.string().optional().nullable(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await db.comment.findMany({
    where: { postId: id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, profession: true } },
      replies: {
        include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
        orderBy: { createdAt: "asc" as const },
      },
    },
    orderBy: { createdAt: "asc" as const },
  });
  return ok({ items: comments });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id } = await params;

  const parsed = await parseBody(request, commentSchema);
  if (parsed.response) return parsed.response;

  const post = await db.post.findUnique({ where: { id }, select: { id: true, userId: true } });
  if (!post) return fail("Publication introuvable.", 404);

  const comment = await db.comment.create({
    data: {
      content: parsed.data.content,
      postId: id,
      userId: auth.user.id,
      parentId: parsed.data.parentId || null,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, profession: true } },
      replies: true,
    },
  });

  // Notification pour l'auteur de la publication
  if (post.userId !== auth.user.id) {
    await db.notification.create({
      data: {
        userId: post.userId,
        type: "COMMENT",
        title: `${auth.user.firstName} ${auth.user.lastName} a commenté ta publication`,
        body: parsed.data.content.slice(0, 120),
        linkUrl: "/espace/fil",
      },
    });
  }

  return ok(comment, 201);
}
