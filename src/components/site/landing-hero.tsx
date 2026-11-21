"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass, Sparkles, Users } from "lucide-react";
import { HeroNetwork } from "@/components/site/hero-network";
import { OcdLogo } from "@/components/ocd-logo";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  const reduced = useReducedMotion();

  const ease = [0.22, 1, 0.36, 1] as const;
  const fadeUp = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease },
        };

  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden bg-ocd-dark text-white">
      {/* Fond : grille + réseau animé */}
      <div className="bg-grid-ocd absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="absolute inset-0" aria-hidden="true">
        <HeroNetwork className="h-full w-full opacity-90" />
      </div>
      {/* Halos */}
      <div
        className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-[#F07819]/15 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[#F07819]/10 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ocd-dark to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div {...fadeUp(0)} className="mb-8 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/75 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-[#F07819]" />
              Un écosystème communautaire &amp; entrepreneurial
            </span>
          </motion.div>

          {/* Logo */}
          <motion.div {...fadeUp(0.1)} className="mb-10 flex justify-center">
            <OcdLogo className="h-14 sm:h-20" priority />
          </motion.div>

          {/* Titre */}
          <motion.h1
            {...fadeUp(0.2)}
            className="font-display text-[clamp(2.4rem,7.5vw,5.5rem)] font-extrabold leading-[1.02] tracking-tight"
          >
            LES OPPORTUNITÉS{" "}
            <span className="text-gradient-ocd">SONT DEHORS.</span>
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            {...fadeUp(0.3)}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg"
          >
            Ne reste pas spectateur de ton avenir. Découvre une communauté qui te permet de
            rencontrer des personnes ambitieuses, de partager tes idées et de créer les connexions
            qui feront avancer tes projets.
          </motion.p>

          {/* Boutons */}
          <motion.div
            {...fadeUp(0.4)}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
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
              className="h-12 w-full rounded-full border-white/25 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur hover:bg-white/10 hover:text-white sm:w-auto"
            >
              <Link href="/vision">
                <Compass className="h-4.5 w-4.5" />
                Découvrir la vision
              </Link>
            </Button>
          </motion.div>

          {/* Indicateurs qualitatifs (aucun chiffre inventé) */}
          <motion.div
            {...fadeUp(0.5)}
            className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/50"
          >
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-[#F07819]" />
              Une communauté qui se construit avec toi
            </span>
            <span className="hidden h-4 w-px bg-white/15 sm:block" aria-hidden="true" />
            <span className="inline-flex items-center gap-2">
              <Compass className="h-4 w-4 text-[#F07819]" />
              Des rencontres qui mènent à des actions
            </span>
          </motion.div>
        </div>
      </div>

      {/* Indicateur de scroll */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex h-9 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
          <motion.div
            animate={reduced ? {} : { y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="h-2 w-1 rounded-full bg-[#F07819]"
          />
        </div>
      </motion.div>
    </section>
  );
}
