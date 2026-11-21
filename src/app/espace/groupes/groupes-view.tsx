"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UsersRound,
  Plus,
  Search,
  Sparkles,
  ArrowRight,
  Compass,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { api, GROUP_LABELS } from "@/lib/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type GroupItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  imageUrl: string | null;
  isFeatured: boolean;
  isDemo: boolean;
  _count: { members: number; posts: number };
  myMembership: { id: string; role: string } | null;
};

const CATEGORY_KEYS = ["ALL", ...Object.keys(GROUP_LABELS)] as const;

export function GroupesView() {
  const [items, setItems] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [submittedQ, setSubmittedQ] = useState("");

  // Création de groupe
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<string>("ENTREPRENARIAT");
  const [creating, setCreating] = useState(false);

  // Quitter un groupe
  const [leaveTarget, setLeaveTarget] = useState<GroupItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (category !== "ALL") params.set("category", category);
    if (submittedQ) params.set("q", submittedQ);

    api
      .get<{ items: GroupItem[] }>(`/api/groups?${params.toString()}`)
      .then((d) => {
        if (!cancelled) setItems(d.items);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Impossible de charger les groupes");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, submittedQ]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSubmittedQ(searchInput.trim());
  }

  function changeCategory(value: string) {
    setLoading(true);
    setCategory(value);
  }

  async function join(group: GroupItem) {
    try {
      await api.post(`/api/groups/${group.id}/members`);
      setItems((prev) =>
        prev.map((g) =>
          g.id === group.id
            ? { ...g, myMembership: { id: "local", role: "MEMBER" }, _count: { ...g._count, members: g._count.members + 1 } }
            : g
        )
      );
      toast.success(`Bienvenue dans le groupe ${group.name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de rejoindre le groupe");
    }
  }

  async function confirmLeave() {
    if (!leaveTarget) return;
    const target = leaveTarget;
    setLeaveTarget(null);
    try {
      await api.delete(`/api/groups/${target.id}/members`);
      setItems((prev) =>
        prev.map((g) =>
          g.id === target.id
            ? { ...g, myMembership: null, _count: { ...g._count, members: Math.max(0, g._count.members - 1) } }
            : g
        )
      );
      toast.success(`Tu as quitté le groupe ${target.name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de quitter le groupe");
    }
  }

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || newDescription.trim().length < 10) return;
    setCreating(true);
    try {
      const created = await api.post<{ id: string; name: string; slug: string; description: string; category: string; imageUrl: string | null }>(
        "/api/groups",
        {
          name: newName.trim(),
          description: newDescription.trim(),
          category: newCategory,
        }
      );
      setItems((prev) => [
        {
          id: created.id,
          name: created.name,
          slug: created.slug,
          description: created.description,
          category: created.category,
          imageUrl: created.imageUrl,
          isFeatured: false,
          isDemo: false,
          _count: { members: 1, posts: 0 },
          myMembership: { id: "local", role: "ADMIN" },
        },
        ...prev,
      ]);
      setCreateOpen(false);
      setNewName("");
      setNewDescription("");
      setNewCategory("ENTREPRENARIAT");
      toast.success("Ton groupe a bien été créé");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Création du groupe impossible");
    } finally {
      setCreating(false);
    }
  }

  const hasFilters = submittedQ !== "" || category !== "ALL";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      {/* En-tête */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="ocd-kicker text-xs font-semibold">Communauté</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">Groupes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rejoins des groupes de membres qui partagent tes ambitions, échange et fais avancer tes projets.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="shrink-0 rounded-full px-5">
          <Plus className="h-4 w-4" /> Créer un groupe
        </Button>
      </header>

      {/* Filtres */}
      <section aria-label="Filtres des groupes" className="mt-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => changeCategory(key)}
              className={cn(
                "inline-flex min-h-[36px] items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                category === key
                  ? "border-[#F07819] bg-[#F07819] text-white"
                  : "border-input bg-card text-muted-foreground hover:border-[#F07819]/40 hover:text-foreground"
              )}
            >
              {key === "ALL" ? "Tous" : GROUP_LABELS[key]}
            </button>
          ))}
        </div>
        <form onSubmit={submitSearch} className="flex max-w-md items-center gap-2" role="search">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher un groupe..."
              className="rounded-full pl-9"
              aria-label="Rechercher un groupe"
            />
          </div>
          <Button type="submit" variant="outline" className="rounded-full px-4">
            Chercher
          </Button>
        </form>
      </section>

      {/* Contenu */}
      {loading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border bg-card">
              <Skeleton className="h-32 w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F07819]/10">
            <Compass className="h-7 w-7 text-[#F07819]" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display text-lg font-semibold">
            {hasFilters ? "Aucun groupe ne correspond." : "Aucun groupe n'existe encore pour cette catégorie."}
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {hasFilters
              ? "Essaie une autre catégorie ou modifie ta recherche."
              : "Sois le premier à créer un groupe et rassemble la communauté autour de ton sujet."}
          </p>
          {!hasFilters && (
            <Button onClick={() => setCreateOpen(true)} className="mt-5 rounded-full px-5">
              <Plus className="h-4 w-4" /> Créer le premier groupe
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((g) => (
            <article
              key={g.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#F07819]/40 hover:shadow-xl"
            >
              <Link
                href={`/espace/groupes/${g.id}`}
                className="absolute inset-0 z-0"
                aria-label={`Ouvrir le groupe ${g.name}`}
              />
              {/* Visuel */}
              <div className="relative h-32 w-full overflow-hidden">
                {g.imageUrl ? (
                  <Image
                    src={g.imageUrl}
                    alt={`Illustration du groupe ${g.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#26201a] to-[#B45309]">
                    <UsersRound className="h-10 w-10 text-white/70" aria-hidden="true" />
                  </div>
                )}
                {g.isFeatured && (
                  <Badge className="absolute left-3 top-3 border-0 bg-[#F07819] text-white">
                    <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" /> À la une
                  </Badge>
                )}
              </div>

              {/* Corps */}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-base font-bold leading-snug">{g.name}</h2>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {GROUP_LABELS[g.category] ?? g.category}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{g.description}</p>
                <p className="text-xs font-medium text-muted-foreground">
                  {g._count.members} membre{g._count.members > 1 ? "s" : ""} · {g._count.posts} publication
                  {g._count.posts > 1 ? "s" : ""}
                </p>
              </div>

              {/* Actions */}
              <div className="relative z-10 flex items-center justify-between gap-2 border-t bg-card/60 px-4 py-3">
                {g.myMembership ? (
                  <>
                    <Badge
                      variant="outline"
                      className="border-[#F07819]/40 bg-[#F07819]/10 text-[#B45309] dark:text-[#FFB25C]"
                    >
                      Membre
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-muted-foreground hover:text-destructive"
                      onClick={() => setLeaveTarget(g)}
                    >
                      Quitter
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      className="flex-1 rounded-full"
                      onClick={() => join(g)}
                    >
                      Rejoindre
                    </Button>
                    <Link
                      href={`/espace/groupes/${g.id}`}
                      className="inline-flex min-h-[36px] items-center gap-1 rounded-full px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-[#F07819]"
                    >
                      Découvrir <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Dialog création */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Créer un groupe</DialogTitle>
            <DialogDescription>
              Rassemble des membres autour d&apos;un sujet qui te passionne.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createGroup} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="group-name" className="text-sm font-semibold">
                Nom du groupe
              </label>
              <Input
                id="group-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex. Founders Afrique"
                required
                minLength={3}
                maxLength={80}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="group-description" className="text-sm font-semibold">
                Description
              </label>
              <Textarea
                id="group-description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Explique l'objectif du groupe et qui tu cherches à réunir..."
                rows={4}
                required
                minLength={10}
                maxLength={1500}
              />
              <p className="text-xs text-muted-foreground">{newDescription.length}/1500</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="group-category" className="text-sm font-semibold">
                Catégorie
              </label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger id="group-category" className="w-full">
                  <SelectValue placeholder="Choisis une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GROUP_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreateOpen(false)}
                className="rounded-full"
              >
                Annuler
              </Button>
              <Button type="submit" className="rounded-full px-5" disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Créer le groupe
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation de départ */}
      <AlertDialog open={leaveTarget !== null} onOpenChange={(open) => !open && setLeaveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter ce groupe ?</AlertDialogTitle>
            <AlertDialogDescription>
              {leaveTarget
                ? `Tu ne recevras plus les publications du groupe « ${leaveTarget.name} ». Tu pourras le rejoindre à nouveau plus tard.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmLeave}
            >
              Quitter le groupe
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
