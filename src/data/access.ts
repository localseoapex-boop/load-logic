/**
 * access.ts — the physical conditions of a job that change the work.
 *
 * Access is the single biggest reason a quote given over the phone turns out to
 * be wrong. Two identical sofas cost different amounts to remove if one is at
 * the curb and the other is on the third floor of a walk-up at the back of a
 * gated complex.
 *
 * Being explicit about this does three useful things: it makes the pricing
 * explanation honest, it tells the visitor what to mention when requesting a
 * quote, and it gives the quote form a reason to ask the right questions.
 *
 * ─────────────────────── Relationship ownership ───────────────────────
 *
 * ACCESS FACTOR owns:
 *   accessFactor -> pricingFactors  (which pricing inputs it feeds)
 *
 * propertyType -> accessFactor is owned by property-types.ts.
 * location -> accessFactor is owned by locations.ts (`accessNotes`).
 * Inverses are derived in src/lib/knowledge.ts.
 */

export interface AccessFactor {
  slug: string;
  name: string;
  /** Phrased as the visitor experiences it. */
  question: string;
  /** What it actually changes about the job. */
  effect: string;
  /** What to tell us when requesting a quote, so the price holds. */
  tellUs: string;
  /** Pricing factor slugs this feeds. CANONICAL. */
  pricingFactors: string[];
  /** Whether this typically increases the quote. */
  affectsPrice: boolean;
  order: number;
}

export const accessFactors: AccessFactor[] = [
  {
    slug: 'curbside',
    name: 'Curbside or driveway',
    question: 'Everything is already outside',
    effect:
      'The fastest and cheapest scenario. The crew loads directly from where the items sit with no carrying through the property.',
    tellUs: 'Let us know items are already out. It often makes same-day scheduling easier.',
    pricingFactors: ['labor'],
    affectsPrice: false,
    order: 1,
  },
  {
    slug: 'inside-home',
    name: 'Inside the home',
    question: 'The items are still in the house',
    effect:
      'The crew removes items from the room they are in and protects floors, walls, and doorways on the way out. This is included, not an extra service.',
    tellUs: 'Tell us which rooms, so we bring the right protection and plan the path out.',
    pricingFactors: ['labor'],
    affectsPrice: false,
    order: 2,
  },
  {
    slug: 'stairs',
    name: 'Stairs',
    question: 'The items are up or down a flight of stairs',
    effect:
      'Every heavy item has to be carried rather than rolled, which adds time and usually a second pair of hands.',
    tellUs: 'How many flights, and whether the stairs turn or are narrow.',
    pricingFactors: ['labor', 'crew-size'],
    affectsPrice: true,
    order: 3,
  },
  {
    slug: 'elevator',
    name: 'Elevator buildings',
    question: 'The unit is in a building with an elevator',
    effect:
      'Elevator size limits what fits in one trip, and many buildings require a reserved service elevator and a certificate of insurance.',
    tellUs: 'Whether the elevator needs booking, and what the building requires from vendors.',
    pricingFactors: ['labor', 'scheduling'],
    affectsPrice: true,
    order: 4,
  },
  {
    slug: 'long-carry',
    name: 'Long carry',
    question: 'The truck cannot park close to the items',
    effect:
      'A long walk from the property to the truck multiplies every trip. It is one of the most commonly missed pricing factors.',
    tellUs: 'Roughly how far from the door to where a truck can park.',
    pricingFactors: ['labor'],
    affectsPrice: true,
    order: 5,
  },
  {
    slug: 'tight-access',
    name: 'Tight access',
    question: 'There are narrow gates, side yards, or doorways',
    effect:
      'Large items may need disassembly to get through, and side yard gates in particular decide whether a backyard job is possible at all.',
    tellUs: 'Gate width and any doorway an oversized item has to pass through.',
    pricingFactors: ['labor', 'disassembly'],
    affectsPrice: true,
    order: 6,
  },
  {
    slug: 'gated-community',
    name: 'Gated communities',
    question: 'The property is behind a gate or guard',
    effect:
      'Arrival depends on gate access being arranged. Without it a crew can lose a scheduling window sitting outside.',
    tellUs: 'Gate code, call-box instructions, or who to list for entry.',
    pricingFactors: ['scheduling'],
    affectsPrice: false,
    order: 7,
  },
  {
    slug: 'apartment',
    name: 'Apartments and condos',
    question: 'The job is in a multi-unit building',
    effect:
      'Loading zones, designated dumpster areas, and quiet hours all shape when and how the work can happen.',
    tellUs: 'Floor, parking situation, and any building rules for vendors.',
    pricingFactors: ['labor', 'scheduling'],
    affectsPrice: true,
    order: 8,
  },
  {
    slug: 'heavy-items',
    name: 'Heavy or oversized items',
    question: 'Something is extremely heavy',
    effect:
      'Safes, pianos, hot tubs, and stone countertops need more crew, sometimes equipment, and always advance planning.',
    tellUs: 'What the item is, rough dimensions, and whether it is bolted or built in.',
    pricingFactors: ['crew-size', 'weight', 'disassembly'],
    affectsPrice: true,
    order: 9,
  },
  {
    slug: 'disassembly',
    name: 'Disassembly required',
    question: 'It has to be taken apart to come out',
    effect:
      'Hot tubs, sheds, playsets, and some furniture are cut down or dismantled on site before they can be loaded.',
    tellUs: 'What needs taking apart, and whether it is anchored or set in concrete.',
    pricingFactors: ['labor', 'disassembly'],
    affectsPrice: true,
    order: 10,
  },
  {
    slug: 'unoccupied',
    name: 'Nobody on site',
    question: 'I cannot be there when the crew arrives',
    effect:
      'Common for turnovers and estates. It works when access and scope are agreed in advance so nothing needs a decision at the door.',
    tellUs: 'How the crew gets in, and exactly what should and should not be removed.',
    pricingFactors: ['scheduling'],
    affectsPrice: false,
    order: 11,
  },
  {
    slug: 'after-hours',
    name: 'Outside business hours',
    question: 'The work has to happen when we are closed',
    effect:
      'Commercial jobs often need to run before opening or after closing to avoid disrupting customers or staff.',
    tellUs: 'The window that works, and any building access limits during it.',
    pricingFactors: ['scheduling'],
    affectsPrice: true,
    order: 12,
  },
];

export const getAccessFactor = (slug: string): AccessFactor | undefined =>
  accessFactors.find((a) => a.slug === slug);

/** The factors that change a quote, for the pricing explanation. */
export const pricingRelevantAccess = (): AccessFactor[] =>
  accessFactors.filter((a) => a.affectsPrice);

/** The "what to tell us" checklist used by the quote form and prep guide. */
export const accessChecklist = (): { name: string; tellUs: string }[] =>
  accessFactors.filter((a) => a.affectsPrice).map((a) => ({ name: a.name, tellUs: a.tellUs }));
