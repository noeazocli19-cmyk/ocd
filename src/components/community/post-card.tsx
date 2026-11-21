"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ThumbsUp,
  PartyPopper,
  Sparkles,
  HeartHandshake,
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
  CornerDownRight,
  Info,
  Send,
  Loader2,
} from "lucide-react";
import { Avatar } from "@/components/community/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, timeAgo, POST_CATEGORY_LABELS } from "@/lib/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type FeedUser = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  profession?: string | null;
  isDemo?: boolean;
};

export type FeedComment = {
  id: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  user: FeedUser;
  replies?: FeedComment[];
};

export type FeedPost = {
  id: string;
  content: string;
  category: string;
  imageUrl: string | null;
  videoUrl: string | null;
  createdAt: string;
  user: FeedUser;
  groupId?: string | null;
  group?: { id: string; name: string; slug: string } | null;
  comments: FeedComment[];
  _count: { comments: number; reactions: number };
};

export type CurrentUser = { id: string; firstName: string; lastName: string; avatarUrl: string | null; role: string };

const REACTIONS = [
  { type: "LIKE", label: "J'aime", icon: ThumbsUp },
  { type: "CELEBRATE", label: "Bravo", icon: PartyPopper },
  { type: "INSPIRED", label: "Inspirant", icon: Sparkles },
  { type: "SUPPORT", label: "Je soutiens", icon: HeartHandshake },
] as const;

export function PostCard({
  post,
  currentUser,
  onUpdate,
  onDelete,
}: {
  post: FeedPost;
  currentUser: CurrentUser | null;
  onUpdate?: (post: FeedPost) => void;
  onDelete?: (postId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>(post.comments ?? []);
  const [commentInput, setCommentInput] = useState("");
  const [replyTo, setReplyTo] = useState<FeedComment | null>(null);
  const [sending, setSending] = useState(false);
  const [reactionState, setReactionState] = useState<{ active: Record<string, boolean>; total: number }>({
    active: {},
    total: post._count.reactions,
  });
  const [reactionDetail, setReactionDetail] = useState<Record<string, number>>({});

  const isOwner = currentUser?.id === post.user.id;
  const canModerate = currentUser && ["MODERATOR", "ADMIN", "SUPER_ADMIN"].includes(currentUser.role);

  async function toggleReaction(type: string) {
    if (!currentUser) return;
    try {
      const res = await api.post<{ active: boolean; counts: { type: string; _count: { type: number } }[] }>(
        `/api/posts/${post.id}/reactions`,
        { type }
      );
      setReactionState((s) => ({
        ...s,
        active: { ...s.active, [type]: res.active },
        total: s.total + (res.active ? 1 : -1),
      }));
      const detail: Record<string, number> = {};
      for (const c of res.counts) detail[c.type] = c._count.type;
      setReactionDetail(detail);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action impossible");
    }
  }

  async function submitComment() {
    if (!commentInput.trim() || !currentUser) return;
    setSending(true);
    try {
      const created = await api.post<FeedComment>(`/api/posts/${post.id}/comments`, {
        content: commentInput.trim(),
        parentId: replyTo?.id ?? null,
      });
      if (replyTo) {
        setComments((cs) =>
          cs.map((c) => (c.id === replyTo.id ? { ...c, replies: [...(c.replies ?? []), created] } : c))
        );
        setReplyTo(null);
      } else {
        setComments((cs) => [...cs, { ...created, replies: [] }]);
      }
      setCommentInput("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Commentaire impossible");
    } finally {
      setSending(false);
    }
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const updated = await api.patch<FeedPost>(`/api/posts/${post.id}`, { content: editContent });
      onUpdate?.({ ...post, ...updated, comments: post.comments, _count: post._count });
      setEditing(false);
      toast.success("Publication mise à jour");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Modification impossible");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await api.delete(`/api/posts/${post.id}`);
      onDelete?.(post.id);
      toast.success("Publication supprimée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible");
    }
  }

  return (
    <article className="rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={`/espace/membres/${post.user.id}`} aria-label={`Profil de ${post.user.firstName}`}>
            <Avatar src={post.user.avatarUrl} firstName={post.user.firstName} lastName={post.user.lastName} />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <Link
                href={`/espace/membres/${post.user.id}`}
                className="truncate text-sm font-semibold hover:underline"
              >
                {post.user.firstName} {post.user.lastName}
              </Link>
              {post.user.isDemo && (
                <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Démo
                </Badge>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {post.user.profession ? `${post.user.profession} · ` : ""}
              {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
            {POST_CATEGORY_LABELS[post.category] ?? post.category}
          </Badge>
          {(isOwner || canModerate) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions sur la publication">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <DropdownMenuItem onClick={() => setEditing((v) => !v)}>
                    <Pencil className="h-4 w-4" /> Modifier
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={remove} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4" /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {post.group && (
        <p className="mt-2 text-xs text-muted-foreground">
          Publié dans{" "}
          <Link href={`/espace/groupes/${post.group.id}`} className="font-semibold text-[#F07819] hover:underline">
            {post.group.name}
          </Link>
        </p>
      )}

      {/* Contenu */}
      {editing ? (
        <div className="mt-3 space-y-3">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            aria-label="Modifier la publication"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setEditContent(post.content); }}>
              Annuler
            </Button>
            <Button size="sm" onClick={saveEdit} disabled={saving || !editContent.trim()}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Enregistrer
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
          {post.content}
        </p>
      )}

      {/* Média */}
      {post.imageUrl && (
        <div className="relative mt-3 overflow-hidden rounded-xl border">
          <Image
            src={post.imageUrl}
            alt="Média de la publication"
            width={1200}
            height={675}
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      {/* Réactions */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
        <div className="flex flex-wrap gap-1">
          {REACTIONS.map((r) => {
            const isActive = reactionState.active[r.type];
            const count = reactionDetail[r.type];
            return (
              <button
                key={r.type}
                type="button"
                onClick={() => toggleReaction(r.type)}
                disabled={!currentUser}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                  isActive
                    ? "bg-[#F07819]/15 text-[#B45309] dark:text-[#FFB25C]"
                    : "text-muted-foreground hover:bg-secondary"
                )}
                aria-label={`${r.label} cette publication`}
                aria-pressed={isActive}
              >
                <r.icon className={cn("h-4 w-4", isActive && "text-[#F07819]")} />
                {r.label}
                {typeof count === "number" && count > 0 ? ` · ${count}` : ""}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary"
          aria-expanded={showComments}
        >
          <MessageSquare className="h-4 w-4" />
          {post._count.comments + (comments.length - post.comments.length)} commentaire
          {comments.length > 1 ? "s" : ""}
        </button>
      </div>

      {/* Commentaires */}
      {showComments && (
        <div className="mt-4 space-y-4 border-t pt-4">
          {!currentUser && (
            <p className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
              <Info className="mr-1 inline h-3.5 w-3.5" />
              Connecte-toi pour réagir et commenter.
            </p>
          )}
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun commentaire. Lance la discussion !</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="space-y-2">
              <CommentBubble comment={c} onReply={() => setReplyTo(c)} currentUser={currentUser} />
              {(c.replies ?? []).map((r) => (
                <div key={r.id} className="ml-6 flex items-start gap-1.5">
                  <CornerDownRight className="mt-3 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <CommentBubble comment={r} currentUser={currentUser} />
                </div>
              ))}
            </div>
          ))}

          {currentUser && (
            <div className="flex items-start gap-3 pt-2">
              <Avatar
                src={currentUser.avatarUrl}
                firstName={currentUser.firstName}
                lastName={currentUser.lastName}
                size="sm"
              />
              <div className="flex-1 space-y-2">
                {replyTo && (
                  <p className="text-xs text-muted-foreground">
                    Réponse à <span className="font-semibold">{replyTo.user.firstName}</span>{" "}
                    <button type="button" className="underline" onClick={() => setReplyTo(null)}>
                      annuler
                    </button>
                  </p>
                )}
                <Textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Ajoute un commentaire constructif..."
                  rows={2}
                  aria-label="Nouveau commentaire"
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={submitComment} disabled={sending || !commentInput.trim()}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Envoyer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function CommentBubble({ comment, onReply, currentUser }: { comment: FeedComment; onReply?: () => void; currentUser: CurrentUser | null }) {
  return (
    <div className="flex items-start gap-3">
      <Avatar src={comment.user.avatarUrl} firstName={comment.user.firstName} lastName={comment.user.lastName} size="sm" />
      <div className="min-w-0 flex-1 rounded-2xl bg-secondary/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{comment.user.firstName} {comment.user.lastName}</span>
          {comment.user.isDemo && (
            <Badge variant="outline" className="h-4 px-1 text-[9px] font-semibold uppercase text-muted-foreground">
              Démo
            </Badge>
          )}
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-foreground/85">{comment.content}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(comment.createdAt)}</p>
        {onReply && (
          <button
            type="button"
            onClick={onReply}
            className="mt-1 text-[11px] font-semibold text-[#F07819] hover:underline"
          >
            Répondre
          </button>
        )}
      </div>
    </div>
  );
}
