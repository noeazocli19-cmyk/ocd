import { db } from "@/lib/db";
import { RealisationsAdminView } from "./realisations-view";

export const dynamic = "force-dynamic";

export default async function AdminRealisationsPage() {
  const items = await db.achievement.findMany({
    include: { media: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return (
    <RealisationsAdminView
      initialItems={items.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        status: a.status,
        imageUrl: a.imageUrl,
        videoUrl: a.videoUrl,
        date: a.date ? a.date.toISOString().slice(0, 10) : "",
        results: a.results ?? "",
        isPublished: a.isPublished,
        order: a.order,
      }))}
    />
  );
}
