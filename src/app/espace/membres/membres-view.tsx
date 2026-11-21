"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, MapPin, UserCheck, UserPlus, Users } from "lucide-react";
import { Avatar } from "@/components/community/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/components/app/user-provider";
import { api } from "@/lib/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* --------------------------------- types ---------------------------------- */

type MemberCard = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string | null;
  country: string | null;
  city: string | null;
  profession: string | null;
  domain: string | null;
  experienceLevel: string | null;
  interests: string | null;
  isDemo: boolean;
  createdAt: string;
  _count: { posts: number };
};

type MembersResponse = { items: MemberCard[]; recommended: MemberCard[] };

type ConnState = "NONE" | "PENDING" | "ACCEPTED";

type FilterKind = "all" | "country" | "domain";

const PAGE = 24;
const MAX_LIMIT = 60;

/* ---------------------------------- vue ----------------------------------- */

export function MembresView() {
  const { user } = useUser();

  const [filter, setFilter] = useState<FilterKind>("all");
  const [items, setItems] = useState<MemberCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const [relations, setRelations] = useState<Record<string, ConnState>>({});
  const [follows, setFollows] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [followBusyId, setFollowBusyId] = useState<string | null>(null);

  const limitRef = useRef(PAGE);

  function buildUrl(kind: FilterKind, limit: number): string {
    const search = new URLSearchParams({ limit: String(limit) });
    if (kind === "country" && user.country) search.set("country", user.country);
    if (kind === "domain" && user.domain) search.set("domain", user.domain);
    return `/api/members?${search.toString()}`;
  }

  // Chargement de la grille à chaque changement de filtre
  useEffect(() => {
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      setLoading(true);
      limitRef.current = PAGE;
      api
        .get<MembersResponse>(buildUrl(filter, PAGE))
        .then((res) => {
          if (cancelled) return;
          setItems(res.items);
          setHasMore(res.items.length >= PAGE && PAGE < MAX_LIMIT);
          setLoading(false);
        })
        .catch((e) => {
          if (cancelled) return;
          setLoading(false);
          setItems([]);
          toast.error(e instanceof Error ? e.message : "Impossible de charger les membres.");
        });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [filter, user.country, user.domain]);

  function loadMore() {
    if (loadingMore) return;
    const nextLimit = Math.min(limitRef.current + PAGE, MAX_LIMIT);
    setLoadingMore(true);
    api
      .get<MembersResponse>(buildUrl(filter, nextLimit))
      .then((res) => {
        limitRef.current = nextLimit;
        setItems(res.items);
        setHasMore(res.items.length >= nextLimit && nextLimit < MAX_LIMIT);
        setLoadingMore(false);
      })
      .catch((e) => {
        setLoadingMore(false);
        toast.error(e instanceof Error ? e.message : "Impossible de charger plus de membres.");
      });
  }

  function connect(m: MemberCard) {
    if (busyId) return;
    setBusyId(m.id);
    api
      .post<{ status: string }>(`/api/members/${m.id}/connections`)
      .then((res) => {
        setBusyId(null);
        if (res.status === "PENDING") {
          setRelations((prev) => ({ ...prev, [m.id]: "PENDING" }));
          toast.success(`Demande envoyée à ${m.firstName}.`);
        } else if (res.status === "ACCEPTED") {
          setRelations((prev) => ({ ...prev, [m.id]: "ACCEPTED" }));
          toast.info("Vous êtes déjà connectés.");
        } else {
          setRelations((prev) => ({ ...prev, [m.id]: "NONE" }));
          toast.info("Demande annulée.");
        }
      })
      .catch((e) => {
        setBusyId(null);
        toast.error(e instanceof Error ? e.message : "Action impossible pour le moment.");
      });
  }

  function toggleFollow(m: MemberCard) {
    if (followBusyId) return;
    setFollowBusyId(m.id);
    api
      .post<{ following: boolean }>(`/api/members/${m.id}/follow`)
      .then((res) => {
        setFollows((prev) => ({ ...prev, [m.id]: res.following }));
        setFollowBusyId(null);
        toast.success(
          res.following ? `Tu suis maintenant ${m.firstName}.` : `Tu ne suis plus ${m.firstName}.`
        );
      })
      .catch((e) => {
        setFollowBusyId(null);
        toast.error(e instanceof Error ? e.message : "Action impossible pour le moment.");
      });
  }

  const isSelf = (m: MemberCard) => m.id === user.id;
  const relationOf = (m: MemberCard): ConnState => relations[m.id] ?? "NONE";
  const followsOf = (m: MemberCard) => follows[m.id] ?? false;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-6">
        <p className="ocd-kicker text-xs font-bold">Réseau</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Membres</h1>
        <p className="mt-1 text-muted-foreground">
          Les derniers arrivants sur OCD. Connecte-toi, suis-les, grandis ensemble.
        </p>
      </header>

      {/* Filtres rapides */}
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filtres rapides">
        {(
          [
            { kind: "all" as FilterKind, label: "Tous" },
            { kind: "country" as FilterKind, label: user.country ? `Mon pays (${user.country})` : "Mon pays" },
            { kind: "domain" as FilterKind, label: user.domain ? `Mon domaine (${user.domain})` : "Mon domaine" },
          ]
        ).map((f) => {
          const disabled =
            (f.kind === "country" && !user.country) || (f.kind === "domain" && !user.domain);
          return (
            <button
              key={f.kind}
              type="button"
              disabled={disabled}
              onClick={() => setFilter(f.kind)}
              aria-pressed={filter === f.kind}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50",
                filter === f.kind
                  ? "bg-[#F07819] text-white shadow-sm"
                  : "border bg-card text-muted-foreground hover:border-[#F07819]/40 hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Grille */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F07819]/10">
            <Users className="h-6 w-6 text-[#F07819]" />
          </span>
          <p className="max-w-sm text-sm text-muted-foreground">
            Aucun membre ne correspond à ce filtre pour le moment.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => {
              const relation = relationOf(m);
              const following = followsOf(m);
              const place = [m.city, m.country].filter(Boolean).join(", ");
              return (
                <article
                  key={m.id}
                  className="flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-[#F07819]/40 hover:shadow-xl"
                >
                  <div className="relative h-20 shrink-0 bg-gradient-to-br from-[#F07819]/70 via-[#B45309]/60 to-[#7C2D12]/60">
                    <div className="bg-grid-ocd absolute inset-0" aria-hidden="true" />
                    {m.coverUrl && (
                      <Image
                        src={m.coverUrl}
                        alt={`Couverture de ${m.firstName} ${m.lastName}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4 pt-0">
                    <div className="-mt-7 flex items-end justify-between gap-2">
                      <Link href={`/espace/membres/${m.id}`} aria-label={`Profil de ${m.firstName} ${m.lastName}`}>
                        <Avatar
                          src={m.avatarUrl}
                          firstName={m.firstName}
                          lastName={m.lastName}
                          size="lg"
                          className="border-2 border-card"
                        />
                      </Link>
                      <div className="flex items-center gap-1.5">
                        {m.isDemo && (
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                            Démo
                          </Badge>
                        )}
                        {isSelf(m) && (
                          <Badge className="h-5 rounded-full bg-[#F07819] px-2 text-[10px] font-semibold uppercase text-white">
                            C&apos;est toi
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h2 className="mt-2 truncate text-sm font-bold">
                      <Link href={`/espace/membres/${m.id}`} className="hover:underline">
                        {m.firstName} {m.lastName}
                      </Link>
                    </h2>
                    <p className="truncate text-xs text-muted-foreground">{m.profession ?? "Membre OCD"}</p>
                    {place && (
                      <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" /> {place}
                      </p>
                    )}
                    {m.bio && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground/80">{m.bio}</p>}
                    <div className="mt-auto flex items-center gap-2 border-t pt-3">
                      {isSelf(m) ? (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full flex-1 rounded-full font-semibold"
                        >
                          <Link href="/espace/profil">Voir mon profil</Link>
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => connect(m)}
                            disabled={busyId === m.id || relation !== "NONE"}
                            variant={relation === "NONE" ? "default" : "outline"}
                            className="w-full flex-1 rounded-full font-semibold"
                          >
                            {busyId === m.id && <Loader2 className="h-4 w-4 animate-spin" />}
                            {busyId !== m.id && relation === "NONE" && <UserPlus className="h-4 w-4" />}
                            {relation === "PENDING" && <Check className="h-4 w-4" />}
                            {relation === "ACCEPTED" && <Check className="h-4 w-4" />}
                            {relation === "NONE" ? "Se connecter" : relation === "PENDING" ? "Demande envoyée" : "Connectés"}
                          </Button>
                          <Button
                            size="icon"
                            variant={following ? "default" : "outline"}
                            aria-label={following ? `Ne plus suivre ${m.firstName}` : `Suivre ${m.firstName}`}
                            aria-pressed={following}
                            disabled={followBusyId === m.id}
                            onClick={() => toggleFollow(m)}
                            className={cn(
                              "h-9 w-9 shrink-0 rounded-full",
                              following && "bg-[#F07819] hover:bg-[#B45309]"
                            )}
                          >
                            {followBusyId === m.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : following ? (
                              <UserCheck className="h-4 w-4" />
                            ) : (
                              <UserPlus className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="rounded-full font-semibold">
                {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                Charger plus de membres
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
