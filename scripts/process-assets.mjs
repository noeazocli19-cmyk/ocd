/**
 * Traitement des assets OCD — prépare le logo officiel :
 * 1. Découpe les marges blanches (trim)
 * 2. Rend le fond transparent (suppression du blanc autour du symbole orange)
 * 3. Génère un favicon carré
 * Le dessin du logo n'est PAS modifié : seuls les pixels de fond quasi-blancs deviennent transparents.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const UPLOAD = "/home/z/my-project/upload";
const PUBLIC_DIR = "/home/z/my-project/public/images";

if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

async function makeTransparent(inputPath, outputPath) {
  const img = sharp(inputPath);
  const trimmed = await img.trim({ threshold: 12 }).toBuffer();
  const { width, height } = await sharp(trimmed).metadata();
  const raw = await sharp(trimmed).ensureAlpha().raw().toBuffer();

  const out = Buffer.from(raw);
  for (let i = 0; i < out.length; i += 4) {
    const r = out[i], g = out[i + 1], b = out[i + 2];
    // luminance approximative
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    // Fond quasi blanc (lumineux et peu saturé) => transparent
    if (lum > 0.88 && sat < 26) {
      out[i + 3] = 0;
    } else if (lum > 0.78 && sat < 40) {
      // transition douce sur les bords antialiasés
      const alpha = Math.round(255 * Math.min(1, Math.max(0, (0.88 - lum) / 0.1)));
      out[i + 3] = Math.min(out[i + 3], alpha);
    }
  }
  await sharp(out, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(outputPath);
  console.log(`OK transparent: ${outputPath} (${width}x${height})`);
  return { width, height, buffer: trimmed };
}

async function main() {
  const logoSrc = path.join(UPLOAD, "pasted_image_1795266000187.png");
  const projetsSrc = path.join(UPLOAD, "pasted_image_1795266007610.png");

  // 1. Logo OCD principal — fond transparent
  const meta = await makeTransparent(logoSrc, path.join(PUBLIC_DIR, "ocd-logo.png"));

  // 2. Favicon carré (padding léger)
  const size = 512;
  const pad = Math.round(Math.min(meta.width, meta.height) * 0.08);
  await sharp(path.join(PUBLIC_DIR, "ocd-logo.png"))
    .resize(size - pad * 2, size - pad * 2, { fit: "inside" })
    .extend({
      top: pad, bottom: pad, left: pad, right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile("/home/z/my-project/public/icon-512.png");
  await sharp("/home/z/my-project/public/icon-512.png")
    .resize(64, 64)
    .png()
    .toFile("/home/z/my-project/public/favicon.png");
  console.log("OK favicon");

  // 3. Visuel OCD PROJETS (identité associée) — conservé tel quel, trim léger
  await sharp(projetsSrc)
    .trim({ threshold: 8 })
    .png()
    .toFile(path.join(PUBLIC_DIR, "ocd-projets.png"));
  console.log("OK ocd-projets");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
