/**
 * generate-favicon.mjs — rasterize the brand mark into a multi-size favicon.ico.
 *
 * WHY: modern browsers use public/favicon.svg, but older browsers, feed readers,
 * and some crawlers still request /favicon.ico. Keeping both in sync from one
 * source means the mark never drifts between formats.
 *
 * Runs alongside the OG generator on the `prebuild` hook, or on demand with
 * `npm run favicon`. Uses `sharp`, which ships with Astro, so there is no extra
 * dependency.
 *
 * The ICO container is assembled by hand: a 6-byte header, one 16-byte directory
 * entry per image, then the PNG payloads. PNG-in-ICO is supported everywhere
 * that matters and avoids pulling in an encoder library for a 3-image file.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(root, 'public/favicon.svg');
const OUT = resolve(root, 'public/favicon.ico');

const SIZES = [16, 32, 48];

try {
  const svg = await readFile(SRC);

  const buffers = await Promise.all(
    SIZES.map((size) =>
      // High density before downscaling keeps the mark's edges crisp at 16px.
      sharp(svg, { density: 384 }).resize(size, size, { fit: 'fill' }).png().toBuffer(),
    ),
  );

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(SIZES.length, 4);

  let offset = 6 + SIZES.length * 16;
  const entries = SIZES.map((size, i) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0); // width, 0 means 256
    entry.writeUInt8(size, 1); // height
    entry.writeUInt8(0, 2); // palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buffers[i].length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += buffers[i].length;
    return entry;
  });

  const ico = Buffer.concat([header, ...entries, ...buffers]);
  await writeFile(OUT, ico);

  console.log(
    `[favicon] Generated public/favicon.ico (${SIZES.join('/')}px, ${(ico.length / 1024).toFixed(1)} KB)`,
  );
} catch (err) {
  // Never fail the build over an icon. A committed .ico is the fallback.
  console.warn('[favicon] Could not regenerate favicon.ico:', err.message);
  process.exitCode = 0;
}
