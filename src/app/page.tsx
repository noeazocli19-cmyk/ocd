import { OcdNavbar } from "@/components/site/ocd-navbar";
import { OcdFooter } from "@/components/site/ocd-footer";
import { LandingHero } from "@/components/site/landing-hero";
import { BovannSection } from "@/components/site/landing-bovann";
import {
  AchievementsSection,
  EventsSection,
  type AchievementItem,
  type EventItem,
} from "@/components/site/landing-data-sections";
import {
  PhilosophySection,
  CommunitySection,
  PossibilitiesSection,
  FinalCtaSection,
} from "@/components/site/landing-static-sections";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getLandingData() {
  try {
    const [siteContents, achievements, events] = await Promise.all([
      db.siteContent.findMany({ where: { key: { startsWith: "bovann." } } }),
      db.achievement.findMany({
        where: { isPublished: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: 3,
      }),
      db.event.findMany({
        where: { status: "PUBLISHED", startDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
        take: 3,
      }),
    ]);

    const content: Record<string, string> = {};
    for (const c of siteContents) content[c.key] = c.value;

    let activities: string[] = [];
    try {
      const parsed = JSON.parse(content["bovann.activities"] || "[]");
      if (Array.isArray(parsed)) activities = parsed.filter((a) => typeof a === "string");
    } catch {
      activities = [];
    }

    const bovann = {
      fullName: content["bovann.fullName"] || "Bovann",
      tagline: content["bovann.tagline"] || "Porteur de la vision OCD",
      presentation: content["bovann.presentation"] || "",
      photoUrl: content["bovann.photoUrl"] || "",
      activities,
    };

    const achievementItems: AchievementItem[] = achievements.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      category: a.category,
      status: a.status,
      imageUrl: a.imageUrl,
      date: a.date ? a.date.toISOString() : null,
    }));

    const eventItems: EventItem[] = events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      category: e.category,
      imageUrl: e.imageUrl,
      startDate: e.startDate.toISOString(),
      location: e.location,
      isOnline: e.isOnline,
      isDemo: e.isDemo,
    }));

    return { bovann, achievementItems, eventItems };
  } catch {
    return {
      bovann: {
        fullName: "Bovann",
        tagline: "Porteur de la vision OCD",
        presentation: "",
        photoUrl: "",
        activities: [] as string[],
      },
      achievementItems: [] as AchievementItem[],
      eventItems: [] as EventItem[],
    };
  }
}

export default async function HomePage() {
  const { bovann, achievementItems, eventItems } = await getLandingData();

  return (
    <div className="flex min-h-screen flex-col">
      <OcdNavbar />
      <main id="contenu-principal" className="flex-1">
        <LandingHero />
        <PhilosophySection />
        <BovannSection data={bovann} />
        <AchievementsSection items={achievementItems} />
        <CommunitySection />
        <PossibilitiesSection />
        <EventsSection items={eventItems} />
        <FinalCtaSection />
      </main>
      <OcdFooter />
    </div>
  );
}
