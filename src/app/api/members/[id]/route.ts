import { db } from "@/lib/db";
import { requireUser, ok, fail } from "@/lib/api-utils";

// GET /api/members/[id] — profil public complet
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id } = await params;

  const member = await db.user.findUnique({
    where: { id },
    select: {
      id: true, firstName: true, lastName: true, avatarUrl: true, coverUrl: true,
      bio: true, country: true, city: true, profession: true, domain: true,
      experienceLevel: true, interests: true, website: true, linkedin: true,
      twitter: true, instagram: true, isDemo: true, createdAt: true,
      skills: { select: { id: true, name: true } },
      experiences: { orderBy: { startDate: "desc" } },
      projects: { orderBy: { createdAt: "desc" } },
      _count: {
        select: {
          posts: true,
          followsSent: true,
          followsReceived: true,
          groupMemberships: true,
        },
      },
    },
  });

  if (!member) return fail("Membre introuvable.", 404);

  // État de la relation avec l'utilisateur courant
  const [connection, iFollow, followsMe] = await Promise.all([
    db.connection.findFirst({
      where: {
        OR: [
          { senderId: auth.user.id, receiverId: id },
          { senderId: id, receiverId: auth.user.id },
        ],
      },
    }),
    db.follow.findUnique({
      where: { followerId_followingId: { followerId: auth.user.id, followingId: id } },
    }),
    db.follow.findUnique({
      where: { followerId_followingId: { followerId: id, followingId: auth.user.id } },
    }),
  ]);

  const posts = await db.post.findMany({
    where: { userId: id },
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
    take: 10,
  });

  return ok({
    member,
    posts,
    relation: {
      connection: connection
        ? { id: connection.id, status: connection.status, senderId: connection.senderId }
        : null,
      iFollow: Boolean(iFollow),
      followsMe: Boolean(followsMe),
    },
  });
}
