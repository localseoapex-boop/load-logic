/**
 * pricing.ts — how a junk removal job is priced, and how much junk a person has.
 *
 * Two jobs in one module because they are the same question asked twice. "How
 * much will this cost" is unanswerable until "how much junk do you have" is
 * answered, and volume is the primary input to the price.
 *
 * ─────────────────────────── Pricing basis ───────────────────────────
 *
 * These figures are MARKET BENCHMARKED, not owner-confirmed. They were derived
 * on 2026-08-19 from published Mesa and Maricopa County competitor pricing, then
 * scaled to Load Logic's actual 9 cubic yard utility trailer. See PRICING_BASIS
 * below for the sources and the method.
 *
 * THE OWNER MUST CONFIRM THESE BEFORE THE SITE GOES LIVE. A published price is
 * a number a customer will hold you to. Everything here is a defensible market
 * position rather than a guess, but a market position is still a proposal until
 * the person doing the work agrees to honour it.
 *
 * Ranges rather than fixed prices, deliberately. Volume, weight and access
 * genuinely vary, and a single number would either be wrong or would have to be
 * padded to cover the worst case.
 *
 * `cubicYards` is populated from confirmed equipment. The reference volume is
 * the 9 cubic yard open utility trailer in src/data/equipment.ts, the larger of
 * the two and therefore the maximum single-trip capacity. A "full load" means
 * that trailer filled.
 *
 * THAT NUMBER IS WHY THE PRICES ARE NOT COPIED FROM COMPETITORS. The industry
 * standard truck is 15 to 16 cubic yards, so a competitor's "full truck" holds
 * nearly twice what Load Logic's full trailer does. Charging their full-truck
 * rate for a 9 yard trailer would overcharge by roughly 70% for the volume
 * delivered. Every figure below was converted to a price per cubic yard first,
 * then applied to Load Logic's real capacities.
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
  /**
   * What the figure means. `starting` is a FLOOR: the job begins here and rises
   * with volume, material, access and labour. It is not a ceiling, not a range
   * and not a guaranteed fixed price, and anything rendering it must say so.
   * Modelled explicitly rather than inferred from a missing `max`, because a
   * range whose upper bound simply had not been supplied would otherwise be
   * indistinguishable from a deliberate starting price.
   */
  basis?: 'starting' | 'range' | 'fixed';
  /** Shown instead of an amount while unpublished. */
  note?: string;
}

const unpublished = (note: string): PriceRange => ({
  published: false,
  currency: 'USD',
  note,
});

const usd = (min: number, max: number, note?: string): PriceRange => ({
  published: true,
  currency: 'USD',
  min,
  max,
  basis: 'range',
  note,
});

/** A published floor. See PriceRange.basis. */
const startingAt = (min: number, note?: string): PriceRange => ({
  published: true,
  currency: 'USD',
  min,
  basis: 'starting',
  note,
});

/**
 * PRICING_BASIS — where these numbers came from, so they can be re-derived.
 *
 * Kept in the data layer rather than in a comment because the reasoning is the
 * asset: when the owner revisits prices, or when a competitor moves, this is what
 * tells them whether the position still holds.
 */
export const PRICING_BASIS = {
  derivedOn: '2026-08-19',
  revisedOn: '2026-08-19',
  confirmedByOwner: false,
  referenceCubicYards: 9,
  /**
   * The published model is STARTING prices, not ranges: 110 / 175 / 250 / 350 /
   * 450 / 550 against the 9 cubic yard trailer. Each figure is a floor that
   * rises with volume, material, access and labour. The competitor benchmarks
   * below still describe where the range model came from and remain the basis
   * for sanity-checking the floors.
   */
  model: 'starting',
  method:
    'Competitor prices converted to a price per cubic yard, then applied to Load Logic\'s real 9 cubic yard trailer. Positioned just above the local trailer operators, because Load Logic removes items from inside the property and sorts for donation rather than loading from the curb, and clearly below the national franchise rate.',
  benchmarks: [
    {
      name: 'Just Haul It (Maricopa County)',
      note: 'Closest structural match: a 10.6 cubic yard trailer, not a truck.',
      fullLoad: 380,
      cubicYards: 10.6,
      perCubicYard: 35.8,
    },
    {
      name: 'Junk Rescue AZ',
      note: 'Standard truck. Full load 500 to 600.',
      fullLoad: 550,
      cubicYards: 15.5,
      perCubicYard: 35.5,
    },
    {
      name: 'Arizona franchise-tier guide',
      note: 'Higher end of the market. Full truck 649 to 795.',
      fullLoad: 722,
      cubicYards: 15.5,
      perCubicYard: 46.6,
    },
  ],
  /** Where Load Logic lands, for comparison against the benchmarks above. */
  loadLogicPerCubicYardAtFullLoad: 42,
  marketContext:
    'Reported Mesa average job is 226 to 251 dollars, which is roughly a half to three-quarter load on this scale.',
} as const;

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
    price: startingAt(110),
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
    price: startingAt(175),
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
    price: startingAt(250),
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
    price: startingAt(350),
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
    price: startingAt(450),
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
    price: startingAt(550, 'Larger than this is planned as multiple trips and quoted together.'),
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

/**
 * A charge that sits on top of the volume price.
 *
 * These exist because certain material costs the business real money to dispose
 * of regardless of the space it takes. Stating them up front is the difference
 * between a quote that holds and a conversation on the driveway.
 */
export interface Surcharge {
  slug: string;
  name: string;
  /** Per unit, or undefined when the item is quoted individually. */
  price?: PriceRange;
  reason: string;
  /** What it applies to, in the customer's terms. */
  appliesTo: string;
}

export interface PricingTerms {
  /** The smallest job the business will take, and what it covers. */
  minimum: PriceRange & { description: string };
  /** Charges added on top of the volume price. */
  surcharges: Surcharge[];
  /** How and when the price is agreed. */
  commitments: string[];
  /** Payment methods. Empty until confirmed. */
  paymentMethods: string[];
}

export const pricingTerms: PricingTerms = {
  minimum: {
    /**
     * SUPERSEDED. The $85 minimum belonged to the range model. Under starting
     * prices the single-item figure IS the floor ($110), so publishing a
     * separate, lower minimum alongside it stated two different smallest
     * numbers for the same job. Left unpublished rather than deleted: the
     * concept is still real, and the figure comes back the moment the owner
     * confirms a production model.
     */
    ...unpublished('The smallest job starts at the single-item price.'),
    description:
      'Every job has a floor that covers getting a crew and trailer to the property, even for a single item. If you only have one thing to move, it is worth checking whether anything else can go at the same time.',
  },

  surcharges: [
    {
      slug: 'mattress',
      name: 'Mattress or box spring',
      price: usd(25, 25),
      reason:
        'Mattresses cannot be compressed and most facilities charge a separate fee to take them, so this is a pass-through rather than a markup.',
      appliesTo: 'Each mattress or box spring',
    },
    {
      slug: 'refrigerant',
      name: 'Fridge, freezer or air conditioner',
      price: usd(35, 35),
      reason:
        'Anything containing refrigerant has to be handled separately from the general load and taken to a facility set up for it.',
      appliesTo: 'Each unit containing refrigerant',
    },
    {
      slug: 'heavy-material',
      name: 'Concrete, tile, brick, soil and roofing',
      reason:
        'Dense debris is limited by weight rather than by space, and disposal is charged by the ton locally. A small pile can weigh more than a whole trailer of furniture, so these are quoted from photos rather than off the volume scale.',
      appliesTo: 'Any load of dense construction or landscaping material',
    },
  ],

  commitments: [
    'You get the price before anything is loaded',
    'The quote is based on what the crew can actually see, not an estimate over the phone',
    'Nothing is loaded until you agree to the number',
    'Photos sent ahead of time get you a closer estimate before the crew arrives',
    'The range covers normal access. Stairs, long carries and tight gates are discussed before we book, not after we arrive',
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

/**
 * Format a price for display. Returns an empty string when unpublished, so
 * callers can render the surrounding markup unconditionally and simply get
 * nothing while figures are missing.
 */
export const formatPrice = (price: PriceRange): string => {
  if (!price.published || price.min === undefined) return '';
  if (price.max === undefined || price.max === price.min) return `$${price.min}`;
  return `$${price.min} to $${price.max}`;
};

/**
 * "Starting at $110" for a floor, the plain amount for anything else. The label
 * is part of the string rather than the component's markup so that a starting
 * price cannot be rendered anywhere as a bare number that reads like a fixed one.
 */
export const formatStartingPrice = (price: PriceRange): string => {
  if (!price.published || price.min === undefined) return '';
  return price.basis === 'starting' ? `Starting at $${price.min}` : formatPrice(price);
};

/** Just the amount, for places that supply their own "starting at" label. */
export const formatAmount = (price: PriceRange): string =>
  !price.published || price.min === undefined ? '' : `$${price.min}`;

/**
 * Compact range for the load scale, where six prices stack into a column and
 * need to align as readings rather than as sentences. "$85 to $125" wraps in a
 * narrow measure and breaks that alignment; "$85-125" does not. Prose contexts
 * keep formatPrice.
 */
export const formatPriceCompact = (price: PriceRange): string => {
  if (!price.published || price.min === undefined) return '';
  if (price.max === undefined || price.max === price.min) return `$${price.min}`;
  return `$${price.min}\u2013${price.max}`;
};

/** Surcharges with a published per-unit figure. */
export const publishedSurcharges = () =>
  pricingTerms.surcharges.filter((s) => s.price?.published);

/** Surcharges quoted case by case rather than at a fixed rate. */
export const quotedSurcharges = () =>
  pricingTerms.surcharges.filter((s) => !s.price?.published);

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
