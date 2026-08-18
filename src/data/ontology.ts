/**
 * ontology.ts — the shared vocabulary for the site's structured business knowledge.
 *
 * The data layer is not a bag of content objects that happen to fill UI slots. It
 * is a small knowledge graph describing how the business actually works: which
 * services handle which materials, which situations lead a person to which
 * service, what drives price, where material goes afterwards, and which of those
 * relationships hold in which city.
 *
 * That graph serves three consumers at once:
 *   1. the UI, which reads it to build every page
 *   2. search engines, via schema.org emitted from the same relationships
 *   3. AI systems and future agentic experiences, which need to answer questions
 *      like "can you take a hot tub in Gilbert and what would affect the price"
 *      without scraping prose
 *
 * ─────────────────────────── Modelling rules ───────────────────────────
 *
 * 1. EVERY entity has a `slug` that is unique within its kind. Slugs are the
 *    only identifiers used in relationships. Never reference an entity by name.
 *
 * 2. Relationships are stored in exactly ONE canonical direction and the inverse
 *    is derived at read time by src/lib/knowledge.ts. Storing both directions is
 *    how a graph drifts out of sync, so we never do it. Each relationship below
 *    documents which side owns it.
 *
 * 3. Entities that assert something about the real business carry a verification
 *    flag. A component renders a `Verifiable` entity only when it is verified,
 *    and renders nothing otherwise. We never ship a plausible-looking placeholder
 *    that a visitor would read as fact.
 *
 * 4. Dangling references are build failures, not silent gaps. `assertGraphIntegrity()`
 *    in src/lib/knowledge.ts walks every relationship and throws on a broken ref.
 */

/** Every entity kind in the graph. Used for typed cross-entity references. */
export type EntityKind =
  | 'business'
  | 'office'
  | 'service'
  | 'subservice'
  | 'location'
  | 'materialCategory'
  | 'material'
  | 'situation'
  | 'propertyType'
  | 'loadSize'
  | 'pricingFactor'
  | 'accessFactor'
  | 'disposalRoute'
  | 'equipment'
  | 'faq'
  | 'job'
  | 'review'
  | 'quoteAction';

/**
 * A typed pointer at another entity. Used where a relationship can target more
 * than one kind (FAQ subjects, job contents, schema `about`).
 */
export interface EntityRef {
  kind: EntityKind;
  slug: string;
}

/** Convenience constructor so call sites read as prose. */
export const ref = (kind: EntityKind, slug: string): EntityRef => ({ kind, slug });

/**
 * Anything asserting a checkable fact about the business: reviews, credentials,
 * completed jobs, published prices.
 *
 * `verified: false` means "the structure exists, the fact does not yet". The UI
 * must hide it. There is deliberately no third state, because "probably true" is
 * how sites end up publishing invented credentials.
 */
export interface Verifiable {
  verified: boolean;
  /** Where the claim can be checked. Required once verified. */
  source?: string;
  /** ISO date the claim was last confirmed. */
  confirmedAt?: string;
}

/**
 * Scope of a piece of content within the graph. Drives which page a FAQ appears
 * on, and which schema node it attaches to.
 */
export type Scope =
  | { kind: 'global' }
  | { kind: 'service'; slug: string }
  | { kind: 'subservice'; slug: string }
  | { kind: 'location'; slug: string }
  | { kind: 'topic'; slug: 'pricing' | 'process' | 'quote' | 'disposal' | 'access' };

/** Whether the business will take a given material, and under what conditions. */
export type AcceptanceStatus =
  | 'accepted'
  /** Taken, but with a condition the customer must meet or that affects price. */
  | 'restricted'
  /** Never taken. Always paired with a reason and, where possible, an alternative. */
  | 'prohibited';

/** Shared shape for the small "explain a tradeoff" entities used by comparisons. */
export interface ComparisonRow {
  /** What is being compared, e.g. "Loading the truck". */
  dimension: string;
  /** The do-it-yourself or alternative-option outcome. */
  alternative: string;
  /** The Load Logic outcome. */
  loadLogic: string;
}
