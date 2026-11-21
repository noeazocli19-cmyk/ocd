import { redirect } from "next/navigation";
import { getSessionUser, isAdminRole } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration OCD",
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/connexion?next=/admin");
  if (!isAdminRole(user.role)) redirect("/espace");

  return (
    <AdminShell
      user={{ firstName: user.firstName, lastName: user.lastName, role: user.role, avatarUrl: user.avatarUrl }}
    >
      {children}
    </AdminShell>
  );
}
