import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ok, parseBody } from "@/lib/api-utils";

const CATEGORIES = [
  "ENTREPRENARIAT", "PROJETS_NUMERIQUES", "EVENEMENTS", "INITIATIVES",
  "CONTENU", "COLLABORATIONS", "PROFESSIONNEL",
] as const;

const achievementSchema = z.object({
  title: z.string().min(2, "Titre requis").max(160),
  description: z.string().min(10, "Description requise").max(3000),
  category: z.enum(CATEGORIES),
  date: z.string().optional().nullable(),
  status: z.enum(["EN_COURS", "REALISE", "A_VENIR"]).default("REALISE"),
  imageUrl: z.string().max(500).optional().nullable(),
  videoUrl: z.string().max(500).optional().nullable(),
  results: z.array(z.object({ label: z.string().max(120), value: z.string().max(60) })).max(8).optional(),
  isPublished: z.boolean().default(false),
  order: z.number().int().min(0).max(999).optional(),
});

// GET /api/admin/achievements — toutes les réalisations (drafts inclus)
export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const items = await db.achievement.findMany({
    include: { media: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return ok({ items });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const parsed = await parseBody(request, achievementSchema);
  if (parsed.response) return parsed.response;
  const data = parsed.data;

  const created = await db.achievement.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      date: data.date ? new Date(data.date) : null,
      status: data.status,
      imageUrl: data.imageUrl || null,
      videoUrl: data.videoUrl || null,
      results: data.results ? JSON.stringify(data.results) : null,
      isPublished: data.isPublished,
      order: data.order ?? 0,
    },
  });

  return ok(created, 201);
}
