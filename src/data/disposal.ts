/**
 * disposal.ts — where material goes after it leaves the property.
 *
 * Answers "what happens to my stuff" and "do you donate or recycle", which are
 * among the most-asked questions in junk removal and a genuine differentiator
 * when answered honestly.
 *
 * RELATIONSHIP OWNERSHIP: this module owns `route -> material categories`. The
 * inverse (which routes a material category can take) is derived in
 * src/lib/knowledge.ts via `disposalRoutesForCategory()`.
 *
 * HONESTY CONSTRAINT: no named donation or recycling partner appears here. The
 * business has not supplied verified partner relationships, and naming a charity
 * we do not actually deliver to would be a fabricated claim. Routes describe what
 * generally happens to a material type, which is true and useful, and
 * `partners` stays empty until real relationships are confirmed.
 */
import type { Verifiable } from './ontology';

export interface DisposalRoute {
  slug: string;
  name: string;
  /** One-line summary used in compact flow diagrams. */
  summary: string;
  /** Fuller explanation for the disposal section on a service page. */
  detail: string;
  /**
   * Material category slugs (materials.ts) that commonly take this route.
   * CANONICAL DIRECTION for the route/category relationship.
   */
  categories: string[];
  /** What has to be true for material to actually go this way. */
  conditions: string[];
  /**
   * Named partner facilities or charities. Empty until verified, because naming
   * an unconfirmed partner is a fabricated business claim.
   */
  partners: (Verifiable & { name: string; kind: 'charity' | 'recycler' | 'facility' })[];
  /** Display order in the flow, best outcome first. */
  order: number;
}

export const disposalRoutes: DisposalRoute[] = [
  {
    slug: 'donation',
    name: 'Donation',
    summary: 'Usable items are set aside for reuse before anything else happens.',
    detail:
      'Furniture, working appliances, household goods, and usable building materials are separated during loading whenever their condition allows. Items have to be clean, structurally sound, and complete to be worth routing for reuse, so the crew makes that call at the property while the load is going on.',
    categories: ['furniture', 'appliances', 'household-goods', 'electronics', 'office-commercial'],
    conditions: [
      'Item is clean and free of damage that would prevent reuse',
      'All parts, hardware, or remotes are present',
      'Upholstered items are free of stains, tears, pet damage, and odor',
      'Appliances are in working order',
    ],
    partners: [],
    order: 1,
  },
  {
    slug: 'recycling',
    name: 'Recycling',
    summary: 'Metal, cardboard, and clean single-material loads are routed for recovery.',
    detail:
      'Scrap metal, appliances with recoverable steel, clean cardboard, and untreated wood can be separated and taken to a recovery facility rather than a landfill. This works best when the material is not mixed with general trash, which is why a garage cleanout often recycles more than a bagged household load.',
    categories: ['appliances', 'construction-debris', 'garage-storage', 'office-commercial'],
    conditions: [
      'Material is sorted rather than mixed with general household trash',
      'Metal is free of significant non-metal attachments',
      'Wood is untreated and unpainted',
    ],
    partners: [],
    order: 2,
  },
  {
    slug: 'e-waste',
    name: 'Electronics recovery',
    summary: 'Screens, computers, and small electronics go to an electronics handler.',
    detail:
      'Televisions, monitors, computers, printers, and small electronics contain material that should not go into a general landfill, and several categories are restricted from normal disposal. These are separated on the truck and taken to a handler set up for them.',
    categories: ['electronics', 'office-commercial'],
    conditions: [
      'Screens are intact enough to transport safely',
      'Items are separated from general junk during loading',
    ],
    partners: [],
    order: 3,
  },
  {
    slug: 'green-waste',
    name: 'Green waste',
    summary: 'Branches, brush, and yard trimmings are taken to a green waste facility.',
    detail:
      'Clean organic yard material can be processed into mulch or compost instead of being buried. It has to be free of trash, plastic bags, dirt, and rock, which is why loose piles and paper yard bags work better than plastic contractor bags.',
    categories: ['yard-green-waste'],
    conditions: [
      'Material is free of trash, plastic, and construction debris',
      'Soil and rock are separated out, as they are handled differently',
    ],
    partners: [],
    order: 4,
  },
  {
    slug: 'transfer-station',
    name: 'Transfer station',
    summary: 'Mixed loads are weighed and sorted at a licensed facility.',
    detail:
      'Most mixed household and cleanout loads go to a licensed transfer station, where they are weighed and separated further. This is where disposal fees are set by weight, which is why heavy material affects the price of a job more than bulky light material does.',
    categories: ['household-goods', 'furniture', 'garage-storage', 'construction-debris'],
    conditions: ['Load contains no prohibited or hazardous material'],
    partners: [],
    order: 5,
  },
  {
    slug: 'heavy-material',
    name: 'Heavy material disposal',
    summary: 'Concrete, tile, brick, and soil go to a facility that accepts inert debris.',
    detail:
      'Dense construction material is charged by weight and often has to go to a facility separate from general waste. A small volume of it can weigh more than an entire truck of furniture, which is why these loads are quoted differently.',
    categories: ['heavy-materials'],
    conditions: [
      'Material is separated from general debris',
      'Load is within the safe weight limit for the equipment',
    ],
    partners: [],
    order: 6,
  },
  {
    slug: 'landfill',
    name: 'Landfill',
    summary: 'What cannot be reused, recycled, or recovered is disposed of properly.',
    detail:
      'Some material has no reuse or recovery path: damaged upholstery, contaminated items, and mixed waste that cannot be separated economically. It is disposed of at a licensed site. Routing as much as possible to the options above is what keeps this portion smaller.',
    categories: ['household-goods', 'furniture', 'mattresses-bedding'],
    conditions: [],
    partners: [],
    order: 7,
  },
  {
    slug: 'specialty',
    name: 'Specialty handling',
    summary: 'A few items need a dedicated facility and are quoted separately.',
    detail:
      'Some material is accepted but cannot ride in a general load, and a few categories cannot be taken at all. Where we cannot take something, the goal is to point you at who can rather than leave you guessing.',
    categories: ['prohibited', 'heavy-materials'],
    conditions: ['Handled case by case, confirmed before the pickup is scheduled'],
    partners: [],
    order: 8,
  },
];

export const getDisposalRoute = (slug: string): DisposalRoute | undefined =>
  disposalRoutes.find((r) => r.slug === slug);

/** Routes in presentation order, best outcome first. */
export const disposalFlow = (): DisposalRoute[] =>
  [...disposalRoutes].sort((a, b) => a.order - b.order);
