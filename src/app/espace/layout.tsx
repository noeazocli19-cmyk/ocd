import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { UserProvider } from "@/components/app/user-provider";
import { EspaceShell } from "@/components/app/espace-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espace membre",
  robots: { index: false },
};

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/connexion?next=/espace");
  }

  return (
    <UserProvider initialUser={user}>
      <EspaceShell>{children}</EspaceShell>
    </UserProvider>
  );
}
