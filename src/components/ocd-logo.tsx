import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo officiel OCD — symbole original issu de l'identité visuelle fournie.
 * Le fichier original est conservé tel quel (fond rendu transparent, dessin intact).
 */
export function OcdLogo({
  className,
  alt = "Logo OCD",
  priority = false,
}: {
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/images/ocd-logo.png"
      alt={alt}
      width={850}
      height={334}
      priority={priority}
      className={cn("h-auto w-auto", className)}
    />
  );
}
