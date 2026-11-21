"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Send,
  UsersRound,
} from "lucide-react";
import { Avatar } from "@/components/community/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@/components/app/user-provider";
import { api, timeAgo } from "@/lib/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type OtherUser = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  profession?: string | null;
};

type ConversationItem = {
  id: string;
  other: OtherUser | null;
  lastMessage: { content: string; createdAt: string; senderId: string } | null;
  unread: boolean;
  updatedAt: string;
};

type ChatMessage = {
  id: string;
  content: string;
  mediaUrl: string | null;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
};

type MemberResult = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  profession: string | null;
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function MessagesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("c");
  const { user } = useUser();

  // Liste des conversations
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listSearch, setListSearch] = useState("");

  // Conversation active
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [other, setOther] = useState<OtherUser | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [convError, setConvError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastAtRef = useRef<string | null>(null);

  // Nouvelle discussion
  const [dialogOpen, setDialogOpen] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");
  const [memberResults, setMemberResults] = useState<MemberResult[]>([]);
  const [memberSearching, setMemberSearching] = useState(false);
  const [startingId, setStartingId] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const d = await api.get<{ items: ConversationItem[] }>("/api/conversations");
      setConversations(d.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de charger tes discussions");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  // Chargement + polling des messages de la conversation sélectionnée
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setLoadingMessages(true);
    setMessages([]);
    setOther(null);
    setConvError(null);
    lastAtRef.current = null;

    const initial = async () => {
      try {
        const d = await api.get<{ messages: ChatMessage[]; other: OtherUser | null }>(
          `/api/conversations/${selectedId}/messages`
        );
        if (cancelled) return;
        setMessages(d.messages);
        setOther(d.other);
        lastAtRef.current = d.messages.length
          ? d.messages[d.messages.length - 1].createdAt
          : null;
      } catch (e) {
        if (!cancelled) {
          setConvError(e instanceof Error ? e.message : "Conversation introuvable.");
        }
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    };

    void initial();

    // Polling toutes les 5 secondes : uniquement les nouveaux messages
    const interval = setInterval(() => {
      if (cancelled) return;
      const after = lastAtRef.current;
      const url = `/api/conversations/${selectedId}/messages${after ? `?after=${encodeURIComponent(after)}` : ""}`;
      api
        .get<{ messages: ChatMessage[]; other: OtherUser | null }>(url)
        .then((d) => {
          if (cancelled || d.messages.length === 0) return;
          lastAtRef.current = d.messages[d.messages.length - 1].createdAt;
          setMessages((prev) => {
            const known = new Set(prev.map((m) => m.id));
            const fresh = d.messages.filter((m) => !known.has(m.id));
            return fresh.length ? [...prev, ...fresh] : prev;
          });
        })
        .catch(() => {
          // silencieux pendant le polling
        });
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedId]);

  // Défilement automatique vers le bas
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight });
  }, [messages, loadingMessages, selectedId]);

  // Recherche de membres (debounce) pour nouvelle discussion
  useEffect(() => {
    if (!dialogOpen) return;
    const q = memberQuery.trim();
    if (q.length < 2) {
      setMemberResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setMemberSearching(true);
      api
        .get<{ items: MemberResult[] }>(`/api/members?q=${encodeURIComponent(q)}&limit=10`)
        .then((d) => {
          if (!cancelled) setMemberResults(d.items.filter((m) => m.id !== user.id));
        })
        .catch(() => {
          if (!cancelled) setMemberResults([]);
        })
        .finally(() => {
          if (!cancelled) setMemberSearching(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [memberQuery, dialogOpen, user.id]);

  function openConversation(id: string) {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: false } : c)));
    router.push(`/espace/messages?c=${id}`);
  }

  async function send() {
    if (!selectedId || !input.trim()) return;
    setSending(true);
    try {
      const created = await api.post<ChatMessage>(`/api/conversations/${selectedId}/messages`, {
        content: input.trim(),
      });
      lastAtRef.current = created.createdAt;
      setMessages((prev) => [...prev, created]);
      setInput("");
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                unread: false,
                updatedAt: created.createdAt,
                lastMessage: {
                  content: created.content,
                  createdAt: created.createdAt,
                  senderId: created.sender.id,
                },
              }
            : c
        )
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Envoi du message impossible");
    } finally {
      setSending(false);
    }
  }

  async function startConversation(memberId: string) {
    setStartingId(memberId);
    try {
      const d = await api.post<{ id: string }>("/api/conversations", { userId: memberId });
      setDialogOpen(false);
      await loadConversations();
      openConversation(d.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible de démarrer la discussion");
    } finally {
      setStartingId(null);
    }
  }

  const filtered = conversations.filter((c) => {
    if (!listSearch.trim()) return true;
    const name = c.other ? `${c.other.firstName} ${c.other.lastName}`.toLowerCase() : "";
    return name.includes(listSearch.trim().toLowerCase());
  });

  const otherName = other ? `${other.firstName} ${other.lastName}` : "Conversation";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:h-[calc(100vh-4rem)] lg:py-6">
      <div className="grid gap-6 lg:h-full lg:grid-cols-[320px_1fr]">
        {/* Liste des conversations */}
        <section
          aria-label="Liste des discussions"
          className={cn(
            "h-[70vh] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm lg:h-full lg:min-h-0",
            selectedId ? "hidden lg:flex" : "flex"
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b p-4">
            <h1 className="font-display text-lg font-bold">Messages</h1>
            <Button
              size="sm"
              className="rounded-full px-3.5"
              onClick={() => {
                setMemberQuery("");
                setMemberResults([]);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Nouvelle
            </Button>
          </div>
          <div className="border-b p-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Rechercher une discussion..."
                className="rounded-full pl-9"
                aria-label="Rechercher une discussion"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-11 w-11 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F07819]/10">
                  <MessageCircle className="h-6 w-6 text-[#F07819]" aria-hidden="true" />
                </span>
                <p className="mt-3 text-sm text-muted-foreground">
                  {conversations.length === 0
                    ? "Aucune discussion. Démarre une conversation avec un membre depuis les pages Membres ou Groupes."
                    : "Aucune discussion ne correspond à ta recherche."}
                </p>
              </div>
            ) : (
              <ul>
                {filtered.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => openConversation(c.id)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary",
                        selectedId === c.id && "bg-[#F07819]/10"
                      )}
                    >
                      <Avatar
                        src={c.other?.avatarUrl}
                        firstName={c.other?.firstName ?? "?"}
                        lastName={c.other?.lastName ?? ""}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold">
                            {c.other ? `${c.other.firstName} ${c.other.lastName}` : "Membre OCD"}
                          </p>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {timeAgo(c.updatedAt)}
                          </span>
                        </div>
                        <p
                          className={cn(
                            "truncate text-xs",
                            c.unread ? "font-semibold text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {c.lastMessage?.content ?? "Nouvelle discussion"}
                        </p>
                      </div>
                      {c.unread && (
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#F07819]"
                          aria-label="Messages non lus"
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Conversation active */}
        <section
          aria-label="Conversation"
          className={cn(
            "flex-col lg:flex",
            selectedId
              ? "fixed inset-0 z-40 flex bg-background lg:static lg:z-auto lg:rounded-2xl lg:border lg:bg-card lg:shadow-sm"
              : "hidden lg:min-h-0 lg:rounded-2xl lg:border lg:bg-card lg:shadow-sm"
          )}
        >
          {selectedId ? (
            <>
              {/* En-tête conversation */}
              <header className="flex items-center gap-3 border-b bg-card px-4 py-3 lg:rounded-t-2xl">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full lg:hidden"
                  onClick={() => router.push("/espace/messages")}
                  aria-label="Retour aux discussions"
                >
                  <ArrowLeft className="h-4.5 w-4.5" />
                </Button>
                <Avatar
                  src={other?.avatarUrl}
                  firstName={other?.firstName ?? "?"}
                  lastName={other?.lastName ?? ""}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{otherName}</p>
                  {other?.profession && (
                    <p className="truncate text-xs text-muted-foreground">{other.profession}</p>
                  )}
                </div>
              </header>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto p-4 lg:min-h-0">
                {loadingMessages ? (
                  <div className="space-y-3 py-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                        <Skeleton className={cn("h-10 rounded-2xl", i % 2 === 0 ? "w-2/3" : "w-1/2")} />
                      </div>
                    ))}
                  </div>
                ) : convError ? (
                  <p className="mx-auto max-w-sm rounded-xl bg-destructive/10 p-4 text-center text-sm text-destructive">
                    {convError}
                  </p>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F07819]/10">
                      <MessageCircle className="h-6 w-6 text-[#F07819]" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Envoie le premier message à {other?.firstName ?? "ce membre"}.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const mine = m.sender.id === user.id;
                    return (
                      <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                            mine
                              ? "rounded-br-md bg-[#F07819] text-white"
                              : "rounded-bl-md bg-secondary text-foreground"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.content}</p>
                          <p
                            className={cn(
                              "mt-1 text-right text-[10px]",
                              mine ? "text-white/70" : "text-muted-foreground"
                            )}
                          >
                            {formatTime(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Zone de saisie */}
              <div className="flex items-center gap-2 border-t bg-card p-3 lg:rounded-b-2xl">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  placeholder="Écris ton message..."
                  className="rounded-full"
                  aria-label="Ton message"
                />
                <Button
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full bg-[#F07819] text-white hover:bg-[#d96a15]"
                  onClick={() => void send()}
                  disabled={sending || !input.trim()}
                  aria-label="Envoyer le message"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F07819]/10">
                <UsersRound className="h-8 w-8 text-[#F07819]" aria-hidden="true" />
              </span>
              <p className="mt-4 font-display text-lg font-semibold">Tes messages</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Sélectionne une discussion à gauche ou démarre une nouvelle conversation avec un membre.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Dialog nouvelle discussion */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (open) {
            setMemberQuery("");
            setMemberResults([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Nouvelle discussion</DialogTitle>
            <DialogDescription>
              Recherche un membre de la communauté pour démarrer une conversation privée.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
              placeholder="Nom, profession, ville..."
              className="rounded-full pl-9"
              aria-label="Rechercher un membre"
            />
          </div>
          <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
            {memberQuery.trim().length < 2 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Saisis au moins 2 caractères pour rechercher un membre.
              </p>
            ) : memberSearching ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-[#F07819]" aria-hidden="true" />
              </div>
            ) : memberResults.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Aucun membre trouvé.</p>
            ) : (
              memberResults.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => void startConversation(m.id)}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-secondary"
                  disabled={startingId !== null}
                >
                  <Avatar src={m.avatarUrl} firstName={m.firstName} lastName={m.lastName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {m.firstName} {m.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.profession ?? "Membre OCD"}
                    </p>
                  </div>
                  {startingId === m.id && (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#F07819]" aria-hidden="true" />
                  )}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
