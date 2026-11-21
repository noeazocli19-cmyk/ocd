"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Compass,
  Users,
  UsersRound,
  MessageCircle,
  CalendarDays,
  Bell,
  UserRound,
  Settings,
  ShieldCheck,
  LogOut,
  Home,
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { OcdLogo } from "@/components/ocd-logo";
import { Avatar } from "@/components/community/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@/components/app/user-provider";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAV = [
  { href: "/espace", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/espace/fil", label: "Fil d'actualité", icon: Newspaper },
  { href: "/espace/decouvrir", label: "Découvrir", icon: Compass },
  { href: "/espace/membres", label: "Membres", icon: Users },
  { href: "/espace/groupes", label: "Groupes", icon: UsersRound },
  { href: "/espace/messages", label: "Messages", icon: MessageCircle },
  { href: "/espace/evenements", label: "Événements", icon: CalendarDays },
  { href: "/espace/notifications", label: "Notifications", icon: Bell, badge: "notifications" as const },
  { href: "/espace/profil", label: "Mon profil", icon: UserRound },
  { href: "/espace/parametres", label: "Paramètres", icon: Settings },
];

const MOBILE_MAIN = [
  { href: "/espace", label: "Accueil", icon: LayoutDashboard },
  { href: "/espace/fil", label: "Fil", icon: Newspaper },
  { href: "/espace/messages", label: "Messages", icon: MessageCircle, badge: "messages" as const },
  { href: "/espace/notifications", label: "Alertes", icon: Bell, badge: "notifications" as const },
];

function useBadges() {
  const [notifications, setNotifications] = useState(0);
  const [messages, setMessages] = useState(0);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const notif = await api.get<{ unreadCount: number }>("/api/notifications");
        if (!alive) return;
        setNotifications(notif.unreadCount);
        const convs = await api.get<{ items: { unread: boolean }[] }>("/api/conversations");
        if (!alive) return;
        setMessages(convs.items.filter((c) => c.unread).length);
      } catch {
        // silencieux
      }
    }
    load();
    const id = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return { notifications, messages };
}

export function EspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, refresh } = useUser();
  const { resolvedTheme, setTheme } = useTheme();
  const { notifications, messages } = useBadges();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadPending, setUnreadPending] = useState(0);

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  useEffect(() => {
    api
      .get<{ pendingIncoming: unknown[] }>("/api/connections")
      .then((d) => setUnreadPending(d.pendingIncoming.length))
      .catch(() => {});
  }, [pathname]);

  async function logout() {
    try {
      await api.post("/api/auth/logout");
      toast.success("À bientôt sur OCD !");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Déconnexion impossible");
    }
  }

  const isActive = (href: string) =>
    href === "/espace" ? pathname === "/espace" : pathname.startsWith(href);

  const navItem = (item: (typeof NAV)[number]) => {
    const count =
      item.badge === "notifications" ? notifications : item.badge === "messages" ? messages : 0;
    const showCount = item.badge && count > 0;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          isActive(item.href)
            ? "bg-[#F07819]/10 text-[#B45309] dark:text-[#FFB25C]"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <item.icon
          className={cn("h-4.5 w-4.5 shrink-0", isActive(item.href) && "text-[#F07819]")}
        />
        <span className="truncate">{item.label}</span>
        {showCount && (
          <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F07819] px-1.5 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
        {isActive(item.href) && (
          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#F07819]" />
        )}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b px-5">
          <Link href="/" aria-label="Retour au site public OCD" className="inline-flex">
            <OcdLogo className="h-6" />
          </Link>
          <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Espace membre
          </span>
        </div>
        <nav aria-label="Navigation espace membre" className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map(navItem)}
          {unreadPending > 0 && (
            <Link
              href="/espace/notifications"
              className="mt-2 flex items-center gap-2 rounded-xl border border-[#F07819]/30 bg-[#F07819]/5 px-3 py-2.5 text-xs font-semibold text-[#B45309] dark:text-[#FFB25C]"
            >
              <Bell className="h-4 w-4" />
              {unreadPending} demande{unreadPending > 1 ? "s" : ""} de connexion
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-[#F07819]/10 text-[#B45309] dark:text-[#FFB25C]"
                  : "text-[#F07819] hover:bg-secondary"
              )}
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              Administration
            </Link>
          )}
        </nav>
        <div className="border-t p-3">
          <Link
            href="/espace/profil"
            className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-secondary"
          >
            <Avatar src={user.avatarUrl} firstName={user.firstName} lastName={user.lastName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.profession ?? "Complète ton profil"}</p>
            </div>
          </Link>
          <div className="mt-1 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Changer de thème"
            >
              <Sun className="h-4 w-4 dark:hidden" />
              <Moon className="hidden h-4 w-4 dark:block" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 flex-1 justify-start rounded-full text-xs text-muted-foreground" asChild>
              <Link href="/">
                <Home className="h-3.5 w-3.5" /> Site public
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground"
              onClick={logout}
              aria-label="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Contenu */}
      <div className="flex min-h-screen w-full flex-col lg:pl-64">
        {/* Topbar mobile */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/85 px-4 backdrop-blur lg:hidden">
          <Link href="/" aria-label="OCD">
            <OcdLogo className="h-6" />
          </Link>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              asChild
              aria-label="Notifications"
            >
              <Link href="/espace/notifications">
                <Bell className="h-4.5 w-4.5" />
                {notifications > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#F07819]" />
                )}
              </Link>
            </Button>
            <Avatar src={user.avatarUrl} firstName={user.firstName} lastName={user.lastName} size="sm" />
          </div>
        </header>

        <main className="flex-1 pb-20 lg:pb-8">{children}</main>

        {/* Bottom nav mobile */}
        <nav
          aria-label="Navigation mobile"
          className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        >
          <div className="mx-auto grid max-w-lg grid-cols-5">
            {MOBILE_MAIN.map((item) => {
              const count = item.badge === "messages" ? messages : item.badge === "notifications" ? notifications : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                    isActive(item.href) ? "text-[#F07819]" : "text-muted-foreground"
                  )}
                >
                  <span className="relative">
                    <item.icon className="h-5 w-5" />
                    {count > 0 && (
                      <span className="absolute -right-2 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F07819] px-1 text-[9px] font-bold text-white">
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </span>
                  {item.label}
                </Link>
              );
            })}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium text-muted-foreground"
                  aria-label="Plus de sections"
                >
                  <Menu className="h-5 w-5" />
                  Plus
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle className="text-left">Toutes les sections</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-2 gap-2 pb-6">
                  {NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        setMenuOpen(false);
                        refresh();
                      }}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl border px-3 py-3 text-sm font-medium",
                        isActive(item.href) ? "border-[#F07819]/40 bg-[#F07819]/10" : "bg-card"
                      )}
                    >
                      <item.icon className="h-4.5 w-4.5 text-[#F07819]" />
                      {item.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2.5 rounded-xl border border-[#F07819]/40 bg-[#F07819]/10 px-3 py-3 text-sm font-semibold"
                    >
                      <ShieldCheck className="h-4.5 w-4.5 text-[#F07819]" />
                      Administration
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={logout}
                    className="col-span-2 mt-1 flex items-center justify-center gap-2 rounded-xl bg-destructive/10 px-3 py-3 text-sm font-semibold text-destructive"
                  >
                    <LogOut className="h-4 w-4" /> Se déconnecter
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </div>
  );
}
