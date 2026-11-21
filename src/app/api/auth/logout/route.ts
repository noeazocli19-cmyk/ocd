import { destroySession } from "@/lib/auth";
import { ok } from "@/lib/api-utils";

export async function POST() {
  await destroySession();
  return ok({ success: true });
}
