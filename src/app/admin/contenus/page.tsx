import { db } from "@/lib/db";
import { ContentEditorView } from "./contenus-view";

export const dynamic = "force-dynamic";

export default async function AdminContenusPage() {
  const items = await db.siteContent.findMany({ orderBy: { key: "asc" } });
  return <ContentEditorView initialItems={items.map((i) => ({ key: i.key, value: i.value }))} />;
}
