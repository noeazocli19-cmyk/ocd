import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { ok, fail, parseBody } from "@/lib/api-utils";

const registerSchema = z.object({
  email: z.string().email("Email invalide").max(180),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").max(100),
  firstName: z.string().min(1, "Prénom requis").max(60),
  lastName: z.string().min(1, "Nom requis").max(60),
});

export async function POST(request: Request) {
  const parsed = await parseBody(request, registerSchema);
  if (parsed.response) return parsed.response;

  const { email, password, firstName, lastName } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return fail("Un compte existe déjà avec cet email.", 409);
  }

  const user = await db.user.create({
    data: {
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    },
  });

  await createSession(user.id);
  return ok({ id: user.id, firstName: user.firstName, onboardingCompleted: false }, 201);
}
