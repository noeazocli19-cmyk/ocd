import { db } from "@/lib/db";
import { requireUser, ok } from "@/lib/api-utils";

// GET /api/connections — mes connexions + demandes en attente
export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const user = auth.user;

  const [accepted, pendingIncoming, pendingOutgoing] = await Promise.all([
    db.connection.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, profession: true, country: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, profession: true, country: true } },
      },
    }),
    db.connection.findMany({
      where: { status: "PENDING", receiverId: user.id },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, profession: true, country: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.connection.findMany({
      where: { status: "PENDING", senderId: user.id },
      include: {
        receiver: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, profession: true, country: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return ok({
    connections: accepted.map((c) => ({
      id: c.id,
      member: c.senderId === user.id ? c.receiver : c.sender,
    })),
    pendingIncoming,
    pendingOutgoing,
  });
}
