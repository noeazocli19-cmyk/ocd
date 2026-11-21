"use client";

import { useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/community/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { api, timeAgo } from "@/lib/client";
import { toast } from "sonner";

type MemberRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  country: string | null;
  city: string | null;
  profession: string | null;
  isDemo: boolean;
  isBlocked: boolean;
  createdAt: string;
  _count: { posts: number };
};

const ROLE_LABELS: Record<string, string> = {
  MEMBER: "Membre",
  MODERATOR: "Modérateur",
  ADMIN: "Administrateur",
  SUPER_ADMIN: "Super admin",
};

export function MembresAdminView({ initialItems }: { initialItems: MemberRow[] }) {
  const [items, setItems] = useState<MemberRow[]>(initialItems);
  const [q, setQ] = useState("");
  const [blockedTarget, setBlockedTarget] = useState<MemberRow | null>(null);

  async function changeRole(user: MemberRow, role: string) {
    try {
      const updated = await api.patch<{ id: string; role: string; isBlocked: boolean }>(`/api/admin/users/${user.id}`, { role });
      setItems((list) => list.map((m) => (m.id === user.id ? { ...m, role: updated.role } : m)));
      toast.success(`Rôle mis à jour : ${ROLE_LABELS[role]}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action impossible");
    }
  }

  async function toggleBlock() {
    if (!blockedTarget) return;
    const target = blockedTarget;
    try {
      const updated = await api.patch<{ id: string; role: string; isBlocked: boolean }>(`/api/admin/users/${target.id}`, {
        isBlocked: !target.isBlocked,
      });
      setItems((list) => list.map((m) => (m.id === target.id ? { ...m, isBlocked: updated.isBlocked } : m)));
      toast.success(updated.isBlocked ? "Compte suspendu" : "Compte réactivé");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action impossible");
    } finally {
      setBlockedTarget(null);
    }
  }

  const filtered = items.filter((m) => {
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return (
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(needle) ||
      m.email.toLowerCase().includes(needle)
    );
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="ocd-kicker mb-2">Gestion de la communauté</p>
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Membres</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Gère les rôles de l&apos;équipe et suspend les comptes problématiques. Les profils marqués
          « Démo » sont fictifs et servent uniquement à la présentation du prototype.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="pl-9"
          aria-label="Rechercher un membre"
        />
      </div>

      <ul className="space-y-3">
        {filtered.map((m) => (
          <li key={m.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
            <Avatar src={m.avatarUrl} firstName={m.firstName} lastName={m.lastName} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{m.firstName} {m.lastName}</p>
                <Badge variant={m.role === "MEMBER" ? "secondary" : "default"} className={m.role !== "MEMBER" ? "bg-[#F07819] hover:bg-[#F07819]" : ""}>
                  {ROLE_LABELS[m.role] ?? m.role}
                </Badge>
                {m.isDemo && <Badge variant="outline" className="text-muted-foreground">Démo</Badge>}
                {m.isBlocked && <Badge className="bg-destructive hover:bg-destructive">Suspendu</Badge>}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {m.email} · {m.profession ?? "—"}
                {m.country ? ` · ${m.country}` : ""} · inscrit {timeAgo(m.createdAt)} · {m._count.posts} publication{m._count.posts > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Select value={m.role} onValueChange={(v) => changeRole(m, v)}>
                <SelectTrigger className="h-8 w-[150px] text-xs" aria-label="Changer le rôle">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={m.isBlocked ? "outline" : "ghost"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setBlockedTarget(m)}
              >
                {m.isBlocked ? "Réactiver" : "Suspendre"}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <AlertDialog open={Boolean(blockedTarget)} onOpenChange={(v) => !v && setBlockedTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blockedTarget?.isBlocked ? "Réactiver ce compte ?" : "Suspendre ce compte ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blockedTarget?.isBlocked
                ? "Le membre retrouvera l'accès complet à la plateforme."
                : "Le membre ne pourra plus se connecter. Ses publications restent visibles mais pourront être modérées."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={toggleBlock}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
