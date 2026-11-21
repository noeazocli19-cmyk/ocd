"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  Fingerprint,
  Globe,
  GraduationCap,
  Instagram,
  Linkedin,
  Loader2,
  MapPin,
  MessageCircle,
  Newspaper,
  Twitter,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  UsersRound,
} from "lucide-react";
import { Avatar } from "@/components/community/avatar";
import { PostCard, type FeedPost } from "@/components/community/post-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/components/app/user-provider";
import { api, formatDateLong, parseJsonArray } from "@/lib/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* --------------------------------- types ---------------------------------- */

type MemberDetail = {
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
  website: string | null;
  linkedin: string | null;
  twitter: string | null;
  instagram: string | null;
  isDemo: boolean;
  createdAt: string;
  skills: { id: string; name: string }[];
  experiences: {
    id: string;
    title: string;
    company: string | null;
    description: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
  }[];
  projects: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    imageUrl: string | null;
    link: string | null;
    createdAt: string;
  }[];
  _count: { posts: number; followsSent: number; followsReceived: number; groupMemberships: number };
};

type MemberResponse = {
  member: MemberDetail;
  posts: FeedPost[];
  relation: {
    connection: { id: string; status: string; senderId: string } | null;
    iFollow: boolean;
    followsMe: boolean;
  };
};

/* ------------------------------- constantes ------------------------------- */

const EXPERIENCE_LABELS: Record<string, string> = {
  ETUDIANT: "Étudiant",
  DEBUTANT: "Débutant",
  INTERMEDIAIRE: "Intermédiaire",
  CONFIRME: "Confirmé",
  EXPERT: "Expert",
};

const PROJECT_STATUS: Record<string, { label: string; className: string }> = {
  IDEA: { label: "Idée", className: "border text-muted-foreground" },
  IN_PROGRESS: { label: "En cours", className: "border border-[#F07819]/40 bg-[#F07819]/10 text-[#B45309] dark:text-[#FFB25C]" },
  LAUNCHED: { label: "Lancé", className: "bg-[#F07819] text-white" },
};

function monthYear(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function periodOf(exp: MemberDetail["experiences"][number]): string {
  const start = monthYear(exp.startDate);
  const end = exp.isCurrent ? "Aujourd'hui" : monthYear(exp.endDate);
  if (start && end) return `${start} — ${end}`;
  return start || end || "Période non précisée";
}

function normalizeUrl(url: string | null): string | null {
  if (!url || !url.trim()) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/* ---------------------------------- vue ----------------------------------- */

export function ProfilView({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useUser();

  const [data, setData] = useState<MemberResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"connect" | "follow" | "message" | null>(null);

  useEffect(() => {
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      setData(null);
      setError(null);
      api
        .get<MemberResponse>(`/api/members/${id}`)
        .then((res) => {
          if (cancelled) return;
          setData(res);
        })
        .catch((e) => {
          if (cancelled) return;
          setError(e instanceof Error ? e.message : "Impossible de charger ce profil.");
        });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [id]);

  const member = data?.member ?? null;
  const relation = data?.relation ?? null;

  function updatePost(updated: FeedPost) {
    setData((prev) =>
      prev ? { ...prev, posts: prev.posts.map((p) => (p.id === updated.id ? updated : p)) } : prev
    );
  }
  function deletePost(postId: string) {
    setData((prev) => (prev ? { ...prev, posts: prev.posts.filter((p) => p.id !== postId) } : prev));
  }

  function connect() {
    if (!member || busy) return;
    setBusy("connect");
    api
      .post<{ status: string }>(`/api/members/${member.id}/connections`)
      .then((res) => {
        setBusy(null);
        if (res.status === "PENDING") {
          setData((prev) =>
            prev && prev.relation
              ? { ...prev, relation: { ...prev.relation, connection: { id: "pending", status: "PENDING", senderId: user.id } } }
              : prev
          );
          toast.success(`Demande envoyée à ${member.firstName}.`);
        } else if (res.status === "ACCEPTED") {
          setData((prev) =>
            prev && prev.relation
              ? { ...prev, relation: { ...prev.relation, connection: { id: "accepted", status: "ACCEPTED", senderId: user.id } } }
              : prev
          );
          toast.info("Vous êtes déjà connectés.");
        } else {
          setData((prev) =>
            prev && prev.relation ? { ...prev, relation: { ...prev.relation, connection: null } } : prev
          );
          toast.info("Demande annulée.");
        }
      })
      .catch((e) => {
        setBusy(null);
        toast.error(e instanceof Error ? e.message : "Action impossible pour le moment.");
      });
  }

  function toggleFollow() {
    if (!member || busy) return;
    setBusy("follow");
    api
      .post<{ following: boolean }>(`/api/members/${member.id}/follow`)
      .then((res) => {
        setBusy(null);
        setData((prev) =>
          prev && prev.relation ? { ...prev, relation: { ...prev.relation, iFollow: res.following } } : prev
        );
        toast.success(
          res.following
            ? `Tu suis maintenant ${member.firstName}.`
            : `Tu ne suis plus ${member.firstName}.`
        );
      })
      .catch((e) => {
        setBusy(null);
        toast.error(e instanceof Error ? e.message : "Action impossible pour le moment.");
      });
  }

  function sendMessage() {
    if (!member || busy) return;
    setBusy("message");
    api
      .post<{ id: string }>("/api/conversations", { userId: member.id })
      .then((res) => {
        setBusy(null);
        router.push(`/espace/messages?c=${res.id}`);
      })
      .catch((e) => {
        setBusy(null);
        toast.error(e instanceof Error ? e.message : "Message impossible pour le moment.");
      });
  }

  /* ------------------------------ état 404 ------------------------------ */
  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F07819]/10">
          <UserX className="h-7 w-7 text-[#F07819]" />
        </span>
        <h1 className="font-display text-2xl font-extrabold">Membre introuvable</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error === "Membre introuvable."
            ? "Ce profil n'existe plus ou l'adresse est incorrecte."
            : error}
        </p>
        <Button asChild className="rounded-full bg-primary font-semibold hover:bg-primary/90">
          <Link href="/espace/membres">
            <ArrowLeft className="h-4 w-4" /> Retour aux membres
          </Link>
        </Button>
      </div>
    );
  }

  /* ---------------------------- chargement ------------------------------ */
  if (!member || !relation) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-10" aria-busy="true" aria-label="Chargement du profil">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="mt-4 flex items-end gap-4 px-2">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-2 pb-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="mt-6 h-16 w-full rounded-2xl" />
        <Skeleton className="mt-6 h-10 w-full rounded-full" />
        <Skeleton className="mt-6 h-48 w-full rounded-2xl" />
      </div>
    );
  }

  /* ------------------------------- rendu -------------------------------- */
  const isSelf = member.id === user.id;
  const conn = relation.connection;
  const connState = !conn ? "NONE" : conn.status === "ACCEPTED" ? "ACCEPTED" : conn.senderId === user.id ? "SENT" : "RECEIVED";
  const place = [member.city, member.country].filter(Boolean).join(", ");
  const interests = parseJsonArray(member.interests);
  const skills = member.skills ?? [];
  const experiences = member.experiences ?? [];
  const projects = member.projects ?? [];
  const socials = [
    { key: "site", label: "Site web", url: normalizeUrl(member.website), icon: Globe },
    { key: "linkedin", label: "LinkedIn", url: normalizeUrl(member.linkedin), icon: Linkedin },
    { key: "twitter", label: "Twitter / X", url: normalizeUrl(member.twitter), icon: Twitter },
    { key: "instagram", label: "Instagram", url: normalizeUrl(member.instagram), icon: Instagram },
  ].filter((s) => Boolean(s.url));

  const stats = [
    { label: "Publications", value: member._count.posts, icon: Newspaper },
    { label: "Abonnements", value: member._count.followsSent, icon: Users },
    { label: "Abonnés", value: member._count.followsReceived, icon: UserCheck },
    { label: "Groupes", value: member._count.groupMemberships, icon: UsersRound },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2 rounded-full font-semibold text-muted-foreground"
      >
        <Link href="/espace/membres">
          <ArrowLeft className="h-4 w-4" /> Retour aux membres
        </Link>
      </Button>

      {/* Bandeau */}
      <div className="relative h-40 overflow-hidden rounded-2xl border bg-[#171717]">
        <div className="bg-grid-ocd absolute inset-0" aria-hidden="true" />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ background: "radial-gradient(60% 120% at 50% 0%, rgba(240,120,25,0.28) 0%, transparent 70%)" }}
        />
        {member.coverUrl && (
          <Image
            src={member.coverUrl}
            alt={`Couverture de ${member.firstName} ${member.lastName}`}
            fill
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* En-tête du profil */}
      <section aria-labelledby="member-name" className="px-1 sm:px-2">
        <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <Avatar
              src={member.avatarUrl}
              firstName={member.firstName}
              lastName={member.lastName}
              size="xl"
              ring
              className="border-2 border-card"
            />
            <div className="pb-1">
              <h1 id="member-name" className="flex flex-wrap items-center gap-2 font-display text-xl font-extrabold tracking-tight sm:text-2xl">
                {member.firstName} {member.lastName}
                {member.isDemo && (
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Démo
                  </Badge>
                )}
                {relation.followsMe && !isSelf && (
                  <Badge variant="secondary" className="h-5 rounded-full px-2 text-[10px] font-semibold">
                    Te suit
                  </Badge>
                )}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">{member.profession ?? "Membre OCD"}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          {place && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#F07819]" /> {place}
            </span>
          )}
          {member.experienceLevel && (
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
              <GraduationCap className="h-3.5 w-3.5 text-[#F07819]" />
              {EXPERIENCE_LABELS[member.experienceLevel] ?? member.experienceLevel}
            </Badge>
          )}
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5 text-[#F07819]" /> Membre depuis{" "}
            {formatDateLong(member.createdAt)}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {isSelf ? (
            <Button asChild variant="outline" className="rounded-full font-semibold">
              <Link href="/espace/profil">Modifier mon profil</Link>
            </Button>
          ) : (
            <>
              {connState === "RECEIVED" ? (
                <Button asChild variant="outline" className="rounded-full font-semibold">
                  <Link href="/espace/notifications">Répondre à la demande</Link>
                </Button>
              ) : (
                <Button
                  onClick={connect}
                  disabled={busy === "connect" || connState !== "NONE"}
                  variant={connState === "NONE" ? "default" : "outline"}
                  className="rounded-full font-semibold"
                >
                  {busy === "connect" && <Loader2 className="h-4 w-4 animate-spin" />}
                  {busy !== "connect" && connState === "NONE" && <UserPlus className="h-4 w-4" />}
                  {connState === "SENT" && <Check className="h-4 w-4" />}
                  {connState === "ACCEPTED" && <Check className="h-4 w-4" />}
                  {connState === "NONE"
                    ? "Se connecter"
                    : connState === "SENT"
                      ? "Demande envoyée"
                      : "Connectés"}
                </Button>
              )}
              <Button
                onClick={toggleFollow}
                disabled={busy === "follow"}
                variant={relation.iFollow ? "default" : "outline"}
                className={cn("rounded-full font-semibold", relation.iFollow && "bg-[#F07819] hover:bg-[#B45309]")}
                aria-pressed={relation.iFollow}
              >
                {busy === "follow" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : relation.iFollow ? (
                  <UserCheck className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {relation.iFollow ? "Abonné" : "Suivre"}
              </Button>
              <Button
                onClick={sendMessage}
                disabled={busy === "message"}
                variant="outline"
                className="rounded-full font-semibold"
              >
                {busy === "message" ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                Message
              </Button>
            </>
          )}
        </div>

        {/* Stats */}
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col rounded-2xl border bg-card p-4 text-center">
              <dt className="order-2 text-xs text-muted-foreground">{s.label}</dt>
              <dd className="order-1 mb-1 flex items-center justify-center gap-1.5 font-display text-xl font-extrabold text-[#F07819]">
                <s.icon className="h-4 w-4" aria-hidden="true" />
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Onglets */}
      <Tabs defaultValue="publications" className="mt-8">
        <TabsList className="h-auto w-full justify-start gap-1 rounded-full bg-secondary p-1 sm:w-auto">
          <TabsTrigger value="publications" className="rounded-full px-4">
            Publications
          </TabsTrigger>
          <TabsTrigger value="apropos" className="rounded-full px-4">
            À propos
          </TabsTrigger>
          <TabsTrigger value="reseaux" className="rounded-full px-4">
            Réseaux
          </TabsTrigger>
        </TabsList>

        {/* Publications */}
        <TabsContent value="publications" className="mt-4 space-y-4">
          {data && data.posts.length > 0 ? (
            data.posts.map((post) => (
              <PostCard key={post.id} post={post} currentUser={user} onUpdate={updatePost} onDelete={deletePost} />
            ))
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F07819]/10">
                <Newspaper className="h-6 w-6 text-[#F07819]" />
              </span>
              <p className="max-w-sm text-sm text-muted-foreground">
                {isSelf
                  ? "Tu n'as pas encore partagé d'expérience. C'est le meilleur moment pour commencer."
                  : "Aucune publication pour le moment."}
              </p>
              {isSelf && (
                <Button asChild size="sm" className="rounded-full font-semibold">
                  <Link href="/espace/fil">Publier maintenant</Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* À propos */}
        <TabsContent value="apropos" className="mt-4 space-y-6">
          <section aria-labelledby="bio-title" className="rounded-2xl border bg-card p-6">
            <h2 id="bio-title" className="font-display text-base font-bold">
              Bio
            </h2>
            {member.bio ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{member.bio}</p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Aucune bio renseignée pour le moment.</p>
            )}
          </section>

          {skills.length > 0 && (
            <section aria-labelledby="skills-title" className="rounded-2xl border bg-card p-6">
              <h2 id="skills-title" className="font-display text-base font-bold">
                Compétences
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <li key={s.id}>
                    <Badge variant="secondary" className="rounded-full px-3 py-1">
                      {s.name}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {interests.length > 0 && (
            <section aria-labelledby="interests-title" className="rounded-2xl border bg-card p-6">
              <h2 id="interests-title" className="font-display text-base font-bold">
                Centres d&apos;intérêt
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {interests.map((it) => (
                  <li key={it}>
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-muted-foreground">
                      {it}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {experiences.length > 0 && (
            <section aria-labelledby="exp-title" className="rounded-2xl border bg-card p-6">
              <h2 id="exp-title" className="font-display text-base font-bold">
                Expériences
              </h2>
              <ol className="relative ml-3 mt-4 space-y-6 border-l border-border">
                {experiences.map((exp) => (
                  <li key={exp.id} className="relative ml-6">
                    <span
                      className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-[#F07819] ring-4 ring-[#F07819]/15"
                      aria-hidden="true"
                    />
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-sm font-semibold">{exp.title}</p>
                      {exp.isCurrent && (
                        <Badge variant="secondary" className="h-5 rounded-full px-2 text-[10px] font-semibold">
                          Poste actuel
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" /> {exp.company ?? "Entreprise non précisée"} · {periodOf(exp)}
                    </p>
                    {exp.description && (
                      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                        {exp.description}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {projects.length > 0 && (
            <section aria-labelledby="projects-title" className="rounded-2xl border bg-card p-6">
              <h2 id="projects-title" className="font-display text-base font-bold">
                Projets
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {projects.map((p) => {
                  const status = PROJECT_STATUS[p.status] ?? {
                    label: p.status,
                    className: "border text-muted-foreground",
                  };
                  return (
                    <article key={p.id} className="rounded-xl border p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold">{p.title}</h3>
                        <Badge variant="outline" className={cn("h-5 shrink-0 rounded-full px-2 text-[10px] font-semibold", status.className)}>
                          {status.label}
                        </Badge>
                      </div>
                      {p.description && (
                        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-foreground/80">{p.description}</p>
                      )}
                      {p.link && (
                        <a
                          href={normalizeUrl(p.link) ?? p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#F07819] hover:underline"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" /> Voir le projet
                        </a>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {!member.bio && skills.length === 0 && interests.length === 0 && experiences.length === 0 && projects.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F07819]/10">
                <Fingerprint className="h-6 w-6 text-[#F07819]" />
              </span>
              <p className="max-w-sm text-sm text-muted-foreground">
                {isSelf
                  ? "Ton profil mérite d'être raconté. Ajoute ta bio, tes compétences et tes expériences."
                  : "Ce membre n'a pas encore complété son profil."}
              </p>
              {isSelf && (
                <Button asChild size="sm" className="rounded-full font-semibold">
                  <Link href="/espace/parametres">Compléter mon profil</Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Réseaux */}
        <TabsContent value="reseaux" className="mt-4">
          <section aria-labelledby="socials-title" className="rounded-2xl border bg-card p-6">
            <h2 id="socials-title" className="font-display text-base font-bold">
              Réseaux et liens
            </h2>
            {socials.length > 0 ? (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {socials.map((s) => (
                  <li key={s.key}>
                    <a
                      href={s.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F07819]/40 hover:shadow-md"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F07819]/10">
                        <s.icon className="h-4 w-4 text-[#F07819]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{s.label}</span>
                        <span className="block truncate text-xs text-muted-foreground">{s.url}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-8 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F07819]/10">
                  <Globe className="h-5 w-5 text-[#F07819]" />
                </span>
                <p className="text-sm text-muted-foreground">Réseaux non renseignés pour le moment.</p>
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
