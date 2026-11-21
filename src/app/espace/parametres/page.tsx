import type { Metadata } from "next";
import { ParametresView } from "./parametres-view";

export const metadata: Metadata = {
  title: "Paramètres du profil — Espace membre OCD",
  description: "Modifie les informations de ton profil OCD.",
  robots: { index: false },
};

export default function Page() {
  return <ParametresView />;
}
