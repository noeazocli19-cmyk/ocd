import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "OCD — Les opportunités sont dehors.",
    template: "%s | OCD",
  },
  description:
    "OCD est un écosystème communautaire qui connecte les ambitions : rencontre des personnes motivées, partage tes expériences, présente tes projets et transforme tes rencontres en opportunités.",
  keywords: ["OCD", "communauté", "entrepreneuriat", "opportunités", "réseau", "Afrique", "Bovann"],
  icons: {
    icon: "/favicon.png",
    apple: "/icon-512.png",
  },
  openGraph: {
    title: "OCD — Les opportunités sont dehors.",
    description:
      "Une communauté qui transforme les rencontres en relations, les idées en projets et les ambitions en actions.",
    siteName: "OCD",
    type: "website",
    locale: "fr_FR",
    images: ["/images/ocd-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "OCD — Les opportunités sont dehors.",
    description:
      "Une communauté qui transforme les rencontres en relations, les idées en projets et les ambitions en actions.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
