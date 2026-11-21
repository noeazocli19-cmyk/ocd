"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UsersRound,
  ArrowLeft,
  Sparkles,
  Loader2,
  Info,
  MessageCircle,
} from "lucide-react";
import { Avatar } from "@/components/community/avatar";
import { PostComposer } from "@/components/community/post-composer";
import { PostCard, type FeedPost, type CurrentUser } from "@/components/community/post-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useUser } from "@/components/app/user-provider";
import { api, GROUP_LABELS } from "@/lib/client";
import { toast } from "sonner";

type MemberUser = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  profession: string | null;
};

type GroupMemberItem = {
  id: string;
  role: string;
  joinedAt: string;
  userId?: string;
  user: MemberUser;
};

type GroupDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  imageUrl: string | null;
  isFeatured: boolean;
  isDemo: boolean;
  creator: { id: string; firstName: string; lastName: string; avatarUrl: string | null } | null;
  members: GroupMemberItem[];
  _count: { members: number; posts: number };
};

type Membership = { id: string; role: string; userId?: string } | null;

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  MODERATOR: "Modérateur",
  MEMBER: "Membre",
};

export function GroupeView({ id }: { id: string }) {
  const { user, refresh } = useUser();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [myMembership, setMyMembership] = useState<Membership>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const currentUser: CurrentUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    role: user.role,
  };

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ group: GroupDetail; posts: FeedPost[]; myMembership: Membership }>(
        `/api/groups/${id}`
      );
      setGroup(data.group);
      setPosts(data.posts);
      setMyMembership(data.myMembership);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Groupe introuvable.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const isMember = myMembership !== null;

  async function join() {
    setJoining(true);
    try {
      await api.post(`/api/groups/${id}/members`);
      setMyMembership({ id: "local", role: "MEMBER", userId: user.id });
      setGroup((prev) =>
        prev
          ? {
              ...prev,
              _count: { ...prev._count, members: prev._count.members + 1 },
              members: [
                ...prev.members,
                {
                  id: "local",
                  role: "MEMBER",
                  joinedAt: new Date().toISOString(),
                  userId: user.id,
                  user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatarUrl: user.avatarUrl,
                    profession: user.profession,
                  },
                },
              ],
            }
          : prev
      );
      toast.success(`Bienvenue dans le groupe ${group?.name ?? ""}`);
      void refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de rejoindre le groupe");
    } finally {
      setJoining(false);
    }
  }

  async function confirmLeave() {
    setLeaveOpen(false);
    try {
      await api.delete(`/api/groups/${id}/members`);
      setMyMembership(null);
      setGroup((prev) =>
        prev
          ? {
              ...prev,
              _count: { ...prev._count, members: Math.max(0, prev._count.members - 1) },
              members: prev.members.filter((m) => m.userId !== user.id),
            }
          : prev
      );
      toast.success("Tu as quitté le groupe");
      void refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de quitter le groupe");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
          <Skeleton className="h-44 w-full rounded-none" />
          <div className="space-y-3 p-6">
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F07819]/10">
          <Info className="h-7 w-7 text-[#F07819]" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-display text-xl font-bold">{error ?? "Groupe introuvable."}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ce groupe n&apos;existe plus ou l&apos;adresse est incorrecte.
        </p>
        <Button asChild className="mt-6 rounded-full px-5">
          <Link href="/espace/groupes">
            <ArrowLeft className="h-4 w-4" /> Retour aux groupes
          </Link>
        </Button>
      </div>
    );
  }

  const myRoleLabel = myMembership ? (ROLE_LABELS[myMembership.role] ?? "Membre") : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <Link
        href="/espace/groupes"
        className="inline-flex min-h-[36px] items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-[#F07819]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Tous les groupes
      </Link>

      {/* Bandeau du groupe */}
      <section aria-labelledby="group-title" className="mt-3 overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="relative h-44 w-full sm:h-56">
          {group.imageUrl ? (
            <Image
              src={group.imageUrl}
              alt={`Illustration du groupe ${group.name}`}
              fill
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#26201a] to-[#B45309]">
              <UsersRound className="h-14 w-14 text-white/70" aria-hidden="true" />
            </div>
          )}
          {group.isFeatured && (
            <Badge className="absolute left-4 top-4 border-0 bg-[#F07819] text-white">
              <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" /> À la une
            </Badge>
          )}
        </div>
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 id="group-title" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {group.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{GROUP_LABELS[group.category] ?? group.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  {group._count.members} membre{group._count.members > 1 ? "s" : ""} · {group._count.posts}{" "}
                  publication{group._count.posts > 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isMember && myRoleLabel ? (
                <>
                  <Badge
                    variant="outline"
                    className="border-[#F07819]/40 bg-[#F07819]/10 text-[#B45309] dark:text-[#FFB25C]"
                  >
                    {myRoleLabel}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full hover:border-destructive/40 hover:text-destructive"
                    onClick={() => setLeaveOpen(true)}
                  >
                    Quitter
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  className="rounded-full px-6"
                  onClick={join}
                  disabled={joining}
                >
                  {joining && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  Rejoindre le groupe
                </Button>
              )}
            </div>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
            {group.description}
          </p>

          {group.creator && (
            <div className="mt-5 flex items-center gap-2.5 border-t pt-4">
              <Avatar
                src={group.creator.avatarUrl}
                firstName={group.creator.firstName}
                lastName={group.creator.lastName}
                size="sm"
              />
              <p className="text-sm text-muted-foreground">
                Créé par{" "}
                <span className="font-semibold text-foreground">
                  {group.creator.firstName} {group.creator.lastName}
                </span>
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,320px]">
        {/* Fil du groupe */}
        <section aria-label="Publications du groupe" className="space-y-5">
          {isMember ? (
            <>
              <PostComposer
                currentUser={currentUser}
                groupId={group.id}
                placeholder="Partage une actualité, une question ou une ressource avec le groupe..."
                onCreated={() => void load()}
              />
              {posts.length === 0 ? (
                <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F07819]/10">
                    <MessageCircle className="h-6 w-6 text-[#F07819]" aria-hidden="true" />
                  </span>
                  <p className="mt-3 font-display font-semibold">Aucune publication pour l&apos;instant</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Lance la discussion en partageant la première publication du groupe.
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onUpdate={(updated) =>
                      setPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
                    }
                    onDelete={(postId) => setPosts((prev) => prev.filter((p) => p.id !== postId))}
                  />
                ))
              )}
            </>
          ) : (
            <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F07819]/10">
                <UsersRound className="h-7 w-7 text-[#F07819]" aria-hidden="true" />
              </span>
              <p className="mt-4 font-display text-lg font-semibold">Espace réservé aux membres</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Rejoins ce groupe pour publier et commenter.
              </p>
              <Button className="mt-5 rounded-full px-6" onClick={join} disabled={joining}>
                {joining && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Rejoindre le groupe
              </Button>
            </div>
          )}
        </section>

        {/* Membres */}
        <aside className="space-y-5">
          <section aria-labelledby="members-title" className="rounded-2xl border bg-card p-5">
            <h2 id="members-title" className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Membres · {group._count.members}
            </h2>
            <ul className="mt-4 max-h-96 space-y-1 overflow-y-auto pr-1">
              {group.members.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/espace/membres/${m.user.id}`}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-secondary"
                  >
                    <Avatar
                      src={m.user.avatarUrl}
                      firstName={m.user.firstName}
                      lastName={m.user.lastName}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {m.user.firstName} {m.user.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {m.user.profession ?? "Membre OCD"}
                      </p>
                    </div>
                    <Badge
                      variant={m.role === "MEMBER" ? "secondary" : "outline"}
                      className={
                        m.role === "MEMBER"
                          ? "shrink-0 text-[10px]"
                          : "shrink-0 border-[#F07819]/40 text-[#B45309] text-[10px] dark:text-[#FFB25C]"
                      }
                    >
                      {ROLE_LABELS[m.role] ?? "Membre"}
                    </Badge>
                  </Link>
                </li>
              ))}
              {group.members.length === 0 && (
                <li className="py-6 text-center text-sm text-muted-foreground">Aucun membre pour le moment.</li>
              )}
            </ul>
          </section>
        </aside>
      </div>

      {/* Confirmation de départ */}
      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter ce groupe ?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu ne recevras plus les publications du groupe « {group.name} ». Tu pourras le rejoindre à
              nouveau plus tard.
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
