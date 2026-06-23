// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // `site` is the canonical absolute origin. It powers:
  //   - Astro.site (used by BaseHead for canonical + OG/Twitter URLs)
  //   - the @astrojs/sitemap integration's absolute URLs
  // Keep this in sync with SITE.url in src/config/site.ts.
  site: 'https://seo-starter-site.vercel.app',

  integrations: [
    // Generates /sitemap-index.xml + /sitemap-0.xml at build time, listing every
    // statically-rendered page. Referenced from robots.txt so crawlers find it.
    sitemap(),
  ],
});
