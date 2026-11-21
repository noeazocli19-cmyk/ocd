import type { Metadata } from "next";
import { RealisationsView } from "./realisations-view";

export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Les réalisations d'OCD et de Bovann : uniquement des initiatives documentées et validées par l'équipe. Aucun chiffre ni projet n'est inventé.",
};

export default function RealisationsPage() {
  return <RealisationsView />;
}
