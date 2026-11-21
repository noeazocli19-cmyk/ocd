import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ok, parseBody } from "@/lib/api-utils";

const EVENT_CATEGORIES = [
  "CONFERENCE", "RENCONTRE", "MASTERCLASS", "ATELIER", "LIVE", "CHALLENGE", "ENTREPRENARIAT",
] as const;

const eventSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().min(10).max(3000),
  category: z.enum(EVENT_CATEGORIES),
  imageUrl: z.string().max(500).optional().nullable(),
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  isOnline: z.boolean().default(false),
  onlineUrl: z.string().max(300).optional().nullable(),
  organizerId: z.string().optional().nullable(),
  organizerName: z.string().max(120).default("OCD"),
  capacity: z.number().int().min(1).max(10000).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]).default("PUBLISHED"),
});

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const items = await db.event.findMany({
    include: {
      organizer: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { startDate: "asc" },
  });
  return ok({ items });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const parsed = await parseBody(request, eventSchema);
  if (parsed.response) return parsed.response;
  const data = parsed.data;

  const created = await db.event.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      imageUrl: data.imageUrl || null,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      location: data.location || null,
      isOnline: data.isOnline,
      onlineUrl: data.onlineUrl || null,
      organizerId: data.organizerId || null,
      organizerName: data.organizerName,
      capacity: data.capacity || null,
      status: data.status,
    },
  });
  return ok(created, 201);
}
