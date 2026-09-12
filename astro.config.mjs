// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // `site` is the canonical absolute origin. It powers:
  //   - Astro.site (used by BaseHead for canonical + OG/Twitter URLs)
  //   - the @astrojs/sitemap integration's absolute URLs
  // Keep this in sync with SITE.url in src/config/site.ts.
  site: 'https://loadlogicjr.com',

  // The site stays static. `output: 'static'` is Astro's default and every page
  // in src/pages is prerendered at build time exactly as before; the adapter is
  // here only so that the ONE route that genuinely cannot be static —
  // src/pages/api/quote.ts, which receives the lead form POST — can opt out with
  // `export const prerender = false`. Nothing else in the project sets that flag,
  // so the page count, the URLs, and the sitemap are unchanged. Verify after any
  // adapter change that the build still reports 34 prerendered pages.
  adapter: vercel(),

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
    //
    //   /mesa25          direct-mail landing page, `noindex`. Campaign pages
    //                    are listed in src/data/campaigns.ts; each one's path
    //                    belongs here as well.
    sitemap({
      filter: (page) =>
        !page.endsWith('/knowledge.json') &&
        !/\/quote\/?$/.test(page) &&
        !/\/quote\/thanks\/?$/.test(page) &&
        !/\/mesa25\/?$/.test(page),
    }),
  ],
});

// NOTE: the knowledge-graph integrity check does NOT live here. A dynamic
// import inside an integration hook is resolved by Node rather than by Vite, so
// the extensionless TypeScript imports in src/lib/knowledge.ts cannot resolve.
// The check runs instead inside src/pages/knowledge.json.ts, which Vite does
// compile, so a broken relationship fails the build there. See that file.
