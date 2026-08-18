// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // `site` is the canonical absolute origin. It powers:
  //   - Astro.site (used by BaseHead for canonical + OG/Twitter URLs)
  //   - the @astrojs/sitemap integration's absolute URLs
  // Keep this in sync with SITE.url in src/config/site.ts.
  site: 'https://load-logic.vercel.app',

  integrations: [
    // Generates /sitemap-index.xml + /sitemap-0.xml at build time from every
    // statically-rendered page. Referenced from robots.txt so crawlers find it.
    //
    // Two kinds of exclusion, and both matter:
    //
    //   /knowledge.json  a machine-readable description of the business for AI
    //                    and agentic consumers, not a page to index. Everything
    //                    in it is visible elsewhere on the site.
    //
    //   /quote, /quote/thanks  both carry `noindex`. A URL that is listed in the
    //                    sitemap while telling crawlers not to index it is a
    //                    contradictory signal, so they are excluded here too.
    //                    Keep this list in step with any page that sets noindex.
    sitemap({
      filter: (page) =>
        !page.endsWith('/knowledge.json') &&
        !/\/quote\/?$/.test(page) &&
        !/\/quote\/thanks\/?$/.test(page),
    }),
  ],
});

// NOTE: the knowledge-graph integrity check does NOT live here. A dynamic
// import inside an integration hook is resolved by Node rather than by Vite, so
// the extensionless TypeScript imports in src/lib/knowledge.ts cannot resolve.
// The check runs instead inside src/pages/knowledge.json.ts, which Vite does
// compile, so a broken relationship fails the build there. See that file.
