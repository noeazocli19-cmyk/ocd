import { Suspense } from "react";
import type { Metadata } from "next";
import { ConnexionView } from "./connexion-view";

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connecte-toi à ton espace membre OCD : retrouve la communauté, tes groupes, tes conversations et tes opportunités.",
  robots: { index: false },
};

/** Squelette affiché pendant la résolution de searchParams (Next 16). */
function ConnexionFallback() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md animate-pulse space-y-6 rounded-2xl border bg-card p-8 shadow-xl">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-10 w-44 rounded-lg bg-muted" />
          <div className="mx-auto h-3 w-28 rounded bg-muted" />
          <div className="mx-auto h-7 w-52 rounded bg-muted" />
        </div>
        <div className="space-y-4">
          <div className="h-14 rounded-lg bg-muted" />
          <div className="h-14 rounded-lg bg-muted" />
          <div className="h-11 rounded-lg bg-muted" />
        </div>
        <div className="h-28 rounded-xl bg-muted" />
      </div>
    </main>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={<ConnexionFallback />}>
      <ConnexionView />
    </Suspense>
  );
}
