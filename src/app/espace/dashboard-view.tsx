"use client";

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Compass,
  Loader2,
  MapPin,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Newspaper,
  PencilLine,
  ThumbsUp,
  Users,
  UsersRound,
  Video,
} from "lucide-react";
import { Avatar } from "@/components/community/avatar";
import { PostCard, type FeedPost } from "@/components/community/post-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/components/app/user-provider";
import { api, formatDateLong, formatDateTime, GROUP_LABELS, timeAgo } from "@/lib/client";

/* ---------------------------------- types --------------------------------- */

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

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
};

type GroupSummary = {
  id: string;
  name: string;
  slug: string;
  category: string;
  isDemo: boolean;
  _count: { members: number; posts: number };
};

type EventSummary = {
  id: string;
  title: string;
  category: string;
  startDate: string;
  location: string | null;
  isOnline: boolean;
  isDemo: boolean;
  registered: boolean;
  _count: { registrations: number };
};

type ProfileFragment = {
  bio: string | null;
  avatarUrl: string | null;
  profession: string | null;
  country: string | null;
  city: string | null;
  skills: { id: string; name: string }[];
};

/* ------------------------------- helpers ---------------------------------- */

const NOTIF_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  CONNECTION_REQUEST: Users,
  MESSAGE: MessageCircle,
  REACTION: ThumbsUp,
  COMMENT: MessageSquare,
  GROUP_INVITE: UsersRound,
  ANNOUNCEMENT: Megaphone,
  EVENT_UPDATE: CalendarDays,
};

function NotifIcon({ type }: { type: string }) {
  const Icon = NOTIF_ICONS[type] ?? Bell;
  return <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#F07819]" />;
}

function SectionHeader({ title, href, label }: { title: string; href: string; label?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#F07819] transition-colors hover:text-[#B45309] dark:hover:text-[#FFB25C]"
      >
        {label ?? "Voir tout"}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function EmptyBlock({
  icon: Icon,
  text,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-8 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F07819]/10">
        <Icon className="h-5 w-5 text-[#F07819]" />
      </span>
      <p className="max-w-xs text-sm text-muted-foreground">{text}</p>
      {action}
    </div>
  );
}

/* --------------------------------- vue ------------------------------------ */

export function DashboardView() {
  const { user } = useUser();

  const [today, setToday] = useState<string>("");
  const [completeness, setCompleteness] = useState<number | null>(null);
  const [posts, setPosts] = useState<FeedPost[] | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[] | null>(null);
  const [recommended, setRecommended] = useState<MemberCard[] | null>(null);
  const [groups, setGroups] = useState<GroupSummary[] | null>(null);
  const [events, setEvents] = useState<EventSummary[] | null>(null);

  // Date longue française (calculée côté client pour éviter tout écart d'hydratation)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setToday(formatDateLong(new Date())));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      api.get<{ items: FeedPost[] }>(`/api/posts?authorId=${user.id}&limit=3`),
      api.get<{ items: NotificationItem[] }>("/api/notifications"),
      api.get<{ items: MemberCard[]; recommended: MemberCard[] }>("/api/members?recommended=1&limit=4"),
      api.get<{ items: GroupSummary[] }>("/api/groups"),
      api.get<{ items: EventSummary[] }>("/api/events?upcoming=1&limit=3"),
      api.get<{ profile: ProfileFragment }>("/api/profile"),
    ])
      .then(([postsRes, notifRes, membersRes, groupsRes, eventsRes, profileRes]) => {
        if (cancelled) return;
        setPosts(postsRes.items);
        setNotifications(notifRes.items.slice(0, 5));
        setRecommended(membersRes.recommended.slice(0, 4));
        setGroups(groupsRes.items.slice(0, 4));
        setEvents(eventsRes.items.slice(0, 3));

        // Complétude du profil : bio, avatar, profession, pays/ville, compétences
        const p = profileRes.profile;
        const criteria = [
          Boolean(p?.bio && p.bio.trim().length > 0),
          Boolean(p?.avatarUrl),
          Boolean(p?.profession && p.profession.trim().length > 0),
          Boolean(
            (p?.country && p.country.trim().length > 0) || (p?.city && p.city.trim().length > 0)
          ),
          (p?.skills?.length ?? 0) > 0,
        ];
        const done = criteria.filter(Boolean).length;
        setCompleteness(Math.round((done / criteria.length) * 100));
      })
      .catch(() => {
        if (cancelled) return;
        setPosts([]);
        setNotifications([]);
        setRecommended([]);
        setGroups([]);
        setEvents([]);
        setCompleteness(0);
      });

    return () => {
      cancelled = true;
    };
  }, [user.id]);

  const loading = posts === null || notifications === null || recommended === null || groups === null || events === null;

  function updatePost(updated: FeedPost) {
    setPosts((prev) => (prev ? prev.map((p) => (p.id === updated.id ? updated : p)) : prev));
  }
  function deletePost(postId: string) {
    setPosts((prev) => (prev ? prev.filter((p) => p.id !== postId) : prev));
  }

  const greetingName = useMemo(() => user.firstName, [user.firstName]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      {/* En-tête de bienvenue */}
      <header className="mb-8">
        <p className="ocd-kicker text-xs font-bold">Espace membre</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          Bonjour {greetingName}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Les opportunités sont dehors. Que feras-tu aujourd&apos;hui ?
        </p>
        {today && <p className="mt-2 text-sm capitalize text-muted-foreground">{today}</p>}
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-2">
          {/* Ton profil */}
          <section aria-labelledby="profil-card-title" className="rounded-2xl border bg-card p-6">
            <div id="profil-card-title">
              <SectionHeader title="Ton profil" href="/espace/parametres" label="Paramètres" />
            </div>
            {completeness === null ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-display text-3xl font-extrabold text-[#F07819]">
                      {completeness}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {completeness < 100
                        ? "Complète tes informations pour être mieux recommandé aux autres membres."
                        : "Ton profil est complet. Continue de partager avec le réseau !"}
                    </p>
                  </div>
                  <Progress value={completeness} className="h-2 w-full sm:w-1/2" aria-label="Complétude du profil" />
                </div>
                {completeness < 100 ? (
                  <Button asChild className="rounded-full bg-primary font-semibold hover:bg-primary/90">
                    <Link href="/espace/parametres">
                      <PencilLine className="h-4 w-4" /> Compléter mon profil
                    </Link>
                  </Button>
                ) : (
                  <p className="inline-flex items-center gap-2 rounded-full bg-[#F07819]/10 px-4 py-2 text-sm font-semibold text-[#B45309] dark:text-[#FFB25C]">
                    <CheckCircle2 className="h-4 w-4" /> Profil complet
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Tes publications récentes */}
          <section aria-labelledby="posts-card-title" className="rounded-2xl border bg-card p-6">
            <div id="posts-card-title">
              <SectionHeader title="Tes publications récentes" href="/espace/fil" />
            </div>
            <div className="mt-4 space-y-4">
              {posts === null ? (
                <>
                  <Skeleton className="h-28 w-full rounded-2xl" />
                  <Skeleton className="h-28 w-full rounded-2xl" />
                </>
              ) : posts.length === 0 ? (
                <EmptyBlock
                  icon={Newspaper}
                  text="Tu n'as pas encore partagé d'expérience. C'est le meilleur moment pour commencer."
                  action={
                    <Button asChild size="sm" className="rounded-full font-semibold">
                      <Link href="/espace/fil">
                        <PencilLine className="h-4 w-4" /> Publier maintenant
                      </Link>
                    </Button>
                  }
                />
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} currentUser={user} onUpdate={updatePost} onDelete={deletePost} />
                ))
              )}
            </div>
          </section>

          {/* Activité récente */}
          <section aria-labelledby="activity-card-title" className="rounded-2xl border bg-card p-6">
            <div id="activity-card-title">
              <SectionHeader title="Activité récente" href="/espace/notifications" />
            </div>
            <div className="mt-4">
              {notifications === null ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <EmptyBlock
                  icon={Bell}
                  text="Aucune activité pour le moment. Les interactions avec le réseau apparaîtront ici."
                />
              ) : (
                <ul className="space-y-1">
                  {notifications.map((n) => {
                    const content = (
                      <>
                        <NotifIcon type={n.type} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{n.title}</span>
                          <span className="block text-xs text-muted-foreground">{timeAgo(n.createdAt)}</span>
                        </span>
                        {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-[#F07819]" aria-label="Non lue" />}
                      </>
                    );
                    return (
                      <li key={n.id}>
                        {n.linkUrl ? (
                          <Link
                            href={n.linkUrl}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-secondary"
                          >
                            {content}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">{content}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Personnes recommandées */}
          <section aria-labelledby="meet-card-title" className="rounded-2xl border bg-card p-6">
            <div id="meet-card-title">
              <SectionHeader title="Des personnes que tu devrais rencontrer" href="/espace/decouvrir" />
            </div>
            <div className="mt-4 space-y-3">
              {recommended === null ? (
                <>
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </>
              ) : recommended.length === 0 ? (
                <EmptyBlock
                  icon={Compass}
                  text="Ajoute ton pays et ton domaine à ton profil pour recevoir des recommandations."
                  action={
                    <Button asChild variant="outline" size="sm" className="rounded-full font-semibold">
                      <Link href="/espace/parametres">Aller aux paramètres</Link>
                    </Button>
                  }
                />
              ) : (
                recommended.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F07819]/40 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={m.avatarUrl} firstName={m.firstName} lastName={m.lastName} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                          {m.firstName} {m.lastName}
                          {m.isDemo && (
                            <Badge variant="outline" className="h-4 px-1 text-[9px] uppercase text-muted-foreground">
                              Démo
                            </Badge>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{m.profession ?? "Membre OCD"}</p>
                        {m.country && (
                          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {m.country}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full rounded-full font-semibold"
                    >
                      <Link href={`/espace/membres/${m.id}`}>Voir le profil</Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Groupes à découvrir */}
          <section aria-labelledby="groups-card-title" className="rounded-2xl border bg-card p-6">
            <div id="groups-card-title">
              <SectionHeader title="Groupes à découvrir" href="/espace/groupes" />
            </div>
            <div className="mt-4">
              {groups === null ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : groups.length === 0 ? (
                <EmptyBlock icon={UsersRound} text="Aucun groupe disponible pour le moment." />
              ) : (
                <ul className="space-y-1">
                  {groups.map((g) => (
                    <li key={g.id}>
                      <Link
                        href={`/espace/groupes/${g.id}`}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-secondary"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F07819]/10">
                          <UsersRound className="h-4 w-4 text-[#F07819]" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-semibold">{g.name}</span>
                            {g.isDemo && (
                              <Badge variant="outline" className="h-4 px-1 text-[9px] uppercase text-muted-foreground">
                                Démo
                              </Badge>
                            )}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {GROUP_LABELS[g.category] ?? g.category} · {g._count.members} membre
                            {g._count.members > 1 ? "s" : ""}
                          </span>
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Événements à venir */}
          <section aria-labelledby="events-card-title" className="rounded-2xl border bg-card p-6">
            <div id="events-card-title">
              <SectionHeader title="Événements à venir" href="/espace/evenements" />
            </div>
            <div className="mt-4 space-y-3">
              {events === null ? (
                <>
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </>
              ) : events.length === 0 ? (
                <EmptyBlock icon={CalendarDays} text="Aucun événement à venir. Reviens bientôt !" />
              ) : (
                events.map((ev) => (
                  <Link
                    key={ev.id}
                    href="/espace/evenements"
                    className="block rounded-xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F07819]/40 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#F07819]">
                        {formatDateTime(ev.startDate)}
                      </p>
                      {ev.isDemo && (
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase text-muted-foreground">
                          Exemple
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold">{ev.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      {ev.isOnline ? (
                        <>
                          <Video className="h-3 w-3" /> En ligne
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3 w-3" /> {ev.location ?? "Lieu à préciser"}
                        </>
                      )}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {loading && (
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground" role="status">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Chargement de ton espace...
        </p>
      )}
    </div>
  );
}
