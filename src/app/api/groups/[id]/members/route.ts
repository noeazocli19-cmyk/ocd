import { db } from "@/lib/db";
import { requireUser, ok, fail } from "@/lib/api-utils";

// POST /api/groups/[id]/members — rejoindre
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id } = await params;

  const group = await db.group.findUnique({ where: { id }, select: { id: true, name: true, createdBy: true } });
  if (!group) return fail("Groupe introuvable.", 404);

  const existing = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: auth.user.id } },
  });
  if (existing) return fail("Tu es déjà membre de ce groupe.", 409);

  await db.groupMember.create({ data: { groupId: id, userId: auth.user.id, role: "MEMBER" } });
  return ok({ joined: true }, 201);
}

// DELETE /api/groups/[id]/members — quitter
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { id } = await params;

  const membership = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: auth.user.id } },
  });
  if (!membership) return fail("Tu n'es pas membre de ce groupe.", 404);
  if (membership.role === "ADMIN") {
    const admins = await db.groupMember.count({ where: { groupId: id, role: "ADMIN" } });
    if (admins <= 1) {
      return fail("Désigne un autre administrateur avant de quitter le groupe.", 400);
    }
  }

  await db.groupMember.delete({ where: { id: membership.id } });
  return ok({ joined: false });
}
