import type { Metadata } from "next";
import { EvenementsView } from "./evenements-view";

export const metadata: Metadata = {
  title: "Événements",
  description:
    "Rencontres, masterclass, challenges et lives OCD : des moments conçus pour sortir de l'écran, échanger en personne et créer de vraies connexions.",
};

export default function EvenementsPage() {
  return <EvenementsView />;
}
