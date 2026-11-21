"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Loader2,
  Megaphone,
  MessageCircle,
  MessageSquare,
  ThumbsUp,
  UserPlus,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, timeAgo } from "@/lib/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
};

const TYPE_ICONS: Record<string, LucideIcon> = {
  CONNECTION_REQUEST: UserPlus,
  MESSAGE: MessageCircle,
  REACTION: ThumbsUp,
  COMMENT: MessageSquare,
  GROUP_INVITE: UsersRound,
  ANNOUNCEMENT: Megaphone,
  EVENT_UPDATE: CalendarDays,
};

export function NotificationsView() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("all");
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ items: NotificationItem[]; unreadCount: number }>("/api/notifications")
      .then((d) => {
        if (!cancelled) {
          setItems(d.items);
          setUnreadCount(d.unreadCount);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Impossible de charger les notifications");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await api.post("/api/notifications", { all: true });
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("Toutes tes notifications sont lues");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action impossible");
    } finally {
      setMarkingAll(false);
    }
  }

  async function openNotification(n: NotificationItem) {
    if (!n.isRead) {
      setItems((prev) => prev.map((it) => (it.id === n.id ? { ...it, isRead: true } : it)));
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await api.post("/api/notifications", { ids: [n.id] });
      } catch {
        // silencieux : la pastille locale est déjà mise à jour
      }
    }
    if (n.linkUrl) router.push(n.linkUrl);
  }

  const visible = tab === "unread" ? items.filter((n) => !n.isRead) : items;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      {/* En-tête */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="ocd-kicker text-xs font-semibold">Communauté</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0
              ? `Tu as ${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}.`
              : "Tu es à jour, aucune notification non lue."}
          </p>
        </div>
        <Button
          variant="outline"
          className="shrink-0 rounded-full"
          onClick={() => void markAllRead()}
          disabled={markingAll || unreadCount === 0}
        >
          {markingAll && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Tout marquer comme lu
        </Button>
      </header>

      {/* Onglets */}
      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="rounded-full">
          <TabsTrigger value="all" className="rounded-full px-4">Toutes</TabsTrigger>
          <TabsTrigger value="unread" className="rounded-full px-4">
            Non lues
            {unreadCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F07819] px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Liste */}
      {loading ? (
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl border bg-card p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F07819]/10">
            <Bell className="h-7 w-7 text-[#F07819]" aria-hidden="true" />
          </span>
          <p className="mt-4 font-display text-lg font-semibold">
            {tab === "unread"
              ? "Aucune notification non lue."
              : "Aucune notification pour le moment. Les interactions de la communauté apparaîtront ici."}
          </p>
        </div>
      ) : (
        <ul className="mt-5 divide-y overflow-hidden rounded-2xl border bg-card shadow-sm">
          {visible.map((n) => {
            const Icon = TYPE_ICONS[n.type] ?? Bell;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => void openNotification(n)}
                  className={cn(
                    "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-secondary/60",
                    !n.isRead && "bg-[#F07819]/5"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      n.isRead ? "bg-secondary text-muted-foreground" : "bg-[#F07819]/15 text-[#F07819]"
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm", n.isRead ? "font-medium" : "font-bold")}>{n.title}</p>
                      {!n.isRead && (
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#F07819]"
                          aria-label="Non lue"
                        />
                      )}
                    </div>
                    {n.body && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                    )}
                    <p className="mt-1.5 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
