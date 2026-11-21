"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Presentation,
  Rocket,
  Sparkles,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { api, parseJsonArray } from "@/lib/client";
import { cn } from "@/lib/utils";
import { OcdLogo } from "@/components/ocd-logo";
import { Avatar } from "@/components/community/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/* Données de référence                                                */
/* ------------------------------------------------------------------ */

const COUNTRIES = [
  "Bénin",
  "Sénégal",
  "Côte d'Ivoire",
  "Togo",
  "Nigeria",
  "Ghana",
  "Cameroun",
  "Mali",
  "Burkina Faso",
  "Guinée",
  "RD Congo",
  "Gabon",
  "Maroc",
  "Algérie",
  "Tunisie",
  "France",
  "Belgique",
  "Canada",
  "États-Unis",
  "Autre",
] as const;

const DOMAINS = [
  "Entrepreneuriat",
  "Business",
  "Technologie",
  "Marketing",
  "Finance",
  "Création de contenu",
  "Éducation",
  "Design",
  "Santé",
  "Agriculture",
  "Autre",
] as const;

const EXPERIENCE_LEVELS = [
  { value: "ETUDIANT", label: "Étudiant" },
  { value: "DEBUTANT", label: "Débutant" },
  { value: "INTERMEDIAIRE", label: "Intermédiaire" },
  { value: "CONFIRME", label: "Confirmé" },
  { value: "EXPERT", label: "Expert" },
] as const;

const EXPERIENCE_LABELS: Record<string, string> = Object.fromEntries(
  EXPERIENCE_LEVELS.map((l) => [l.value, l.label])
);

const STEPS = [
  {
    short: "Identité",
    title: "Informations personnelles",
    description: "Présente-toi : ces informations créeront ton compte OCD.",
  },
  {
    short: "Lieu",
    title: "Localisation",
    description: "Indique d'où tu viens pour rencontrer des membres près de chez toi.",
  },
  {
    short: "Métier",
    title: "Profil professionnel",
    description: "Parle de ton activité : les autres membres te trouveront plus facilement.",
  },
  {
    short: "Présentation",
    title: "Présentation",
    description:
      "Ajoute une photo et raconte ce qui te motive. Tu pourras compléter tout cela plus tard.",
  },
  {
    short: "Finalisation",
    title: "Finalisation",
    description: "Vérifie tes informations puis rejoins la communauté.",
  },
] as const;

const BENEFITS = [
  {
    icon: Users,
    title: "Rencontrer des personnes ambitieuses",
    text: "Élargis ton réseau avec des membres motivés, près de chez toi et ailleurs.",
  },
  {
    icon: Presentation,
    title: "Présenter tes projets",
    text: "Montre ce que tu construis et reçois des retours concrets de la communauté.",
  },
  {
    icon: Rocket,
    title: "Trouver des opportunités",
    text: "Repère des événements, des groupes et des collaborations qui font avancer tes idées.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Validation par étape                                                */
/* ------------------------------------------------------------------ */

function isHttpUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const step1Schema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(60, "60 caractères maximum"),
  lastName: z.string().trim().min(1, "Nom requis").max(60, "60 caractères maximum"),
  email: z.string().min(1, "Email requis").email("Adresse email invalide").max(180, "Email trop long"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(100, "Mot de passe trop long"),
});

const step2Schema = z.object({
  country: z.string().trim().min(1, "Sélectionne ton pays").max(80, "80 caractères maximum"),
  city: z.string().trim().min(1, "Indique ta ville").max(80, "80 caractères maximum"),
});

const step3Schema = z.object({
  profession: z.string().trim().min(1, "Indique ta profession").max(120, "120 caractères maximum"),
  domain: z.string().min(1, "Choisis un domaine"),
  experienceLevel: z.string().min(1, "Choisis ton niveau d'expérience"),
  skills: z.array(z.string().min(1)).max(20, "20 compétences maximum"),
});

const step4Schema = z.object({
  bio: z.string().max(1200, "1200 caractères maximum"),
  interests: z.array(z.string().min(1)).max(12, "12 centres d'intérêt maximum"),
  website: z
    .string()
    .trim()
    .max(200, "Lien trop long")
    .refine(isHttpUrl, "Entre un lien valide (ex. https://…)"),
  linkedin: z
    .string()
    .trim()
    .max(200, "Lien trop long")
    .refine(isHttpUrl, "Entre un lien valide (ex. https://linkedin.com/in/…)"),
  twitter: z
    .string()
    .trim()
    .max(200, "Lien trop long")
    .refine(isHttpUrl, "Entre un lien valide (ex. https://x.com/…)"),
  instagram: z
    .string()
    .trim()
    .max(200, "Lien trop long")
    .refine(isHttpUrl, "Entre un lien valide (ex. https://instagram.com/…)"),
});

function toFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) out[key] = issue.message;
  }
  return out;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Une erreur est survenue. Réessaie.";
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type InscriptionForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  city: string;
  profession: string;
  domain: string;
  experienceLevel: string;
  skills: string[];
  bio: string;
  interests: string[];
  avatarUrl: string;
  website: string;
  linkedin: string;
  twitter: string;
  instagram: string;
};

const EMPTY_FORM: InscriptionForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  country: "",
  city: "",
  profession: "",
  domain: "",
  experienceLevel: "",
  skills: [],
  bio: "",
  interests: [],
  avatarUrl: "",
  website: "",
  linkedin: "",
  twitter: "",
  instagram: "",
};

type ProfileResponse = {
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
    bio: string | null;
    country: string | null;
    city: string | null;
    profession: string | null;
    domain: string | null;
    experienceLevel: string | null;
    interests: string | null;
    website: string | null;
    linkedin: string | null;
    twitter: string | null;
    instagram: string | null;
    skills: { id: string; name: string }[];
  } | null;
};

/* ------------------------------------------------------------------ */
/* Sous-composants                                                     */
/* ------------------------------------------------------------------ */

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-xs">{message}</p>;
}

function ChipsField({
  label,
  value,
  onChange,
  max,
  placeholder,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  max: number;
  placeholder: string;
  hint?: string;
}) {
  const [draft, setDraft] = useState("");

  function addDraft() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (value.length >= max) return;
    if (value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={`chips-${label}`}>{label}</Label>
        <span className="text-xs text-muted-foreground">
          {value.length}/{max}
        </span>
      </div>
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {value.map((item) => (
            <li key={item}>
              <Badge variant="secondary" className="gap-1 pr-1.5 font-normal">
                {item}
                <button
                  type="button"
                  aria-label={`Retirer ${item}`}
                  onClick={() => onChange(value.filter((v) => v !== item))}
                  className="rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
      <Input
        id={`chips-${label}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addDraft();
          }
        }}
        placeholder={placeholder}
        maxLength={60}
        aria-label={label}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex w-full items-center" aria-label="Progression de l'inscription">
      {STEPS.map((meta, index) => {
        const number = index + 1;
        const done = number < current;
        const active = number === current;
        return (
          <li
            key={meta.short}
            aria-current={active ? "step" : undefined}
            className={cn("flex items-center", index < STEPS.length - 1 && "flex-1")}
          >
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-background text-primary ring-2 ring-primary/25",
                  !done && !active && "border-border bg-background text-muted-foreground"
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">{number}</span>
                )}
              </span>
              <span
                className={cn(
                  "hidden text-xs sm:block",
                  active ? "font-semibold text-foreground" : "text-muted-foreground"
                )}
              >
                {meta.short}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "mx-2 h-0.5 w-6 flex-1 self-start rounded sm:mx-3",
                  done ? "bg-primary" : "bg-border",
                  "mt-[18px]"
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Vue principale                                                      */
/* ------------------------------------------------------------------ */

export function InscriptionView() {
  const router = useRouter();
  const reduced = useReducedMotion();

  const [checking, setChecking] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<InscriptionForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stepError, setStepError] = useState<string | null>(null);
  const [accountExists, setAccountExists] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Session existante ? On saute l'inscription et on pré-remplit le profil.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api.get<{ user: { id: string } | null }>("/api/auth/me");
        if (cancelled) return;
        if (!me.user) return;
        const res = await api.get<ProfileResponse>("/api/profile").catch(() => null);
        if (cancelled) return;
        const profile = res?.profile;
        if (profile) {
          setForm((prev) => ({
            ...prev,
            firstName: profile.firstName || prev.firstName,
            lastName: profile.lastName || prev.lastName,
            email: profile.email || prev.email,
            country: profile.country || prev.country,
            city: profile.city || prev.city,
            profession: profile.profession || prev.profession,
            domain: profile.domain || prev.domain,
            experienceLevel: profile.experienceLevel || prev.experienceLevel,
            skills: profile.skills.map((s) => s.name),
            bio: profile.bio || prev.bio,
            interests: parseJsonArray(profile.interests),
            avatarUrl: profile.avatarUrl || prev.avatarUrl,
            website: profile.website || prev.website,
            linkedin: profile.linkedin || prev.linkedin,
            twitter: profile.twitter || prev.twitter,
            instagram: profile.instagram || prev.instagram,
          }));
        }
        setRegistered(true);
        setStep(2);
      } catch {
        // Non connecté ou erreur réseau : on reste à l'étape 1.
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function setField<K extends keyof InscriptionForm>(key: K, value: InscriptionForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function goToStep(next: number) {
    setStepError(null);
    setErrors({});
    setStep(next);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    }
  }

  function handleBack() {
    const blocked = step === 1 || (registered && step === 2);
    if (!blocked) goToStep(step - 1);
  }

  async function handleContinue() {
    setStepError(null);
    setAccountExists(false);

    // Étape 1 — création du compte (session automatique)
    if (step === 1) {
      const parsed = step1Schema.safeParse({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      if (!parsed.success) {
        setErrors(toFieldErrors(parsed.error));
        return;
      }
      setErrors({});
      setSubmitting(true);
      try {
        await api.post<{ id: string; firstName: string; onboardingCompleted: boolean }>(
          "/api/auth/register",
          {
            email: parsed.data.email.trim(),
            password: parsed.data.password,
            firstName: parsed.data.firstName.trim(),
            lastName: parsed.data.lastName.trim(),
          }
        );
        setRegistered(true);
        goToStep(2);
      } catch (err) {
        const message = errorMessage(err);
        setStepError(message);
        if (message.toLowerCase().includes("existe déjà")) setAccountExists(true);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Étape 2 — localisation
    if (step === 2) {
      const parsed = step2Schema.safeParse({ country: form.country, city: form.city });
      if (!parsed.success) {
        setErrors(toFieldErrors(parsed.error));
        return;
      }
      setErrors({});
      setSubmitting(true);
      try {
        await api.patch("/api/profile", { country: parsed.data.country, city: parsed.data.city });
        goToStep(3);
      } catch (err) {
        const message = errorMessage(err);
        setStepError(message);
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Étape 3 — profil professionnel
    if (step === 3) {
      const parsed = step3Schema.safeParse({
        profession: form.profession,
        domain: form.domain,
        experienceLevel: form.experienceLevel,
        skills: form.skills,
      });
      if (!parsed.success) {
        setErrors(toFieldErrors(parsed.error));
        return;
      }
      setErrors({});
      setSubmitting(true);
      try {
        await api.patch("/api/profile", {
          profession: parsed.data.profession,
          domain: parsed.data.domain,
          experienceLevel: parsed.data.experienceLevel,
          skills: parsed.data.skills,
        });
        goToStep(4);
      } catch (err) {
        const message = errorMessage(err);
        setStepError(message);
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Étape 4 — présentation
    if (step === 4) {
      const parsed = step4Schema.safeParse({
        bio: form.bio,
        interests: form.interests,
        website: form.website,
        linkedin: form.linkedin,
        twitter: form.twitter,
        instagram: form.instagram,
      });
      if (!parsed.success) {
        setErrors(toFieldErrors(parsed.error));
        return;
      }
      setErrors({});
      setSubmitting(true);
      try {
        const payload: Record<string, unknown> = {
          bio: parsed.data.bio,
          interests: parsed.data.interests,
          website: parsed.data.website || null,
          linkedin: parsed.data.linkedin || null,
          twitter: parsed.data.twitter || null,
          instagram: parsed.data.instagram || null,
        };
        if (form.avatarUrl) payload.avatarUrl = form.avatarUrl;
        await api.patch("/api/profile", payload);
        goToStep(5);
      } catch (err) {
        const message = errorMessage(err);
        setStepError(message);
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Étape 5 — finalisation
    if (step === 5) {
      setSubmitting(true);
      try {
        await api.patch("/api/profile", { onboardingCompleted: true });
        toast.success("Bienvenue sur OCD !");
        router.push("/espace");
        router.refresh();
      } catch (err) {
        const message = errorMessage(err);
        setStepError(message);
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choisis un fichier image (JPG, PNG, WebP ou GIF).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop volumineuse (max 5 Mo).");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.upload<{ url: string }>("/api/upload", formData);
      setForm((prev) => ({ ...prev, avatarUrl: res.url }));
      await api.patch("/api/profile", { avatarUrl: res.url });
      toast.success("Photo mise à jour.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto() {
    setForm((prev) => ({ ...prev, avatarUrl: "" }));
    try {
      await api.patch("/api/profile", { avatarUrl: null });
    } catch {
      toast.error("Impossible de retirer la photo pour le moment.");
    }
  }

  const backBlocked = step === 1 || (registered && step === 2);
  const meta = STEPS[step - 1];

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,420px)_1fr] xl:grid-cols-[minmax(0,480px)_1fr]">
      {/* Panneau latéral sombre (desktop) */}
      <aside
        className="relative hidden overflow-hidden bg-ocd-dark text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:justify-between"
        aria-label="Présentation de OCD"
      >
        <div className="bg-grid-ocd absolute inset-0 opacity-60" aria-hidden="true" />
        <div
          className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-[#F07819]/15 blur-[120px]"
          aria-hidden="true"
        />
        <div className="relative z-10 p-10 xl:p-12">
          <OcdLogo className="h-9" priority />
          <h2 className="mt-10 font-display text-3xl font-bold tracking-tight">Rejoins OCD</h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
            Crée ton profil en quelques étapes et entre dans une communauté qui transforme les
            rencontres en opportunités.
          </p>
          <ul className="mt-10 space-y-6">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5">
                  <benefit.icon className="h-5 w-5 text-[#F07819]" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold leading-snug">{benefit.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">{benefit.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 border-t border-white/10 p-10 xl:p-12">
          <p className="font-display text-xl font-extrabold tracking-tight">
            LES OPPORTUNITÉS <span className="text-gradient-ocd">SONT DEHORS.</span>
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/50">La devise OCD</p>
        </div>
      </aside>

      {/* Colonne formulaire */}
      <div className="flex min-h-dvh flex-col bg-background">
        <header className="flex items-center justify-between gap-4 border-b px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <OcdLogo className="h-7" />
            <span className="hidden h-5 w-px bg-border lg:block" aria-hidden="true" />
            <p className="ocd-kicker hidden lg:inline-flex">Inscription</p>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            Étape {step} sur {STEPS.length}
          </p>
        </header>

        <main className="flex flex-1 justify-center px-4 py-8 sm:px-8 lg:px-10">
          <div className="w-full max-w-xl">
            {checking ? (
              <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground" role="status">
                <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                <p className="text-sm">Vérification de ta session…</p>
              </div>
            ) : (
              <>
                <Stepper current={step} />

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step}
                    initial={reduced ? false : { opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduced ? undefined : { opacity: 0, x: -28 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <section
                      aria-labelledby="inscription-step-title"
                      className="mt-8 rounded-2xl border bg-card p-6 sm:p-8"
                    >
                      <p className="ocd-kicker">
                        Étape {step}/{STEPS.length}
                      </p>
                      <h1
                        id="inscription-step-title"
                        className="mt-3 font-display text-2xl font-bold tracking-tight"
                      >
                        {meta.title}
                      </h1>
                      <p className="mt-1.5 text-sm text-muted-foreground">{meta.description}</p>

                      {stepError ? (
                        <Alert variant="destructive" className="mt-5">
                          <TriangleAlert aria-hidden="true" />
                          <AlertDescription>
                            {stepError}
                            {accountExists ? (
                              <>
                                {" "}
                                <Link
                                  href="/connexion"
                                  className="font-semibold underline underline-offset-2"
                                >
                                  Se connecter
                                </Link>
                              </>
                            ) : null}
                          </AlertDescription>
                        </Alert>
                      ) : null}

                      <form
                        className="mt-7 space-y-6"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!submitting && !uploading) void handleContinue();
                        }}
                        noValidate
                      >
                        {step === 1 ? (
                          <>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="firstName">Prénom</Label>
                                <Input
                                  id="firstName"
                                  autoComplete="given-name"
                                  placeholder="Awa"
                                  value={form.firstName}
                                  onChange={(e) => setField("firstName", e.target.value)}
                                  aria-invalid={Boolean(errors.firstName)}
                                  maxLength={60}
                                />
                                <FieldError message={errors.firstName} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lastName">Nom</Label>
                                <Input
                                  id="lastName"
                                  autoComplete="family-name"
                                  placeholder="Kponou"
                                  value={form.lastName}
                                  onChange={(e) => setField("lastName", e.target.value)}
                                  aria-invalid={Boolean(errors.lastName)}
                                  maxLength={60}
                                />
                                <FieldError message={errors.lastName} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                placeholder="ton@email.com"
                                value={form.email}
                                onChange={(e) => setField("email", e.target.value)}
                                aria-invalid={Boolean(errors.email)}
                                maxLength={180}
                              />
                              <FieldError message={errors.email} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="password">Mot de passe</Label>
                              <div className="relative">
                                <Input
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  autoComplete="new-password"
                                  placeholder="8 caractères minimum"
                                  value={form.password}
                                  onChange={(e) => setField("password", e.target.value)}
                                  aria-invalid={Boolean(errors.password)}
                                  className="pr-11"
                                  maxLength={100}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword((v) => !v)}
                                  aria-label={
                                    showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                                  }
                                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                                  ) : (
                                    <Eye className="h-4 w-4" aria-hidden="true" />
                                  )}
                                </button>
                              </div>
                              <FieldError message={errors.password} />
                              <p className="text-xs text-muted-foreground">
                                8 caractères minimum. Choisis un mot de passe unique.
                              </p>
                            </div>
                          </>
                        ) : null}

                        {step === 2 ? (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="country">Pays</Label>
                              <Input
                                id="country"
                                list="inscription-pays"
                                autoComplete="country-name"
                                placeholder="Commence à taper ton pays…"
                                value={form.country}
                                onChange={(e) => setField("country", e.target.value)}
                                aria-invalid={Boolean(errors.country)}
                                maxLength={80}
                              />
                              <datalist id="inscription-pays">
                                {COUNTRIES.map((country) => (
                                  <option key={country} value={country} />
                                ))}
                              </datalist>
                              <FieldError message={errors.country} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="city">Ville</Label>
                              <Input
                                id="city"
                                autoComplete="address-level2"
                                placeholder="Ex. Cotonou"
                                value={form.city}
                                onChange={(e) => setField("city", e.target.value)}
                                aria-invalid={Boolean(errors.city)}
                                maxLength={80}
                              />
                              <FieldError message={errors.city} />
                              <p className="text-xs text-muted-foreground">
                                Ta ville aide les membres proches de chez toi à te trouver.
                              </p>
                            </div>
                          </>
                        ) : null}

                        {step === 3 ? (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="profession">Profession</Label>
                              <Input
                                id="profession"
                                placeholder="Ex. Développeuse, étudiante en droit…"
                                value={form.profession}
                                onChange={(e) => setField("profession", e.target.value)}
                                aria-invalid={Boolean(errors.profession)}
                                maxLength={120}
                              />
                              <FieldError message={errors.profession} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="domain">Domaine</Label>
                              <Select
                                value={form.domain}
                                onValueChange={(value) => setField("domain", value)}
                              >
                                <SelectTrigger
                                  id="domain"
                                  className="w-full"
                                  aria-invalid={Boolean(errors.domain)}
                                >
                                  <SelectValue placeholder="Choisis un domaine" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DOMAINS.map((domain) => (
                                    <SelectItem key={domain} value={domain}>
                                      {domain}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FieldError message={errors.domain} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="experienceLevel">Niveau d'expérience</Label>
                              <Select
                                value={form.experienceLevel}
                                onValueChange={(value) => setField("experienceLevel", value)}
                              >
                                <SelectTrigger
                                  id="experienceLevel"
                                  className="w-full"
                                  aria-invalid={Boolean(errors.experienceLevel)}
                                >
                                  <SelectValue placeholder="Choisis ton niveau" />
                                </SelectTrigger>
                                <SelectContent>
                                  {EXPERIENCE_LEVELS.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                      {level.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FieldError message={errors.experienceLevel} />
                            </div>
                            <ChipsField
                              label="Compétences"
                              value={form.skills}
                              onChange={(next) => setField("skills", next)}
                              max={20}
                              placeholder="Tape une compétence puis Entrée"
                              hint="Ex. Design, prise de parole, gestion de projet…"
                            />
                          </>
                        ) : null}

                        {step === 4 ? (
                          <>
                            <div className="flex items-center gap-4">
                              <Avatar
                                src={form.avatarUrl || null}
                                firstName={form.firstName || "M"}
                                lastName={form.lastName}
                                size="lg"
                                ring
                              />
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="min-h-11"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                  >
                                    {uploading ? (
                                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                    ) : (
                                      <Camera className="h-4 w-4" aria-hidden="true" />
                                    )}
                                    {uploading ? "Envoi en cours…" : "Choisir une photo"}
                                  </Button>
                                  {form.avatarUrl ? (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="min-h-11"
                                      onClick={() => void removePhoto()}
                                      disabled={uploading}
                                    >
                                      Retirer
                                    </Button>
                                  ) : null}
                                </div>
                                <p className="mt-1.5 text-xs text-muted-foreground">
                                  JPG, PNG, WebP ou GIF — 5 Mo maximum.
                                </p>
                              </div>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => void handleFileChange(e)}
                                aria-hidden="true"
                                tabIndex={-1}
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <Label htmlFor="bio">Biographie</Label>
                                <span className="text-xs text-muted-foreground">
                                  {form.bio.length}/1200
                                </span>
                              </div>
                              <Textarea
                                id="bio"
                                placeholder="Raconte en quelques lignes qui tu es, ce que tu fais et ce qui te motive."
                                value={form.bio}
                                onChange={(e) => setField("bio", e.target.value)}
                                aria-invalid={Boolean(errors.bio)}
                                maxLength={1200}
                                rows={5}
                              />
                              <FieldError message={errors.bio} />
                            </div>
                            <ChipsField
                              label="Centres d'intérêt"
                              value={form.interests}
                              onChange={(next) => setField("interests", next)}
                              max={12}
                              placeholder="Tape un centre d'intérêt puis Entrée"
                              hint="Ex. Lecture, football, intelligence artificielle…"
                            />
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="linkedin">LinkedIn</Label>
                                <Input
                                  id="linkedin"
                                  type="url"
                                  placeholder="https://linkedin.com/in/…"
                                  value={form.linkedin}
                                  onChange={(e) => setField("linkedin", e.target.value)}
                                  aria-invalid={Boolean(errors.linkedin)}
                                  maxLength={200}
                                />
                                <FieldError message={errors.linkedin} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="twitter">X (Twitter)</Label>
                                <Input
                                  id="twitter"
                                  type="url"
                                  placeholder="https://x.com/…"
                                  value={form.twitter}
                                  onChange={(e) => setField("twitter", e.target.value)}
                                  aria-invalid={Boolean(errors.twitter)}
                                  maxLength={200}
                                />
                                <FieldError message={errors.twitter} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="instagram">Instagram</Label>
                                <Input
                                  id="instagram"
                                  type="url"
                                  placeholder="https://instagram.com/…"
                                  value={form.instagram}
                                  onChange={(e) => setField("instagram", e.target.value)}
                                  aria-invalid={Boolean(errors.instagram)}
                                  maxLength={200}
                                />
                                <FieldError message={errors.instagram} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="website">Site web</Label>
                                <Input
                                  id="website"
                                  type="url"
                                  placeholder="https://…"
                                  value={form.website}
                                  onChange={(e) => setField("website", e.target.value)}
                                  aria-invalid={Boolean(errors.website)}
                                  maxLength={200}
                                />
                                <FieldError message={errors.website} />
                              </div>
                            </div>
                          </>
                        ) : null}

                        {step === 5 ? (
                          <>
                            <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/50 p-6 text-center">
                              <Avatar
                                src={form.avatarUrl || null}
                                firstName={form.firstName || "M"}
                                lastName={form.lastName}
                                size="xl"
                                ring
                              />
                              <div>
                                <p className="font-display text-lg font-bold tracking-tight">
                                  {form.firstName} {form.lastName}
                                </p>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                  {[form.profession, form.domain].filter(Boolean).join(" · ") || "—"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {[form.country, form.city].filter(Boolean).join(", ") || "—"}
                                </p>
                              </div>
                            </div>
                            <dl className="space-y-4 text-sm">
                              <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                                <dt className="w-44 shrink-0 text-muted-foreground">
                                  Niveau d'expérience
                                </dt>
                                <dd className="font-medium">
                                  {EXPERIENCE_LABELS[form.experienceLevel] || "—"}
                                </dd>
                              </div>
                              <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                                <dt className="w-44 shrink-0 text-muted-foreground">Compétences</dt>
                                <dd>
                                  {form.skills.length > 0 ? (
                                    <span className="flex flex-wrap gap-1.5">
                                      {form.skills.map((skill) => (
                                        <Badge key={skill} variant="secondary" className="font-normal">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </span>
                                  ) : (
                                    "—"
                                  )}
                                </dd>
                              </div>
                              <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                                <dt className="w-44 shrink-0 text-muted-foreground">
                                  Centres d'intérêt
                                </dt>
                                <dd>
                                  {form.interests.length > 0 ? (
                                    <span className="flex flex-wrap gap-1.5">
                                      {form.interests.map((interest) => (
                                        <Badge key={interest} variant="outline" className="font-normal">
                                          {interest}
                                        </Badge>
                                      ))}
                                    </span>
                                  ) : (
                                    "—"
                                  )}
                                </dd>
                              </div>
                            </dl>
                            <p className="rounded-xl border border-dashed p-4 text-xs leading-relaxed text-muted-foreground">
                              Tu pourras compléter et modifier ton profil à tout moment depuis ton
                              espace membre : expériences, projets, photo de couverture et plus.
                            </p>
                          </>
                        ) : null}

                        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            className="min-h-11"
                            onClick={handleBack}
                            disabled={backBlocked || submitting}
                          >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Retour
                          </Button>
                          <Button
                            type="submit"
                            className="min-h-11 font-semibold sm:min-w-48"
                            disabled={submitting || uploading}
                          >
                            {submitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : step === 5 ? (
                              <Sparkles className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            )}
                            {step === 5 ? "Terminer et rejoindre la communauté" : "Continuer"}
                          </Button>
                        </div>
                      </form>
                    </section>
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
