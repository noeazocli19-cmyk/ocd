"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Handshake,
  Lightbulb,
  Quote,
  Rocket,
  UserPlus,
  UsersRound,
  MessagesSquare,
  Zap,
  CircleAlert,
  RotateCcw,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { api } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/site/section-reveal";
import { OcdNavbar } from "@/components/site/ocd-navbar";
import { OcdFooter } from "@/components/site/ocd-footer";

// ============ Données ============

const PILIERS = [
  {
    icon: Handshake,
    num: "01",
    title: "RENCONTRER",
    text: "Sortir de l'anonymat des écrans et créer de vraies relations. Chaque membre croisé peut devenir un allié, un partenaire ou un ami qui partage ton niveau d'exigence.",
    detail:
      "Les rencontres ne sont pas laissées au hasard : profils détaillés, centres d'intérêt et projets en cours rendent chaque mise en relation utile.",
  },
  {
    icon: Lightbulb,
    num: "02",
    title: "APPRENDRE",
    text: "Progresser auprès de personnes qui agissent réellement. Les expériences partagées valent souvent plus qu'un manuel : elles sont vécues, concrètes et actuelles.",
    detail:
      "Masterclass, échanges de groupe et retours d'expérience : OCD met en contact celles et ceux qui savent avec celles et ceux qui veulent apprendre.",
  },
  {
    icon: Rocket,
    num: "03",
    title: "AGIR",
    text: "Transformer les idées en projets et les discussions en collaborations. Une communauté se juge à ce qu'elle permet de construire, pas à ce qu'elle promet.",
    detail:
      "Groupes de travail, challenges et événements : chaque fonctionnalité d'OCD pousse vers un résultat mesurable et documenté.",
  },
];

const ETAPES = [
  {
    title: "Crée ton profil",
    text: "Présente qui tu es, ce que tu fais et ce que tu cherches. Un profil clair attire les bonnes personnes.",
  },
  {
    title: "Découvre les membres",
    text: "Explore la communauté par domaine, ville ou ambition, et identifie les profils qui complètent le tien.",
  },
  {
    title: "Rencontre et échange",
    text: "Discute, partage tes expériences, participe aux groupes et aux événements pour créer de vraies connexions.",
  },
  {
    title: "Passe à l'action",
    text: "Lance ton projet, forme une équipe ou rejoins une initiative existante. OCD existe pour cela.",
  },
];

// ============ Vue ============

export function VisionView() {
  const reduced = useReducedMotion();
  const [editorial, setEditorial] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ content: Record<string, string> }>("/api/site-content")
      .then((data) => {
        if (cancelled) return;
        setEditorial(data.content["philosophy.editorial"] ?? "");
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fadeUp = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <div className="flex min-h-screen flex-col">
      <OcdNavbar />
      <main id="contenu-principal" className="flex-1">
      {/* HERO */}
      <section
        className="relative flex min-h-[78svh] items-center overflow-hidden bg-ocd-dark text-white"
        aria-labelledby="vision-hero-titre"
      >
        <div className="bg-grid-ocd absolute inset-0 opacity-50" aria-hidden="true" />
        <div
          className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-[#F07819]/15 blur-[120px]"
          aria-hidden="true"
        />
        <div
          className="absolute -right-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[#F07819]/10 blur-[130px]"
          aria-hidden="true"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-40 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <motion.p {...fadeUp(0)} className="ocd-kicker mb-6 justify-center">
              La philosophie OCD
            </motion.p>
            <motion.h1
              {...fadeUp(0.1)}
              className="font-display text-[clamp(2.4rem,7vw,5rem)] font-extrabold leading-[1.04] tracking-tight"
            >
              LES OPPORTUNITÉS <span className="text-gradient-ocd">SONT DEHORS.</span>
            </motion.h1>
            <motion.p
              {...fadeUp(0.2)}
              className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg"
            >
              OCD n&apos;est pas un simple réseau social. C&apos;est un espace destiné à
              transformer les rencontres en relations, les idées en projets et les ambitions en
              actions.
            </motion.p>
          </div>
        </div>
        <div
          className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ocd-dark to-transparent"
          aria-hidden="true"
        />
      </section>

      {/* PILIERS */}
      <section className="py-24 sm:py-28" aria-labelledby="piliers-titre">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="ocd-kicker mb-4 justify-center">Les trois piliers</p>
            <h2
              id="piliers-titre"
              className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]"
            >
              LE MONDE APPARTIENT À{" "}
              <span className="text-gradient-ocd">CEUX QUI OSENT SORTIR.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Une conviction simple guide chaque fonctionnalité d&apos;OCD : les occasions de
              grandir se trouvent dans les rencontres réelles, les échanges sincères et les
              actions menées jusqu&apos;au bout.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {PILIERS.map((pilier, i) => (
              <Reveal key={pilier.title} delay={i * 0.12}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#F07819]/40 hover:shadow-xl hover:shadow-[#F07819]/5">
                  <span
                    className="font-display absolute -right-3 -top-6 text-[5.5rem] font-extrabold leading-none text-muted/80 select-none"
                    aria-hidden="true"
                  >
                    {pilier.num}
                  </span>
                  <div className="relative flex flex-1 flex-col">
                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#F07819]/10 text-[#F07819] transition-colors group-hover:bg-[#F07819] group-hover:text-white">
                      <pilier.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-xl font-bold tracking-wide">{pilier.title}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                      {pilier.text}
                    </p>
                    <p className="mt-4 border-t border-dashed pt-4 text-sm leading-relaxed text-muted-foreground/90">
                      {pilier.detail}
                    </p>
                  </div>
                  <div
                    className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-[#F07819] transition-transform duration-300 group-hover:scale-x-100"
                    aria-hidden="true"
                  />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CITATION ÉDITORIALE */}
      <section
        className="relative overflow-hidden bg-ocd-dark py-24 text-white sm:py-28"
        aria-labelledby="citation-titre"
      >
        <div className="bg-grid-ocd absolute inset-0 opacity-40" aria-hidden="true" />
        <div
          className="absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[#F07819]/12 blur-[120px]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 id="citation-titre" className="sr-only">
            Notre conviction
          </h2>
          {status === "loading" ? (
            <div className="mx-auto max-w-2xl space-y-4" aria-hidden="true">
              <Skeleton className="mx-auto h-14 w-14 rounded-full bg-white/10" />
              <Skeleton className="h-6 w-3/4 bg-white/10" />
              <Skeleton className="h-6 w-2/3 bg-white/10" />
              <Skeleton className="mx-auto h-4 w-56 bg-white/10" />
            </div>
          ) : status === "error" ? (
            <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8">
              <CircleAlert className="mx-auto mb-3 h-7 w-7 text-[#F07819]" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-white/70">
                Impossible de charger le texte éditorial pour le moment.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatus("loading");
                  api
                    .get<{ content: Record<string, string> }>("/api/site-content")
                    .then((data) => {
                      setEditorial(data.content["philosophy.editorial"] ?? "");
                      setStatus("ready");
                    })
                    .catch(() => setStatus("error"));
                }}
                className="mt-5 rounded-full border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
                Réessayer
              </Button>
            </div>
          ) : editorial && editorial.trim() ? (
            <Reveal>
              <span className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#F07819]/15 text-[#F07819]">
                <Quote className="h-6 w-6" aria-hidden="true" />
              </span>
              <blockquote>
                <p className="font-display text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl">
                  « {editorial} »
                </p>
              </blockquote>
              <p className="mt-6 text-xs italic text-white/40">
                Proposition éditoriale du prototype — non attribuée comme déclaration officielle.
              </p>
            </Reveal>
          ) : (
            <Reveal>
              <span className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#F07819]/15 text-[#F07819]">
                <Quote className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mx-auto max-w-xl rounded-2xl border border-dashed border-white/15 p-8 text-sm leading-relaxed text-white/55">
                Le texte éditorial de référence sera publié ici après validation par l&apos;équipe
                OCD. Rien n&apos;est inventé dans ce prototype.
              </p>
            </Reveal>
          )}
        </div>
      </section>

      {/* FONCTIONNEMENT */}
      <section className="bg-secondary/40 py-24 sm:py-28" aria-labelledby="fonctionnement-titre">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="ocd-kicker mb-4 justify-center">Le parcours</p>
            <h2
              id="fonctionnement-titre"
              className="font-display text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]"
            >
              COMMENT OCD FONCTIONNE
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Quatre étapes simples pour passer de spectateur à acteur de ta trajectoire.
            </p>
          </Reveal>

          <div className="relative mt-16 grid gap-10 lg:grid-cols-4 lg:gap-6">
            {/* Ligne de liaison (desktop) */}
            <div
              className="absolute left-0 right-0 top-7 hidden h-px bg-border lg:block"
              aria-hidden="true"
            />
            {ETAPES.map((etape, i) => (
              <Reveal key={etape.title} delay={i * 0.12} className="relative">
                <div className="flex gap-5 lg:flex-col lg:gap-0">
                  <span className="font-display relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#F07819] bg-background text-lg font-extrabold text-[#F07819] shadow-sm">
                    {i + 1}
                  </span>
                  <div className="lg:mt-6">
                    <h3 className="font-display text-lg font-bold">{etape.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {etape.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEUILLE DE ROUTE — présentation honnête du prototype */}
      <section className="border-t py-20 sm:py-24" aria-labelledby="roadmap-titre">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="ocd-kicker mb-4 justify-center">Ce prototype, en toute transparence</p>
            <h2
              id="roadmap-titre"
              className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]"
            >
              CE QUE CE PROTOTYPE DÉMONTRE DÉJÀ.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Ce prototype est une proposition indépendante présentée à Bovann. Les parcours
              essentiels sont réellement fonctionnels ; voici clairement ce qui est opérationnel et
              ce que la version officielle apportera.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border bg-card p-6">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F07819]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#B45309]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Fonctionnel dès maintenant
                </p>
                <ul className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                  <li>Page d&apos;accueil immersive, pages publiques (vision, Bovann, réalisations, galerie, événements).</li>
                  <li>Inscription en 5 étapes, connexion sécurisée, sessions protégées.</li>
                  <li>Fil d&apos;actualité : publications, photos, réactions, commentaires imbriqués.</li>
                  <li>Profils membres complets, demandes de connexion, abonnements.</li>
                  <li>Groupes thématiques avec espaces de discussion, messagerie privée (rafraîchissement automatique toutes les 5 s).</li>
                  <li>Événements avec inscription réelle, notifications, espace d&apos;administration complet.</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="h-full rounded-2xl border border-dashed bg-card p-6">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Prochaine version
                </p>
                <ul className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                  <li>Messagerie temps réel instantanée (WebSockets) et conversations de groupe.</li>
                  <li>Vérification d&apos;email, mot de passe oublié et réinitialisation.</li>
                  <li>Recommandations intelligentes enrichies (intérêts, compétences).</li>
                  <li>Vidéos hébergées dans les publications et la galerie.</li>
                  <li>Modération avancée : signalements, blocage d&apos;utilisateur, gestion fine des groupes.</li>
                  <li>Déploiement production (PostgreSQL/Neon, stockage Cloudinary, domaine officiel).</li>
                </ul>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
              Les profils marqués « Démo » sont fictifs et servent uniquement à illustrer
              l&apos;expérience. Aucune donnée personnelle réelle, aucune statistique ni déclaration
              attribuable à Bovann n&apos;a été inventée.
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        className="relative overflow-hidden bg-ocd-dark py-24 text-white sm:py-28"
        aria-labelledby="vision-cta-titre"
      >
        <div className="bg-grid-ocd absolute inset-0 opacity-50" aria-hidden="true" />
        <div
          className="absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[#F07819]/15 blur-[120px]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Reveal>
            <h2
              id="vision-cta-titre"
              className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl"
            >
              TON PROCHAIN DÉCLIC{" "}
              <span className="text-gradient-ocd">POURRAIT COMMENCER ICI.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
              La vision ne vaut que si elle se vit. Rejoins la communauté et fais de ta prochaine
              rencontre un point de départ.
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
                <Link href="/bovann">Découvrir Bovann</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Accès rapide (cohérence de navigation) */}
      <section className="border-t py-10" aria-label="Aller plus loin">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <Link
            href="/communaute"
            className="inline-flex items-center gap-2 transition-colors hover:text-[#F07819]"
          >
            <UsersRound className="h-4 w-4 text-[#F07819]" aria-hidden="true" />
            Découvrir la communauté
          </Link>
          <Link
            href="/evenements"
            className="inline-flex items-center gap-2 transition-colors hover:text-[#F07819]"
          >
            <MessagesSquare className="h-4 w-4 text-[#F07819]" aria-hidden="true" />
            Voir les événements
          </Link>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 transition-colors hover:text-[#F07819]"
          >
            <UserPlus className="h-4 w-4 text-[#F07819]" aria-hidden="true" />
            Créer un compte
          </Link>
          <Link
            href="/realisations"
            className="inline-flex items-center gap-2 transition-colors hover:text-[#F07819]"
          >
            <Zap className="h-4 w-4 text-[#F07819]" aria-hidden="true" />
            Les réalisations
          </Link>
        </div>
      </section>
      </main>
      <OcdFooter />
    </div>
  );
}
