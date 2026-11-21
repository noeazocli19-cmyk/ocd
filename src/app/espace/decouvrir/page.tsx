import type { Metadata } from "next";
import { DecouvrirView } from "./decouvrir-view";

export const metadata: Metadata = {
  title: "Découvrir les membres — OCD",
  description: "Trouve des personnes selon leurs métiers, leurs lieux et leurs compétences.",
  robots: { index: false },
};

export default function EspaceDecouvrirPage() {
  return <DecouvrirView />;
}
