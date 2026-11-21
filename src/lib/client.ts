/** Petit client fetch typé pour l'app. */

async function handle<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      json && typeof json === "object" && "error" in json
        ? String((json as { error: unknown }).error)
        : `Erreur ${res.status}`;
    throw new Error(message);
  }
  return json as T;
}

export const api = {
  get<T>(url: string): Promise<T> {
    return fetch(url, { credentials: "same-origin" }).then((r) => handle<T>(r));
  },
  post<T>(url: string, body?: unknown): Promise<T> {
    return fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    }).then((r) => handle<T>(r));
  },
  patch<T>(url: string, body?: unknown): Promise<T> {
    return fetch(url, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    }).then((r) => handle<T>(r));
  },
  delete<T>(url: string): Promise<T> {
    return fetch(url, { method: "DELETE", credentials: "same-origin" }).then((r) => handle<T>(r));
  },
  upload<T>(url: string, formData: FormData): Promise<T> {
    return fetch(url, { method: "POST", credentials: "same-origin", body: formData }).then((r) =>
      handle<T>(r)
    );
  },
};

/** Date relative en français. */
export function timeAgo(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

/** Date longue en français. */
export function formatDateLong(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const POST_CATEGORIES = [
  "ENTREPRENARIAT",
  "BUSINESS",
  "TECHNOLOGIE",
  "MOTIVATION",
  "EDUCATION",
  "CREATION_CONTENU",
  "PROJETS",
  "EXPERIENCES",
] as const;

export const POST_CATEGORY_LABELS: Record<string, string> = {
  ENTREPRENARIAT: "Entrepreneuriat",
  BUSINESS: "Business",
  TECHNOLOGIE: "Technologie",
  MOTIVATION: "Motivation",
  EDUCATION: "Éducation",
  CREATION_CONTENU: "Création de contenu",
  PROJETS: "Projets",
  EXPERIENCES: "Expériences",
};

export const EVENT_LABELS: Record<string, string> = {
  CONFERENCE: "Conférence",
  RENCONTRE: "Rencontre",
  MASTERCLASS: "Masterclass",
  ATELIER: "Atelier",
  LIVE: "Live",
  CHALLENGE: "Challenge",
  ENTREPRENARIAT: "Entrepreneuriat",
};

export const GROUP_LABELS: Record<string, string> = {
  ENTREPRENARIAT: "Entrepreneuriat",
  TECHNOLOGIE: "Technologie",
  INTELLIGENCE_ARTIFICIELLE: "Intelligence artificielle",
  BUSINESS: "Business",
  MARKETING: "Marketing",
  FINANCE: "Finance",
  CREATION_CONTENU: "Création de contenu",
  DEVELOPPEMENT_PERSONNEL: "Développement personnel",
  LEADERSHIP: "Leadership",
};

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function initialsOf(firstName: string, lastName: string): string {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}
