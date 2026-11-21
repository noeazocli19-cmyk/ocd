import { db } from "@/lib/db";
import { requireUser, ok, fail } from "@/lib/api-utils";

// GET /api/groups/[id] — détail du groupe + publications
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const user = auth.user;
  const { id } = await params;

  const group = await db.group.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      members: {
        include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, profession: true } } },
        orderBy: { joinedAt: "asc" },
      },
      _count: { select: { members: true, posts: true } },
    },
  });

  if (!group) return fail("Groupe introuvable.", 404);

  const posts = await db.post.findMany({
    where: { groupId: id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, profession: true, isDemo: true } },
      _count: { select: { comments: true, reactions: true } },
      comments: {
        take: 2,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const myMembership = group.members.find((m) => m.userId === user.id) ?? null;

  return ok({
    group: { ...group, members: group.members.map((m) => ({ ...m, user: m.user })) },
    posts,
    myMembership,
  });
}
