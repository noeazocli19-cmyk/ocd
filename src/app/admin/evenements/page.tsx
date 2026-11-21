import { db } from "@/lib/db";
import { EvenementsAdminView } from "./evenements-view";

export const dynamic = "force-dynamic";

export default async function AdminEvenementsPage() {
  const items = await db.event.findMany({
    include: {
      organizer: { select: { firstName: true, lastName: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { startDate: "asc" },
  });
  return (
    <EvenementsAdminView
      initialItems={items.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        category: e.category,
        imageUrl: e.imageUrl,
        startDate: e.startDate.toISOString().slice(0, 16),
        location: e.location,
        isOnline: e.isOnline,
        onlineUrl: e.onlineUrl,
        organizerName: e.organizerName,
        capacity: e.capacity,
        status: e.status,
        isDemo: e.isDemo,
        registrations: e._count.registrations,
      }))}
    />
  );
}
