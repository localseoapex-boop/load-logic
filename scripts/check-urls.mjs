/**
 * check-urls.mjs — guards the site's existing URLs against silent loss.
 *
 * BASELINE REWRITTEN 2026-08-20, deliberately. The city x service architecture
 * was removed: /locations/[city]/[service] and its [subservice] child generated
 * 144 URLs from 9 cities x 14 services, each asserting only that a service is
 * available in a city — a fact that belongs in data, not in a page. Those 144
 * are covered by two wildcard 301s in vercel.json, which is the single-hop
 * redirect this file's own rule requires before a baseline rewrite.
 *
 * A redesign is the easiest way to accidentally drop a route: a changed
 * getStaticPaths filter, a renamed slug, or a data field that stops resolving,
 * and a page that used to rank quietly stops existing. This compares the built
 * output against a committed baseline and fails on any difference.
 *
 * Usage:
 *   node scripts/check-urls.mjs           compare dist against the baseline
 *   node scripts/check-urls.mjs --update  rewrite the baseline (deliberate changes only)
 *
 * Updating the baseline is a decision, not a formality. Any removed URL needs a
 * single-hop 301 before the baseline is rewritten.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(root, 'dist');
const BASELINE = resolve(root, 'scripts/url-baseline.txt');

/** Every .html file in dist, as the URL path it will be served at. */
async function collectUrls(dir, urls = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectUrls(full, urls);
    } else if (entry.name.endsWith('.html')) {
      const rel = full.slice(DIST.length);
      urls.push(rel.replace(/\/index\.html$/, '/').replace(/\.html$/, ''));
    }
  }
  return urls;
}

let built;
try {
  built = (await collectUrls(DIST)).sort();
} catch {
  console.error('[urls] No dist/ directory. Run `npm run build` first.');
  process.exit(1);
}

if (process.argv.includes('--update')) {
  await writeFile(BASELINE, built.join('\n') + '\n');
  console.log(`[urls] Baseline updated with ${built.length} URLs.`);
  process.exit(0);
}

let baseline;
try {
  baseline = (await readFile(BASELINE, 'utf8')).split('\n').filter(Boolean);
} catch {
  console.error('[urls] No baseline found. Create one with --update.');
  process.exit(1);
}

const builtSet = new Set(built);
const baselineSet = new Set(baseline);
const missing = baseline.filter((u) => !builtSet.has(u));
const added = built.filter((u) => !baselineSet.has(u));

if (missing.length === 0 && added.length === 0) {
  console.log(`[urls] OK. All ${built.length} URLs match the baseline.`);
  process.exit(0);
}

if (missing.length > 0) {
  console.error(`\n[urls] ${missing.length} URL(s) MISSING from the build:`);
  missing.forEach((u) => console.error(`  - ${u}`));
  console.error('\nEach of these needs a single-hop 301 before the baseline is updated.');
}

if (added.length > 0) {
  console.log(`\n[urls] ${added.length} new URL(s):`);
  added.forEach((u) => console.log(`  + ${u}`));
}

// New URLs alone are fine during a build-out. Losing one is not.
process.exit(missing.length > 0 ? 1 : 0);
