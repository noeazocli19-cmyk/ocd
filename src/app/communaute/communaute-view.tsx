"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  CircleAlert,
  Code2,
  Compass,
  FolderKanban,
  Globe2,
  GraduationCap,
  Info,
  LogIn,
  MapPin,
  Megaphone,
  MessageCircle,
  PenTool,
  Rocket,
  RotateCcw,
  UserPlus,
  UsersRound,
  Video,
} from "lucide-react";
import { api, formatDateLong } from "@/lib/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal, SectionHeading } from "@/components/site/section-reveal";
import { OcdNavbar } from "@/components/site/ocd-navbar";
import { OcdFooter } from "@/components/site/ocd-footer";

// ============ Données statiques ============

const PROFILS = [
  {
    icon: Rocket,
    label: "Entrepreneurs",
    note: "Ceux qui construisent et cherchent les bons partenaires pour accélérer.",
  },
  {
    icon: GraduationCap,
    label: "Étudiants",
    note: "Ceux qui se préparent et veulent apprendre auprès de personnes qui agissent.",
  },
  {
    icon: Code2,
    label: "Développeurs",
    note: "Ceux qui créent en code et donnent vie aux idées techniques.",
  },
  {
    icon: Video,
    label: "Créateurs de contenu",
    note: "Ceux qui racontent, inspirent et font rayonner les projets.",
  },
  {
    icon: Briefcase,
    label: "Freelances",
    note: "Ceux qui offrent leurs talents et élargissent leur réseau de clients.",
  },
  {
    icon: PenTool,
    label: "Professionnels",
    note: "Ceux qui maîtrisent leur métier et partagent leur expérience.",
  },
  {
    icon: Compass,
    label: "Porteurs de projets",
    note: "Ceux qui osent commencer et cherchent une équipe pour aller plus loin.",
  },
];

const POSSIBILITES = [
  {
    icon: UserPlus,
    title: "Créer ton profil",
    text: "Présente qui tu es, ce que tu fais et ce que tu cherches en quelques minutes.",
  },
  {
    icon: UsersRound,
    title: "Rencontrer des membres",
    text: "Découvre des personnes ambitieuses autour de toi et au-delà des frontières.",
  },
  {
    icon: Megaphone,
    title: "Présenter tes projets",
    text: "Montre ce que tu construis et attire les bonnes personnes vers ton idée.",
  },
  {
    icon: MessageCircle,
    title: "Partager tes expériences",
    text: "Tes leçons, réussites et échecs valent de l'or pour quelqu'un qui démarre.",
  },
  {
    icon: FolderKanban,
    title: "Rejoindre des groupes",
    text: "Des espaces thématiques pour apprendre, échanger et collaborer durablement.",
  },
  {
    icon: CalendarCheck,
    title: "Participer aux événements",
    text: "Rencontres, masterclass et challenges conçus pour sortir de l'écran.",
  },
];

// ============ Vue ============

type EventItem = {
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

export function CommunauteView() {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    api
      .get<{ items: EventItem[] }>("/api/events?upcoming=1&limit=3")
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
  }, [reloadKey]);

  return (
    <div className="flex min-h-screen flex-col">
      <OcdNavbar />
      <main id="contenu-principal" className="flex-1">
        {/* HERO */}
        <section
          className="relative overflow-hidden border-b bg-secondary/40"
          aria-labelledby="communaute-hero-titre"
        >
          <div className="bg-grid-ocd absolute inset-0 opacity-60" aria-hidden="true" />
          <div
            className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#F07819]/10 blur-[100px]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pb-20 sm:pt-40 lg:px-8">
            <Reveal className="mx-auto max-w-3xl text-center">
              <p className="ocd-kicker mb-4 justify-center">La communauté</p>
              <h1
                id="communaute-hero-titre"
                className="font-display text-[clamp(2.2rem,6vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-foreground"
              >
                DES PERSONNES AMBITIEUSES,{" "}
                <span className="text-gradient-ocd">UNE MÊME ÉNERGIE.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                OCD réunit celles et ceux qui préfèrent avancer ensemble : chaque profil apporte
                une pièce du puzzle — l&apos;idée, la compétence, l&apos;expérience ou la
                motivation.
              </p>
            </Reveal>
          </div>
        </section>

        {/* PROFILS */}
        <section className="py-24 sm:py-28" aria-labelledby="profils-titre">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker="Profils types"
              title="TROUVE TA PLACE DANS LA COMMUNAUTÉ."
              description="Cette liste n'est pas exhaustive : si tu as une ambition et l'envie d'agir, tu es au bon endroit."
            />
            <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PROFILS.map((profil, i) => (
                <Reveal key={profil.label} delay={(i % 4) * 0.07}>
                  <div className="group flex h-full flex-col gap-3 rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#F07819]/40 hover:shadow-lg">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#F07819]/10 text-[#F07819] transition-colors group-hover:bg-[#F07819] group-hover:text-white">
                      <profil.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-[15px] font-bold">{profil.label}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{profil.note}</p>
                  </div>
                </Reveal>
              ))}
              <Reveal delay={0.28}>
                <Link
                  href="/inscription"
                  className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#F07819]/50 bg-[#F07819]/5 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-[#F07819]/10"
                >
                  <UsersRound className="h-5 w-5 text-[#F07819]" aria-hidden="true" />
                  <span className="font-display text-sm font-bold text-[#F07819]">
                    Et toi, quel profil ?
                  </span>
                  <span className="text-xs text-muted-foreground">Rejoins la communauté</span>
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        {/* POSSIBILITÉS */}
        <section className="bg-secondary/40 py-24 sm:py-28" aria-labelledby="possibilites-titre">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker="Fonctionnalités"
              title="CE QUE TU PEUX FAIRE SUR OCD."
              description="Six façons concrètes de transformer ta présence en opportunités réelles."
            />
            <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {POSSIBILITES.map((p, i) => (
                <Reveal key={p.title} delay={(i % 3) * 0.08}>
                  <div className="group flex h-full gap-4 rounded-2xl border bg-card p-6 transition-all duration-300 hover:border-[#F07819]/40 hover:shadow-lg">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F07819]/10 text-[#F07819] transition-colors group-hover:bg-[#F07819] group-hover:text-white">
                      <p.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-display text-[15px] font-bold">{p.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {p.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ÉVÉNEMENTS À VENIR */}
        <section className="py-24 sm:py-28" aria-labelledby="evenements-avenir-titre">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker="Rendez-vous"
              title="LES PROCHAINS ÉVÉNEMENTS."
              description="Les rencontres programmées par l'équipe OCD. Détails et inscriptions sur la page Événements."
            />

            {error ? (
              <Reveal className="mx-auto mt-14 max-w-xl">
                <div className="rounded-2xl border border-dashed p-10 text-center">
                  <CircleAlert className="mx-auto mb-4 h-8 w-8 text-[#F07819]" aria-hidden="true" />
                  <p className="font-display text-lg font-bold">
                    Impossible de charger les événements
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
              <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="overflow-hidden rounded-2xl border bg-card">
                    <Skeleton className="aspect-[16/9] w-full rounded-none" />
                    <div className="space-y-3 p-6">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <Reveal className="mx-auto mt-14 max-w-2xl">
                <div className="rounded-2xl border border-dashed p-10 text-center">
                  <CalendarDays className="mx-auto mb-4 h-8 w-8 text-[#F07819]" aria-hidden="true" />
                  <p className="font-display text-lg font-bold">
                    Aucun événement programmé pour le moment
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Les rencontres OCD seront annoncées ici dès leur officialisation par
                    l&apos;équipe.
                  </p>
                </div>
              </Reveal>
            ) : (
              <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
                {events.map((event, i) => (
                  <Reveal key={event.id} delay={i * 0.1}>
                    <article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-[#F07819]/40 hover:shadow-xl">
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
                              className="h-8 w-8 text-[#F07819]/50"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                        <Badge className="absolute left-3 top-3 bg-[#F07819] hover:bg-[#F07819]">
                          {EVENT_LABELS[event.category] ?? event.category}
                        </Badge>
                      </div>
                      <div className="flex flex-1 flex-col gap-2.5 p-6">
                        <p className="text-sm font-semibold capitalize text-[#F07819]">
                          {formatDateLong(event.startDate)}
                        </p>
                        <h3 className="font-display text-base font-bold leading-snug">
                          {event.title}
                        </h3>
                        <div className="mt-auto flex flex-col gap-1.5 pt-1 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            {event.isOnline ? (
                              <>
                                <Globe2 className="h-4 w-4 shrink-0 text-[#F07819]" aria-hidden="true" />
                                En ligne
                              </>
                            ) : (
                              <>
                                <MapPin className="h-4 w-4 shrink-0 text-[#F07819]" aria-hidden="true" />
                                {event.location ?? "Lieu à confirmer"}
                              </>
                            )}
                          </span>
                          {event.isDemo && (
                            <span className="inline-flex items-center gap-1.5 text-xs italic text-muted-foreground/80">
                              <Info className="h-3.5 w-3.5" aria-hidden="true" />
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

        {/* CTA */}
        <section
          className="relative overflow-hidden bg-ocd-dark py-24 text-white sm:py-28"
          aria-labelledby="communaute-cta-titre"
        >
          <div className="bg-grid-ocd absolute inset-0 opacity-50" aria-hidden="true" />
          <div
            className="absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[#F07819]/15 blur-[120px]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <Reveal>
              <h2
                id="communaute-cta-titre"
                className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]"
              >
                CRÉE TON COMPTE POUR DÉCOUVRIR LES MEMBRES{" "}
                <span className="text-gradient-ocd">ET REJOINDRE LES GROUPES.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
                L&apos;énergie est là, il ne manque plus que la tienne. Rejoins la communauté et
                fais tes premières rencontres dès aujourd&apos;hui.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full rounded-full px-8 text-base font-semibold shadow-lg shadow-[#F07819]/30 sm:w-auto"
                >
                  <Link href="/inscription">
                    Rejoindre OCD
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full border-white/25 bg-white/5 px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  <Link href="/connexion">
                    <LogIn className="h-4.5 w-4.5" />
                    Connexion
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <OcdFooter />
    </div>
  );
}
