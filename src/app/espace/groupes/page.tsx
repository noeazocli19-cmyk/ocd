import type { Metadata } from "next";
import { GroupesView } from "./groupes-view";

export const metadata: Metadata = {
  title: "Groupes — Espace membre OCD",
  description: "Rejoins les groupes OCD qui correspondent à tes ambitions.",
  robots: { index: false },
};

export default function Page() {
  return <GroupesView />;
}
