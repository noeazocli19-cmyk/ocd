import { z } from "zod";
import { db } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { ok, fail, parseBody } from "@/lib/api-utils";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export async function POST(request: Request) {
  const parsed = await parseBody(request, loginSchema);
  if (parsed.response) return parsed.response;

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return fail("Email ou mot de passe incorrect.", 401);
  }
  if (user.isBlocked) {
    return fail("Ce compte a été suspendu. Contacte l'équipe OCD.", 403);
  }

  await createSession(user.id);
  return ok({
    id: user.id,
    firstName: user.firstName,
    onboardingCompleted: user.onboardingCompleted,
    role: user.role,
  });
}
