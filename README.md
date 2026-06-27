# Load Logic

The marketing site for **Load Logic**, built with [Astro](https://astro.build). It ships an SEO-focused content framework with structured data (schema.org), multi-office support, location and service landing pages, and a Markdown-driven blog.

## 🚀 Project Structure

```text
/
├── public/                 # Static assets (favicon, OG images, robots.txt)
├── scripts/
│   └── generate-og.mjs     # Generates Open Graph share images at build time
├── src
│   ├── config/
│   │   └── site.ts         # Brand-level config: name, URL, nav, footer, business defaults
│   ├── content/
│   │   └── blog/           # Markdown blog posts (content collection)
│   ├── content.config.ts   # Content collection schema
│   ├── data/
│   │   └── offices.ts       # Per-office NAP/hours — source of truth for LocalBusiness schema
│   ├── layouts/            # Base, city, and service page layouts
│   └── pages/              # Routes: home, services, locations, blog
└── package.json
```

Brand and business details live in `src/config/site.ts` (org-level) and `src/data/offices.ts` (per-office NAP, hours, and service areas). The canonical site origin is set in both `astro.config.mjs` and `SITE.url` — keep them in sync.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run og`              | Regenerate Open Graph share images               |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |

## 👀 Want to learn more?

Refer to the [Astro documentation](https://docs.astro.build) for framework details.
