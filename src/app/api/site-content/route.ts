import { db } from "@/lib/db";
import { ok } from "@/lib/api-utils";

// GET /api/site-content — contenus éditoriaux administrables (lecture publique)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get("prefix");

  const items = await db.siteContent.findMany({
    ...(prefix ? { where: { key: { startsWith: prefix } } } : {}),
  });

  const content: Record<string, string> = {};
  for (const item of items) {
    content[item.key] = item.value;
  }
  return ok({ content });
}
