"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Camera, Quote, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OcdLogo } from "@/components/ocd-logo";

type BovannData = {
  fullName: string;
  tagline: string;
  presentation: string; // vide = non renseigné (jamais inventé)
  photoUrl: string; // vide = photo officielle non fournie
  activities: string[]; // JSON administrable
};

export function BovannSection({ data }: { data: BovannData }) {
  const reduced = useReducedMotion();
  const hasPhoto = Boolean(data.photoUrl);
  const hasPresentation = Boolean(data.presentation && data.presentation.trim());

  return (
    <section
      className="relative overflow-hidden bg-ocd-dark py-24 text-white sm:py-32"
      aria-labelledby="bovann-titre"
    >
      <div className="bg-grid-ocd absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-[#F07819]/12 blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#F07819]/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Portrait / emplacement photo officiel */}
          <motion.div
            initial={reduced ? {} : { opacity: 0, scale: 0.96 }}
            whileInView={reduced ? {} : { opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-md lg:mx-0"
          >
            {/* Cadre décoratif */}
            <div
              className="absolute -inset-3 rounded-[1.75rem] border border-[#F07819]/30"
              aria-hidden="true"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#1d1d1d]">
              {hasPhoto ? (
                <Image
                  src={data.photoUrl}
                  alt={`Photographie de ${data.fullName}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 40vw"
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
                      <Camera className="h-7 w-7" />
                    </span>
                    <p className="font-display text-lg font-bold">Emplacement officiel</p>
                    <p className="max-w-[26ch] text-sm leading-relaxed text-white/60">
                      La photographie officielle de {data.fullName} sera intégrée ici dès sa
                      validation par l&apos;équipe OCD. Aucune image de substitution ne présente
                      son visage.
                    </p>
                  </div>
                </>
              )}
            </div>
            {/* Carte flottante identité */}
            <motion.div
              animate={reduced ? {} : { y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="glow-ocd absolute -bottom-6 left-1/2 w-[85%] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#111111]/90 p-4 backdrop-blur"
            >
              <div className="flex items-center gap-3">
                <OcdLogo className="h-6 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold">{data.fullName}</p>
                  <p className="truncate text-xs text-white/55">{data.tagline}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Contenu éditorial */}
          <div>
            <motion.p
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="ocd-kicker mb-5"
            >
              À l&apos;origine d&apos;une vision
            </motion.p>
            <motion.h2
              id="bovann-titre"
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="font-display text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl lg:text-[2.9rem]"
            >
              UNE VISION. UNE COMMUNAUTÉ.{" "}
              <span className="text-gradient-ocd">UN MOUVEMENT.</span>
            </motion.h2>

            <motion.div
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="mt-7 space-y-5"
            >
              <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
                <Quote className="h-5 w-5 shrink-0 text-[#F07819]" aria-hidden="true" />
                <p className="text-[15px] leading-relaxed text-white/75">
                  Derrière chaque ambition, il y a une vision. OCD porte une philosophie simple :
                  les opportunités sont dehors. Il faut oser sortir, rencontrer, découvrir et
                  agir.
                </p>
              </div>
              <p className="text-xs italic text-white/40">
                Proposition éditoriale présentée dans le cadre de ce prototype — non attribuée
                comme déclaration de {data.fullName}.
              </p>

              {hasPresentation ? (
                <p className="text-[15px] leading-relaxed text-white/70">{data.presentation}</p>
              ) : (
                <p className="rounded-xl border border-dashed border-white/15 p-4 text-sm leading-relaxed text-white/50">
                  Présentation détaillée, parcours et activités de {data.fullName} :{" "}
                  <span className="font-semibold text-white/70">
                    champs réservés à l&apos;équipe OCD
                  </span>
                  . Ces informations seront publiées uniquement après validation — rien
                  n&apos;est inventé dans ce prototype.
                </p>
              )}

              {data.activities.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {data.activities.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#F07819]/35 bg-[#F07819]/10 px-3.5 py-1.5 text-xs font-semibold text-[#FFB25C]"
                    >
                      <MapPin className="h-3 w-3" />
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={reduced ? {} : { opacity: 0, y: 20 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="mt-9"
            >
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-7 text-base font-semibold shadow-lg shadow-[#F07819]/25"
              >
                <Link href="/bovann">
                  Découvrir son univers
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
