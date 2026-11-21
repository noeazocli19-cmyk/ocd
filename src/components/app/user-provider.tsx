"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client";

export type EspaceUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
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
  whatsapp: string | null;
  onboardingCompleted: boolean;
};

type UserContextValue = {
  user: EspaceUser;
  refresh: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ initialUser, children }: { initialUser: EspaceUser; children: React.ReactNode }) {
  const [user, setUser] = useState<EspaceUser>(initialUser);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<{ user: EspaceUser | null }>("/api/auth/me");
      if (res.user) setUser(res.user);
    } catch {
      // silencieux : conserve l'utilisateur courant
    }
  }, []);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const value = useMemo(() => ({ user, refresh }), [user, refresh]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser doit être utilisé dans UserProvider");
  return ctx;
}
