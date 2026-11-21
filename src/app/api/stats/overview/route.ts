import { db } from "@/lib/db";
import { ok } from "@/lib/api-utils";

// GET /api/stats/overview — statistiques réelles uniquement.
// Les valeurs vides sont renvoyées null pour que l'UI les masque (aucun chiffre inventé).
export async function GET() {
  const [members, posts, groups, events, achievements] = await Promise.all([
    db.user.count({ where: { isBlocked: false } }),
    db.post.count(),
    db.group.count(),
    db.event.count({ where: { status: "PUBLISHED" } }),
    db.achievement.count({ where: { isPublished: true } }),
  ]);

  return ok({
    members: members > 0 ? members : null,
    posts: posts > 0 ? posts : null,
    groups: groups > 0 ? groups : null,
    events: events > 0 ? events : null,
    achievements: achievements > 0 ? achievements : null,
  });
}
