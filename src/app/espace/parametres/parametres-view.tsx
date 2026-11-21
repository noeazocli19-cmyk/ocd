"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { z } from "zod";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { Avatar } from "@/components/community/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/components/app/user-provider";
import { api, parseJsonArray } from "@/lib/client";
import { toast } from "sonner";

type ProfileData = {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  country: string | null;
  city: string | null;
  profession: string | null;
  domain: string | null;
  experienceLevel: string | null;
  interests: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  website: string | null;
  linkedin: string | null;
  twitter: string | null;
  instagram: string | null;
  whatsapp: string | null;
  skills: { id: string; name: string }[];
};

type FormState = {
  firstName: string;
  lastName: string;
  bio: string;
  country: string;
  city: string;
  profession: string;
  domain: string;
  experienceLevel: string;
  website: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  whatsapp: string;
  skills: string[];
  interests: string[];
  avatarUrl: string | null;
  coverUrl: string | null;
};

const COUNTRIES = [
  "Bénin", "Sénégal", "Côte d'Ivoire", "Togo", "Nigeria", "Ghana", "Cameroun",
  "Mali", "Burkina Faso", "Guinée", "RD Congo", "Gabon", "Maroc", "Algérie",
  "Tunisie", "France", "Belgique", "Canada", "États-Unis", "Autre",
];

const DOMAINS = [
  "Entrepreneuriat", "Business", "Technologie", "Marketing", "Finance",
  "Création de contenu", "Éducation", "Design", "Santé", "Agriculture", "Autre",
];

const EXPERIENCE_LEVELS = [
  { value: "ETUDIANT", label: "Étudiant" },
  { value: "DEBUTANT", label: "Débutant" },
  { value: "INTERMEDIAIRE", label: "Intermédiaire" },
  { value: "CONFIRME", label: "Confirmé" },
  { value: "EXPERT", label: "Expert" },
];

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function urlSchema(message: string) {
  return z.string().refine((v) => v === "" || isValidHttpUrl(v), { message }).nullable();
}

function normalizeUrl(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

const profileFormSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis.").max(60, "Le prénom est trop long."),
  lastName: z.string().min(1, "Le nom est requis.").max(60, "Le nom est trop long."),
  bio: z.string().max(1200, "La biographie ne peut pas dépasser 1200 caractères.").nullable(),
  country: z.string().max(80).nullable(),
  city: z.string().max(80).nullable(),
  profession: z.string().max(120).nullable(),
  domain: z.string().max(120).nullable(),
  experienceLevel: z.string().max(40).nullable(),
  website: urlSchema("Le lien du site web est invalide (doit être une URL http ou https)."),
  linkedin: urlSchema("Le lien LinkedIn est invalide (doit être une URL http ou https)."),
  twitter: urlSchema("Le lien X (Twitter) est invalide (doit être une URL http ou https)."),
  instagram: urlSchema("Le lien Instagram est invalide (doit être une URL http ou https)."),
  whatsapp: z.string().max(40, "Le numéro WhatsApp est trop long.").nullable(),
  interests: z.array(z.string().min(1)).max(12, "12 centres d'intérêt maximum."),
  skills: z.array(z.string().min(1)).max(20, "20 compétences maximum."),
});

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  bio: "",
  country: "",
  city: "",
  profession: "",
  domain: "",
  experienceLevel: "",
  website: "",
  linkedin: "",
  twitter: "",
  instagram: "",
  whatsapp: "",
  skills: [],
  interests: [],
  avatarUrl: null,
  coverUrl: null,
};

export function ParametresView() {
  const { user, refresh } = useUser();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"avatarUrl" | "coverUrl" | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ profile: ProfileData | null }>("/api/profile")
      .then((d) => {
        if (!cancelled || !d.profile) return;
        const p = d.profile;
        setForm({
          firstName: p.firstName ?? "",
          lastName: p.lastName ?? "",
          bio: p.bio ?? "",
          country: p.country ?? "",
          city: p.city ?? "",
          profession: p.profession ?? "",
          domain: p.domain ?? "",
          experienceLevel: p.experienceLevel ?? "",
          website: p.website ?? "",
          linkedin: p.linkedin ?? "",
          twitter: p.twitter ?? "",
          instagram: p.instagram ?? "",
          whatsapp: p.whatsapp ?? "",
          skills: (p.skills ?? []).map((s) => s.name),
          interests: parseJsonArray(p.interests),
          avatarUrl: p.avatarUrl,
          coverUrl: p.coverUrl,
        });
      })
      .catch((e: unknown) => {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Impossible de charger ton profil");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadImage(file: File, target: "avatarUrl" | "coverUrl") {
    setUploading(target);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.upload<{ url: string }>("/api/upload", fd);
      await api.patch("/api/profile", { [target]: res.url });
      setForm((f) => ({ ...f, [target]: res.url }));
      await refresh();
      toast.success(target === "avatarUrl" ? "Photo de profil mise à jour" : "Photo de couverture mise à jour");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Envoi de l'image impossible");
    } finally {
      setUploading(null);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      bio: form.bio.trim() || null,
      country: form.country.trim() || null,
      city: form.city.trim() || null,
      profession: form.profession.trim() || null,
      domain: form.domain || null,
      experienceLevel: form.experienceLevel || null,
      website: normalizeUrl(form.website),
      linkedin: normalizeUrl(form.linkedin),
      twitter: normalizeUrl(form.twitter),
      instagram: normalizeUrl(form.instagram),
      whatsapp: form.whatsapp.trim() || null,
      interests: form.interests.map((s) => s.trim()).filter(Boolean),
      skills: form.skills.map((s) => s.trim()).filter(Boolean),
    };
    const parsed = profileFormSchema.safeParse(payload);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      toast.error(issue?.message ?? "Vérifie les champs du formulaire.");
      return;
    }
    setSaving(true);
    try {
      await api.patch("/api/profile", parsed.data);
      toast.success("Profil mis à jour");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
        <Skeleton className="h-9 w-64" />
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      {/* En-tête */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="ocd-kicker text-xs font-semibold">Mon compte</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Paramètres du profil
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Un profil complet multiplie tes chances de créer de vraies opportunités.
          </p>
        </div>
        <Button type="submit" className="rounded-full px-6" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Enregistrer
        </Button>
      </header>

      {/* Photos */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section aria-labelledby="cover-title" className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="relative h-36 w-full sm:h-44">
            {form.coverUrl ? (
              <Image
                src={form.coverUrl}
                alt="Ta photo de couverture"
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover"
              />
            ) : (
              <div className="bg-grid-ocd flex h-full w-full items-center justify-center bg-gradient-to-br from-[#171717] via-[#241d15] to-[#B45309]/80">
                <ImagePlus className="h-8 w-8 text-white/60" aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 p-4">
            <h2 id="cover-title" className="font-display text-sm font-bold">
              Photo de couverture
            </h2>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadImage(f, "coverUrl");
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploading !== null}
            >
              {uploading === "coverUrl" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
              )}
              Changer
            </Button>
          </div>
        </section>

        <section aria-labelledby="avatar-title" className="flex flex-col items-center justify-center rounded-2xl border bg-card p-6 shadow-sm">
          <h2 id="avatar-title" className="self-start font-display text-sm font-bold">
            Photo de profil
          </h2>
          <div className="my-4">
            <Avatar
              src={form.avatarUrl}
              firstName={form.firstName || user.firstName}
              lastName={form.lastName || user.lastName}
              size="xl"
              ring
            />
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadImage(f, "avatarUrl");
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploading !== null}
          >
            {uploading === "avatarUrl" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Camera className="h-4 w-4" aria-hidden="true" />
            )}
            Changer la photo
          </Button>
        </section>
      </div>

      {/* Informations */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Infos personnelles */}
        <section aria-labelledby="perso-title" className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 id="perso-title" className="font-display text-base font-bold">
            Informations personnelles
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                required
                maxLength={60}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                required
                maxLength={60}
              />
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio">Biographie</Label>
              <span className="text-xs text-muted-foreground">{form.bio.length}/1200</span>
            </div>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => setField("bio", e.target.value)}
              rows={5}
              maxLength={1200}
              placeholder="Raconte ton parcours, tes ambitions et ce que tu cherches sur OCD..."
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => setField("country", e.target.value)}
                list="countries-list"
                maxLength={80}
                placeholder="Ex. Bénin"
              />
              <datalist id="countries-list">
                {COUNTRIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                maxLength={80}
                placeholder="Ex. Cotonou"
              />
            </div>
          </div>
        </section>

        {/* Infos professionnelles */}
        <section aria-labelledby="pro-title" className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 id="pro-title" className="font-display text-base font-bold">
            Informations professionnelles
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                value={form.profession}
                onChange={(e) => setField("profession", e.target.value)}
                maxLength={120}
                placeholder="Ex. Développeur web"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="domain">Domaine</Label>
              <Select
                value={form.domain || "NONE"}
                onValueChange={(v) => setField("domain", v === "NONE" ? "" : v)}
              >
                <SelectTrigger id="domain" className="w-full">
                  <SelectValue placeholder="Choisis un domaine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Non renseigné</SelectItem>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="experienceLevel">Niveau d&apos;expérience</Label>
            <Select
              value={form.experienceLevel || "NONE"}
              onValueChange={(v) => setField("experienceLevel", v === "NONE" ? "" : v)}
            >
              <SelectTrigger id="experienceLevel" className="w-full">
                <SelectValue placeholder="Choisis ton niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Non renseigné</SelectItem>
                {EXPERIENCE_LEVELS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Compétences */}
          <SkillsChips
            values={form.skills}
            onChange={(next) => setField("skills", next)}
          />

          {/* Centres d'intérêt */}
          <InterestsChips
            values={form.interests}
            onChange={(next) => setField("interests", next)}
          />
        </section>
      </div>

      {/* Réseaux */}
      <section aria-labelledby="socials-title" className="mt-5 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 id="socials-title" className="font-display text-base font-bold">
          Réseaux et contacts
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Ces liens apparaissent sur ton profil public. Laisse vide si non renseigné.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
              value={form.website}
              onChange={(e) => setField("website", e.target.value)}
              type="url"
              placeholder="https://ton-site.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              value={form.linkedin}
              onChange={(e) => setField("linkedin", e.target.value)}
              type="url"
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="twitter">X (Twitter)</Label>
            <Input
              id="twitter"
              value={form.twitter}
              onChange={(e) => setField("twitter", e.target.value)}
              type="url"
              placeholder="https://x.com/..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={form.instagram}
              onChange={(e) => setField("instagram", e.target.value)}
              type="url"
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={form.whatsapp}
              onChange={(e) => setField("whatsapp", e.target.value)}
              type="tel"
              maxLength={40}
              placeholder="+229 01 ..."
            />
          </div>
        </div>
      </section>

      {/* Enregistrer */}
      <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Pense à enregistrer tes modifications avant de quitter la page.
        </p>
        <Button type="submit" className="shrink-0 rounded-full px-6" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Chips                                                               */
/* ------------------------------------------------------------------ */

function SkillsChips({ values, onChange }: { values: string[]; onChange: (next: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v) return;
    if (values.length >= 20) {
      toast.error("Tu peux ajouter au maximum 20 compétences.");
      return;
    }
    if (!values.some((s) => s.toLowerCase() === v.toLowerCase())) {
      onChange([...values, v]);
    }
    setDraft("");
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="skills-input">Compétences ({values.length}/20)</Label>
      </div>
      {values.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Tes compétences">
          {values.map((skill, i) => (
            <li
              key={`${skill}-${i}`}
              className="inline-flex items-center gap-1 rounded-full bg-[#F07819]/10 px-3 py-1 text-xs font-semibold text-[#B45309] dark:text-[#FFB25C]"
            >
              {skill}
              <button
                type="button"
                onClick={() => onChange(values.filter((_, idx) => idx !== i))}
                className="rounded-full p-0.5 transition-colors hover:bg-[#F07819]/20"
                aria-label={`Retirer la compétence ${skill}`}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Input
        id="skills-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        placeholder="Ajoute une compétence puis appuie sur Entrée"
        maxLength={50}
      />
    </div>
  );
}

function InterestsChips({ values, onChange }: { values: string[]; onChange: (next: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v) return;
    if (values.length >= 12) {
      toast.error("Tu peux ajouter au maximum 12 centres d'intérêt.");
      return;
    }
    if (!values.some((s) => s.toLowerCase() === v.toLowerCase())) {
      onChange([...values, v]);
    }
    setDraft("");
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="interests-input">Centres d&apos;intérêt ({values.length}/12)</Label>
      </div>
      {values.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Tes centres d'intérêt">
          {values.map((interest, i) => (
            <li
              key={`${interest}-${i}`}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground"
            >
              {interest}
              <button
                type="button"
                onClick={() => onChange(values.filter((_, idx) => idx !== i))}
                className="rounded-full p-0.5 transition-colors hover:bg-[#F07819]/20"
                aria-label={`Retirer le centre d'intérêt ${interest}`}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Input
        id="interests-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        placeholder="Ex. Lecture, football, investissement..."
        maxLength={60}
      />
    </div>
  );
}
