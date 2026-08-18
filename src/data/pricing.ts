/**
 * pricing.ts — how a junk removal job is priced, and how much junk a person has.
 *
 * Two jobs in one module because they are the same question asked twice. "How
 * much will this cost" is unanswerable until "how much junk do you have" is
 * answered, and volume is the primary input to the price.
 *
 * ─────────────────────────── Honesty contract ───────────────────────────
 *
 * NO DOLLAR FIGURES ARE INVENTED HERE. Every monetary value sits behind a
 * `published` flag and is absent until the business supplies real numbers.
 * Components read `isPricingPublished()` and render the structure, the factors,
 * and the load scale without amounts until then. Publishing a plausible-looking
 * price a customer might rely on is exactly the kind of fabrication this data
 * layer exists to prevent.
 *
 * `cubicYards` IS now populated, because the equipment is confirmed. The
 * reference volume is the 9 cubic yard open utility trailer from
 * src/data/equipment.ts, which is the larger of the two trailers and therefore
 * the maximum single-trip capacity. A "full load" means that trailer filled.
 *
 * The business runs one tow vehicle, so only one trailer is hitched at a time.
 * Anything bigger than a full load is several trips, quoted together. Components
 * describing large cleanouts must say so rather than implying unlimited capacity.
 * See `fleetLimits` in src/data/equipment.ts.
 *
 * ─────────────────────── Relationship ownership ───────────────────────
 *
 * LOAD SIZE owns:
 *   loadSize -> situations   (what typically produces this much)
 *   loadSize -> services     (which services commonly run at this size)
 *
 * PRICING FACTOR owns:
 *   pricingFactor -> services  ('all' or specific slugs)
 *
 * situation -> typicalLoad is owned by situations.ts.
 * accessFactor -> pricingFactors is owned by access.ts.
 * Inverses derived in src/lib/knowledge.ts.
 */

/** A money value that only exists once the business has supplied it. */
export interface PriceRange {
  published: boolean;
  currency: 'USD';
  min?: number;
  max?: number;
  /** Shown instead of an amount while unpublished. */
  note?: string;
}

const unpublished = (note: string): PriceRange => ({
  published: false,
  currency: 'USD',
  note,
});

export interface LoadSize {
  slug: string;
  name: string;
  /** Portion of one full trailer load, used to draw the visual scale. */
  fraction: number;
  summary: string;
  /**
   * Relative volume descriptions. Kept alongside `cubicYards` because "a packed
   * two-car garage" is far easier for a homeowner to judge than a number.
   */
  exampleContents: string[];
  /** Situation slugs that typically produce this much. CANONICAL. */
  situations: string[];
  /** Service slugs commonly booked at this size. CANONICAL. */
  services: string[];
  /**
   * Diagram id for this step of the load scale.
   *
   * Resolves to src/assets/diagrams/<image>.svg, NOT to a photograph. The scale
   * is drawn rather than shot because a measuring instrument has to be identical
   * in every frame, and generated photography could not hold the trailer steady
   * while the load changed. See docs/image-art-direction.md section 5.2.
   */
  image: string;
  /** Absolute volume, from the 9 cu yd reference trailer. See equipment.ts. */
  cubicYards?: number;
  price: PriceRange;
  order: number;
}

export const loadSizes: LoadSize[] = [
  {
    slug: 'single-item',
    name: 'Single item',
    fraction: 0.08,
    summary: 'One bulky thing that will not fit in a car and cannot go out with the trash.',
    exampleContents: ['A sofa', 'A mattress and box spring', 'A refrigerator', 'A treadmill'],
    situations: ['replacing-furniture', 'replacing-appliance'],
    services: ['furniture-removal', 'mattress-removal', 'appliance-removal', 'same-day-junk-removal'],
    image: 'load-single-item',
    cubicYards: 0.75,
    price: unpublished('Single items are quoted individually. Send a photo for a firm price.'),
    order: 1,
  },
  {
    slug: 'small',
    name: 'Small load',
    fraction: 0.15,
    summary: 'A few items, or one corner of a room cleared out.',
    exampleContents: [
      'A bedroom set',
      'Eight to ten bags and boxes',
      'A patio set and a grill',
      'Two or three appliances',
    ],
    situations: ['replacing-furniture', 'yard-cleanup'],
    services: ['junk-removal', 'furniture-removal', 'yard-waste-removal'],
    image: 'load-small',
    cubicYards: 1.5,
    price: unpublished('Quoted from photos or a short description.'),
    order: 2,
  },
  {
    slug: 'quarter',
    name: 'Quarter load',
    fraction: 0.25,
    summary: 'About a quarter of the trailer. One small room, or a modest yard cleanup.',
    exampleContents: [
      'A cleared home office',
      'A pile of branches and trimmings',
      'The contents of a small shed',
      'A dozen boxes plus a couple of pieces of furniture',
    ],
    situations: ['yard-cleanup', 'garage-reset'],
    services: ['junk-removal', 'yard-waste-removal', 'garage-cleanouts', 'shed-removal'],
    image: 'load-quarter',
    cubicYards: 2.25,
    price: unpublished('Volume-based. Confirmed on site before loading starts.'),
    order: 3,
  },
  {
    slug: 'half',
    name: 'Half load',
    fraction: 0.5,
    summary: 'Half the trailer. A one-car garage, or a full room of furniture and boxes.',
    exampleContents: [
      'A single-car garage cleared out',
      'A living room and a bedroom',
      'Debris from a bathroom remodel',
      'A tenant move-out from a one-bedroom unit',
    ],
    situations: ['garage-reset', 'moving-out', 'rental-turnover', 'renovation-cleanup'],
    services: ['garage-cleanouts', 'junk-removal', 'construction-debris-removal', 'foreclosure-cleanouts'],
    image: 'load-half',
    cubicYards: 4.5,
    price: unpublished('Volume-based. Confirmed on site before loading starts.'),
    order: 4,
  },
  {
    slug: 'three-quarter',
    name: 'Three-quarter load',
    fraction: 0.75,
    summary: 'Most of the trailer. A two-car garage, or several rooms at once.',
    exampleContents: [
      'A packed two-car garage',
      'Most of a two-bedroom apartment',
      'An office suite of desks and chairs',
      'A hot tub plus surrounding decking',
    ],
    situations: ['downsizing', 'pre-sale-prep', 'office-change', 'backyard-project'],
    services: ['garage-cleanouts', 'estate-cleanouts', 'office-cleanouts', 'hot-tub-removal'],
    image: 'load-three-quarter',
    cubicYards: 6.75,
    price: unpublished('Volume-based. Confirmed on site before loading starts.'),
    order: 5,
  },
  {
    slug: 'full',
    name: 'Full load',
    fraction: 1,
    summary:
      'The trailer filled to the rails. Bigger jobs than this are planned as several trips and quoted together.',
    exampleContents: [
      'A packed garage plus a room of furniture',
      'A one-bedroom apartment cleared completely',
      'A large yard and shed clearance',
      'One load of a multi-load estate cleanout',
    ],
    situations: ['estate-settlement', 'foreclosure-turnover', 'hoarding-cleanup'],
    services: ['estate-cleanouts', 'foreclosure-cleanouts', 'hoarder-cleanouts', 'junk-removal'],
    image: 'load-full',
    cubicYards: 9,
    price: unpublished('Large jobs are quoted on site or from photos. Multiple loads are priced together.'),
    order: 6,
  },
];

/* ───────────────────────── Pricing factors ───────────────────────── */

export interface PricingFactor {
  slug: string;
  name: string;
  /** How this input changes the price, in plain terms. */
  explanation: string;
  /** Service slugs affected, or 'all'. CANONICAL. */
  services: string[] | 'all';
  /** Whether this is the dominant input for most jobs. */
  primary: boolean;
  order: number;
}

export const pricingFactors: PricingFactor[] = [
  {
    slug: 'volume',
    name: 'How much space it takes',
    explanation:
      'The main input for most jobs. Price is based on the share of the truck your items fill, which is why the load scale above is the fastest way to get close to a real number.',
    services: 'all',
    primary: true,
    order: 1,
  },
  {
    slug: 'weight',
    name: 'How heavy it is',
    explanation:
      'Disposal facilities charge by weight. A small pile of concrete, tile, or dirt can weigh more than an entire truck of furniture, so dense material is priced differently from bulky material.',
    services: ['construction-debris-removal', 'junk-removal', 'yard-waste-removal', 'hot-tub-removal'],
    primary: true,
    order: 2,
  },
  {
    slug: 'labor',
    name: 'How much carrying is involved',
    explanation:
      'Items already at the curb load fastest. Items upstairs, at the back of a property, or a long way from where the truck can park take more time and more hands.',
    services: 'all',
    primary: true,
    order: 3,
  },
  {
    slug: 'disassembly',
    name: 'Whether it has to be taken apart',
    explanation:
      'Hot tubs, sheds, playsets, and some oversized furniture are cut down or dismantled on site before they can be loaded. That is work in its own right.',
    services: ['hot-tub-removal', 'shed-removal', 'construction-debris-removal', 'furniture-removal'],
    primary: false,
    order: 4,
  },
  {
    slug: 'crew-size',
    name: 'How many people it takes',
    explanation:
      'Most jobs run with a standard crew. Extremely heavy items, multi-floor carries, and large cleanouts need more people, which is factored into the quote.',
    services: 'all',
    primary: false,
    order: 5,
  },
  {
    slug: 'disposal-fees',
    name: 'Where the material has to go',
    explanation:
      'Different material takes different routes, and those routes cost different amounts. Electronics, refrigerant-containing appliances, and heavy debris all carry their own handling costs.',
    services: 'all',
    primary: false,
    order: 6,
  },
  {
    slug: 'scheduling',
    name: 'When you need it done',
    explanation:
      'Standard scheduling fits your job into an existing route. Same-day and outside-hours work depends on what is already booked that day.',
    services: 'all',
    primary: false,
    order: 7,
  },
  {
    slug: 'travel',
    name: 'Where the property is',
    explanation:
      'Jobs across the East Valley are priced the same way. Properties well outside the regular service area may carry a travel consideration, which is discussed before booking rather than added afterwards.',
    services: 'all',
    primary: false,
    order: 8,
  },
];

/* ───────────────────────── Commercial terms ───────────────────────── */

export interface PricingTerms {
  /** The smallest job the business will take, and what it covers. */
  minimum: PriceRange & { description: string };
  /** How and when the price is agreed. */
  commitments: string[];
  /** Payment methods. Empty until confirmed. */
  paymentMethods: string[];
}

export const pricingTerms: PricingTerms = {
  minimum: {
    ...unpublished('Minimum pickup pricing has not been published yet.'),
    description:
      'Every job has a minimum that covers getting a crew and truck to the property, even for a single item.',
  },
  commitments: [
    'You get the price before anything is loaded',
    'The quote is based on what the crew can actually see, not an estimate over the phone',
    'Nothing is loaded until you agree to the number',
    'Photos sent ahead of time get you a closer estimate before the crew arrives',
  ],
  paymentMethods: [],
};

/* ─────────────────────────────── Helpers ─────────────────────────────── */

export const getLoadSize = (slug: string): LoadSize | undefined =>
  loadSizes.find((l) => l.slug === slug);

export const getPricingFactor = (slug: string): PricingFactor | undefined =>
  pricingFactors.find((f) => f.slug === slug);

/** True once any real figure has been supplied. Gates all price display. */
export const isPricingPublished = (): boolean =>
  pricingTerms.minimum.published || loadSizes.some((l) => l.price.published);

/** The factors that matter most, for compact pricing summaries. */
export const primaryPricingFactors = (): PricingFactor[] =>
  pricingFactors.filter((f) => f.primary);

/** Factors relevant to one service, preserving declared order. */
export const pricingFactorsForService = (serviceSlug: string): PricingFactor[] =>
  pricingFactors.filter((f) => f.services === 'all' || f.services.includes(serviceSlug));

/** The load scale in visual order, smallest first. */
export const loadScale = (): LoadSize[] => [...loadSizes].sort((a, b) => a.order - b.order);

/**
 * The volume a full load refers to, in cubic yards.
 *
 * Read from the confirmed equipment rather than hardcoded, so replacing a trailer
 * updates every load size at once. Returns undefined if no equipment is
 * confirmed, in which case the scale stays purely relative.
 */
export const referenceCubicYards = (): number | undefined =>
  loadSizes.find((l) => l.fraction === 1)?.cubicYards;

/** Formatted volume for display, e.g. "4.5 cu yd". Empty when unknown. */
export const formatVolume = (load: LoadSize): string =>
  typeof load.cubicYards === 'number' ? `${load.cubicYards} cu yd` : '';
