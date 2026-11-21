"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  Clock,
  Globe,
  Loader2,
  MapPin,
  Users,
  UserRound,
} from "lucide-react";
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
import { api, EVENT_LABELS, formatDateTime } from "@/lib/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  organizerName: string | null;
  isDemo: boolean;
  registered: boolean;
  _count: { registrations: number };
};

const CATEGORY_KEYS = ["ALL", ...Object.keys(EVENT_LABELS)] as const;

export function EvenementsView() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("ALL");
  const [upcoming, setUpcoming] = useState<boolean>(true);
  const [cancelTarget, setCancelTarget] = useState<EventItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (category !== "ALL") params.set("category", category);
    if (upcoming) params.set("upcoming", "1");

    api
      .get<{ items: EventItem[] }>(`/api/events?${params.toString()}`)
      .then((d) => {
        if (!cancelled) setItems(d.items);
      })
      .catch((e: unknown) => {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Impossible de charger les événements");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, upcoming]);

  function changeFilters(nextCategory: string, nextUpcoming: boolean) {
    setLoading(true);
    setCategory(nextCategory);
    setUpcoming(nextUpcoming);
  }

  async function register(event: EventItem) {
    try {
      await api.post(`/api/events/${event.id}/register`);
      setItems((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, registered: true, _count: { ...e._count, registrations: e._count.registrations + 1 } }
            : e
        )
      );
      toast.success("Inscription confirmée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Inscription impossible");
    }
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    const target = cancelTarget;
    setCancelTarget(null);
    try {
      await api.delete(`/api/events/${target.id}/register`);
      setItems((prev) =>
        prev.map((e) =>
          e.id === target.id
            ? { ...e, registered: false, _count: { ...e._count, registrations: Math.max(0, e._count.registrations - 1) } }
            : e
        )
      );
      toast.success("Ton inscription a été annulée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Annulation impossible");
    }
  }

  const now = Date.now();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      {/* En-tête */}
      <header>
        <p className="ocd-kicker text-xs font-semibold">Communauté</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">Événements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Conférences, masterclass et rencontres OCD : inscris-toi et viens rencontrer la communauté.
        </p>
      </header>

      {/* Filtres */}
      <section aria-label="Filtres des événements" className="mt-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => changeFilters(key, upcoming)}
              className={cn(
                "inline-flex min-h-[36px] items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                category === key
                  ? "border-[#F07819] bg-[#F07819] text-white"
                  : "border-input bg-card text-muted-foreground hover:border-[#F07819]/40 hover:text-foreground"
              )}
            >
              {key === "ALL" ? "Tous" : EVENT_LABELS[key]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => changeFilters(category, true)}
            className={cn(
              "inline-flex min-h-[36px] items-center rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
              upcoming
                ? "border-foreground bg-foreground text-background"
                : "border-input bg-card text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={upcoming}
          >
            À venir
          </button>
          <button
            type="button"
            onClick={() => changeFilters(category, false)}
            className={cn(
              "inline-flex min-h-[36px] items-center rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
              !upcoming
                ? "border-foreground bg-foreground text-background"
                : "border-input bg-card text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={!upcoming}
          >
            Tous
          </button>
        </div>
      </section>

      {/* Contenu */}
      {loading ? (
        <div className="mt-6 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border bg-card">
              <Skeleton className="h-40 w-full rounded-none sm:h-44" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-40 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F07819]/10">
            <CalendarDays className="h-7 w-7 text-[#F07819]" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display text-lg font-semibold">
            Aucun événement pour le moment. Les prochains événements OCD seront annoncés ici.
          </p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {category !== "ALL" ? "Essaie une autre catégorie pour élargir ta recherche." : "Reviens bientôt : de nouvelles rencontres sont préparées."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {items.map((ev) => {
            const isPast = new Date(ev.startDate).getTime() < now;
            return (
              <article
                key={ev.id}
                className="grid overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:border-[#F07819]/40 hover:shadow-xl sm:grid-cols-[260px,1fr]"
              >
                {/* Visuel */}
                <div className="relative h-40 w-full overflow-hidden sm:h-full sm:min-h-[180px]">
                  {ev.imageUrl ? (
                    <Image
                      src={ev.imageUrl}
                      alt={`Illustration de l'événement ${ev.title}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 260px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-grid-ocd flex h-full w-full items-center justify-center bg-gradient-to-br from-[#171717] via-[#241d15] to-[#B45309]/80">
                      <CalendarDays className="h-10 w-10 text-white/70" aria-hidden="true" />
                    </div>
                  )}
                  {isPast && (
                    <Badge className="absolute left-3 top-3 border-0 bg-black/70 text-white">Passé</Badge>
                  )}
                </div>

                {/* Corps */}
                <div className="flex flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="font-display text-lg font-bold leading-snug">{ev.title}</h2>
                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      {ev.isDemo && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          Exemple de démonstration
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">
                        {EVENT_LABELS[ev.category] ?? ev.category}
                      </Badge>
                    </div>
                  </div>

                  <p className="line-clamp-2 text-sm text-muted-foreground">{ev.description}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                      <Clock className="h-3.5 w-3.5 text-[#F07819]" aria-hidden="true" />
                      {formatDateTime(ev.startDate)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      {ev.isOnline ? (
                        <>
                          <Globe className="h-3.5 w-3.5 text-[#F07819]" aria-hidden="true" /> En ligne
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3.5 w-3.5 text-[#F07819]" aria-hidden="true" />
                          {ev.location ?? "Lieu à préciser"}
                        </>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound className="h-3.5 w-3.5 text-[#F07819]" aria-hidden="true" />
                      {ev.organizerName ?? "OCD"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#F07819]" aria-hidden="true" />
                      {ev._count.registrations} inscrit{ev._count.registrations > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center gap-3 pt-1">
                    {ev.registered ? (
                      <>
                        <Badge className="border-0 bg-[#F07819] text-white">Inscrit</Badge>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-full hover:border-destructive/40 hover:text-destructive"
                          onClick={() => setCancelTarget(ev)}
                        >
                          Annuler
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-full px-5"
                        onClick={() => void register(ev)}
                      >
                        M&apos;y inscrire
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Confirmation d'annulation */}
      <AlertDialog open={cancelTarget !== null} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler ton inscription ?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget
                ? `Ta place pour « ${cancelTarget.title} » sera libérée et pourra être prise par un autre membre.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Garder mon inscription</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmCancel}
            >
              Annuler mon inscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
