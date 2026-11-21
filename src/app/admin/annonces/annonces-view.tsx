"use client";

import { useState } from "react";
import { Loader2, Plus, Save, Trash2, Megaphone } from "lucide-react";
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
import { api, timeAgo } from "@/lib/client";
import { toast } from "sonner";

type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  isPublished: boolean;
  author: string;
  createdAt: string;
};

export function AnnoncesAdminView({ initialItems }: { initialItems: AnnouncementRow[] }) {
  const [items, setItems] = useState<AnnouncementRow[]>(initialItems);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", body: "", isPublished: false });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function save() {
    if (!form.title.trim() || form.body.trim().length < 5) {
      toast.error("Le titre et le contenu (min. 5 caractères) sont requis.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const updated = await api.patch<AnnouncementRow>(`/api/admin/announcements/${editingId}`, form);
        setItems((list) => list.map((a) => (a.id === editingId ? { ...a, ...updated } : a)));
        toast.success("Annonce mise à jour");
      } else {
        const created = await api.post<AnnouncementRow>("/api/admin/announcements", form);
        setItems((list) => [{ ...created, author: "Équipe OCD", createdAt: new Date().toISOString() }, ...list]);
        toast.success("Annonce créée");
      }
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(item: AnnouncementRow) {
    try {
      const updated = await api.patch<AnnouncementRow>(`/api/admin/announcements/${item.id}`, {
        isPublished: !item.isPublished,
      });
      setItems((list) => list.map((a) => (a.id === item.id ? { ...a, ...updated } : a)));
      toast.success(updated.isPublished ? "Annonce publiée" : "Annonce dépubliée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action impossible");
    }
  }

  async function remove() {
    if (!deleteId) return;
    try {
      await api.delete(`/api/admin/announcements/${deleteId}`);
      setItems((list) => list.filter((a) => a.id !== deleteId));
      toast.success("Annonce supprimée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ocd-kicker mb-2">Communication</p>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Annonces</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Publie des annonces à destination de la communauté. Les annonces publiées apparaissent
            dans l&apos;espace membre.
          </p>
        </div>
        <Button
          className="rounded-full"
          onClick={() => {
            setEditingId(null);
            setForm({ title: "", body: "", isPublished: false });
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Nouvelle annonce
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Aucune annonce pour le moment.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.id} className="rounded-2xl border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Megaphone className="h-4 w-4 text-[#F07819]" />
                <p className="font-semibold">{a.title}</p>
                {a.isPublished ? (
                  <Badge className="bg-[#F07819] hover:bg-[#F07819]">Publiée</Badge>
                ) : (
                  <Badge variant="outline">Brouillon</Badge>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {a.author} · {timeAgo(a.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Switch checked={a.isPublished} onCheckedChange={() => togglePublish(a)} aria-label="Publier" />
                  Publiée
                </div>
                <div className="ml-auto flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setEditingId(a.id);
                      setForm({ title: a.title, body: a.body, isPublished: a.isPublished });
                      setOpen(true);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(a.id)} aria-label="Supprimer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier l'annonce" : "Nouvelle annonce"}</DialogTitle>
            <DialogDescription>Une annonce publiée notifie les membres actifs.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="an-title">Titre</Label>
              <Input id="an-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="an-body">Contenu</Label>
              <Textarea id="an-body" rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="an-pub" checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} />
              <Label htmlFor="an-pub">Publier immédiatement</Label>
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
            <AlertDialogTitle>Supprimer cette annonce ?</AlertDialogTitle>
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
