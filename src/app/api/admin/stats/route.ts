import { db } from "@/lib/db";
import { getSessionUser, isModeratorRole } from "@/lib/auth";
import { ok, fail } from "@/lib/api-utils";

// GET /api/admin/stats — statistiques réelles de la plateforme
export async function GET() {
  const user = await getSessionUser();
  if (!user) return fail("Authentification requise.", 401);
  if (!isModeratorRole(user.role)) return fail("Accès réservé à l'équipe OCD.", 403);

  const [members, newMembers, posts, groups, events, pendingReports, unreadNotifications] =
    await Promise.all([
      db.user.count({ where: { isBlocked: false } }),
      db.user.count({ where: { isBlocked: false, createdAt: { gte: new Date(Date.now() - 7 * 864e5) } } }),
      db.post.count(),
      db.group.count(),
      db.event.count(),
      db.report.count({ where: { status: "PENDING" } }),
      db.notification.count({ where: { isRead: false } }),
    ]);

  const recentUsers = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, firstName: true, lastName: true, avatarUrl: true, profession: true, country: true, createdAt: true, isDemo: true },
  });

  const recentPosts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
  });

  return ok({
    stats: { members, newMembers, posts, groups, events, pendingReports, unreadNotifications },
    recentUsers,
    recentPosts,
  });
}
