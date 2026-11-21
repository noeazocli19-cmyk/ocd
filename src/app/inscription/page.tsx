import type { Metadata } from "next";
import { InscriptionView } from "./inscription-view";

export const metadata: Metadata = {
  title: "Rejoindre OCD",
  description:
    "Crée ton compte OCD et complète ton profil en 5 étapes : rejoins une communauté qui transforme les rencontres en opportunités.",
  robots: { index: false },
};

export default function InscriptionPage() {
  return <InscriptionView />;
}
