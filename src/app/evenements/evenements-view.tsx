"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Globe2,
  Info,
  Loader2,
  LogIn,
  MapPin,
  RotateCcw,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { api, EVENT_LABELS, formatDateLong } from "@/lib/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Reveal } from "@/components/site/section-reveal";
import { OcdNavbar } from "@/components/site/ocd-navbar";
import { OcdFooter } from "@/components/site/ocd-footer";

// ============ Types et utilitaires ============

type EventItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  startDate: string;
  location: string | null;
  isOnline: boolean;
  onlineUrl: string | null;
  organizerName: string;
  isDemo: boolean;
  registered: boolean;
  _count: { registrations: number };
};

const FILTERS = ["ALL", ...Object.keys(EVENT_LABELS)] as const;

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function heureOf(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============ Vue ============

export function EvenementsView() {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState<string>("ALL");
  const [reloadKey, setReloadKey] = useState(0);
  const [meStatus, setMeStatus] = useState<"loading" | "anon" | "user">("loading");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  // Session (détermine le mode d'inscription)
  useEffect(() => {
    let alive = true;
    api
      .get<{ user: { id: string } | null }>("/api/auth/me")
      .then((data) => {
        if (!alive) return;
        setMeStatus(data.user ? "user" : "anon");
      })
      .catch(() => {
        if (!alive) return;
        setMeStatus("anon");
      });
    return () => {
      alive = false;
    };
  }, []);

  // Événements (rechargés à chaque changement de catégorie)
  useEffect(() => {
    let alive = true;
    const query = category === "ALL" ? "" : `?category=${encodeURIComponent(category)}`;
    api
      .get<{ items: EventItem[] }>(`/api/events${query}`)
      .then((data) => {
        if (!alive) return;
        setEvents(data.items);
        setError(false);
      })
      .catch(() => {
        if (!alive) return;
        setError(true);
      });
    return () => {
      alive = false;
    };
  }, [category, reloadKey]);

  function handleRegister(event: EventItem) {
    setPendingId(event.id);
    api
      .post<{ registered: boolean }>(`/api/events/${event.id}/register`)
      .then(() => {
        toast.success(`Inscription confirmée pour « ${event.title} ».`);
        setEvents((prev) =>
          (prev ?? []).map((e) =>
            e.id === event.id
              ? {
                  ...e,
                  registered: true,
                  _count: { registrations: e._count.registrations + 1 },
                }
              : e
          )
        );
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Une erreur est survenue.");
      })
      .finally(() => {
        setPendingId(null);
      });
  }

  function handleCancel(event: EventItem) {
    setPendingId(event.id);
    api
      .delete<{ registered: boolean }>(`/api/events/${event.id}/register`)
      .then(() => {
        toast.success("Inscription annulée.");
        setEvents((prev) =>
          (prev ?? []).map((e) =>
            e.id === event.id
              ? {
                  ...e,
                  registered: false,
                  _count: { registrations: Math.max(0, e._count.registrations - 1) },
                }
              : e
          )
        );
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Une erreur est survenue.");
      })
      .finally(() => {
        setPendingId(null);
        setCancelTargetId(null);
      });
  }

  const cancelTarget = (events ?? []).find((e) => e.id === cancelTargetId) ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      <OcdNavbar />
      <main id="contenu-principal" className="flex-1">
        {/* HERO */}
        <section
          className="relative overflow-hidden bg-ocd-dark text-white"
          aria-labelledby="evenements-hero-titre"
        >
          <div className="bg-grid-ocd absolute inset-0 opacity-50" aria-hidden="true" />
          <div
            className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-[#F07819]/15 blur-[110px]"
            aria-hidden="true"
          />
          <div
            className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#F07819]/10 blur-[120px]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pb-20 sm:pt-40 lg:px-8">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="ocd-kicker mb-4 justify-center">Les événements</p>
              <h1
                id="evenements-hero-titre"
                className="font-display text-[clamp(2.2rem,6vw,4rem)] font-extrabold leading-[1.05] tracking-tight"
              >
                DES RENCONTRES <span className="text-gradient-ocd">QUI FONT AVANCER.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
                Masterclass, rencontres, challenges : des moments conçus pour sortir de l&apos;écran
                et créer de vraies connexions. Les événements marqués « Exemple de démonstration »
                illustrent le format du prototype.
              </p>
            </Reveal>
          </div>
          <div
            className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ocd-dark to-transparent"
            aria-hidden="true"
          />
        </section>

        {/* LISTE */}
        <section className="py-16 sm:py-24" aria-labelledby="evenements-liste-titre">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="evenements-liste-titre" className="sr-only">
              Liste des événements
            </h2>

            {/* Filtres par catégorie */}
            <Reveal className="mb-10">
              <div
                className="flex flex-wrap items-center gap-2"
                role="group"
                aria-label="Filtrer les événements par catégorie"
              >
                {FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setCategory(filter)}
                    aria-pressed={category === filter}
                    className={`inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold transition-all duration-200 ${
                      category === filter
                        ? "border-[#F07819] bg-[#F07819] text-white shadow-md shadow-[#F07819]/25"
                        : "border-border bg-card text-muted-foreground hover:border-[#F07819]/40 hover:text-foreground"
                    }`}
                  >
                    {filter === "ALL" ? "Tous" : EVENT_LABELS[filter]}
                  </button>
                ))}
              </div>
            </Reveal>

            {error ? (
              <Reveal className="mx-auto max-w-xl">
                <div className="rounded-2xl border border-dashed p-10 text-center">
                  <CircleAlert className="mx-auto mb-4 h-8 w-8 text-[#F07819]" aria-hidden="true" />
                  <p className="font-display text-lg font-bold">
                    Impossible de charger les événements
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
            ) : events === null ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="overflow-hidden rounded-2xl border bg-card">
                    <Skeleton className="aspect-[16/9] w-full rounded-none" />
                    <div className="space-y-3 p-6">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <Reveal className="mx-auto max-w-2xl">
                <div className="rounded-2xl border border-dashed p-10 text-center">
                  <CalendarDays className="mx-auto mb-4 h-8 w-8 text-[#F07819]" aria-hidden="true" />
                  <p className="font-display text-lg font-bold">
                    Aucun événement{category === "ALL" ? "" : " dans cette catégorie"} pour le
                    moment
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Les rencontres OCD seront annoncées ici dès leur officialisation par
                    l&apos;équipe. Les catégories seront alimentées au fil des programmations.
                  </p>
                </div>
              </Reveal>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event, i) => (
                  <Reveal key={event.id} delay={(i % 3) * 0.08}>
                    <article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-[#F07819]/40 hover:shadow-xl">
                      {/* Visuel */}
                      <div className="relative aspect-[16/9] bg-secondary">
                        {event.imageUrl ? (
                          <Image
                            src={event.imageUrl}
                            alt={event.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="bg-grid-ocd flex h-full items-center justify-center">
                            <CalendarDays
                              className="h-9 w-9 text-[#F07819]/50"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                        <Badge className="absolute left-3 top-3 bg-[#F07819] hover:bg-[#F07819]">
                          {EVENT_LABELS[event.category] ?? event.category}
                        </Badge>
                      </div>

                      {/* Contenu */}
                      <div className="flex flex-1 flex-col gap-3 p-6">
                        <div>
                          <p className="text-sm font-semibold capitalize text-[#F07819]">
                            {capitalizeFirst(formatDateLong(event.startDate))} ·{" "}
                            {heureOf(event.startDate)}
                          </p>
                          <h3 className="mt-1.5 font-display text-lg font-bold leading-snug">
                            {event.title}
                          </h3>
                        </div>
                        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {event.description}
                        </p>

                        <div className="mt-auto flex flex-col gap-1.5 pt-2 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            {event.isOnline ? (
                              <Badge
                                variant="outline"
                                className="gap-1 border-[#F07819]/40 text-[#B45309] dark:text-[#FFB25C]"
                              >
                                <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                                En ligne
                              </Badge>
                            ) : (
                              <>
                                <MapPin className="h-4 w-4 shrink-0 text-[#F07819]" aria-hidden="true" />
                                {event.location ?? "Lieu à confirmer"}
                              </>
                            )}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <UserRound className="h-4 w-4 shrink-0 text-[#F07819]" aria-hidden="true" />
                            Organisé par {event.organizerName || "l'équipe OCD"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="h-4 w-4 shrink-0 text-[#F07819]" aria-hidden="true" />
                            {event._count.registrations} participant
                            {event._count.registrations > 1 ? "s" : ""}
                          </span>
                          {event.isDemo && (
                            <span className="inline-flex items-center gap-1.5 text-xs italic text-muted-foreground/80">
                              <Info className="h-3.5 w-3.5" aria-hidden="true" />
                              Exemple de démonstration
                            </span>
                          )}
                        </div>

                        {/* Inscription */}
                        <div className="border-t pt-4">
                          {meStatus === "loading" ? (
                            <Button
                              disabled
                              variant="outline"
                              className="h-11 w-full rounded-full"
                              aria-label="Vérification de la session en cours"
                            >
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                              Vérification…
                            </Button>
                          ) : meStatus === "anon" ? (
                            <Button
                              asChild
                              variant="outline"
                              className="h-11 w-full rounded-full font-semibold"
                            >
                              <Link href="/connexion?next=/espace/evenements">
                                <LogIn className="h-4 w-4" />
                                Connecte-toi pour t&apos;inscrire
                              </Link>
                            </Button>
                          ) : event.registered ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[#F07819]/40 bg-[#F07819]/10 text-sm font-semibold text-[#B45309] dark:text-[#FFB25C]">
                                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                Inscrit
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCancelTargetId(event.id)}
                                disabled={pendingId === event.id}
                                className="h-11 rounded-full px-4 text-sm"
                              >
                                Annuler
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => handleRegister(event)}
                              disabled={pendingId === event.id}
                              className="h-11 w-full rounded-full font-semibold shadow-md shadow-[#F07819]/20"
                            >
                              {pendingId === event.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                  Inscription…
                                </>
                              ) : (
                                "S'inscrire"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <OcdFooter />

      {/* CONFIRMATION D'ANNULATION */}
      <AlertDialog
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Annuler ton inscription ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget
                ? `Ta place pour « ${cancelTarget.title} » sera libérée et pourra être réservée par un autre membre.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Conserver</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (cancelTarget) handleCancel(cancelTarget);
              }}
            >
              {pendingId && cancelTarget && pendingId === cancelTarget.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Annulation…
                </>
              ) : (
                "Annuler l'inscription"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
