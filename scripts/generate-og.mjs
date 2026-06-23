/**
 * generate-og.mjs — rasterize the SVG OG template to a real PNG.
 *
 * WHY: Social crawlers (Facebook, LinkedIn, X/Twitter) do not render SVG for
 * og:image — they require a raster format (PNG/JPG). This script converts the
 * editable src/assets/og-default.svg into public/og-default.png at the canonical
 * 1200x630 OG size, so the fallback image referenced by BaseHead always exists
 * and social shares never break.
 *
 * Runs automatically via the `prebuild` npm hook, or on demand with `npm run og`.
 * Uses `sharp`, which ships with Astro — no extra dependency.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(root, 'src/assets/og-default.svg');
const OUT = resolve(root, 'public/og-default.png');

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

try {
  const svg = await readFile(SRC);
  await mkdir(dirname(OUT), { recursive: true });

  const png = await sharp(svg, { density: 144 }) // higher density = crisp text
    .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover' })
    .png()
    .toBuffer();

  await writeFile(OUT, png);
  console.log(`[og] Generated public/og-default.png (${OG_WIDTH}x${OG_HEIGHT}, ${(png.length / 1024).toFixed(1)} KB)`);
} catch (err) {
  // Don't fail the whole build if generation breaks — a committed PNG should
  // already exist as the fallback-to-the-fallback.
  console.warn('[og] Could not regenerate og-default.png:', err.message);
  process.exitCode = 0;
}
