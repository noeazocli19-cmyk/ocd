import type { Metadata } from "next";
import { ProfilView } from "./profil-view";

export const metadata: Metadata = {
  title: "Profil membre — OCD",
  description: "Découvre le parcours et les publications d'un membre de la communauté OCD.",
  robots: { index: false },
};

export default async function EspaceMembreProfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProfilView id={id} />;
}
