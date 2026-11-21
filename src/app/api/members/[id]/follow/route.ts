import { db } from "@/lib/db";
import { requireUser, ok, fail } from "@/lib/api-utils";

// POST /api/members/[id]/follow — suivre / ne plus suivre
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id } = await params;

  if (id === auth.user.id) return fail("Action impossible.", 400);

  const target = await db.user.findUnique({ where: { id }, select: { id: true } });
  if (!target) return fail("Membre introuvable.", 404);

  const existing = await db.follow.findUnique({
    where: { followerId_followingId: { followerId: auth.user.id, followingId: id } },
  });

  if (existing) {
    await db.follow.delete({ where: { id: existing.id } });
    return ok({ following: false });
  }

  await db.follow.create({ data: { followerId: auth.user.id, followingId: id } });
  return ok({ following: true });
}
