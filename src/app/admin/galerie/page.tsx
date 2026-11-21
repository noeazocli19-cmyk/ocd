import { db } from "@/lib/db";
import { GalerieAdminView } from "./galerie-view";

export const dynamic = "force-dynamic";

export default async function AdminGaleriePage() {
  const items = await db.galleryMedia.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return (
    <GalerieAdminView
      initialItems={items.map((g) => ({
        id: g.id,
        url: g.url,
        type: g.type,
        category: g.category,
        title: g.title,
        description: g.description,
        order: g.order,
        isPublished: g.isPublished,
      }))}
    />
  );
}
