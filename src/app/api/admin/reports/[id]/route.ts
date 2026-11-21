import { db } from "@/lib/db";
import { requireAdmin, ok, fail } from "@/lib/api-utils";

// PATCH /api/admin/reports/[id] — traiter un signalement (MOD+)
export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  if (status !== "RESOLVED" && status !== "DISMISSED") {
    return fail("Statut invalide.", 400);
  }

  return ok({ success: true, status });
}
