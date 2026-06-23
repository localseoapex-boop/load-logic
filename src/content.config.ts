/**
 * content.config.ts — Astro Content Collections config (Content Layer API).
 *
 * Defines the `blog` collection: where its entries live (the glob loader) and
 * the SCHEMA every post must satisfy (Zod). The schema is validated at build
 * time, so a typo'd or missing field fails the build instead of silently
 * shipping a broken page. This replaces the old hardcoded `posts` array.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // Content Layer loader: every .md file under src/content/blog becomes an entry.
  // The entry `id` is the filename without extension (e.g. "water-heater-signs").
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),

  // Frontmatter contract. Editors get autocomplete + type safety from this.
  schema: z.object({
    // Kept short so it isn't truncated in search results.
    title: z.string().max(70, 'Keep titles under ~70 characters for SERP display'),
    // Meta description: enforced length keeps it in Google's display window.
    description: z
      .string()
      .min(50, 'Description is too short for a good meta description')
      .max(160, 'Meta descriptions should be ~150–160 characters'),
    // z.coerce.date() parses the YAML "2026-06-01" string into a real Date.
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Acme Home Services'),
    /** Optional social/hero image path (under /public or an absolute URL). */
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    /** Drafts are excluded from listing + routing until set false. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
