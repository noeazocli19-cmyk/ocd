"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Compass, Loader2, MapPin, RotateCcw, Search, Settings, Users } from "lucide-react";
import { Avatar } from "@/components/community/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/components/app/user-provider";
import { api } from "@/lib/client";
import { toast } from "sonner";

/* ---------------------------------- types --------------------------------- */

type MemberCard = {
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
  isDemo: boolean;
  createdAt: string;
  _count: { posts: number };
};

type MembersResponse = { items: MemberCard[]; recommended: MemberCard[] };

const COUNTRIES = [
  "Bénin",
  "Sénégal",
  "Côte d'Ivoire",
  "Togo",
  "Nigeria",
  "Ghana",
  "Cameroun",
  "Mali",
  "Burkina Faso",
  "Guinée",
  "RD Congo",
  "Gabon",
  "Maroc",
  "Algérie",
  "Tunisie",
  "France",
  "Belgique",
  "Canada",
  "États-Unis",
];

const DOMAINS = [
  "Entrepreneuriat",
  "Business",
  "Technologie",
  "Marketing",
  "Finance",
  "Création de contenu",
  "Éducation",
  "Design",
  "Santé",
  "Agriculture",
  "Autre",
];

/* ------------------------------ carte membre ------------------------------ */

export function MemberCardTile({ member }: { member: MemberCard }) {
  const fullName = `${member.firstName} ${member.lastName}`;
  const place = [member.city, member.country].filter(Boolean).join(", ");

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-[#F07819]/40 hover:shadow-xl">
      <div className="relative h-20 shrink-0 bg-gradient-to-br from-[#F07819]/70 via-[#B45309]/60 to-[#7C2D12]/60">
        <div className="bg-grid-ocd absolute inset-0" aria-hidden="true" />
        {member.coverUrl && (
          <Image
            src={member.coverUrl}
            alt={`Couverture de ${fullName}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="-mt-7 flex items-end justify-between gap-2">
          <Avatar
            src={member.avatarUrl}
            firstName={member.firstName}
            lastName={member.lastName}
            size="lg"
            className="border-2 border-card"
          />
          {member.isDemo && (
            <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Démo
            </Badge>
          )}
        </div>
        <h3 className="mt-2 truncate text-sm font-bold">{fullName}</h3>
        <p className="truncate text-xs text-muted-foreground">{member.profession ?? "Membre OCD"}</p>
        {place && (
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" /> {place}
          </p>
        )}
        {member.bio && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground/80">{member.bio}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
          <span className="text-xs text-muted-foreground">
            {member._count.posts} publication{member._count.posts > 1 ? "s" : ""}
          </span>
          <Button asChild size="sm" className="rounded-full bg-primary font-semibold hover:bg-primary/90">
            <Link href={`/espace/membres/${member.id}`}>Voir le profil</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

/* ---------------------------------- vue ----------------------------------- */

export function DecouvrirView() {
  const { user } = useUser();

  const [q, setQ] = useState("");
  const [country, setCountry] = useState("all");
  const [profession, setProfession] = useState("");
  const [domain, setDomain] = useState("all");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<MemberCard[] | null>(null);
  const [recommended, setRecommended] = useState<MemberCard[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get<MembersResponse>("/api/members?limit=24"),
      api.get<MembersResponse>("/api/members?recommended=1&limit=6"),
    ])
      .then(([res, rec]) => {
        if (cancelled) return;
        setResults(res.items);
        setRecommended(rec.recommended.slice(0, 6));
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setLoading(false);
        setResults([]);
        setRecommended([]);
        toast.error(e instanceof Error ? e.message : "Impossible de charger les membres.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function runSearch(next: { q: string; country: string; profession: string; domain: string }) {
    setSubmitting(true);
    const search = new URLSearchParams({ limit: "24" });
    if (next.q.trim()) search.set("q", next.q.trim());
    if (next.country !== "all") search.set("country", next.country);
    if (next.profession.trim()) search.set("profession", next.profession.trim());
    if (next.domain !== "all") search.set("domain", next.domain);

    api
      .get<MembersResponse>(`/api/members?${search.toString()}`)
      .then((res) => {
        setResults(res.items);
        setSubmitting(false);
      })
      .catch((e) => {
        setSubmitting(false);
        toast.error(e instanceof Error ? e.message : "Recherche impossible pour le moment.");
      });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    runSearch({ q, country, profession, domain });
  }

  function handleReset() {
    const next = { q: "", country: "all", profession: "", domain: "all" };
    setQ(next.q);
    setCountry(next.country);
    setProfession(next.profession);
    setDomain(next.domain);
    runSearch(next);
  }

  const recommendedEmpty =
    !loading && recommended.length === 0 && (!user.country || !user.domain);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-8">
        <p className="ocd-kicker text-xs font-bold">Explorer</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          Découvrir les membres
        </h1>
        <p className="mt-1 text-muted-foreground">
          Trouve des personnes selon leurs métiers, leurs lieux et leurs compétences.
        </p>
      </header>

      {/* Recommandations */}
      <section aria-labelledby="recommended-title" className="mb-8">
        <div className="rounded-2xl border border-[#F07819]/25 bg-[#F07819]/[0.04] p-6">
          <p id="recommended-title" className="ocd-kicker text-[11px] font-bold">
            Des personnes que tu devrais rencontrer
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Basé sur ton profil : même pays, même domaine ou même profession.
          </p>
          <div className="mt-4">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-56 w-full rounded-2xl" />
                ))}
              </div>
            ) : recommended.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-8 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F07819]/10">
                  <Users className="h-5 w-5 text-[#F07819]" />
                </span>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {recommendedEmpty
                    ? "Ajoute ton pays et ton domaine à ton profil pour recevoir des recommandations."
                    : "Aucune recommandation disponible pour le moment. Explore tous les membres ci-dessous."}
                </p>
                {recommendedEmpty && (
                  <Button asChild variant="outline" size="sm" className="rounded-full font-semibold">
                    <Link href="/espace/parametres">
                      <Settings className="h-4 w-4" /> Compléter mon profil
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.map((m) => (
                  <MemberCardTile key={m.id} member={m} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recherche */}
      <section aria-labelledby="search-title" className="mb-8 rounded-2xl border bg-card p-6">
        <h2 id="search-title" className="font-display text-lg font-bold tracking-tight">
          Rechercher des membres
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2" aria-label="Recherche de membres">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="search-q">Mot-clé</Label>
            <Input
              id="search-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un nom, une profession, une ville..."
              className="rounded-full"
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="search-country">Pays</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="search-country" className="w-full rounded-full">
                <SelectValue placeholder="Tous les pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="search-profession">Profession</Label>
            <Input
              id="search-profession"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Ex. Développeur, Comptable..."
              className="rounded-full"
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="search-domain">Domaine</Label>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger id="search-domain" className="w-full rounded-full">
                <SelectValue placeholder="Tous les domaines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les domaines</SelectItem>
                {DOMAINS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary font-semibold hover:bg-primary/90"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Rechercher
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} className="rounded-full font-semibold">
              <RotateCcw className="h-4 w-4" /> Réinitialiser
            </Button>
          </div>
        </form>
      </section>

      {/* Résultats */}
      <section aria-labelledby="results-title">
        <h2 id="results-title" className="mb-4 font-display text-lg font-bold tracking-tight">
          Résultats
        </h2>
        {loading || (submitting && results === null) ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-56 w-full rounded-2xl" />
            ))}
          </div>
        ) : results && results.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((m) => (
              <MemberCardTile key={m.id} member={m} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F07819]/10">
              <Compass className="h-6 w-6 text-[#F07819]" />
            </span>
            <p className="max-w-sm text-sm text-muted-foreground">
              Aucun membre ne correspond à ta recherche.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
