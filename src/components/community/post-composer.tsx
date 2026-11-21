"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import { Avatar } from "@/components/community/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api, POST_CATEGORIES, POST_CATEGORY_LABELS } from "@/lib/client";
import { toast } from "sonner";

export type ComposerUser = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

export function PostComposer({
  currentUser,
  groupId,
  onCreated,
  placeholder = "Partage une expérience, une idée, une question...",
}: {
  currentUser: ComposerUser | null;
  groupId?: string;
  onCreated?: () => void;
  placeholder?: string;
}) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("EXPERIENCES");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.upload<{ url: string }>("/api/upload", fd);
      setImageUrl(res.url);
      toast.success("Image ajoutée");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload impossible");
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!content.trim()) return;
    setSending(true);
    try {
      await api.post("/api/posts", {
        content: content.trim(),
        category,
        imageUrl,
        groupId: groupId ?? null,
      });
      setContent("");
      setImageUrl(null);
      setCategory("EXPERIENCES");
      onCreated?.();
      toast.success("Publication partagée avec la communauté");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Publication impossible");
    } finally {
      setSending(false);
    }
  }

  if (!currentUser) return null;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar src={currentUser.avatarUrl} firstName={currentUser.firstName} lastName={currentUser.lastName} />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="resize-none border-0 bg-transparent p-0 focus-visible:ring-0 text-[15px]"
          aria-label="Contenu de ta publication"
        />
      </div>

      {imageUrl && (
        <div className="relative mt-3 overflow-hidden rounded-xl border">
          <button
            type="button"
            onClick={() => setImageUrl(null)}
            className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
            aria-label="Retirer l'image"
          >
            <X className="h-4 w-4" />
          </button>
          <Image
            src={imageUrl}
            alt="Aperçu de l'image ajoutée"
            width={800}
            height={400}
            className="max-h-72 w-auto object-cover"
          />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            Photo
          </Button>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-8 w-[180px] rounded-full text-xs" aria-label="Catégorie de la publication">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POST_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {POST_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={submit}
          disabled={sending || !content.trim()}
          className="rounded-full px-5"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Publier
        </Button>
      </div>
    </div>
  );
}
