import type { Metadata } from "next";
import { GroupeView } from "./groupe-view";

export const metadata: Metadata = {
  title: "Détail du groupe — Espace membre OCD",
  description: "Publications et membres du groupe.",
  robots: { index: false },
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GroupeView id={id} />;
}
