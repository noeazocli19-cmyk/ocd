"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react";
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
import { api, EVENT_LABELS } from "@/lib/client";
import { toast } from "sonner";

type EventRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  startDate: string;
  location: string | null;
  isOnline: boolean;
  onlineUrl: string | null;
  organizerName: string;
  capacity: number | null;
  status: string;
  isDemo: boolean;
  registrations: number;
};

const emptyForm = {
  title: "",
  description: "",
  category: "RENCONTRE",
  imageUrl: "",
  startDate: "",
  location: "",
  isOnline: false,
  onlineUrl: "",
  organizerName: "Équipe OCD",
  capacity: "",
  status: "DRAFT",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  CANCELLED: "Annulé",
};

export function EvenementsAdminView({ initialItems }: { initialItems: EventRow[] }) {
  const [items, setItems] = useState<EventRow[]>(initialItems);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setOpen(true);
  }

  function openEdit(item: EventRow) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      imageUrl: item.imageUrl ?? "",
      startDate: item.startDate,
      location: item.location ?? "",
      isOnline: item.isOnline,
      onlineUrl: item.onlineUrl ?? "",
      organizerName: item.organizerName,
      capacity: item.capacity ? String(item.capacity) : "",
      status: item.status,
    });
    setOpen(true);
  }

  async function save() {
    if (!form.title.trim() || form.description.trim().length < 10 || !form.startDate) {
      toast.error("Le titre, la description (min. 10 caractères) et la date de début sont requis.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        imageUrl: form.imageUrl || null,
        startDate: new Date(form.startDate).toISOString(),
        location: form.location || null,
        isOnline: form.isOnline,
        onlineUrl: form.onlineUrl || null,
        organizerName: form.organizerName || "Équipe OCD",
        capacity: form.capacity ? Number(form.capacity) : null,
        status: form.status,
      };
      if (editingId) {
        const updated = await api.patch<EventRow>(`/api/admin/events/${editingId}`, payload);
        setItems((list) => list.map((i) => (i.id === editingId ? { ...i, ...updated } : i)));
        toast.success("Événement mis à jour");
      } else {
        const created = await api.post<EventRow>("/api/admin/events", payload);
        setItems((list) => [...list, { ...created, isDemo: false, registrations: 0 }]);
        toast.success("Événement créé");
      }
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleteId) return;
    try {
      await api.delete(`/api/admin/events/${deleteId}`);
      setItems((list) => list.filter((i) => i.id !== deleteId));
      toast.success("Événement supprimé");
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
          <p className="ocd-kicker mb-2">Espace événementiel</p>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Événements</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Crée les événements OCD (masterclass, rencontres, challenges). Les brouillons restent
            invisibles ; les événements d&apos;exemple sont marqués « Exemple » publiquement.
          </p>
        </div>
        <Button onClick={openCreate} className="rounded-full">
          <Plus className="h-4 w-4" /> Nouvel événement
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Aucun événement enregistré.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{item.title}</p>
                  <Badge variant="secondary">{EVENT_LABELS[item.category] ?? item.category}</Badge>
                  <Badge
                    variant="outline"
                    className={
                      item.status === "PUBLISHED"
                        ? "border-[#F07819]/50 text-[#B45309]"
                        : item.status === "CANCELLED"
                          ? "text-destructive"
                          : ""
                    }
                  >
                    {STATUS_LABELS[item.status] ?? item.status}
                  </Badge>
                  {item.isDemo && <Badge variant="outline" className="text-muted-foreground">Exemple</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(item.startDate).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                  {" · "}
                  {item.isOnline ? "En ligne" : item.location ?? "Lieu à définir"}
                  {" · "}
                  {item.registrations} inscrit{item.registrations > 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier l'événement" : "Nouvel événement"}</DialogTitle>
            <DialogDescription>
              Renseigne toutes les informations visibles par les membres. Crée d&apos;abord en
              brouillon, publie quand c&apos;est prêt.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="e-title">Titre</Label>
              <Input id="e-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-desc">Description</Label>
              <Textarea id="e-desc" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Catégorie</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger aria-label="Catégorie"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(EVENT_LABELS).map(([v, l]) => (
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
                    <SelectItem value="DRAFT">Brouillon</SelectItem>
                    <SelectItem value="PUBLISHED">Publié</SelectItem>
                    <SelectItem value="CANCELLED">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="e-start">Date et heure de début</Label>
                <Input id="e-start" type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e-cap">Capacité (optionnel)</Label>
                <Input id="e-cap" type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="illimité" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="e-online" checked={form.isOnline} onCheckedChange={(v) => setForm({ ...form, isOnline: v })} />
              <Label htmlFor="e-online">Événement en ligne</Label>
            </div>
            {form.isOnline ? (
              <div className="space-y-1.5">
                <Label htmlFor="e-url">Lien en ligne</Label>
                <Input id="e-url" value={form.onlineUrl} onChange={(e) => setForm({ ...form, onlineUrl: e.target.value })} placeholder="https://..." />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="e-loc">Lieu</Label>
                <Input id="e-loc" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ville, pays (ou lieu à confirmer)" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="e-org">Organisateur affiché</Label>
              <Input id="e-org" value={form.organizerName} onChange={(e) => setForm({ ...form, organizerName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-img">Image (URL, optionnel)</Label>
              <Input id="e-img" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="/uploads/... ou https://..." />
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
            <AlertDialogTitle>Supprimer cet événement ?</AlertDialogTitle>
            <AlertDialogDescription>Les inscriptions associées seront également supprimées.</AlertDialogDescription>
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
