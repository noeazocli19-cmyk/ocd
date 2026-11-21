import { getSessionUser } from "@/lib/auth";
import { ok } from "@/lib/api-utils";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return ok({ user: null });
  return ok({ user });
}
