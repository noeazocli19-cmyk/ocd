import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, ok, fail, parseBody } from "@/lib/api-utils";

const startSchema = z.object({
  userId: z.string().min(1),
});

// GET /api/conversations — liste de mes conversations
export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const user = auth.user;

  const memberships = await db.conversationMember.findMany({
    where: { userId: user.id },
    include: {
      conversation: {
        include: {
          members: {
            where: { userId: { not: user.id } },
            include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, profession: true } } },
          },
          messages: { orderBy: { createdAt: "desc" as const }, take: 1 },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" as const } },
  });

  const items = memberships.map((m) => {
    const other = m.conversation.members[0]?.user ?? null;
    const lastMessage = m.conversation.messages[0] ?? null;
    const unread = lastMessage && lastMessage.senderId !== user.id
      ? lastMessage.createdAt > m.lastReadAt
      : false;
    return {
      id: m.conversation.id,
      other,
      lastMessage: lastMessage
        ? { content: lastMessage.content, createdAt: lastMessage.createdAt, senderId: lastMessage.senderId }
        : null,
      unread,
      updatedAt: m.conversation.updatedAt,
    };
  });

  return ok({ items });
}

// POST /api/conversations — démarrer une conversation avec un membre
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const user = auth.user;

  const parsed = await parseBody(request, startSchema);
  if (parsed.response) return parsed.response;
  const { userId } = parsed.data;

  if (userId === user.id) return fail("Tu ne peux pas discuter avec toi-même.", 400);

  const target = await db.user.findUnique({ where: { id: userId }, select: { id: true, isBlocked: true } });
  if (!target || target.isBlocked) return fail("Membre introuvable.", 404);

  // Chercher une conversation existante à 2
  const mine = await db.conversationMember.findMany({
    where: { userId: user.id },
    select: { conversationId: true },
  });
  const theirs = await db.conversationMember.findMany({
    where: { userId },
    select: { conversationId: true },
  });
  const shared = mine.filter((m) => theirs.some((t) => t.conversationId === m.conversationId));
  const existingConv = await db.conversation.findFirst({
    where: {
      id: { in: shared.map((s) => s.conversationId) },
      isGroup: false,
    },
  });
  if (existingConv) return ok({ id: existingConv.id });

  const conversation = await db.conversation.create({
    data: {
      isGroup: false,
      members: {
        create: [{ userId: user.id }, { userId }],
      },
    },
  });

  return ok({ id: conversation.id }, 201);
}
