import { db } from "@/lib/db";
import { ok } from "@/lib/api-utils";

// GET /api/achievements — réalisations publiées (public)
export async function GET() {
  const items = await db.achievement.findMany({
    where: { isPublished: true },
    include: { media: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return ok({ items });
}

// GET /api/achievements/[id] n'est pas nécessaire pour la version publique
export async function POST() {
  return ok({ error: "Méthode non autorisée." }, 405);
}
