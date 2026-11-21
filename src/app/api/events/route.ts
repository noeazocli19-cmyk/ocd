import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ok } from "@/lib/api-utils";

// GET /api/events — événements publiés (état d'inscription inclus si connecté)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const upcoming = searchParams.get("upcoming") === "1";
  const limit = Math.min(Number(searchParams.get("limit") ?? 24), 50);

  const events = await db.event.findMany({
    where: {
      status: "PUBLISHED",
      ...(category && category !== "ALL" ? { category } : {}),
      ...(upcoming ? { startDate: { gte: new Date() } } : {}),
    },
    include: {
      organizer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { startDate: "asc" },
    take: limit,
  });

  const user = await getSessionUser();
  let registeredIds = new Set<string>();
  if (user) {
    const regs = await db.eventRegistration.findMany({
      where: { userId: user.id, status: "REGISTERED", eventId: { in: events.map((e) => e.id) } },
      select: { eventId: true },
    });
    registeredIds = new Set(regs.map((r) => r.eventId));
  }

  return ok({
    items: events.map((e) => ({ ...e, registered: registeredIds.has(e.id) })),
  });
}
