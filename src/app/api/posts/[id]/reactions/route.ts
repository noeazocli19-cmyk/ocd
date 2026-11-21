import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, ok, fail, parseBody } from "@/lib/api-utils";

const REACTION_TYPES = ["LIKE", "CELEBRATE", "INSPIRED", "SUPPORT"] as const;

const reactionSchema = z.object({
  type: z.enum(REACTION_TYPES).default("LIKE"),
});

// POST = toggle la réaction de l'utilisateur courant
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id } = await params;

  const parsed = await parseBody(request, reactionSchema);
  if (parsed.response) return parsed.response;

  const post = await db.post.findUnique({ where: { id }, select: { id: true, userId: true } });
  if (!post) return fail("Publication introuvable.", 404);

  const existing = await db.reaction.findUnique({
    where: { postId_userId_type: { postId: id, userId: auth.user.id, type: parsed.data.type } },
  });

  let active: boolean;
  if (existing) {
    await db.reaction.delete({ where: { id: existing.id } });
    active = false;
  } else {
    await db.reaction.create({
      data: { postId: id, userId: auth.user.id, type: parsed.data.type },
    });
    active = true;

    if (post.userId !== auth.user.id) {
      const already = await db.notification.findFirst({
        where: {
          userId: post.userId,
          type: "REACTION",
          linkUrl: `/espace/fil?post=${id}`,
        },
      });
      if (!already) {
        await db.notification.create({
          data: {
            userId: post.userId,
            type: "REACTION",
            title: `${auth.user.firstName} ${auth.user.lastName} a réagi à ta publication`,
            linkUrl: `/espace/fil?post=${id}`,
          },
        });
      }
    }
  }

  const counts = await db.reaction.groupBy({
    by: ["type"],
    where: { postId: id },
    _count: { type: true },
  });

  return ok({ active, counts });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id } = await params;

  const counts = await db.reaction.groupBy({
    by: ["type"],
    where: { postId: id },
    _count: { type: true },
  });
  const mine = await db.reaction.findMany({
    where: { postId: id, userId: auth.user.id },
    select: { type: true },
  });

  return ok({ counts, mine: mine.map((m) => m.type) });
}
