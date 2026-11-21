import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { requireUser, ok, fail } from "@/lib/api-utils";

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// POST /api/upload — upload d'image (multipart/form-data, champ "file")
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return fail("Aucun fichier fourni.", 400);
  }
  if (file.size > MAX_SIZE) {
    return fail("Image trop volumineuse (max 5 Mo).", 413);
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return fail("Format non supporté (JPEG, PNG, WebP ou GIF).", 415);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const isGif = file.type === "image/gif";

  // Optimisation : largeur max 1920px, WebP pour JPEG/PNG, GIF conservé
  let outputBuffer: Buffer;
  let ext: string;
  if (isGif) {
    outputBuffer = buffer;
    ext = "gif";
  } else {
    outputBuffer = await sharp(buffer)
      .rotate()
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    ext = "webp";
  }

  const fileName = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, fileName), outputBuffer);

  return ok({ url: `/uploads/${fileName}` }, 201);
}
