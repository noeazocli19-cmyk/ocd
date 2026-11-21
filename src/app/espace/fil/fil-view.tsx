"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Newspaper, SearchX } from "lucide-react";
import { PostCard, type FeedPost } from "@/components/community/post-card";
import { PostComposer } from "@/components/community/post-composer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/components/app/user-provider";
import { api, POST_CATEGORIES, POST_CATEGORY_LABELS } from "@/lib/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* --------------------------------- types ---------------------------------- */

type PostsResponse = { items: FeedPost[]; nextCursor: string | null };

const PAGE_SIZE = 10;

function buildUrl(category: string | null, cursor?: string | null): string {
  return `/api/posts?limit=${PAGE_SIZE}${category ? `&category=${encodeURIComponent(category)}` : ""}${
    cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""
  }`;
}

function PostSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-8 w-3/4 rounded-full" />
    </div>
  );
}

/* ---------------------------------- vue ----------------------------------- */

export function FilView() {
  const { user } = useUser();

  const [category, setCategory] = useState<string | null>(null); // null = Tous
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // Chargement (ou rechargement) de la première page à chaque changement de catégorie
  useEffect(() => {
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      setLoading(true);
      api
        .get<PostsResponse>(buildUrl(category))
        .then((res) => {
          if (cancelled) return;
          setPosts(res.items);
          setCursor(res.nextCursor);
          setHasMore(res.nextCursor !== null);
          setLoading(false);
        })
        .catch((e) => {
          if (cancelled) return;
          setLoading(false);
          toast.error(e instanceof Error ? e.message : "Impossible de charger le fil d'actualité.");
        });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [category]);

  function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    api
      .get<PostsResponse>(buildUrl(category, cursor))
      .then((res) => {
        setPosts((prev) => [...prev, ...res.items]);
        setCursor(res.nextCursor);
        setHasMore(res.nextCursor !== null);
        setLoadingMore(false);
      })
      .catch((e) => {
        setLoadingMore(false);
        toast.error(e instanceof Error ? e.message : "Impossible de charger la suite du fil.");
      });
  }

  // Recharge la première page puis remonte en haut du fil après une publication
  function reload() {
    api
      .get<PostsResponse>(buildUrl(category))
      .then((res) => {
        setPosts(res.items);
        setCursor(res.nextCursor);
        setHasMore(res.nextCursor !== null);
        setLoading(false);
        feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      })
      .catch(() => {
        // silencieux : le fil courant reste affiché
      });
  }

  function updatePost(updated: FeedPost) {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }
  function deletePost(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  const currentLabel = category ? (POST_CATEGORY_LABELS[category] ?? category) : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
      <header className="mb-6">
        <p className="ocd-kicker text-xs font-bold">Communauté</p>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Fil d&apos;actualité</h1>
        <p className="mt-1 text-muted-foreground">
          Les expériences, idées et opportunités partagées par la communauté OCD.
        </p>
      </header>

      {/* Composer */}
      <section aria-label="Créer une publication">
        <PostComposer currentUser={user} onCreated={reload} />
      </section>

      {/* Filtres catégories */}
      <nav
        aria-label="Filtrer les publications par catégorie"
        className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      >
        <button
          type="button"
          onClick={() => setCategory(null)}
          aria-pressed={category === null}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all",
            category === null
              ? "bg-[#F07819] text-white shadow-sm"
              : "border bg-card text-muted-foreground hover:border-[#F07819]/40 hover:text-foreground"
          )}
        >
          Tous
        </button>
        {POST_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            aria-pressed={category === cat}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all",
              category === cat
                ? "bg-[#F07819] text-white shadow-sm"
                : "border bg-card text-muted-foreground hover:border-[#F07819]/40 hover:text-foreground"
            )}
          >
            {POST_CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </nav>

      {/* Fil */}
      <div ref={feedRef} className="scroll-mt-20 space-y-4 pt-6" aria-live="polite">
        {currentLabel && !loading && (
          <p className="text-sm text-muted-foreground">
            Publications dans <span className="font-semibold text-[#F07819]">{currentLabel}</span>
          </p>
        )}

        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-4 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F07819]/10">
              {category ? <SearchX className="h-6 w-6 text-[#F07819]" /> : <Newspaper className="h-6 w-6 text-[#F07819]" />}
            </span>
            <p className="max-w-sm text-sm text-muted-foreground">
              {category
                ? `Aucune publication dans cette catégorie pour le moment. Sois le premier à t'exprimer !`
                : "Aucune publication pour le moment. Lance la discussion avec ta première expérience."}
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUser={user} onUpdate={updatePost} onDelete={deletePost} />
            ))}

            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-full font-semibold"
                >
                  {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                  Charger plus de publications
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
