import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getSessionUser, isAdminRole } from "@/lib/auth";
import { AdminOverviewView } from "./overview-view";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const user = await getSessionUser();
  if (!user || !isAdminRole(user.role)) redirect("/espace");

  const [members, newMembers, posts, groups, events, achievements, gallery, pendingReports] =
    await Promise.all([
      db.user.count({ where: { isBlocked: false } }),
      db.user.count({ where: { isBlocked: false, createdAt: { gte: new Date(Date.now() - 7 * 864e5) } } }),
      db.post.count(),
      db.group.count(),
      db.event.count(),
      db.achievement.count({ where: { isPublished: true } }),
      db.galleryMedia.count({ where: { isPublished: true } }),
      db.report.count({ where: { status: "PENDING" } }),
    ]);

  const recentUsers = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true, firstName: true, lastName: true, avatarUrl: true, profession: true,
      country: true, isDemo: true, createdAt: true,
    },
  });

  return (
    <AdminOverviewView
      stats={{ members, newMembers, posts, groups, events, achievements, gallery, pendingReports }}
      recentUsers={recentUsers.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      }))}
      adminName={user.firstName}
    />
  );
}
