import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { getSessionUser, type SessionUser } from "@/lib/auth";

export function ok<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function requireUser(): Promise<
  { user: SessionUser; response?: never } | { user?: never; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) return { response: fail("Authentification requise.", 401) };
  return { user };
}

export async function requireAdmin(): Promise<
  { user: SessionUser; response?: never } | { user?: never; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) return { response: fail("Authentification requise.", 401) };
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return { response: fail("Accès réservé à l'équipe OCD.", 403) };
  }
  return { user };
}

export async function parseBody<T>(request: Request, schema: ZodSchema<T>): Promise<
  { data: T; response?: never } | { data?: never; response: NextResponse }
> {
  try {
    const json = await request.json();
    const data = schema.parse(json);
    return { data };
  } catch (error) {
    if (error instanceof ZodError) {
      const first = error.issues[0];
      return {
        response: fail(first ? `${first.path.join(".")}: ${first.message}` : "Données invalides.", 422),
      };
    }
    return { response: fail("Corps de requête invalide.", 400) };
  }
}

// Types de partage pour les réponses API
export const publicUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  coverUrl: true,
  bio: true,
  country: true,
  city: true,
  profession: true,
  domain: true,
  experienceLevel: true,
  interests: true,
  website: true,
  linkedin: true,
  twitter: true,
  instagram: true,
  isDemo: true,
  createdAt: true,
} as const;
