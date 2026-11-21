"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Info, Loader2, LogIn, TriangleAlert } from "lucide-react";
import { z } from "zod";
import { api } from "@/lib/client";
import { OcdLogo } from "@/components/ocd-logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const connexionSchema = z.object({
  email: z.string().min(1, "Email requis").email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type ConnexionValues = z.infer<typeof connexionSchema>;

type LoginResponse = {
  id: string;
  firstName: string;
  onboardingCompleted: boolean;
  role: string;
};

/** Comptes de démonstration du prototype (seedés côté API). */
const DEMO_ACCOUNTS = [
  { role: "Membre", email: "demo@ocd.africa", password: "ocd-demo-2025" },
  { role: "Admin", email: "admin@ocd.africa", password: "ocd-admin-2025" },
] as const;

function toFieldErrors(error: z.ZodError): Partial<Record<keyof ConnexionValues, string>> {
  const out: Partial<Record<keyof ConnexionValues, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      out[key as keyof ConnexionValues] = issue.message;
    }
  }
  return out;
}

export function ConnexionView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduced = useReducedMotion();

  const [form, setForm] = useState<ConnexionValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof ConnexionValues, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Déjà connecté → redirection directe vers l'espace membre
  useEffect(() => {
    let cancelled = false;
    api
      .get<{ user: { id: string } | null }>("/api/auth/me")
      .then((res) => {
        if (cancelled) return;
        if (res.user) {
          setRedirecting(true);
          router.replace("/espace");
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);
    const parsed = connexionSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>("/api/auth/login", {
        email: parsed.data.email.trim(),
        password: parsed.data.password,
      });
      const isAdmin = res.role === "ADMIN" || res.role === "SUPER_ADMIN";
      const next = searchParams.get("next");
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/espace";
      router.push(isAdmin ? "/admin" : safeNext);
      router.refresh();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Une erreur est survenue. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  function fillWithDemo(email: string, password: string) {
    setForm({ email, password });
    setErrors({});
    setApiError(null);
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Fond décoratif */}
      <div className="bg-grid-ocd absolute inset-0 opacity-70" aria-hidden="true" />
      <div
        className="absolute -top-40 left-1/2 h-96 w-[46rem] -translate-x-1/2 rounded-full bg-[#F07819]/10 blur-[140px]"
        aria-hidden="true"
      />

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-2xl border bg-card p-8 shadow-xl"
      >
        <div className="text-center">
          <OcdLogo className="mx-auto h-10" priority />
          <p className="ocd-kicker mt-5 justify-center">Espace membre</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">
            Bon retour parmi nous
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Connecte-toi pour retrouver la communauté OCD.
          </p>
        </div>

        {redirecting ? (
          <div className="mt-10 flex flex-col items-center gap-3 text-muted-foreground" role="status">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm">Tu es déjà connecté, redirection…</p>
          </div>
        ) : (
          <>
            <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
              {apiError ? (
                <Alert variant="destructive">
                  <TriangleAlert aria-hidden="true" />
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="ton@email.com"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  aria-invalid={Boolean(errors.email)}
                  maxLength={180}
                />
                {errors.email ? <p className="text-destructive text-xs">{errors.email}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Ton mot de passe"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    aria-invalid={Boolean(errors.password)}
                    className="pr-11"
                    maxLength={100}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-destructive text-xs">{errors.password}</p>
                ) : null}
              </div>

              <Button type="submit" disabled={loading} className="min-h-11 w-full font-semibold">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                )}
                {loading ? "Connexion en cours…" : "Se connecter"}
              </Button>
            </form>

            {/* Comptes de démonstration (prototype) */}
            <div className="mt-7 rounded-xl border border-dashed p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Info className="h-4 w-4 text-primary" aria-hidden="true" />
                Comptes de démonstration
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Prototype : remplis le formulaire en un clic.
              </p>
              <ul className="mt-3 space-y-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <li
                    key={account.email}
                    className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        {account.role}
                      </p>
                      <p className="truncate text-xs">
                        {account.email} · {account.password}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fillWithDemo(account.email, account.password)}
                    >
                      Utiliser
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 flex flex-col items-center gap-2.5 text-sm">
              <p className="text-muted-foreground">
                Pas encore de compte ?{" "}
                <Link
                  href="/inscription"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Rejoindre OCD
                </Link>
              </p>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Retour au site
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </main>
  );
}
