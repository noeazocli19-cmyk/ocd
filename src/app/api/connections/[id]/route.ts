import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, ok, fail, parseBody } from "@/lib/api-utils";

const actionSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT"]),
});

// PATCH /api/connections/[id] — accepter ou refuser une demande
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id } = await params;

  const parsed = await parseBody(request, actionSchema);
  if (parsed.response) return parsed.response;

  const connection = await db.connection.findUnique({ where: { id } });
  if (!connection) return fail("Demande introuvable.", 404);
  if (connection.receiverId !== auth.user.id) return fail("Action non autorisée.", 403);
  if (connection.status !== "PENDING") return fail("Cette demande a déjà été traitée.", 409);

  const updated = await db.connection.update({
    where: { id },
    data: { status: parsed.data.action === "ACCEPT" ? "ACCEPTED" : "REJECTED" },
  });

  if (parsed.data.action === "ACCEPT") {
    await db.notification.create({
      data: {
        userId: connection.senderId,
        type: "CONNECTION_REQUEST",
        title: `${auth.user.firstName} ${auth.user.lastName} a accepté ta demande de connexion`,
        linkUrl: `/espace/membres/${connection.receiverId}`,
      },
    });
  }

  return ok(updated);
}
