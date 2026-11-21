"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/client";
import { toast } from "sonner";

type AchievementRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  imageUrl: string | null;
  videoUrl: string | null;
  date: string;
  results: string;
  isPublished: boolean;
  order: number;
};

const CATEGORIES = [
  ["ENTREPRENARIAT", "Entrepreneuriat"],
  ["PROJETS_NUMERIQUES", "Projets numériques"],
  ["EVENEMENTS", "Événements"],
  ["INITIATIVES", "Initiatives communautaires"],
  ["CONTENU", "Création de contenu"],
  ["COLLABORATIONS", "Collaborations"],
  ["PROFESSIONNEL", "Activités professionnelles"],
] as const;

const STATUSES = [
  ["EN_COURS", "En cours"],
  ["REALISE", "Réalisé"],
  ["A_VENIR", "À venir"],
] as const;

const emptyForm = {
  title: "",
  description: "",
  category: "ENTREPRENARIAT",
  status: "REALISE",
  imageUrl: "",
  videoUrl: "",
  date: "",
  results: "",
  isPublished: false,
  order: 0,
};

export function RealisationsAdminView({ initialItems }: { initialItems: AchievementRow[] }) {
  const [items, setItems] = useState<AchievementRow[]>(initialItems);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [fileRef, setFileRef] = useState<HTMLInputElement | null>(null);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setOpen(true);
  }

  function openEdit(item: AchievementRow) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      status: item.status,
      imageUrl: item.imageUrl ?? "",
      videoUrl: item.videoUrl ?? "",
      date: item.date ?? "",
      results: item.results ?? "",
      isPublished: item.isPublished,
      order: item.order,
    });
    setOpen(true);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.upload<{ url: string }>("/api/upload", fd);
      setForm((f) => ({ ...f, imageUrl: res.url }));
      toast.success("Image téléversée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload impossible");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!form.title.trim() || form.description.trim().length < 10) {
      toast.error("Le titre et la description (min. 10 caractères) sont requis.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        status: form.status,
        imageUrl: form.imageUrl || null,
        videoUrl: form.videoUrl || null,
        date: form.date || null,
        results: form.results.trim() || null,
        isPublished: form.isPublished,
        order: form.order,
      };
      if (editingId) {
        const updated = await api.patch<AchievementRow>(`/api/admin/achievements/${editingId}`, payload);
        setItems((list) => list.map((i) => (i.id === editingId ? { ...i, ...updated, date: form.date, results: form.results } : i)));
        toast.success("Réalisation mise à jour");
      } else {
        const created = await api.post<AchievementRow>("/api/admin/achievements", payload);
        setItems((list) => [{ ...created, date: form.date, results: form.results }, ...list]);
        toast.success("Réalisation créée");
      }
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(item: AchievementRow) {
    try {
      const updated = await api.patch<AchievementRow>(`/api/admin/achievements/${item.id}`, {
        isPublished: !item.isPublished,
      });
      setItems((list) => list.map((i) => (i.id === item.id ? { ...i, ...updated } : i)));
      toast.success(updated.isPublished ? "Réalisation publiée" : "Réalisation retirée de la publication");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action impossible");
    }
  }

  async function remove() {
    if (!deleteId) return;
    try {
      await api.delete(`/api/admin/achievements/${deleteId}`);
      setItems((list) => list.filter((i) => i.id !== deleteId));
      toast.success("Réalisation supprimée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ocd-kicker mb-2">Des idées aux réalisations</p>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Réalisations</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Crée, publie ou retire les réalisations documentées de Bovann et de l&apos;univers OCD.
            Seules les réalisations publiées apparaissent sur le site public.
          </p>
        </div>
        <Button onClick={openCreate} className="rounded-full">
          <Plus className="h-4 w-4" /> Nouvelle réalisation
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Aucune réalisation enregistrée. Crée la première (ou ne publie rien tant que ce n&apos;est
          pas documenté).
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
              <div className="relative h-16 w-full shrink-0 overflow-hidden rounded-lg bg-secondary sm:h-16 sm:w-28">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="112px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Camera className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{item.title}</p>
                  {item.isPublished ? (
                    <Badge className="bg-[#F07819] hover:bg-[#F07819]">Publiée</Badge>
                  ) : (
                    <Badge variant="outline">Brouillon</Badge>
                  )}
                </div>
                <p className="line-clamp-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <div className="mr-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Switch checked={item.isPublished} onCheckedChange={() => togglePublish(item)} aria-label="Publier" />
                  Publier
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)} aria-label="Modifier">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(item.id)} aria-label="Supprimer">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Dialog création / édition */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier la réalisation" : "Nouvelle réalisation"}</DialogTitle>
            <DialogDescription>
              Renseigne uniquement des informations documentées. Les résultats chiffrés doivent
              être vérifiés.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="a-title">Titre</Label>
              <Input id="a-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-desc">Description</Label>
              <Textarea id="a-desc" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Catégorie</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger aria-label="Catégorie"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger aria-label="Statut"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="a-date">Date (optionnel)</Label>
                <Input id="a-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-order">Ordre d&apos;affichage</Label>
                <Input id="a-order" type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-results">Résultats documentés (optionnel)</Label>
              <Textarea
                id="a-results"
                rows={3}
                placeholder='JSON array [{"label":"Participants","value":"120"}] — uniquement des chiffres vérifiés'
                value={form.results}
                onChange={(e) => setForm({ ...form, results: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex items-center gap-3">
                <div className="relative h-20 w-32 overflow-hidden rounded-lg border bg-secondary">
                  {form.imageUrl ? (
                    <Image src={form.imageUrl} alt="Aperçu" fill className="object-cover" sizes="128px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground"><Camera className="h-5 w-5" /></div>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={setFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImage(f);
                      e.target.value = "";
                    }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} Téléverser
                  </Button>
                  {form.imageUrl && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, imageUrl: "" })}>
                      <X className="h-3.5 w-3.5" /> Retirer
                    </Button>
                  )}
                </div>
              </div>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="ou URL directe de l'image"
                aria-label="URL de l'image"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-video">Lien vidéo (optionnel)</Label>
              <Input id="a-video" value={form.videoUrl ?? ""} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="a-pub" checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} />
              <Label htmlFor="a-pub">Publier sur le site</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <AlertDialog open={Boolean(deleteId)} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette réalisation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. La réalisation sera retirée de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-white hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
