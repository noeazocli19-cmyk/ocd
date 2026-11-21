import type { Metadata } from "next";
import { FilView } from "./fil-view";

export const metadata: Metadata = {
  title: "Fil d'actualité — OCD",
  description: "Les expériences, idées et opportunités partagées par la communauté OCD.",
  robots: { index: false },
};

export default function EspaceFilPage() {
  return <FilView />;
}
