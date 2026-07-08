// Generates favicon.ico, app icons, and PWA icons from the brand logo.
// Run with: node scripts/generate-icons.mjs
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = process.cwd();
const logoPath = path.join(root, "public", "infinity-peptides-logo.png");

// Crop the infinity symbol (top portion of the lockup), trim transparent
// edges, then pad onto a square transparent canvas.
async function symbolSquare(size, { background = null, paddingRatio = 0.12 } = {}) {
  const cropped = await sharp(logoPath)
    .extract({ left: 0, top: 0, width: 1536, height: 510 })
    .toBuffer();
  const symbol = await sharp(cropped).trim().toBuffer();

  const meta = await sharp(symbol).metadata();
  const pad = Math.round(size * paddingRatio);
  const inner = size - pad * 2;
  const scale = Math.min(inner / meta.width, inner / meta.height);
  const w = Math.round(meta.width * scale);
  const h = Math.round(meta.height * scale);

  const resized = await sharp(symbol).resize(w, h).toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, gravity: "centre" }])
    .png();
}

const DARK = { r: 4, g: 6, b: 12, alpha: 1 };

async function main() {
  await mkdir(path.join(root, "public", "icons"), { recursive: true });

  // App-dir file conventions
  await (await symbolSquare(512)).toFile(path.join(root, "app", "icon.png"));
  await (await symbolSquare(180, { background: DARK, paddingRatio: 0.16 })).toFile(
    path.join(root, "app", "apple-icon.png"),
  );

  // PWA / manifest icons
  await (await symbolSquare(192, { background: DARK })).toFile(
    path.join(root, "public", "icons", "icon-192.png"),
  );
  await (await symbolSquare(512, { background: DARK })).toFile(
    path.join(root, "public", "icons", "icon-512.png"),
  );

  // Multi-size favicon.ico
  const sizes = [16, 32, 48];
  const buffers = [];
  for (const s of sizes) {
    buffers.push(await (await symbolSquare(s, { paddingRatio: 0.04 })).toBuffer());
  }
  const ico = await pngToIco(buffers);
  await writeFile(path.join(root, "app", "favicon.ico"), ico);

  console.log("Icons written: app/favicon.ico, app/icon.png, app/apple-icon.png, public/icons/*");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
