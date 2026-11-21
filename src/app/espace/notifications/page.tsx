import type { Metadata } from "next";
import { NotificationsView } from "./notifications-view";

export const metadata: Metadata = {
  title: "Notifications — Espace membre OCD",
  description: "Toutes les interactions de la communauté OCD.",
  robots: { index: false },
};

export default function Page() {
  return <NotificationsView />;
}
