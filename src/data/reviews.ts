/**
 * reviews.ts — customer reviews, and the gate that keeps unverified ones off the site.
 *
 * ─────────────────────────── Verification gate ───────────────────────────
 *
 * Every review below is `verified: false`, so NOTHING in this module renders.
 * `ReviewWall` and `ReviewInline` return null, review sections collapse, and
 * `aggregateRating()` returns undefined so no AggregateRating or Review schema is
 * emitted anywhere on the site.
 *
 * The three entries are the testimonials that were previously hardcoded in
 * src/pages/index.astro and rendered as though they were real customer quotes.
 * They are preserved here rather than deleted so they can be confirmed and
 * switched on if they turn out to be genuine, but until someone sets
 * `verified: true` with a source, the site makes no social proof claim at all.
 *
 * Publishing invented reviews is both a trust problem and, with schema attached,
 * a search penalty risk. The gate is deliberately all or nothing.
 *
 * ─────────────────────── Relationship ownership ───────────────────────
 *
 * REVIEW owns:
 *   review -> service   (what was done)
 *   review -> location  (where)
 *
 * This is what allows a city page to show reviews from that city, and a service
 * page to show reviews for that service, once real ones exist.
 */
import type { Verifiable } from './ontology';

export type ReviewPlatform = 'google' | 'yelp' | 'facebook' | 'nextdoor' | 'direct';

export interface Review extends Verifiable {
  slug: string;
  /** Customer name as they allow it to be shown. */
  author: string;
  platform: ReviewPlatform;
  /** Out of 5. Only meaningful once verified. */
  rating: number;
  /** ISO date the review was left. */
  date?: string;
  /** Location slug from locations.ts. CANONICAL. */
  location?: string;
  /** Service slug from services.ts. CANONICAL. */
  service?: string;
  text: string;
}

export const reviews: Review[] = [
  {
    slug: 'alvarez-mesa-garage',
    author: 'M. Alvarez',
    platform: 'direct',
    rating: 5,
    location: 'mesa-az',
    service: 'garage-cleanouts',
    text: 'They gave a clear quote from photos, showed up in the window, and had our garage cleared before lunch.',
    verified: false,
  },
  {
    slug: 'morgan-gilbert-furniture',
    author: 'J. Morgan',
    platform: 'direct',
    rating: 5,
    location: 'gilbert-az',
    service: 'furniture-removal',
    text: 'Careful with the walls, quick with the heavy furniture, and they swept the patio before leaving.',
    verified: false,
  },
  {
    slug: 'patel-chandler-rental',
    author: 'R. Patel',
    platform: 'direct',
    rating: 5,
    location: 'chandler-az',
    service: 'foreclosure-cleanouts',
    text: 'I needed a rental cleaned out fast. Load Logic made it simple and kept me updated the whole time.',
    verified: false,
  },
];

/** The ONLY reviews any component may render. */
export const verifiedReviews = (): Review[] => reviews.filter((r) => r.verified);

export const hasVerifiedReviews = (): boolean => verifiedReviews().length > 0;

export const reviewsForLocation = (locationSlug: string): Review[] =>
  verifiedReviews().filter((r) => r.location === locationSlug);

export const reviewsForService = (serviceSlug: string): Review[] =>
  verifiedReviews().filter((r) => r.service === serviceSlug);

export const reviewsForLocationService = (locationSlug: string, serviceSlug: string): Review[] =>
  verifiedReviews().filter((r) => r.location === locationSlug && r.service === serviceSlug);

/**
 * Aggregate rating for schema.org, or undefined when there is nothing verified
 * to aggregate. Callers must omit the schema node entirely when this returns
 * undefined rather than emitting a zero or a placeholder.
 */
export const aggregateRating = (): { ratingValue: number; reviewCount: number } | undefined => {
  const verified = verifiedReviews();
  if (verified.length === 0) return undefined;
  const total = verified.reduce((sum, r) => sum + r.rating, 0);
  return {
    ratingValue: Math.round((total / verified.length) * 10) / 10,
    reviewCount: verified.length,
  };
};
