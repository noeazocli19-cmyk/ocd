import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ok, parseBody } from "@/lib/api-utils";

const contentSchema = z.object({
  entries: z.array(
    z.object({
      key: z.string().min(1).max(120),
      value: z.string().max(8000),
    })
  ).min(1, "Aucune modification fournie."),
});

// GET /api/admin/content — tous les contenus éditoriaux
export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const items = await db.siteContent.findMany({ orderBy: { key: "asc" } });
  return ok({ items });
}

// PATCH /api/admin/content — upsert des contenus (présentation Bovann, coordonnées vérifiées, etc.)
export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const parsed = await parseBody(request, contentSchema);
  if (parsed.response) return parsed.response;

  for (const entry of parsed.data.entries) {
    await db.siteContent.upsert({
      where: { key: entry.key },
      update: { value: entry.value },
      create: { key: entry.key, value: entry.value },
    });
  }

  const items = await db.siteContent.findMany({ orderBy: { key: "asc" } });
  return ok({ items });
}
