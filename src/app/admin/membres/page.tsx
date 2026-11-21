import { db } from "@/lib/db";
import { MembresAdminView } from "./membres-view";

export const dynamic = "force-dynamic";

export default async function AdminMembresPage() {
  const users = await db.user.findMany({
    select: {
      id: true, firstName: true, lastName: true, email: true, avatarUrl: true,
      role: true, country: true, city: true, profession: true, isDemo: true,
      isBlocked: true, createdAt: true,
      _count: { select: { posts: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return (
    <MembresAdminView
      initialItems={users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      }))}
    />
  );
}
