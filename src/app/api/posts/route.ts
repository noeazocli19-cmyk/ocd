import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, ok, fail, parseBody } from "@/lib/api-utils";

const CATEGORIES = [
  "ENTREPRENARIAT", "BUSINESS", "TECHNOLOGIE", "MOTIVATION",
  "EDUCATION", "CREATION_CONTENU", "PROJETS", "EXPERIENCES",
] as const;

const createPostSchema = z.object({
  content: z.string().min(1, "Le contenu ne peut pas être vide.").max(3000),
  category: z.enum(CATEGORIES).optional().default("EXPERIENCES"),
  imageUrl: z.string().max(500).optional().nullable(),
  videoUrl: z.string().max(500).optional().nullable(),
  groupId: z.string().optional().nullable(),
});

// GET /api/posts?cursor=&limit=&category=&groupId=&authorId=
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit") ?? 10), 30);
  const category = searchParams.get("category");
  const groupId = searchParams.get("groupId");
  const authorId = searchParams.get("authorId");

  const posts = await db.post.findMany({
    where: {
      ...(category && category !== "ALL" ? { category } : {}),
      ...(groupId ? { groupId } : {}),
      ...(authorId ? { userId: authorId } : {}),
    },
    include: {
      user: {
        select: {
          id: true, firstName: true, lastName: true, avatarUrl: true,
          profession: true, isDemo: true,
        },
      },
      group: { select: { id: true, name: true, slug: true } },
      comments: {
        take: 2,
        orderBy: { createdAt: "desc" as const },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      },
      _count: { select: { comments: true, reactions: true } },
    },
    orderBy: [{ isPinned: "desc" as const }, { createdAt: "desc" as const }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;

  return ok({
    items: items.map((p) => ({
      ...p,
      comments: p.comments.reverse(),
    })),
    nextCursor: hasMore ? items[items.length - 1].id : null,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const user = auth.user;

  const parsed = await parseBody(request, createPostSchema);
  if (parsed.response) return parsed.response;
  const data = parsed.data;

  // Si publication dans un groupe : vérifier l'appartenance
  if (data.groupId) {
    const membership = await db.groupMember.findUnique({
      where: { groupId_userId: { groupId: data.groupId, userId: user.id } },
    });
    if (!membership) return fail("Tu dois rejoindre le groupe pour y publier.", 403);
  }

  const post = await db.post.create({
    data: {
      content: data.content,
      category: data.category,
      imageUrl: data.imageUrl || null,
      videoUrl: data.videoUrl || null,
      groupId: data.groupId || null,
      userId: user.id,
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true, profession: true, isDemo: true },
      },
      group: { select: { id: true, name: true, slug: true } },
      comments: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
      _count: { select: { comments: true, reactions: true } },
    },
  });

  return ok(post, 201);
}
