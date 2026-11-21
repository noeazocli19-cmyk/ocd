import { db } from "@/lib/db";
import { requireUser, ok } from "@/lib/api-utils";

// GET /api/members?q=&country=&city=&profession=&domain=&limit=
export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const user = auth.user;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const country = searchParams.get("country");
  const city = searchParams.get("city");
  const profession = searchParams.get("profession");
  const domain = searchParams.get("domain");
  const limit = Math.min(Number(searchParams.get("limit") ?? 24), 60);
  const recommended = searchParams.get("recommended") === "1";

  const where = {
    isBlocked: false,
    ...(q
      ? {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { profession: { contains: q } },
            { domain: { contains: q } },
            { city: { contains: q } },
            { country: { contains: q } },
          ],
        }
      : {}),
    ...(country ? { country: { contains: country } } : {}),
    ...(city ? { city: { contains: city } } : {}),
    ...(profession ? { profession: { contains: profession } } : {}),
    ...(domain ? { domain: { contains: domain } } : {}),
  };

  const members = await db.user.findMany({
    where,
    select: {
      id: true, firstName: true, lastName: true, avatarUrl: true, coverUrl: true,
      bio: true, country: true, city: true, profession: true, domain: true,
      experienceLevel: true, interests: true, isDemo: true, createdAt: true,
      _count: { select: { posts: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Recommandations simples basées sur les données réelles :
  // même pays, même domaine ou même profession que l'utilisateur courant.
  let recommendedMembers: typeof members = [];
  if (recommended) {
    const alreadyIds = new Set(members.map((m) => m.id));
    const all = await db.user.findMany({
      where: { isBlocked: false, id: { not: user.id } },
      select: {
        id: true, firstName: true, lastName: true, avatarUrl: true, coverUrl: true,
        bio: true, country: true, city: true, profession: true, domain: true,
        experienceLevel: true, interests: true, isDemo: true, createdAt: true,
        _count: { select: { posts: true } },
      },
      take: 200,
    });
    recommendedMembers = all
      .filter((m) => {
        if (alreadyIds.has(m.id)) return false;
        const sameCountry = user.country && m.country === user.country;
        const sameDomain = user.domain && m.domain === user.domain;
        const sameProfession = user.profession && m.profession === user.profession;
        return Boolean(sameCountry || sameDomain || sameProfession);
      })
      .slice(0, 6);
  }

  return ok({ items: members, recommended: recommendedMembers });
}
