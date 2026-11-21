import Link from "next/link";
import { OcdLogo } from "@/components/ocd-logo";
import { WhatsAppIcon } from "@/components/site/icons";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/vision", label: "La vision" },
  { href: "/bovann", label: "Bovann" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/communaute", label: "Communauté" },
  { href: "/evenements", label: "Événements" },
  { href: "/galerie", label: "Galerie" },
];

const UTILES = [
  { href: "/inscription", label: "Rejoindre OCD" },
  { href: "/connexion", label: "Connexion" },
  { href: "/evenements", label: "Participer aux événements" },
  { href: "/galerie", label: "Voir la galerie" },
];

export function OcdFooter() {
  return (
    <footer className="mt-auto border-t bg-ocd-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo + présentation */}
          <div className="space-y-4">
            <Link href="/" aria-label="OCD — accueil" className="inline-block">
              <OcdLogo className="h-8" />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/60">
              Un écosystème communautaire qui connecte les ambitions : les rencontres deviennent des
              relations, les idées deviennent des projets, les ambitions deviennent des actions.
            </p>
            <p className="font-display text-sm font-bold tracking-wide text-[#F07819]">
              LES OPPORTUNITÉS SONT DEHORS.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Navigation du pied de page">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-white/40">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {NAV.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/70 transition-colors hover:text-[#F07819]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Liens utiles */}
          <nav aria-label="Liens utiles">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-white/40">
              Liens utiles
            </h3>
            <ul className="space-y-2.5">
              {UTILES.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/70 transition-colors hover:text-[#F07819]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact vérifié */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-white/40">
              Contact officiel
            </h3>
            <a
              href="https://wa.me/2290154461925"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 transition-colors hover:border-[#F07819]/50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F07819]/15 text-[#F07819]">
                <WhatsAppIcon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs font-medium uppercase tracking-wide text-white/50">
                  WhatsApp — vérifié
                </span>
                <span className="block text-sm font-semibold text-white group-hover:text-[#F07819]">
                  +229 01 54 46 19 25
                </span>
              </span>
            </a>
            <p className="mt-3 text-xs leading-relaxed text-white/40">
              Contact issu des visuels officiels OCD PROJETS. Les autres canaux (email, réseaux
              sociaux) seront ajoutés uniquement après validation par l&apos;équipe OCD.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} OCD. Prototype indépendant — proposition présentée à
            Bovann. Tous droits réservés sur les contenus validés.
          </p>
          <p className="text-xs text-white/45">
            Fait avec exigence — pour une communauté qui passe à l&apos;action.
          </p>
        </div>
      </div>
    </footer>
  );
}
