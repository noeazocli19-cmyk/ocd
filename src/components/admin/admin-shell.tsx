"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  Award,
  Images,
  CalendarDays,
  Users,
  Megaphone,
  LogOut,
  Home,
  ExternalLink,
} from "lucide-react";
import { OcdLogo } from "@/components/ocd-logo";
import { Avatar } from "@/components/community/avatar";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ADMIN_NAV = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: "/admin/contenus", label: "Contenus & Bovann", icon: PenSquare },
  { href: "/admin/realisations", label: "Réalisations", icon: Award },
  { href: "/admin/galerie", label: "Galerie", icon: Images },
  { href: "/admin/evenements", label: "Événements", icon: CalendarDays },
  { href: "/admin/membres", label: "Membres", icon: Users },
  { href: "/admin/annonces", label: "Annonces", icon: Megaphone },
];

export function AdminShell({
  user,
  children,
}: {
  user: { firstName: string; lastName: string; role: string; avatarUrl: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await api.post("/api/auth/logout");
      toast.success("Déconnexion réussie");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Déconnexion impossible");
    }
  }

  const isActive = (item: (typeof ADMIN_NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-ocd-dark text-white lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <OcdLogo className="h-6" />
          <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/60">
            Admin
          </span>
        </div>
        <nav aria-label="Navigation administration" className="flex-1 space-y-1 p-3">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item)
                  ? "bg-[#F07819] text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar src={user.avatarUrl} firstName={user.firstName} lastName={user.lastName} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.firstName} {user.lastName}</p>
              <p className="text-[11px] uppercase tracking-wide text-white/40">{user.role}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button asChild variant="ghost" size="sm" className="h-8 flex-1 justify-start rounded-full text-xs text-white/60 hover:text-white">
              <Link href="/"><Home className="h-3.5 w-3.5" /> Site public</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="h-8 flex-1 justify-start rounded-full text-xs text-white/60 hover:text-white">
              <Link href="/espace"><ExternalLink className="h-3.5 w-3.5" /> Espace</Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full text-white/60 hover:text-white" onClick={logout} aria-label="Se déconnecter">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Contenu */}
      <div className="flex min-h-screen w-full flex-col lg:pl-60">
        {/* Topbar mobile */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 overflow-x-auto border-b bg-background px-4 lg:hidden">
          <OcdLogo className="h-5 shrink-0" />
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold",
                isActive(item) ? "bg-[#F07819] text-white" : "bg-secondary text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
