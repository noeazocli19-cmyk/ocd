"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Save, Camera, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/client";
import { toast } from "sonner";

type ContentItem = { key: string; value: string };

const BOVANN_KEYS: { key: string; label: string; hint: string; multiline?: boolean }[] = [
  { key: "bovann.fullName", label: "Nom complet", hint: "Nom affiché publiquement (ex : Bovann)." },
  { key: "bovann.tagline", label: "Titre / rôle", hint: "Ex : Porteur de la vision OCD." },
  {
    key: "bovann.presentation",
    label: "Présentation",
    hint: "Biographie validée par l'équipe. Laisser vide tant que non validée — le site affichera un encadré « champs réservés ».",
    multiline: true,
  },
  {
    key: "bovann.journey",
    label: "Parcours",
    hint: "Parcours vérifié (étapes, dates, fonctions). Vide = non affiché.",
    multiline: true,
  },
  {
    key: "bovann.activities",
    label: "Domaines d'activité",
    hint: "JSON array de chaînes. Ex : [\"Entrepreneuriat\", \"Événementiel\"]",
    multiline: true,
  },
  {
    key: "bovann.socials",
    label: "Réseaux sociaux officiels",
    hint: "JSON array d'objets {label,url}. Ex : [{\"label\":\"Instagram\",\"url\":\"https://...\"}] — uniquement des liens vérifiés.",
    multiline: true,
  },
];

const CONTACT_KEYS: { key: string; label: string; hint: string }[] = [
  { key: "contact.whatsapp", label: "WhatsApp (affiché)", hint: "Numéro au format lisible. Contact issu des visuels OCD PROJETS." },
  { key: "contact.whatsappLink", label: "Lien WhatsApp", hint: "Ex : https://wa.me/2290154461925" },
  { key: "contact.email", label: "Email public", hint: "Vide = non affiché." },
  { key: "contact.instagram", label: "Instagram officiel", hint: "Vide = non affiché." },
  { key: "contact.linkedin", label: "LinkedIn officiel", hint: "Vide = non affiché." },
];

export function ContentEditorView({ initialItems }: { initialItems: ContentItem[] }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(initialItems.map((i) => [i.key, i.value]))
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function setValue(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.upload<{ url: string }>("/api/upload", fd);
      setValue("bovann.photoUrl", res.url);
      toast.success("Photo téléversée — pense à enregistrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload impossible");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const entries = Object.entries(values).map(([key, value]) => ({ key, value }));
      await api.patch("/api/admin/content", { entries });
      toast.success("Contenus enregistrés");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  const photoUrl = values["bovann.photoUrl"] ?? "";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="ocd-kicker mb-2">Contenus institutionnels</p>
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Présentation de Bovann &amp; coordonnées</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Ces champs alimentent la page publique /bovann et le footer. Règle absolue : ne publier
          que des informations validées par l&apos;équipe OCD.
        </p>
      </div>

      {/* Photographie officielle */}
      <section className="rounded-2xl border bg-card p-6">
        <h2 className="font-display text-base font-bold">Photographie officielle</h2>
        <div className="mt-4 flex flex-wrap items-center gap-5">
          <div className="relative h-40 w-32 overflow-hidden rounded-xl border bg-secondary">
            {photoUrl ? (
              <Image src={photoUrl} alt="Photo officielle" fill className="object-cover" sizes="128px" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Camera className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadPhoto(f);
                e.target.value = "";
              }}
            />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              Téléverser la photo officielle
            </Button>
            <Input
              value={photoUrl}
              onChange={(e) => setValue("bovann.photoUrl", e.target.value)}
              placeholder="/uploads/... ou https://..."
              className="w-72"
              aria-label="URL de la photo officielle"
            />
            <p className="text-xs text-muted-foreground">
              La photo officielle de Bovann remplacera automatiquement le placeholder public. Ne
              jamais téléverser une image de substitution de son visage.
            </p>
          </div>
        </div>
      </section>

      {/* Présentation Bovann */}
      <section className="space-y-5 rounded-2xl border bg-card p-6">
        <h2 className="font-display text-base font-bold">Présentation de Bovann</h2>
        {BOVANN_KEYS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={field.key}>{field.label}</Label>
            {field.multiline ? (
              <Textarea
                id={field.key}
                value={values[field.key] ?? ""}
                onChange={(e) => setValue(field.key, e.target.value)}
                rows={4}
              />
            ) : (
              <Input
                id={field.key}
                value={values[field.key] ?? ""}
                onChange={(e) => setValue(field.key, e.target.value)}
              />
            )}
            <p className="text-xs text-muted-foreground">{field.hint}</p>
          </div>
        ))}
      </section>

      {/* Texte philosophie */}
      <section className="space-y-2 rounded-2xl border bg-card p-6">
        <Label htmlFor="philosophy.editorial">Texte éditorial — philosophie</Label>
        <Textarea
          id="philosophy.editorial"
          value={values["philosophy.editorial"] ?? ""}
          onChange={(e) => setValue("philosophy.editorial", e.target.value)}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Texte affiché sur /vision et la page d&apos;accueil. Doit rester une proposition
          éditoriale (non attribuée comme citation de Bovann).
        </p>
      </section>

      {/* Contact */}
      <section className="space-y-5 rounded-2xl border bg-card p-6">
        <h2 className="font-display text-base font-bold">Coordonnées officielles (footer &amp; pages publiques)</h2>
        {CONTACT_KEYS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              value={values[field.key] ?? ""}
              onChange={(e) => setValue(field.key, e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{field.hint}</p>
          </div>
        ))}
        <p className="flex items-start gap-2 rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Les coordonnées vides ne sont jamais affichées publiquement. Le WhatsApp pré-rempli
          provient du visuel officiel OCD PROJETS fourni.
        </p>
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={save} disabled={saving} size="lg" className="rounded-full px-8 shadow-lg">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer les contenus
        </Button>
      </div>
    </div>
  );
}
