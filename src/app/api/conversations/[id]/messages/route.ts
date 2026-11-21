import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, ok, fail, parseBody } from "@/lib/api-utils";

const sendSchema = z.object({
  content: z.string().min(1, "Le message ne peut pas être vide.").max(2000),
  mediaUrl: z.string().max(500).optional().nullable(),
});

// GET /api/conversations/[id]/messages?after=
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const user = auth.user;
  const { id } = await params;

  const membership = await db.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: user.id } },
    include: {
      conversation: {
        include: {
          members: {
            where: { userId: { not: user.id } },
            include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
          },
        },
      },
    },
  });
  if (!membership) return fail("Conversation introuvable.", 404);

  const { searchParams } = new URL(request.url);
  const after = searchParams.get("after");

  const messages = await db.message.findMany({
    where: {
      conversationId: id,
      ...(after ? { createdAt: { gt: new Date(after) } } : {}),
    },
    include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    orderBy: { createdAt: "asc" as const },
    take: 200,
  });

  // Marquer comme lu
  await db.conversationMember.update({
    where: { id: membership.id },
    data: { lastReadAt: new Date() },
  });

  return ok({
    messages,
    other: membership.conversation.members[0]?.user ?? null,
  });
}

// POST /api/conversations/[id]/messages — envoyer un message
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const user = auth.user;
  const { id } = await params;

  const parsed = await parseBody(request, sendSchema);
  if (parsed.response) return parsed.response;

  const membership = await db.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: user.id } },
    include: { conversation: { include: { members: true } } },
  });
  if (!membership) return fail("Conversation introuvable.", 404);

  const message = await db.message.create({
    data: {
      conversationId: id,
      senderId: user.id,
      content: parsed.data.content,
      mediaUrl: parsed.data.mediaUrl || null,
    },
    include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  });

  await db.conversation.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  // Notification pour les autres membres
  const others = membership.conversation.members.filter((m) => m.userId !== user.id);
  for (const other of others) {
    await db.notification.create({
      data: {
        userId: other.userId,
        type: "MESSAGE",
        title: `${user.firstName} ${user.lastName} t'a envoyé un message`,
        body: parsed.data.content.slice(0, 100),
        linkUrl: "/espace/messages",
      },
    });
  }

  return ok(message, 201);
}
