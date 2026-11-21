import type { Metadata } from "next";
import { DashboardView } from "./dashboard-view";

export const metadata: Metadata = {
  title: "Tableau de bord — OCD",
  description: "Ton point de départ quotidien sur OCD : profil, publications et opportunités.",
  robots: { index: false },
};

export default function EspaceDashboardPage() {
  return <DashboardView />;
}
