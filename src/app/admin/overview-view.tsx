"use client";

import Link from "next/link";
import {
  Users,
  Newspaper,
  UsersRound,
  CalendarDays,
  Award,
  Images,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Avatar } from "@/components/community/avatar";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/client";

type Stats = {
  members: number;
  newMembers: number;
  posts: number;
  groups: number;
  events: number;
  achievements: number;
  gallery: number;
  pendingReports: number;
};

type RecentUser = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  profession: string | null;
  country: string | null;
  isDemo: boolean;
  createdAt: string;
};

const CARDS: { key: keyof Stats; label: string; icon: typeof Users; href: string; accent?: boolean }[] = [
  { key: "members", label: "Membres inscrits", icon: Users, href: "/admin/membres" },
  { key: "newMembers", label: "Nouvelles inscriptions (7 jours)", icon: TrendingUp, href: "/admin/membres" },
  { key: "posts", label: "Publications", icon: Newspaper, href: "/admin" },
  { key: "groups", label: "Groupes", icon: UsersRound, href: "/admin" },
  { key: "events", label: "Événements", icon: CalendarDays, href: "/admin/evenements" },
  { key: "achievements", label: "Réalisations publiées", icon: Award, href: "/admin/realisations" },
  { key: "gallery", label: "Médias galerie publiés", icon: Images, href: "/admin/galerie" },
  { key: "pendingReports", label: "Signalements en attente", icon: AlertTriangle, href: "/admin/membres" },
];

export function AdminOverviewView({ stats, recentUsers, adminName }: { stats: Stats; recentUsers: RecentUser[]; adminName: string }) {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="ocd-kicker mb-2">Administration OCD</p>
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
          Bonjour {adminName}. Voici l&apos;état réel de la plateforme.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Ces statistiques reflètent uniquement les données réelles de la base. Les contenus
          institutionnels (Bovann, réalisations, galerie) sont administrables depuis les sections
          dédiées.
        </p>
      </div>

      {/* Statistiques réelles */}
      <section aria-labelledby="stats-titre" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <h2 id="stats-titre" className="sr-only">Statistiques de la plateforme</h2>
        {CARDS.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="group rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F07819]/40 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#F07819]/10 text-[#F07819]">
                <card.icon className="h-4.5 w-4.5" />
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="font-display mt-3 text-2xl font-extrabold">{stats[card.key]}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </Link>
        ))}
      </section>

      {/* Derniers membres */}
      <section aria-labelledby="recent-titre" className="rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b p-5">
          <h2 id="recent-titre" className="font-display text-base font-bold">Derniers membres inscrits</h2>
          <Link href="/admin/membres" className="text-sm font-semibold text-[#F07819] hover:underline">
            Gérer les membres
          </Link>
        </div>
        {recentUsers.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Aucun membre inscrit pour le moment.</p>
        ) : (
          <ul className="divide-y">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center gap-3 p-4">
                <Avatar src={u.avatarUrl} firstName={u.firstName} lastName={u.lastName} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{u.firstName} {u.lastName}</p>
                    {u.isDemo && (
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase text-muted-foreground">
                        Démo
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.profession ?? "Profession non renseignée"}
                    {u.country ? ` · ${u.country}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(u.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="rounded-xl border border-dashed p-4 text-xs leading-relaxed text-muted-foreground">
        Rappel éditorial : ne jamais publier de chiffres, témoignages ou réalisations non
        documentés. Les indicateurs ci-dessus sont calculés directement depuis la base de données.
      </p>
    </div>
  );
}
