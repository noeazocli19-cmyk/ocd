import { db } from "@/lib/db";
import { requireUser, ok, fail } from "@/lib/api-utils";

// POST /api/events/[id]/register — s'inscrire
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id } = await params;

  const event = await db.event.findUnique({
    where: { id },
    select: { id: true, title: true, status: true, capacity: true, organizerId: true },
  });
  if (!event || event.status !== "PUBLISHED") return fail("Événement introuvable.", 404);

  const existing = await db.eventRegistration.findUnique({
    where: { eventId_userId: { eventId: id, userId: auth.user.id } },
  });
  if (existing && existing.status === "REGISTERED") {
    return fail("Tu es déjà inscrit à cet événement.", 409);
  }
  if (existing) {
    await db.eventRegistration.update({ where: { id: existing.id }, data: { status: "REGISTERED" } });
    return ok({ registered: true });
  }

  if (event.capacity) {
    const count = await db.eventRegistration.count({ where: { eventId: id, status: "REGISTERED" } });
    if (count >= event.capacity) return fail("Cet événement est complet.", 409);
  }

  await db.eventRegistration.create({ data: { eventId: id, userId: auth.user.id } });

  if (event.organizerId && event.organizerId !== auth.user.id) {
    await db.notification.create({
      data: {
        userId: event.organizerId,
        type: "EVENT_UPDATE",
        title: `${auth.user.firstName} ${auth.user.lastName} s'est inscrit à « ${event.title} »`,
        linkUrl: "/espace/evenements",
      },
    });
  }

  return ok({ registered: true }, 201);
}

// DELETE /api/events/[id]/register — annuler l'inscription
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id } = await params;

  const existing = await db.eventRegistration.findUnique({
    where: { eventId_userId: { eventId: id, userId: auth.user.id } },
  });
  if (!existing) return fail("Tu n'es pas inscrit à cet événement.", 404);

  await db.eventRegistration.update({ where: { id: existing.id }, data: { status: "CANCELLED" } });
  return ok({ registered: false });
}
