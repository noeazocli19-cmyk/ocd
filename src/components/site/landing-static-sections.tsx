"use client";

import Link from "next/link";
import {
  ArrowRight,
  Handshake,
  Lightbulb,
  Rocket,
  UserPlus,
  Megaphone,
  UsersRound,
  MessageCircle,
  CalendarCheck,
  FolderKanban,
  Network,
  GraduationCap,
  Code2,
  Video,
  Briefcase,
  PenTool,
  Compass,
} from "lucide-react";
import { Reveal, SectionHeading } from "@/components/site/section-reveal";
import { Button } from "@/components/ui/button";

const PILIERS = [
  {
    icon: Handshake,
    num: "01",
    title: "RENCONTRER",
    text: "Créer des relations et découvrir des personnes qui partagent tes ambitions. Les bonnes rencontres changent une trajectoire.",
  },
  {
    icon: Lightbulb,
    num: "02",
    title: "APPRENDRE",
    text: "Découvrir de nouvelles perspectives, partager des expériences réelles et développer tes compétences auprès de ceux qui agissent.",
  },
  {
    icon: Rocket,
    num: "03",
    title: "AGIR",
    text: "Transformer les idées en projets et les rencontres en collaborations. Ici, l'action est la seule monnaie qui compte.",
  },
];

export function PhilosophySection() {
  return (
    <section className="relative py-24 sm:py-32" aria-labelledby="philosophie-titre">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="La philosophie OCD"
          title={
            <>
              LE MONDE APPARTIENT À{" "}
              <span className="text-gradient-ocd">CEUX QUI OSENT SORTIR.</span>
            </>
          }
          description="OCD n'est pas un simple réseau social. C'est un espace conçu pour transformer les rencontres en relations, les idées en projets et les ambitions en actions."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {PILIERS.map((pilier, i) => (
            <Reveal key={pilier.title} delay={i * 0.12}>
              <article className="group relative h-full overflow-hidden rounded-2xl border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#F07819]/40 hover:shadow-xl hover:shadow-[#F07819]/5">
                <span
                  className="font-display absolute -right-3 -top-6 text-[5.5rem] font-extrabold leading-none text-muted/80 select-none"
                  aria-hidden="true"
                >
                  {pilier.num}
                </span>
                <div className="relative">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#F07819]/10 text-[#F07819] transition-colors group-hover:bg-[#F07819] group-hover:text-white">
                    <pilier.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold tracking-wide">{pilier.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    {pilier.text}
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
  );
}

// ============ SECTION COMMUNAUTÉ ============
const PROFILS = [
  { icon: Rocket, label: "Entrepreneurs", note: "Ceux qui construisent" },
  { icon: GraduationCap, label: "Étudiants", note: "Ceux qui se préparent" },
  { icon: Code2, label: "Développeurs", note: "Ceux qui créent en code" },
  { icon: Video, label: "Créateurs de contenu", note: "Ceux qui racontent" },
  { icon: Briefcase, label: "Freelances", note: "Ceux qui offrent leurs talents" },
  { icon: PenTool, label: "Professionnels", note: "Ceux qui maîtrisent leur métier" },
  { icon: Compass, label: "Porteurs de projets", note: "Ceux qui osent commencer" },
];

export function CommunitySection() {
  return (
    <section className="bg-secondary/40 py-24 sm:py-32" aria-labelledby="communaute-titre">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="La communauté"
          title="DES PROFILS COMPLÉMENTAIRES, UNE MÊME ÉNERGIE."
          description="OCD réunit celles et ceux qui veulent avancer ensemble. Chaque profil apporte une pièce du puzzle : l'idée, la compétence, l'expérience, la motivation."
        />
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PROFILS.map((p, i) => (
            <Reveal key={p.label} delay={i * 0.06}>
              <div className="group flex h-full flex-col items-center gap-3 rounded-2xl border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#F07819]/40 hover:shadow-lg">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F07819]/10 text-[#F07819] transition-colors group-hover:bg-[#F07819] group-hover:text-white">
                  <p.icon className="h-5 w-5" />
                </span>
                <span className="font-display text-sm font-bold">{p.label}</span>
                <span className="text-xs text-muted-foreground">{p.note}</span>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.42}>
            <Link
              href="/communaute"
              className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#F07819]/50 bg-[#F07819]/5 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-[#F07819]/10"
            >
              <Network className="h-5 w-5 text-[#F07819]" />
              <span className="font-display text-sm font-bold text-[#F07819]">
                Et toi, quel profil ?
              </span>
              <span className="text-xs text-muted-foreground">Rejoins la communauté</span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ============ SECTION POSSIBILITÉS ============
const POSSIBILITES = [
  { icon: UserPlus, title: "Créer ton profil", text: "Présente qui tu es, ce que tu fais et ce que tu cherches." },
  { icon: UsersRound, title: "Rencontrer des membres", text: "Découvre des personnes ambitieuses près de toi ou au-delà." },
  { icon: Megaphone, title: "Présenter tes projets", text: "Montre ce que tu construis et attire les bons partenaires." },
  { icon: MessageCircle, title: "Partager tes expériences", text: "Tes leçons valent de l'or pour quelqu'un qui démarre." },
  { icon: FolderKanban, title: "Rejoindre des groupes", text: "Des espaces thématiques pour apprendre et collaborer." },
  { icon: CalendarCheck, title: "Participer aux événements", text: "Rencontres, masterclass et challenges qui font agir." },
];

export function PossibilitiesSection() {
  return (
    <section className="py-24 sm:py-32" aria-labelledby="possibilites-titre">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Sur OCD"
          title="CE QUE TU PEUX FAIRE ICI."
          description="Chaque fonctionnalité d'OCD existe pour une seule raison : te rapprocher des personnes, des idées et des projets qui feront grandir le tien."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POSSIBILITES.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.07}>
              <div className="group flex gap-4 rounded-2xl border bg-card p-6 transition-all duration-300 hover:border-[#F07819]/40 hover:shadow-lg">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F07819]/10 text-[#F07819] transition-colors group-hover:bg-[#F07819] group-hover:text-white">
                  <p.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-[15px] font-bold">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ CTA FINAL ============
export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden bg-ocd-dark py-24 text-white sm:py-32" aria-labelledby="cta-titre">
      <div className="bg-grid-ocd absolute inset-0 opacity-50" aria-hidden="true" />
      <div
        className="absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[#F07819]/15 blur-[120px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <h2
            id="cta-titre"
            className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl"
          >
            TON PROCHAIN DÉCLIC <span className="text-gradient-ocd">POURRAIT COMMENCER ICI.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
            Les opportunités sont dehors. Une communauté est prête à te les faire découvrir.
            Rejoins OCD et transforme tes ambitions en actions.
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
  );
}
