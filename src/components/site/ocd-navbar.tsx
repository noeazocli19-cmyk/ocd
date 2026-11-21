"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { OcdLogo } from "@/components/ocd-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/vision", label: "La vision" },
  { href: "/bovann", label: "Bovann" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/communaute", label: "Communauté" },
  { href: "/evenements", label: "Événements" },
];

type MeUser = { id: string; firstName: string } | null;

export function OcdNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [me, setMe] = useState<MeUser>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    // Vérification initiale hors du corps synchrone de l'effet
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setMe(d.user ? { id: d.user.id, firstName: d.user.firstName } : null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || mobileOpen
          ? "border-b bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <a
        href="#contenu-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Aller au contenu principal
      </a>
      <nav
        aria-label="Navigation principale"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <Link href="/" className="flex items-center gap-2.5" aria-label="OCD — accueil">
          <OcdLogo className="h-7 md:h-8" priority />
          <span className="sr-only">OCD</span>
        </Link>

        {/* Liens desktop */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label={resolvedTheme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
          >
            <Sun className="h-4.5 w-4.5 dark:hidden" />
            <Moon className="hidden h-4.5 w-4.5 dark:block" />
          </button>

          {me ? (
            <Button asChild className="hidden rounded-full sm:inline-flex">
              <Link href="/espace">
                <LayoutDashboard className="h-4 w-4" />
                Mon espace
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
                <Link href="/connexion">Connexion</Link>
              </Button>
              <Button asChild className="rounded-full px-4 font-semibold shadow-sm">
                <Link href="/inscription">
                  Rejoindre OCD
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </>
          )}

          {/* Burger mobile */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="border-t bg-background lg:hidden">
          <ul className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-[15px] font-medium",
                    pathname === link.href
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/80 hover:bg-secondary"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              {me ? (
                <Button asChild className="w-full rounded-full">
                  <Link href="/espace">Mon espace</Link>
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1 rounded-full">
                    <Link href="/connexion">Connexion</Link>
                  </Button>
                  <Button asChild className="flex-1 rounded-full">
                    <Link href="/inscription">Rejoindre OCD</Link>
                  </Button>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
