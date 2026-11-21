"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  FileCheck2,
  Images,
  Loader2,
  RotateCcw,
  Sparkles,
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

// ============ Types et utilitaires ============

type AchievementMedia = {
  id: string;
  url: string;
  type: string;
  caption: string | null;
};

type AchievementItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  imageUrl: string | null;
  videoUrl: string | null;
  date: string | null;
  results: string | null;
  media: AchievementMedia[];
};

const CATEGORY_LABELS: Record<string, string> = {
  ENTREPRENARIAT: "Entrepreneuriat",
  PROJETS_NUMERIQUES: "Projets numériques",
  EVENEMENTS: "Événements",
  INITIATIVES: "Initiatives communautaires",
  CONTENU: "Création de contenu",
  COLLABORATIONS: "Collaborations",
  PROFESSIONNEL: "Activités professionnelles",
};

function formatDateFr(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Convertit le champ `results` (JSON documenté) en liste de libellés lisibles. */
function parseResults(raw: string | null): string[] {
  if (!raw || !raw.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => {
        if (typeof entry === "string") return entry.trim();
        if (entry && typeof entry === "object") {
          const obj = entry as { label?: unknown; value?: unknown };
          const label = typeof obj.label === "string" ? obj.label.trim() : "";
          const value =
            typeof obj.value === "string" || typeof obj.value === "number"
              ? String(obj.value).trim()
              : "";
          if (label && value) return `${label} : ${value}`;
          if (label) return label;
          if (value) return value;
        }
        return "";
      })
      .filter((line) => line.length > 0);
  } catch {
    return [];
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === "REALISE") {
    return (
      <Badge className="gap-1 border border-[#F07819]/30 bg-[#F07819]/15 text-[#B45309] hover:bg-[#F07819]/15 dark:text-[#FFB25C]">
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
        Réalisé
      </Badge>
    );
  }
  if (status === "EN_COURS") {
    return (
      <Badge variant="outline" className="gap-1 text-amber-600 dark:text-amber-400">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        En cours
      </Badge>
    );
  }
  if (status === "A_VENIR") {
    return (
      <Badge variant="outline" className="gap-1">
        <CircleDashed className="h-3 w-3" aria-hidden="true" />
        À venir
      </Badge>
    );
  }
  return null;
}

// ============ Vue ============

export function RealisationsView() {
  const [items, setItems] = useState<AchievementItem[] | null>(null);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    api
      .get<{ items: AchievementItem[] }>("/api/achievements")
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

  const categories = useMemo(() => {
    const all = items ?? [];
    const seen: string[] = [];
    for (const item of all) {
      if (item.category && !seen.includes(item.category)) seen.push(item.category);
    }
    return seen;
  }, [items]);

  const filtered = useMemo(() => {
    const all = items ?? [];
    return activeFilter === "ALL" ? all : all.filter((item) => item.category === activeFilter);
  }, [items, activeFilter]);

  const detail = useMemo(
    () => (items ?? []).find((item) => item.id === detailId) ?? null,
    [items, detailId]
  );
  const detailResults = parseResults(detail?.results ?? null);

  return (
    <div className="flex min-h-screen flex-col">
      <OcdNavbar />
      <main id="contenu-principal" className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden border-b bg-secondary/40" aria-labelledby="realisations-hero-titre">
          <div className="bg-grid-ocd absolute inset-0 opacity-60" aria-hidden="true" />
          <div
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#F07819]/10 blur-[100px]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pb-20 sm:pt-40 lg:px-8">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="ocd-kicker mb-4 justify-center">Des idées aux réalisations</p>
              <h1
                id="realisations-hero-titre"
                className="font-display text-[clamp(2.2rem,6vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-foreground"
              >
                DES IDÉES AUX{" "}
                <span className="text-gradient-ocd">RÉALISATIONS.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Uniquement des initiatives documentées et validées par l&apos;équipe OCD. Aucun
                chiffre ni projet n&apos;est inventé.
              </p>
            </Reveal>
          </div>
        </section>

        {/* CONTENU */}
        <section className="py-16 sm:py-24" aria-labelledby="realisations-liste-titre">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="realisations-liste-titre" className="sr-only">
              Liste des réalisations
            </h2>

            {/* Filtres par catégorie */}
            {categories.length > 0 && (
              <Reveal className="mb-10">
                <div
                  className="flex flex-wrap items-center gap-2"
                  role="group"
                  aria-label="Filtrer par catégorie"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFilter("ALL")}
                    aria-pressed={activeFilter === "ALL"}
                    className={`inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold transition-all duration-200 ${
                      activeFilter === "ALL"
                        ? "border-[#F07819] bg-[#F07819] text-white shadow-md shadow-[#F07819]/25"
                        : "border-border bg-card text-muted-foreground hover:border-[#F07819]/40 hover:text-foreground"
                    }`}
                  >
                    Tous
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveFilter(category)}
                      aria-pressed={activeFilter === category}
                      className={`inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold transition-all duration-200 ${
                        activeFilter === category
                          ? "border-[#F07819] bg-[#F07819] text-white shadow-md shadow-[#F07819]/25"
                          : "border-border bg-card text-muted-foreground hover:border-[#F07819]/40 hover:text-foreground"
                      }`}
                    >
                      {CATEGORY_LABELS[category] ?? category}
                    </button>
                  ))}
                </div>
              </Reveal>
            )}

            {error ? (
              <Reveal className="mx-auto max-w-xl">
                <div className="rounded-2xl border border-dashed p-10 text-center">
                  <CircleAlert className="mx-auto mb-4 h-8 w-8 text-[#F07819]" aria-hidden="true" />
                  <p className="font-display text-lg font-bold">
                    Impossible de charger les réalisations
                  </p>
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="overflow-hidden rounded-2xl border bg-card">
                    <Skeleton className="aspect-[16/10] w-full rounded-none" />
                    <div className="space-y-3 p-6">
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-24 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <Reveal className="mx-auto max-w-2xl">
                <div className="rounded-2xl border border-dashed p-10 text-center">
                  <Sparkles className="mx-auto mb-4 h-8 w-8 text-[#F07819]" aria-hidden="true" />
                  <p className="font-display text-lg font-bold">
                    {activeFilter === "ALL"
                      ? "Les réalisations seront publiées ici dès validation par l'équipe OCD."
                      : `Aucune réalisation « ${CATEGORY_LABELS[activeFilter] ?? activeFilter} » pour le moment.`}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {activeFilter === "ALL"
                      ? "Chaque initiative sera accompagnée de sa documentation vérifiée."
                      : "Sélectionne une autre catégorie ou reviens plus tard."}
                  </p>
                </div>
              </Reveal>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item, i) => (
                  <Reveal key={item.id} delay={(i % 3) * 0.08}>
                    <button
                      type="button"
                      onClick={() => setDetailId(item.id)}
                      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-card text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#F07819]/40 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F07819]"
                      aria-label={`Voir le détail : ${item.title}`}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="bg-grid-ocd flex h-full items-center justify-center">
                            <Sparkles className="h-8 w-8 text-[#F07819]/50" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="font-semibold">
                            {CATEGORY_LABELS[item.category] ?? item.category}
                          </Badge>
                          <StatusBadge status={item.status} />
                        </div>
                        <h3 className="font-display text-lg font-bold leading-snug">{item.title}</h3>
                        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs font-semibold text-[#F07819] transition-colors group-hover:text-[#B45309]">
                          Voir le détail
                        </span>
                      </div>
                    </button>
                  </Reveal>
                ))}
              </div>
            )}

            <Reveal className="mt-16 text-center">
              <p className="text-xs italic text-muted-foreground/80">
                Ce prototype n&apos;affiche que des réalisations documentées.
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <OcdFooter />

      {/* DÉTAIL D'UNE RÉALISATION */}
      <Dialog
        open={detail !== null}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
      >
        <DialogContent className="h-[100dvh] w-full max-w-none gap-0 overflow-y-auto rounded-none border-0 p-0 sm:h-auto sm:max-w-3xl sm:rounded-2xl">
          {detail && (
            <div className="flex flex-col">
              <div className="relative aspect-[16/9] w-full bg-secondary">
                {detail.imageUrl ? (
                  <Image
                    src={detail.imageUrl}
                    alt={detail.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 60vw"
                  />
                ) : (
                  <div className="bg-grid-ocd flex h-full items-center justify-center">
                    <Sparkles className="h-10 w-10 text-[#F07819]/50" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8">
                <DialogHeader>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge className="bg-[#F07819] hover:bg-[#F07819]">
                      {CATEGORY_LABELS[detail.category] ?? detail.category}
                    </Badge>
                    <StatusBadge status={detail.status} />
                    {detail.date && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5 text-[#F07819]" aria-hidden="true" />
                        {formatDateFr(detail.date)}
                      </span>
                    )}
                  </div>
                  <DialogTitle className="font-display text-xl font-bold leading-snug sm:text-2xl">
                    {detail.title}
                  </DialogTitle>
                  <DialogDescription className="whitespace-pre-line text-sm leading-relaxed sm:text-[15px]">
                    {detail.description}
                  </DialogDescription>
                </DialogHeader>

                {detailResults.length > 0 && (
                  <div className="mt-6 rounded-2xl border bg-card p-5">
                    <p className="mb-3 inline-flex items-center gap-2 font-display text-sm font-bold">
                      <FileCheck2 className="h-4.5 w-4.5 text-[#F07819]" aria-hidden="true" />
                      Résultats documentés
                    </p>
                    <ul className="space-y-2.5">
                      {detailResults.map((line) => (
                        <li key={line} className="flex items-start gap-2.5 text-sm leading-relaxed">
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-[#F07819]"
                            aria-hidden="true"
                          />
                          <span className="text-muted-foreground">{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {detail.videoUrl && (
                  <div className="mt-6">
                    <video
                      src={detail.videoUrl}
                      controls
                      playsInline
                      className="w-full rounded-2xl border bg-black"
                    />
                  </div>
                )}

                {detail.media.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-3 inline-flex items-center gap-2 font-display text-sm font-bold">
                      <Images className="h-4.5 w-4.5 text-[#F07819]" aria-hidden="true" />
                      Médias additionnels
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {detail.media.map((media) => (
                        <figure key={media.id} className="overflow-hidden rounded-2xl border">
                          {media.type === "VIDEO" ? (
                            <video
                              src={media.url}
                              controls
                              playsInline
                              className="aspect-[16/10] w-full bg-black object-cover"
                            />
                          ) : (
                            <div className="relative aspect-[16/10] bg-secondary">
                              <Image
                                src={media.url}
                                alt={media.caption ?? detail.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, 40vw"
                              />
                            </div>
                          )}
                          {media.caption && (
                            <figcaption className="border-t bg-card px-3.5 py-2.5 text-xs text-muted-foreground">
                              {media.caption}
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  </div>
                )}

                {detailResults.length === 0 && !detail.videoUrl && detail.media.length === 0 && (
                  <p className="mt-6 rounded-xl border border-dashed p-4 text-sm leading-relaxed text-muted-foreground">
                    Résultats chiffrés et médias complémentaires : à documenter par l&apos;équipe
                    OCD. Aucune donnée n&apos;est extrapolée.
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
