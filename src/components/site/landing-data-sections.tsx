"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Globe2, MapPin, Sparkles, CheckCircle2, Loader2, CircleDashed, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/site/section-reveal";

// ============ RÉALISATIONS ============
export type AchievementItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  imageUrl: string | null;
  date: string | null;
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

export function AchievementsSection({ items }: { items: AchievementItem[] }) {
  return (
    <section className="py-24 sm:py-32" aria-labelledby="realisations-titre">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Des idées aux réalisations"
          title="DES IDÉES AUX RÉALISATIONS."
          description="Ce que Bovann et l'univers OCD construisent : uniquement des initiatives documentées et validées par l'équipe. Aucun chiffre, aucun projet n'est inventé."
        />

        {items.length === 0 ? (
          <Reveal className="mx-auto mt-14 max-w-2xl">
            <div className="rounded-2xl border border-dashed p-10 text-center">
              <Sparkles className="mx-auto mb-4 h-8 w-8 text-[#F07819]" />
              <p className="font-display text-lg font-bold">
                Les réalisations seront publiées ici
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Dès que l&apos;équipe OCD valide les initiatives documentées (titres, descriptions,
                médias, résultats réels), elles apparaîtront automatiquement dans cet espace.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.slice(0, 3).map((item, i) => (
              <Reveal key={item.id} delay={i * 0.1}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-[#F07819]/40 hover:shadow-xl">
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
                      <div className="flex h-full items-center justify-center bg-secondary">
                        <Sparkles className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-semibold">
                        {CATEGORY_LABELS[item.category] ?? item.category}
                      </Badge>
                      {item.status === "REALISE" && (
                        <Badge className="gap-1 bg-[#F07819]/15 text-[#B45309] hover:bg-[#F07819]/15">
                          <CheckCircle2 className="h-3 w-3" /> Réalisé
                        </Badge>
                      )}
                      {item.status === "EN_COURS" && (
                        <Badge variant="outline" className="gap-1">
                          <Loader2 className="h-3 w-3" /> En cours
                        </Badge>
                      )}
                      {item.status === "A_VENIR" && (
                        <Badge variant="outline" className="gap-1">
                          <CircleDashed className="h-3 w-3" /> À venir
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-display text-lg font-bold leading-snug">{item.title}</h3>
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal className="mt-10 text-center">
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link href="/realisations">
              Voir toutes les réalisations
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

// ============ ÉVÉNEMENTS ============
export type EventItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  startDate: string;
  location: string | null;
  isOnline: boolean;
  isDemo: boolean;
};

const EVENT_LABELS: Record<string, string> = {
  CONFERENCE: "Conférence",
  RENCONTRE: "Rencontre",
  MASTERCLASS: "Masterclass",
  ATELIER: "Atelier",
  LIVE: "Live",
  CHALLENGE: "Challenge",
  ENTREPRENARIAT: "Entrepreneuriat",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export function EventsSection({ items }: { items: EventItem[] }) {
  return (
    <section className="bg-secondary/40 py-24 sm:py-32" aria-labelledby="evenements-titre">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Les événements"
          title="DES RENCONTRES QUI FONT AVANCER."
          description="Masterclass, rencontres, challenges : des moments conçus pour sortir de l'écran, échanger en personne et créer de vraies connexions."
        />

        {items.length === 0 ? (
          <Reveal className="mx-auto mt-14 max-w-2xl">
            <div className="rounded-2xl border border-dashed p-10 text-center">
              <CalendarDays className="mx-auto mb-4 h-8 w-8 text-[#F07819]" />
              <p className="font-display text-lg font-bold">Aucun événement programmé pour le moment</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Les événements OCD seront annoncés ici dès leur officialisation par l&apos;équipe.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {items.slice(0, 3).map((ev, i) => (
              <Reveal key={ev.id} delay={i * 0.1}>
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-[#F07819]/40 hover:shadow-xl">
                  <div className="relative aspect-[16/9] bg-secondary">
                    {ev.imageUrl ? (
                      <Image
                        src={ev.imageUrl}
                        alt={ev.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="bg-grid-ocd flex h-full items-center justify-center">
                        <CalendarDays className="h-8 w-8 text-[#F07819]/50" />
                      </div>
                    )}
                    <Badge className="absolute left-3 top-3 bg-[#F07819] hover:bg-[#F07819]">
                      {EVENT_LABELS[ev.category] ?? ev.category}
                    </Badge>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <p className="text-sm font-semibold capitalize text-[#F07819]">
                      {formatDate(ev.startDate)}
                    </p>
                    <h3 className="font-display text-lg font-bold leading-snug">{ev.title}</h3>
                    <div className="mt-auto flex flex-col gap-1.5 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        {ev.isOnline ? (
                          <Globe2 className="h-4 w-4 text-[#F07819]" />
                        ) : (
                          <MapPin className="h-4 w-4 text-[#F07819]" />
                        )}
                        {ev.location ?? "Lieu à confirmer"}
                      </span>
                      {ev.isDemo && (
                        <span className="inline-flex items-center gap-1.5 text-xs italic text-muted-foreground/80">
                          <Info className="h-3.5 w-3.5" />
                          Exemple de démonstration
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal className="mt-10 text-center">
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link href="/evenements">
              Voir tous les événements
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
