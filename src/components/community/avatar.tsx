"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const SIZES: Record<string, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 64,
  xl: 96,
};

export function Avatar({
  src,
  firstName,
  lastName,
  size = "md",
  className,
  ring = false,
}: {
  src?: string | null;
  firstName: string;
  lastName: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean;
}) {
  const px = SIZES[size] ?? 44;
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Membre";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-secondary text-foreground",
        ring && "ring-2 ring-[#F07819]/60 ring-offset-2 ring-offset-background",
        className
      )}
      style={{ width: px, height: px }}
    >
      {src ? (
        <Image
          src={src}
          alt={`Photo de ${name}`}
          width={px}
          height={px}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="font-display font-bold text-white"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: px * 0.36,
            background: "linear-gradient(135deg, #F07819 0%, #B45309 100%)",
          }}
        >
          {initials || "?"}
        </span>
      )}
    </span>
  );
}
