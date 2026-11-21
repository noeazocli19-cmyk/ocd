import { db } from "@/lib/db";
import { requireAdmin, ok } from "@/lib/api-utils";

// GET /api/admin/users — liste des membres
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const items = await db.user.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : {},
    select: {
      id: true, firstName: true, lastName: true, email: true, avatarUrl: true,
      role: true, country: true, city: true, profession: true, isDemo: true,
      isBlocked: true, createdAt: true,
      _count: { select: { posts: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return ok({ items });
}
