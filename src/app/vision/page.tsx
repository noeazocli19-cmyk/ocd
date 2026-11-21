import type { Metadata } from "next";
import { VisionView } from "./vision-view";

export const metadata: Metadata = {
  title: "La vision",
  description:
    "La philosophie OCD : transformer les rencontres en relations, les idées en projets et les ambitions en actions. Découvre la vision et le fonctionnement de la plateforme.",
};

export default function VisionPage() {
  return <VisionView />;
}
