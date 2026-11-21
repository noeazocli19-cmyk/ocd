"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Camera,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  ExternalLink,
  Flag,
  Images,
  Loader2,
  Mail,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { api, parseJsonArray } from "@/lib/client";
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
import { Reveal, SectionHeading } from "@/components/site/section-reveal";
import { OcdNavbar } from "@/components/site/ocd-navbar";
import { OcdFooter } from "@/components/site/ocd-footer";
import { WhatsAppIcon } from "@/components/site/icons";

// ============ Types ============

type AchievementItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  imageUrl: string | null;
  date: string | null;
};

type AchievementMedia = {
  id: string;
  url: string;
  type: string;
  caption: string | null;
};

type AchievementFull = AchievementItem & { media: AchievementMedia[] };

type GalleryItem = {
  id: string;
  url: string;
  type: string;
  category: string;
  title: string | null;
  description: string | null;
};

type SocialEntry = { label: string; url: string };

const CATEGORY_LABELS: Record<string, string> = {
  ENTREPRENARIAT: "Entrepreneuriat",
  PROJETS_NUMERIQUES: "Projets numériques",
  EVENEMENTS: "Événements",
  INITIATIVES: "Initiatives communautaires",
  CONTENU: "Création de contenu",
  COLLABORATIONS: "Collaborations",
  PROFESSIONNEL: "Activités professionnelles",
};

const GALLERY_CATEGORY_LABELS: Record<string, string> = {
  PORTRAITS: "Portraits",
  CONFERENCES: "Conférences",
  EVENEMENTS: "Événements",
  RENCONTRES: "Rencontres",
  ENTREPRENARIAT: "Entrepreneuriat",
  COULISSES: "Coulisses",
  PROJETS: "Projets",
  COMMUNAUTE: "Communauté",
};

// Répartition masonry-like sur une grille à rangées automatiques
const MOSAIC_SPANS = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
];

function formatDateFr(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function parseSocials(raw: string | null | undefined): SocialEntry[] {
  return parseJsonArray(raw)
    .map((entry) => {
      try {
        const parsed: unknown = JSON.parse(entry);
        if (parsed && typeof parsed === "object") {
          const obj = parsed as { label?: unknown; url?: unknown };
          if (typeof obj.url === "string" && obj.url.trim()) {
            return {
              label: typeof obj.label === "string" && obj.label.trim() ? obj.label : obj.url,
              url: obj.url,
            } satisfies SocialEntry;
          }
        }
        return null;
      } catch {
        return null;
      }
    })
    .filter((s): s is SocialEntry => s !== null);
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

export function BovannView() {
  const [content, setContent] = useState<Record<string, string> | null>(null);
  const [contentError, setContentError] = useState(false);
  const [achievements, setAchievements] = useState<AchievementFull[] | null>(null);
  const [achievementsError, setAchievementsError] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[] | null>(null);
  const [galleryError, setGalleryError] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;

    async function loadAll() {
      const [contentRes, achievementsRes, galleryRes] = await Promise.allSettled([
        api.get<{ content: Record<string, string> }>("/api/site-content"),
        api.get<{ items: AchievementFull[] }>("/api/achievements"),
        api.get<{ items: GalleryItem[] }>("/api/gallery"),
      ]);
      if (!alive) return;

      if (contentRes.status === "fulfilled") {
        setContent(contentRes.value.content);
        setContentError(false);
      } else {
        setContentError(true);
      }

      if (achievementsRes.status === "fulfilled") {
        setAchievements(achievementsRes.value.items);
        setAchievementsError(false);
      } else {
        setAchievementsError(true);
      }

      if (galleryRes.status === "fulfilled") {
        setGallery(galleryRes.value.items.slice(0, 8));
        setGalleryError(false);
      } else {
        setGalleryError(true);
      }
    }

    loadAll().catch(() => {
      if (!alive) return;
      setContentError(true);
      setAchievementsError(true);
      setGalleryError(true);
    });

    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const fullName = content?.["bovann.fullName"]?.trim() || "Bovann";
  const tagline = content?.["bovann.tagline"]?.trim() || "Porteur de la vision OCD";
  const photoUrl = content?.["bovann.photoUrl"]?.trim() ?? "";
  const presentation = content?.["bovann.presentation"]?.trim() ?? "";
  const journey = content?.["bovann.journey"]?.trim() ?? "";
  const activities = parseJsonArray(content?.["bovann.activities"]);
  const socials = parseSocials(content?.["bovann.socials"]);
  const whatsapp = content?.["contact.whatsapp"]?.trim() ?? "";
  const whatsappLink = content?.["contact.whatsappLink"]?.trim() ?? "";
  const email = content?.["contact.email"]?.trim() ?? "";

  const galleryItems = gallery ?? [];
  const lightboxItem = lightboxIndex !== null ? galleryItems[lightboxIndex] : null;

  return (
    <div className="flex min-h-screen flex-col">
      <OcdNavbar />
      <main id="contenu-principal" className="flex-1">
        {/* HERO */}
        <section
          className="relative overflow-hidden bg-ocd-dark text-white"
          aria-labelledby="bovann-hero-titre"
        >
          <div className="bg-grid-ocd absolute inset-0 opacity-50" aria-hidden="true" />
          <div
            className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-[#F07819]/15 blur-[120px]"
            aria-hidden="true"
          />
          <div
            className="absolute -right-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[#F07819]/10 blur-[130px]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 sm:pt-40 lg:px-8">
            <Reveal className="mx-auto max-w-4xl text-center">
              <p className="ocd-kicker mb-6 justify-center">Le porteur de la vision</p>
              <h1
                id="bovann-hero-titre"
                className="font-display text-[clamp(2.4rem,6.5vw,4.5rem)] font-extrabold leading-[1.04] tracking-tight"
              >
                À L&apos;ORIGINE D&apos;UNE <span className="text-gradient-ocd">VISION.</span>
              </h1>
              <p className="mt-8 font-display text-xl font-bold text-white sm:text-2xl">
                {fullName}
              </p>
              <p className="mt-2 text-sm uppercase tracking-[0.16em] text-white/55 sm:text-base">
                {tagline}
              </p>
              <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-white/60">
                Cette page regroupe les informations vérifiées le concernant. Les champs encore
                vides sont explicitement signalés : rien n&apos;est inventé dans ce prototype.
              </p>
            </Reveal>
          </div>
          <div
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ocd-dark to-transparent"
            aria-hidden="true"
          />
        </section>

        {/* PORTRAIT + PRÉSENTATION */}
        <section className="py-24 sm:py-28" aria-labelledby="portrait-titre">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="portrait-titre" className="sr-only">
              Présentation de {fullName}
            </h2>
            {contentError && (
              <p className="mb-8 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                Impossible de charger les contenus éditoriaux — des informations par défaut sont
                affichées.{" "}
                <button
                  type="button"
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="inline-flex items-center gap-1 font-semibold text-[#F07819] underline underline-offset-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Réessayer
                </button>
              </p>
            )}
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Portrait / emplacement photo officiel */}
              <Reveal className="relative mx-auto w-full max-w-md lg:mx-0">
                <div
                  className="absolute -inset-3 rounded-[1.75rem] border border-[#F07819]/30"
                  aria-hidden="true"
                />
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary">
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={`Photographie de ${fullName}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 90vw, 40vw"
                      priority
                    />
                  ) : (
                    <>
                      <Image
                        src="/images/gen-stage-portrait.png"
                        alt=""
                        fill
                        className="object-cover opacity-70"
                        sizes="(max-width: 1024px) 90vw, 40vw"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-t from-black/70 via-black/20 to-black/40 p-8 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F07819]/15 text-[#F07819]">
                          <Camera className="h-7 w-7" aria-hidden="true" />
                        </span>
                        <p className="font-display text-lg font-bold text-white">
                          Photographie officielle à intégrer
                        </p>
                        <p className="max-w-[28ch] text-sm leading-relaxed text-white/65">
                          Aucune image de substitution ne présente son visage. La photographie
                          officielle sera ajoutée par l&apos;équipe OCD.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Reveal>

              {/* Présentation, parcours, activités */}
              <div className="flex flex-col gap-8">
                <Reveal delay={0.1}>
                  <p className="ocd-kicker mb-4">Présentation</p>
                  {presentation ? (
                    <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                      {presentation}
                    </p>
                  ) : (
                    <p className="rounded-2xl border border-dashed p-6 text-sm leading-relaxed text-muted-foreground">
                      Présentation détaillée, parcours et activités :{" "}
                      <span className="font-semibold text-foreground">
                        champs réservés à l&apos;équipe OCD
                      </span>
                      . Rien n&apos;est inventé dans ce prototype : ces contenus seront publiés
                      uniquement après validation.
                    </p>
                  )}
                </Reveal>

                {journey && (
                  <Reveal delay={0.16}>
                    <div className="rounded-2xl border bg-card p-6">
                      <div className="mb-3 flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F07819]/10 text-[#F07819]">
                          <Flag className="h-4.5 w-4.5" aria-hidden="true" />
                        </span>
                        <h3 className="font-display text-base font-bold">Parcours</h3>
                      </div>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {journey}
                      </p>
                    </div>
                  </Reveal>
                )}

                {activities.length > 0 && (
                  <Reveal delay={0.22}>
                    <p className="ocd-kicker mb-4">Domaines d&apos;activité</p>
                    <div className="flex flex-wrap gap-2">
                      {activities.map((activity) => (
                        <span
                          key={activity}
                          className="inline-flex items-center rounded-full border border-[#F07819]/35 bg-[#F07819]/10 px-3.5 py-1.5 text-xs font-semibold text-[#B45309] dark:text-[#FFB25C]"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </Reveal>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* RÉALISATIONS */}
        <section className="bg-secondary/40 py-24 sm:py-28" aria-labelledby="bovann-realisations-titre">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker="Des idées aux réalisations"
              title="DES IDÉES AUX RÉALISATIONS."
              description="Les initiatives documentées et validées par l'équipe OCD. Aucun projet ni chiffre n'est inventé."
            />

            {achievementsError ? (
              <Reveal className="mx-auto mt-14 max-w-xl">
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
            ) : achievements === null ? (
              <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
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
            ) : achievements.length === 0 ? (
              <Reveal className="mx-auto mt-14 max-w-2xl">
                <div className="rounded-2xl border border-dashed p-10 text-center">
                  <Sparkles className="mx-auto mb-4 h-8 w-8 text-[#F07819]" aria-hidden="true" />
                  <p className="font-display text-lg font-bold">
                    Aucune réalisation publiée pour le moment
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Les initiatives documentées apparaîtront ici dès leur validation par
                    l&apos;équipe OCD.
                  </p>
                </div>
              </Reveal>
            ) : (
              <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {achievements.map((item, i) => (
                  <Reveal key={item.id} delay={i * 0.08}>
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
                        {item.date && (
                          <p className="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5 text-[#F07819]" aria-hidden="true" />
                            {formatDateFr(item.date)}
                          </p>
                        )}
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* GALERIE */}
        <section className="py-24 sm:py-28" aria-labelledby="bovann-galerie-titre">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker="La galerie"
              title="INSTANTS ET VISUELS."
              description="Une sélection limitée de visuels liés à l'univers OCD. L'intégralité est visible sur la page Galerie."
            />

            {galleryError ? (
              <Reveal className="mx-auto mt-14 max-w-xl">
                <div className="rounded-2xl border border-dashed p-10 text-center">
                  <CircleAlert className="mx-auto mb-4 h-8 w-8 text-[#F07819]" aria-hidden="true" />
                  <p className="font-display text-lg font-bold">Impossible de charger la galerie</p>
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
            ) : gallery === null ? (
              <div
                className="mt-14 grid auto-rows-[140px] grid-cols-2 gap-4 sm:auto-rows-[170px] sm:grid-cols-3 lg:auto-rows-[190px] lg:grid-cols-4"
                aria-hidden="true"
              >
                {MOSAIC_SPANS.slice(0, 6).map((span, i) => (
                  <Skeleton key={i} className={`${span} rounded-2xl`} />
                ))}
              </div>
            ) : galleryItems.length === 0 ? (
              <Reveal className="mx-auto mt-14 max-w-2xl">
                <div className="rounded-2xl border border-dashed p-10 text-center">
                  <Images className="mx-auto mb-4 h-8 w-8 text-[#F07819]" aria-hidden="true" />
                  <p className="font-display text-lg font-bold">La galerie est encore vide</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Les visuels validés par l&apos;équipe OCD seront publiés ici.
                  </p>
                </div>
              </Reveal>
            ) : (
              <>
                <div className="mt-14 grid auto-rows-[140px] grid-cols-2 gap-4 sm:auto-rows-[170px] sm:grid-cols-3 lg:auto-rows-[190px] lg:grid-cols-4">
                  {galleryItems.map((item, i) => (
                    <Reveal key={item.id} delay={(i % 4) * 0.08} className={MOSAIC_SPANS[i % MOSAIC_SPANS.length]}>
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(i)}
                        className="group relative h-full w-full overflow-hidden rounded-2xl border bg-secondary transition-all duration-300 hover:border-[#F07819]/40 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F07819]"
                        aria-label={
                          item.type === "VIDEO"
                            ? `Ouvrir la vidéo : ${item.title ?? "sans titre"}`
                            : `Agrandir l'image : ${item.title ?? "sans titre"}`
                        }
                      >
                        <Image
                          src={item.url}
                          alt={item.title ?? "Visuel de la galerie OCD"}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        {item.type === "VIDEO" && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors group-hover:bg-black/50">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg">
                              <Play className="h-5 w-5 translate-x-0.5" aria-hidden="true" />
                            </span>
                          </span>
                        )}
                        <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-left text-xs font-medium text-white">
                          {item.title ?? GALLERY_CATEGORY_LABELS[item.category] ?? item.category}
                        </span>
                      </button>
                    </Reveal>
                  ))}
                </div>
                <Reveal className="mt-6 text-center">
                  <Button asChild variant="outline" className="rounded-full px-6">
                    <Link href="/galerie">
                      Voir toute la galerie
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </Reveal>
                <p className="mt-6 text-center text-xs italic text-muted-foreground/80">
                  Visuels d&apos;ambiance provisoires — les photographies officielles seront
                  ajoutées par l&apos;équipe OCD.
                </p>
              </>
            )}
          </div>
        </section>

        {/* CONTACT OFFICIEL */}
        <section
          className="relative overflow-hidden bg-ocd-dark py-24 text-white sm:py-28"
          aria-labelledby="contact-titre"
        >
          <div className="bg-grid-ocd absolute inset-0 opacity-40" aria-hidden="true" />
          <div
            className="absolute -right-32 top-0 h-80 w-80 rounded-full bg-[#F07819]/12 blur-[110px]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <p className="ocd-kicker mb-4">Contact officiel</p>
                <h2
                  id="contact-titre"
                  className="font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl"
                >
                  UN CANAL DIRECT <span className="text-gradient-ocd">ET VÉRIFIÉ.</span>
                </h2>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-white/60">
                  Un seul canal de contact est officiellement validé à ce jour. Toute autre adresse
                  prétendant représenter OCD ou {fullName} n&apos;est pas confirmée.
                </p>
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="mt-8 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-[#F07819]/50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F07819]/15 text-[#F07819]">
                      <Mail className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-xs font-medium uppercase tracking-wide text-white/50">
                        Email officiel
                      </span>
                      <span className="block text-sm font-semibold text-white">{email}</span>
                    </span>
                  </a>
                )}
              </Reveal>

              <Reveal delay={0.12} className="flex flex-col justify-center gap-4">
                {whatsappLink ? (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F07819]/50 hover:shadow-xl hover:shadow-[#F07819]/10"
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F07819]/15 text-[#F07819] transition-colors group-hover:bg-[#F07819] group-hover:text-white">
                      <WhatsAppIcon className="h-7 w-7" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/55">
                        WhatsApp — vérifié
                        <BadgeCheck className="h-3.5 w-3.5 text-[#F07819]" aria-hidden="true" />
                      </span>
                      <span className="block truncate font-display text-lg font-bold text-white">
                        {whatsapp || whatsappLink}
                      </span>
                      <span className="mt-0.5 block text-xs text-white/50">
                        Ouvre une conversation WhatsApp dans un nouvel onglet
                      </span>
                    </span>
                  </a>
                ) : (
                  <p className="rounded-2xl border border-dashed border-white/15 p-6 text-sm leading-relaxed text-white/55">
                    Canal WhatsApp officiel : à confirmer par l&apos;équipe OCD. Aucun numéro
                    n&apos;est affiché tant qu&apos;il n&apos;est pas vérifié.
                  </p>
                )}

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/55">
                    Réseaux sociaux officiels
                  </p>
                  {socials.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {socials.map((social) => (
                        <a
                          key={social.url}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:border-[#F07819]/50 hover:text-[#FFB25C]"
                        >
                          {social.label}
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-white/50">
                      Réseaux sociaux officiels : à confirmer par l&apos;équipe OCD.
                    </p>
                  )}
                </div>

                <p className="text-xs italic text-white/40">
                  Coordonnées issues des visuels officiels fournis — elles seront enrichies
                  uniquement après validation par l&apos;équipe OCD.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 sm:py-28" aria-labelledby="bovann-cta-titre">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <Reveal>
              <p className="ocd-kicker mb-4 justify-center">Rejoindre OCD</p>
              <h2
                id="bovann-cta-titre"
                className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl"
              >
                UNE VISION. UNE COMMUNAUTÉ.{" "}
                <span className="text-gradient-ocd">TON TOUR D'AGIR.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Crée ton compte, rencontre des personnes ambitieuses et transforme tes idées en
                projets concrets.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 w-full rounded-full px-8 text-base font-semibold shadow-lg shadow-[#F07819]/25 sm:w-auto"
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
                  className="h-12 w-full rounded-full px-8 text-base font-semibold sm:w-auto"
                >
                  <Link href="/vision">Découvrir la vision</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <OcdFooter />

      {/* VISIONNEUSE GALERIE */}
      <Dialog
        open={lightboxIndex !== null}
        onOpenChange={(open) => {
          if (!open) setLightboxIndex(null);
        }}
      >
        <DialogContent className="h-[100dvh] w-full max-w-none gap-0 overflow-y-auto rounded-none border-0 bg-black p-0 sm:h-auto sm:max-w-4xl sm:rounded-2xl">
          {lightboxItem && (
            <div className="flex h-full flex-col sm:h-auto">
              {lightboxItem.type === "VIDEO" ? (
                <video
                  key={lightboxItem.id}
                  src={lightboxItem.url}
                  controls
                  playsInline
                  className="max-h-[70vh] w-full bg-black object-contain"
                />
              ) : (
                <div className="relative aspect-[4/3] w-full bg-black sm:max-h-[70vh]">
                  <Image
                    src={lightboxItem.url}
                    alt={lightboxItem.title ?? "Visuel de la galerie OCD"}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </div>
              )}
              <div className="bg-background p-6">
                <DialogHeader>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge className="bg-[#F07819] hover:bg-[#F07819]">
                      {GALLERY_CATEGORY_LABELS[lightboxItem.category] ?? lightboxItem.category}
                    </Badge>
                    {lightboxItem.type === "VIDEO" && (
                      <Badge variant="outline" className="gap-1">
                        <Play className="h-3 w-3" aria-hidden="true" />
                        Vidéo
                      </Badge>
                    )}
                  </div>
                  <DialogTitle className="font-display text-lg font-bold">
                    {lightboxItem.title ?? "Visuel OCD"}
                  </DialogTitle>
                  <DialogDescription className="leading-relaxed">
                    {lightboxItem.description ?? "Légende à préciser par l'équipe OCD."}
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
