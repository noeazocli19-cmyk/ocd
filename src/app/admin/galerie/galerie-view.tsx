"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
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

type GalleryRow = {
  id: string;
  url: string;
  type: string;
  category: string;
  title: string | null;
  description: string | null;
  order: number;
  isPublished: boolean;
};

const CATEGORIES = [
  ["PORTRAITS", "Portraits"],
  ["CONFERENCES", "Conférences"],
  ["EVENEMENTS", "Événements"],
  ["RENCONTRES", "Rencontres"],
  ["ENTREPRENARIAT", "Entrepreneuriat"],
  ["COULISSES", "Coulisses"],
  ["PROJETS", "Projets"],
  ["COMMUNAUTE", "Communauté"],
] as const;

const emptyForm = {
  url: "",
  type: "IMAGE",
  category: "EVENEMENTS",
  title: "",
  description: "",
  order: 0,
  isPublished: false,
};

export function GalerieAdminView({ initialItems }: { initialItems: GalleryRow[] }) {
  const [items, setItems] = useState<GalleryRow[]>(initialItems);
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

  function openEdit(item: GalleryRow) {
    setEditingId(item.id);
    setForm({
      url: item.url,
      type: item.type,
      category: item.category,
      title: item.title ?? "",
      description: item.description ?? "",
      order: item.order,
      isPublished: item.isPublished,
    });
    setOpen(true);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.upload<{ url: string }>("/api/upload", fd);
      setForm((f) => ({ ...f, url: res.url }));
      toast.success("Média téléversé");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload impossible");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!form.url.trim()) {
      toast.error("Une image ou un lien de média est requis.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        url: form.url,
        type: form.type,
        category: form.category,
        title: form.title || null,
        description: form.description || null,
        order: form.order,
        isPublished: form.isPublished,
      };
      if (editingId) {
        const updated = await api.patch<GalleryRow>(`/api/admin/gallery/${editingId}`, payload);
        setItems((list) => list.map((i) => (i.id === editingId ? { ...i, ...updated, title: form.title, description: form.description } : i)));
        toast.success("Média mis à jour");
      } else {
        const created = await api.post<GalleryRow>("/api/admin/gallery", payload);
        setItems((list) => [{ ...created, title: form.title, description: form.description }, ...list]);
        toast.success("Média ajouté à la galerie");
      }
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(item: GalleryRow) {
    try {
      const updated = await api.patch<GalleryRow>(`/api/admin/gallery/${item.id}`, { isPublished: !item.isPublished });
      setItems((list) => list.map((i) => (i.id === item.id ? { ...i, ...updated } : i)));
      toast.success(updated.isPublished ? "Média publié" : "Média retiré de la publication");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action impossible");
    }
  }

  async function remove() {
    if (!deleteId) return;
    try {
      await api.delete(`/api/admin/gallery/${deleteId}`);
      setItems((list) => list.filter((i) => i.id !== deleteId));
      toast.success("Média supprimé");
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
          <p className="ocd-kicker mb-2">Galerie photographique</p>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Galerie</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Organise les photographies et vidéos de l&apos;univers OCD par catégorie. Les médias non
            publiés restent invisibles sur le site public.
          </p>
        </div>
        <Button onClick={openCreate} className="rounded-full">
          <Plus className="h-4 w-4" /> Ajouter un média
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Aucun média enregistré.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border bg-card">
              <div className="relative aspect-video bg-secondary">
                {item.type === "IMAGE" ? (
                  <Image src={item.url} alt={item.title ?? "Média"} fill className="object-cover" sizes="320px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Vidéo</div>
                )}
                <Badge className="absolute left-2 top-2 bg-[#F07819] hover:bg-[#F07819]">{item.category}</Badge>
                {!item.isPublished && (
                  <Badge variant="outline" className="absolute right-2 top-2 bg-background">Brouillon</Badge>
                )}
              </div>
              <div className="space-y-2 p-4">
                <p className="truncate text-sm font-semibold">{item.title ?? "Sans titre"}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{item.description ?? item.url}</p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Switch checked={item.isPublished} onCheckedChange={() => togglePublish(item)} aria-label="Publier" />
                    Publié
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openEdit(item)}>Modifier</Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(item.id)} aria-label="Supprimer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier le média" : "Ajouter un média"}</DialogTitle>
            <DialogDescription>Téléverse une image ou renseigne un lien vidéo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger aria-label="Type de média"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMAGE">Image</SelectItem>
                    <SelectItem value="VIDEO">Vidéo (lien)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            </div>
            {form.type === "IMAGE" && (
              <div className="space-y-2">
                <div className="relative aspect-video overflow-hidden rounded-lg border bg-secondary">
                  {form.url ? (
                    <Image src={form.url} alt="Aperçu" fill className="object-cover" sizes="400px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">Aperçu</div>
                  )}
                </div>
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
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Téléverser
                  </Button>
                  {form.url && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, url: "" })}>
                      <X className="h-3.5 w-3.5" /> Retirer
                    </Button>
                  )}
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="g-url">{form.type === "IMAGE" ? "URL de l'image" : "URL de la vidéo"}</Label>
              <Input id="g-url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="/uploads/... ou https://..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-title">Titre (optionnel)</Label>
              <Input id="g-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-desc">Description (optionnelle)</Label>
              <Textarea id="g-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="g-pub" checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} />
              <Label htmlFor="g-pub">Publier</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce média ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-white hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
