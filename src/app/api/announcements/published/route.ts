import { db } from "@/lib/db";
import { ok } from "@/lib/api-utils";

// GET /api/announcements/published — annonces publiées
export async function GET() {
  const items = await db.announcement.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return ok({ items });
}
