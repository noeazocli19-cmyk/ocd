import { db } from "@/lib/db";
import { ok } from "@/lib/api-utils";

// GET /api/gallery — galerie publiée (public)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const items = await db.galleryMedia.findMany({
    where: {
      isPublished: true,
      ...(category && category !== "ALL" ? { category } : {}),
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return ok({ items });
}
