"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ImagesIcon,
  Play,
  RotateCcw,
} from "lucide-react";
import { api } from "@/lib/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Reveal } from "@/components/site/section-reveal";
import { OcdNavbar } from "@/components/site/ocd-navbar";
import { OcdFooter } from "@/components/site/ocd-footer";

// ============ Types et données ============

type GalleryItem = {
  id: string;
  url: string;
  type: string;
  category: string;
  title: string | null;
  description: string | null;
};

const CATEGORIES = [
  { key: "PORTRAITS", label: "Portraits" },
  { key: "CONFERENCES", label: "Conférences" },
  { key: "EVENEMENTS", label: "Événements" },
  { key: "RENCONTRES", label: "Rencontres" },
  { key: "ENTREPRENARIAT", label: "Entrepreneuriat" },
  { key: "COULISSES", label: "Coulisses" },
  { key: "PROJETS", label: "Projets" },
  { key: "COMMUNAUTE", label: "Communauté" },
] as const;

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label])
);

// Hauteurs variées pour une grille éditoriale
function aspectOf(index: number): string {
  return index % 2 === 0 ? "aspect-[4/3]" : "aspect-[3/4]";
}

// ============ Vue ============

export function GalerieView() {
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    api
      .get<{ items: GalleryItem[] }>("/api/gallery")
      .then((data) => {
        if (!alive) return;
        setItems(data.items);
        setError(false);
      })
      .catch(() => {
        if (!alive) return;
        setError(true);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const all = items ?? [];
    return filter === "ALL" ? all : all.filter((item) => item.category === filter);
  }, [items, filter]);

  const goPrev = useCallback(() => {
    setOpenIndex((current) => (current === null ? current : Math.max(0, current - 1)));
  }, []);

  const goNext = useCallback(() => {
    setOpenIndex((current) =>
      current === null ? current : Math.min(filtered.length - 1, current + 1)
    );
  }, [filtered.length]);

  // Navigation clavier dans la visionneuse
  useEffect(() => {
    if (openIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex, goPrev, goNext]);

  const activeItem = openIndex !== null ? filtered[openIndex] : null;
  const activeIndex = openIndex !== null && openIndex < filtered.length ? openIndex : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <OcdNavbar />
      <main id="contenu-principal" className="flex-1">
        {/* HERO */}
        <section
          className="relative overflow-hidden border-b bg-secondary/40"
          aria-labelledby="galerie-hero-titre"
        >
          <div className="bg-grid-ocd absolute inset-0 opacity-60" aria-hidden="true" />
          <div
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#F07819]/10 blur-[100px]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pb-20 sm:pt-40 lg:px-8">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="ocd-kicker mb-4 justify-center">La galerie</p>
              <h1
                id="galerie-hero-titre"
                className="font-display text-[clamp(2.2rem,6vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-foreground"
              >
                L&apos;UNIVERS OCD <span className="text-gradient-ocd">EN IMAGES.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Portraits, conférences, rencontres et coulisses : une fenêtre sur la vie de la
                communauté et de ses projets.
              </p>
            </Reveal>
          </div>
        </section>

        {/* GRILLE */}
        <section className="py-16 sm:py-24" aria-labelledby="galerie-grille-titre">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="galerie-grille-titre" className="sr-only">
              Galerie de visuels
            </h2>

            {/* Filtres */}
            {items !== null && (items?.length ?? 0) > 0 && (
              <Reveal className="mb-10">
                <div
                  className="flex flex-wrap items-center gap-2"
                  role="group"
                  aria-label="Filtrer la galerie par catégorie"
                >
                  <button
                    type="button"
                    onClick={() => setFilter("ALL")}
                    aria-pressed={filter === "ALL"}
                    className={`inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold transition-all duration-200 ${
                      filter === "ALL"
                        ? "border-[#F07819] bg-[#F07819] text-white shadow-md shadow-[#F07819]/25"
                        : "border-border bg-card text-muted-foreground hover:border-[#F07819]/40 hover:text-foreground"
                    }`}
                  >
                    Tous
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setFilter(cat.key)}
                      aria-pressed={filter === cat.key}
                      className={`inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold transition-all duration-200 ${
                        filter === cat.key
                          ? "border-[#F07819] bg-[#F07819] text-white shadow-md shadow-[#F07819]/25"
                          : "border-border bg-card text-muted-foreground hover:border-[#F07819]/40 hover:text-foreground"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </Reveal>
            )}

            {error ? (
              <Reveal className="mx-auto max-w-xl">
                <div className="rounded-2xl border border-dashed p-10 text-center">
                  <CircleAlert className="mx-auto mb-4 h-8 w-8 text-[#F07819]" aria-hidden="true" />
                  <p className="font-display text-lg font-bold">Impossible de charger la galerie</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Une erreur est survenue. Vérifie ta connexion puis réessaie.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setReloadKey((k) => k + 1)}
                    className="mt-6 rounded-full"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Réessayer
                  </Button>
                </div>
              </Reveal>
            ) : items === null ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <Skeleton key={i} className={`${aspectOf(i)} rounded-2xl`} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <Reveal className="mx-auto max-w-2xl">
                <div className="rounded-2xl border border-dashed p-10 text-center">
                  <ImagesIcon className="mx-auto mb-4 h-8 w-8 text-[#F07819]" aria-hidden="true" />
                  <p className="font-display text-lg font-bold">
                    {filter === "ALL"
                      ? "La galerie sera alimentée prochainement"
                      : "Aucun visuel dans cette catégorie pour le moment"}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Les visuels validés par l&apos;équipe OCD seront publiés ici. Les catégories
                    seront enrichies au fil des activités.
                  </p>
                </div>
              </Reveal>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.map((item, i) => (
                  <Reveal key={item.id} delay={(i % 4) * 0.06}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(i)}
                      className={`group relative w-full overflow-hidden rounded-2xl border bg-secondary transition-all duration-300 hover:-translate-y-1 hover:border-[#F07819]/40 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F07819] ${aspectOf(i)}`}
                      aria-label={
                        item.type === "VIDEO"
                          ? `Lire la vidéo : ${item.title ?? "sans titre"}`
                          : `Agrandir : ${item.title ?? "sans titre"}`
                      }
                    >
                      <Image
                        src={item.url}
                        alt={item.title ?? "Visuel de la galerie OCD"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <span
                        className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8 text-left"
                        aria-hidden="true"
                      >
                        <span className="truncate text-xs font-semibold text-white">
                          {item.title ?? CATEGORY_LABELS[item.category] ?? item.category}
                        </span>
                        {item.type === "VIDEO" && (
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/90 text-foreground shadow">
                            <Play className="h-4 w-4 translate-x-0.5" />
                          </span>
                        )}
                      </span>
                    </button>
                  </Reveal>
                ))}
              </div>
            )}

            <Reveal className="mt-14 text-center">
              <p className="mx-auto max-w-xl text-xs italic leading-relaxed text-muted-foreground/80">
                Visuels d&apos;ambiance provisoires. Les photographies officielles des activités
                OCD seront ajoutées par l&apos;équipe.
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <OcdFooter />

      {/* VISIONNEUSE (LIGHTBOX) */}
      <Dialog
        open={openIndex !== null}
        onOpenChange={(open) => {
          if (!open) setOpenIndex(null);
        }}
      >
        <DialogContent className="h-[100dvh] w-full max-w-none gap-0 overflow-y-auto rounded-none border-0 bg-black p-0 sm:h-auto sm:max-w-4xl sm:rounded-2xl">
          {activeItem && (
            <div className="relative flex h-full flex-col sm:h-auto">
              {/* Visuel */}
              <div className="relative flex-1 bg-black sm:flex-none">
                {activeItem.type === "VIDEO" ? (
                  <video
                    key={activeItem.id}
                    src={activeItem.url}
                    controls
                    playsInline
                    autoPlay
                    className="mx-auto max-h-[62vh] w-full object-contain sm:max-h-[70vh]"
                  />
                ) : (
                  <div className="relative mx-auto aspect-[4/3] w-full sm:max-h-[70vh] sm:aspect-auto sm:h-[60vh]">
                    <Image
                      src={activeItem.url}
                      alt={activeItem.title ?? "Visuel de la galerie OCD"}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      priority
                    />
                  </div>
                )}
              </div>

              {/* Navigation */}
              <button
                type="button"
                onClick={goPrev}
                disabled={activeIndex === 0}
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-[#F07819] disabled:pointer-events-none disabled:opacity-35"
                aria-label="Visuel précédent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={activeIndex >= filtered.length - 1}
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-[#F07819] disabled:pointer-events-none disabled:opacity-35"
                aria-label="Visuel suivant"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Légende */}
              <div className="bg-background p-6 sm:rounded-b-2xl">
                <DialogHeader>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <Badge className="bg-[#F07819] hover:bg-[#F07819]">
                      {CATEGORY_LABELS[activeItem.category] ?? activeItem.category}
                    </Badge>
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                      {activeIndex + 1} / {filtered.length}
                    </span>
                  </div>
                  <DialogTitle className="text-left font-display text-lg font-bold">
                    {activeItem.title ?? "Visuel OCD"}
                  </DialogTitle>
                  <DialogDescription className="text-left leading-relaxed">
                    {activeItem.description ?? "Légende à préciser par l'équipe OCD."}
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
