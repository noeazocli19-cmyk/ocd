import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, ok, fail, parseBody } from "@/lib/api-utils";

const patchSchema = z.object({
  role: z.enum(["MEMBER", "MODERATOR", "ADMIN", "SUPER_ADMIN"]).optional(),
  isBlocked: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;

  const parsed = await parseBody(request, patchSchema);
  if (parsed.response) return parsed.response;
  const data = parsed.data;

  const target = await db.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!target) return fail("Membre introuvable.", 404);

  // Un SUPER_ADMIN ne peut pas être rétrogradé/bloqué par un ADMIN
  if (target.role === "SUPER_ADMIN" && auth.user.role !== "SUPER_ADMIN") {
    return fail("Seul un super administrateur peut modifier ce compte.", 403);
  }
  if (target.id === auth.user.id && (data.isBlocked || (data.role && data.role !== "SUPER_ADMIN"))) {
    return fail("Tu ne peux pas appliquer cette action à ton propre compte.", 400);
  }

  const updated = await db.user.update({
    where: { id },
    data: {
      ...(data.role ? { role: data.role } : {}),
      ...(data.isBlocked !== undefined ? { isBlocked: data.isBlocked } : {}),
    },
    select: { id: true, role: true, isBlocked: true },
  });

  return ok(updated);
}
