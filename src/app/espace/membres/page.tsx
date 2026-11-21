import type { Metadata } from "next";
import { MembresView } from "./membres-view";

export const metadata: Metadata = {
  title: "Membres — OCD",
  description: "Rencontre les membres récents de la communauté OCD.",
  robots: { index: false },
};

export default function EspaceMembresPage() {
  return <MembresView />;
}
