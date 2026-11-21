import type { Metadata } from "next";
import { GalerieView } from "./galerie-view";

export const metadata: Metadata = {
  title: "Galerie",
  description:
    "L'univers OCD en images : visuels d'ambiance, portraits, événements et coulisses. Les photographies officielles seront ajoutées par l'équipe OCD.",
};

export default function GaleriePage() {
  return <GalerieView />;
}
