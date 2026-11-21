import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { MessagesView } from "./messages-view";

export const metadata: Metadata = {
  title: "Messages — Espace membre OCD",
  description: "Discute en privé avec les autres membres de la communauté OCD.",
  robots: { index: false },
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
            <Skeleton className="h-[70vh] w-full rounded-2xl" />
            <Skeleton className="hidden h-[70vh] w-full rounded-2xl lg:block" />
          </div>
        </div>
      }
    >
      <MessagesView />
    </Suspense>
  );
}
