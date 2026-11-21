import type { Metadata } from "next";
import { CommunauteView } from "./communaute-view";

export const metadata: Metadata = {
  title: "Communauté",
  description:
    "Des personnes ambitieuses, une même énergie : entrepreneurs, étudiants, développeurs, créateurs et porteurs de projets réunis sur OCD pour passer à l'action.",
};

export default function CommunautePage() {
  return <CommunauteView />;
}
