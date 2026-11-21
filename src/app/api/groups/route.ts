import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, ok, parseBody } from "@/lib/api-utils";

const GROUP_CATEGORIES = [
  "ENTREPRENARIAT", "TECHNOLOGIE", "INTELLIGENCE_ARTIFICIELLE", "BUSINESS",
  "MARKETING", "FINANCE", "CREATION_CONTENU", "DEVELOPPEMENT_PERSONNEL", "LEADERSHIP",
] as const;

const createGroupSchema = z.object({
  name: z.string().min(3, "Nom trop court").max(80),
  description: z.string().min(10, "Description trop courte").max(1500),
  category: z.enum(GROUP_CATEGORIES),
  imageUrl: z.string().max(500).optional().nullable(),
});

// GET /api/groups?category=&q=
export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const user = auth.user;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim();

  const groups = await db.group.findMany({
    where: {
      ...(category && category !== "ALL" ? { category } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { members: true, posts: true } },
      members: { where: { userId: user.id }, select: { id: true, role: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 60,
  });

  return ok({
    items: groups.map((g) => ({
      ...g,
      myMembership: g.members[0] ?? null,
      members: undefined,
    })),
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const user = auth.user;

  const parsed = await parseBody(request, createGroupSchema);
  if (parsed.response) return parsed.response;
  const data = parsed.data;

  const baseSlug = data.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  let slug = baseSlug;
  let attempt = 1;
  while (await db.group.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${attempt++}`;
  }

  const group = await db.group.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      category: data.category,
      imageUrl: data.imageUrl || null,
      createdBy: user.id,
      members: { create: { userId: user.id, role: "ADMIN" } },
    },
  });

  return ok(group, 201);
}
