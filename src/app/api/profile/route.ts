import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, ok, parseBody } from "@/lib/api-utils";

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(60).optional(),
  lastName: z.string().min(1).max(60).optional(),
  bio: z.string().max(1200).optional().nullable(),
  country: z.string().max(80).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  profession: z.string().max(120).optional().nullable(),
  domain: z.string().max(120).optional().nullable(),
  experienceLevel: z.string().max(40).optional().nullable(),
  interests: z.array(z.string().max(60)).max(12).optional(),
  avatarUrl: z.string().max(500).optional().nullable(),
  coverUrl: z.string().max(500).optional().nullable(),
  website: z.string().max(200).optional().nullable(),
  linkedin: z.string().max(200).optional().nullable(),
  twitter: z.string().max(200).optional().nullable(),
  instagram: z.string().max(200).optional().nullable(),
  whatsapp: z.string().max(40).optional().nullable(),
  skills: z.array(z.string().min(1).max(50)).max(20).optional(),
  onboardingCompleted: z.boolean().optional(),
});

// PATCH /api/profile — mettre à jour mon profil
export async function PATCH(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const user = auth.user;

  const parsed = await parseBody(request, updateProfileSchema);
  if (parsed.response) return parsed.response;
  const data = parsed.data;

  const userData: Record<string, unknown> = {
    firstName: data.firstName,
    lastName: data.lastName,
    bio: data.bio,
    country: data.country,
    city: data.city,
    profession: data.profession,
    domain: data.domain,
    experienceLevel: data.experienceLevel,
    avatarUrl: data.avatarUrl,
    coverUrl: data.coverUrl,
    website: data.website,
    linkedin: data.linkedin,
    twitter: data.twitter,
    instagram: data.instagram,
    whatsapp: data.whatsapp,
    onboardingCompleted: data.onboardingCompleted,
  };
  if (data.interests !== undefined) {
    userData.interests = JSON.stringify(data.interests);
  }
  Object.keys(userData).forEach((k) => userData[k] === undefined && delete userData[k]);

  const updated = await db.user.update({
    where: { id: user.id },
    data: userData,
  });

  if (data.skills !== undefined) {
    await db.skill.deleteMany({ where: { userId: user.id } });
    const unique = Array.from(new Set(data.skills.map((s) => s.trim()).filter(Boolean)));
    if (unique.length) {
      await db.skill.createMany({
        data: unique.map((name) => ({ userId: user.id, name: name.slice(0, 50) })),
      });
    }
  }

  return ok({
    id: updated.id,
    firstName: updated.firstName,
    lastName: updated.lastName,
    avatarUrl: updated.avatarUrl,
    onboardingCompleted: updated.onboardingCompleted,
  });
}

// GET /api/profile — mon profil complet (avec skills, expériences, projets)
export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const profile = await db.user.findUnique({
    where: { id: auth.user.id },
    include: {
      skills: true,
      experiences: { orderBy: { startDate: "desc" } },
      projects: { orderBy: { createdAt: "desc" } },
      _count: { select: { posts: true, followsSent: true, followsReceived: true } },
    },
  });
  if (!profile) return ok({ profile: null });

  const { passwordHash: _ph, ...safe } = profile;
  return ok({ profile: safe });
}
