import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ok, parseBody } from "@/lib/api-utils";

const GALLERY_CATEGORIES = [
  "PORTRAITS", "CONFERENCES", "EVENEMENTS", "RENCONTRES",
  "ENTREPRENARIAT", "COULISSES", "PROJETS", "COMMUNAUTE",
] as const;

const gallerySchema = z.object({
  url: z.string().min(1, "URL de média requise").max(500),
  type: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  category: z.enum(GALLERY_CATEGORIES),
  title: z.string().max(120).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  order: z.number().int().min(0).max(999).optional(),
  isPublished: z.boolean().default(false),
});

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const items = await db.galleryMedia.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return ok({ items });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const parsed = await parseBody(request, gallerySchema);
  if (parsed.response) return parsed.response;

  const created = await db.galleryMedia.create({ data: { ...parsed.data, title: parsed.data.title || null, description: parsed.data.description || null } });
  return ok(created, 201);
}
