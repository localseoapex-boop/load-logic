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
/* ─────────────────────── TEMPORARY TESTIMONIALS ───────────────────────
 *
 * ⚠️  THESE ARE NOT REAL CUSTOMER REVIEWS.  ⚠️
 *
 * Approved as temporary homepage display content while real reviews are being
 * collected. They are held in a SEPARATE array from `reviews`, so they can never
 * reach `verifiedReviews()` and can never be picked up by anything that renders
 * genuine testimonials. Every entry carries `isPlaceholder: true`.
 *
 * WHAT THEY DELIBERATELY DO NOT CARRY, and why:
 *
 *   no platform   attributing invented copy to Google, Yelp or Facebook would
 *                 be a false statement about a third party
 *   no rating     a star count on invented copy is invented data
 *   no date       a date implies a documented, datable transaction
 *   no link       there is nothing to link to
 *
 * The display names are first name plus last initial, chosen as neutral
 * stand-ins. Nothing here emits Review or AggregateRating structured data, and
 * none may be added until real reviews with real provenance replace this array.
 *
 * TO REPLACE: move each confirmed review into `reviews` above with
 * `verified: true`, a real author, platform, rating, date and ideally a link,
 * then delete this array. `Testimonials.astro` prefers verified reviews
 * automatically, so no component or layout work is needed.
 */
export interface PlaceholderReview {
  slug: string;
  /** Temporary display name: first name plus last initial. */
  author: string;
  /** City only, for tone. Not a verified location claim. */
  city: string;
  text: string;
  /** Always true. The flag exists so this can never be mistaken for real data. */
  isPlaceholder: true;
}

export const placeholderReviews: PlaceholderReview[] = [
  {
    slug: 'placeholder-garage',
    author: 'Marcus R.',
    city: 'Mesa',
    text: 'Load Logic made our garage cleanout incredibly easy. We sent photos, got a clear estimate and they handled all of the heavy lifting. The whole process was straightforward from start to finish.',
    isPlaceholder: true,
  },
  {
    slug: 'placeholder-bulky',
    author: 'Dana K.',
    city: 'Gilbert',
    text: 'We needed an old sectional, mattress and a few other bulky items removed. Communication was quick, pricing was explained upfront and everything was hauled away without us having to move it outside.',
    isPlaceholder: true,
  },
  {
    slug: 'placeholder-yard',
    author: 'Priya S.',
    city: 'East Valley',
    text: 'Fast response and an easy process. We had yard debris and household junk that had been piling up, and they cleared everything out in one visit.',
    isPlaceholder: true,
  },
];

export const verifiedReviews = (): Review[] => reviews.filter((r) => r.verified);

export const hasVerifiedReviews = (): boolean => verifiedReviews().length > 0;

/** True while the reviews section is showing invented copy. */
export const usingPlaceholderReviews = (): boolean =>
  verifiedReviews().length === 0 && placeholderReviews.length > 0;


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
