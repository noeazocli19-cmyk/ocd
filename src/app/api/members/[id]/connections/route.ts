import { db } from "@/lib/db";
import { requireUser, ok, fail } from "@/lib/api-utils";

// POST /api/members/[id]/connections — envoyer une demande de connexion
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id } = await params;

  if (id === auth.user.id) return fail("Tu ne peux pas te connecter à toi-même.", 400);

  const target = await db.user.findUnique({ where: { id }, select: { id: true, firstName: true, isBlocked: true } });
  if (!target || target.isBlocked) return fail("Membre introuvable.", 404);

  const existing = await db.connection.findFirst({
    where: {
      OR: [
        { senderId: auth.user.id, receiverId: id },
        { senderId: id, receiverId: auth.user.id },
      ],
    },
  });

  if (existing) {
    if (existing.status === "PENDING" && existing.senderId === auth.user.id) {
      // Annuler la demande
      await db.connection.delete({ where: { id: existing.id } });
      return ok({ status: "CANCELLED" });
    }
    return ok({ status: existing.status });
  }

  await db.connection.create({
    data: { senderId: auth.user.id, receiverId: id, status: "PENDING" },
  });

  await db.notification.create({
    data: {
      userId: id,
      type: "CONNECTION_REQUEST",
      title: `${auth.user.firstName} ${auth.user.lastName} souhaite se connecter avec toi`,
      linkUrl: "/espace/notifications",
    },
  });

  return ok({ status: "PENDING" }, 201);
}
