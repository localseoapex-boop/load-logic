# Load Logic

The marketing site for **Load Logic**, built with [Astro](https://astro.build). It ships an SEO-focused content framework with structured data (schema.org), multi-office support, location and service landing pages, and a Markdown-driven blog.

## 📚 Framework Documentation

Before making changes to this project, review these documents in order:

1. **Project Philosophy** (`docs/project-philosophy.md`) – Understand the principles and architectural goals of the framework.
2. **Copywriting Standards** (`docs/copywriting-standards.md`) – Follow the writing standards for all content.
3. **SEO Methodology Interview** (`docs/seo-methodology-interview.md`) – Understand the reasoning behind the framework's SEO decisions.
4. **SEO Standards** *(Coming Soon)* – The official SEO playbook built from the methodology interview.

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

## 🧭 Project Philosophy

This project is a reusable framework for building local service business websites, not a one-off site. Before making architectural changes, developers and AI assistants should read [`docs/project-philosophy.md`](docs/project-philosophy.md).

It explains the principles the framework is built on: configurable systems over hardcoded logic, data-driven page generation, SEO as part of the architecture, performance, simplicity, and the local SEO model where the primary office city lives on the homepage and core service pages while surrounding markets get service-area pages.

## ✍️ Copywriting Standards

All site copy follows the rules in [`docs/copywriting-standards.md`](docs/copywriting-standards.md). This covers the homepage, service pages, service area pages, blog posts, FAQs, meta titles and descriptions, CTAs, and landing pages.

Before creating or editing any content on this site, developers and AI assistants must read that file and follow it. The goal is copy that reads like an experienced local copywriter wrote it: natural, trustworthy, and free of AI clichés and corporate filler.

## 🔎 SEO Methodology Interview

Before making SEO-related architecture or content decisions, review [`docs/seo-methodology-interview.md`](docs/seo-methodology-interview.md).

This document captures the reasoning behind the framework's SEO decisions through a structured question-and-answer interview covering website architecture, URL strategy, internal linking, content strategy, local SEO, technical SEO, and overall framework philosophy.

It serves as the raw methodology behind the framework. The answers captured in this document will be distilled into `docs/seo-standards.md`, which will become the official SEO playbook for every website built from this framework.

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
