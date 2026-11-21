import type { Metadata } from "next";
import { BovannView } from "./bovann-view";

export const metadata: Metadata = {
  title: "Bovann",
  description:
    "À l'origine d'une vision OCD : découvrez le porteur du projet, ses activités, ses réalisations documentées et son contact officiel vérifié.",
};

export default function BovannPage() {
  return <BovannView />;
}
