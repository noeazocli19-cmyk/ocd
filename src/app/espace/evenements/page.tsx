import type { Metadata } from "next";
import { EvenementsView } from "./evenements-view";

export const metadata: Metadata = {
  title: "Événements — Espace membre OCD",
  description: "Inscris-toi aux prochains événements de la communauté OCD.",
  robots: { index: false },
};

export default function Page() {
  return <EvenementsView />;
}
