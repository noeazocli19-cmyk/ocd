import { db } from "@/lib/db";
import { AnnoncesAdminView } from "./annonces-view";

export const dynamic = "force-dynamic";

export default async function AdminAnnoncesPage() {
  const items = await db.announcement.findMany({
    include: { author: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <AnnoncesAdminView
      initialItems={items.map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body,
        isPublished: a.isPublished,
        author: a.author ? `${a.author.firstName} ${a.author.lastName}` : "—",
        createdAt: a.createdAt.toISOString(),
      }))}
    />
  );
}
