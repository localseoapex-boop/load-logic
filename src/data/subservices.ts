/**
 * subservices.ts — individual services offered under a core category (req #1, #2).
 *
 * Each sub-service belongs to ONE parent category (a slug from services.ts) and
 * drives two page tiers:
 *   - /services/[category]/[subservice]            (parent sub-service page)
 *   - /locations/[city]/[category]/[subservice]    (location sub-service page)
 *
 * Availability rule (req #9): a sub-service is offered in a city iff that city
 * offers its PARENT category (see locations.ts `services` + lib/links). So we
 * never store per-city sub-service flags — coverage is inherited from the
 * category, which keeps the model small and impossible to get inconsistent.
 *
 * Load Logic keeps the catalog flat (each service is its own category), and uses
 * this tier to split the flagship "Junk Removal" category into the two highest-
 * intent audiences: residential and commercial. Adding a row here automatically
 * generates its pages and links — no new files.
 */
export interface SubService {
  slug: string;
  name: string;
  /** Parent category slug from services.ts (e.g. 'junk-removal'). */
  parent: string;
  /** One-line hero subhead. */
  tagline: string;
  /** Meta-description base (~150–160 chars). */
  description: string;
  /** Opening body paragraph. */
  intro: string;
  /** Bulleted "what's included" list. */
  features: string[];
}

export const subServices: SubService[] = [
  // ───────────────────────── Junk Removal ─────────────────────────
  {
    slug: 'residential-junk-removal',
    name: 'Residential Junk Removal',
    parent: 'junk-removal',
    tagline: 'Home junk removal for furniture, appliances, and clutter.',
    description:
      'Residential junk removal in Mesa for furniture, appliances, garage clutter, yard items, and unwanted household goods, with full-service loading.',
    intro:
      'Residential junk removal clears unwanted items from rooms, garages, patios, sheds, and curbside piles. You do not rent a trailer or round up friends — our crew removes items from inside or outside whenever access is safe.',
    features: [
      'Household clutter and bagged junk',
      'Furniture, mattresses, and appliances',
      'Garage, patio, and yard items',
      'Donation-ready goods separated first',
      'In-home and curbside pickup',
    ],
  },
  {
    slug: 'commercial-junk-removal',
    name: 'Commercial Junk Removal',
    parent: 'junk-removal',
    tagline: 'Office, retail, and warehouse junk removal that fits your hours.',
    description:
      'Commercial junk removal in Mesa for office furniture, retail fixtures, storage rooms, tenant debris, and business cleanouts with flexible scheduling.',
    intro:
      'Commercial junk removal keeps your team focused on their work while we handle the heavy, awkward loads. We clear desks, fixtures, shelving, and tenant debris and plan around your operating hours and building rules.',
    features: [
      'Office furniture and cubicles',
      'Retail fixtures and displays',
      'Storage-room and backroom clutter',
      'Tenant turnover debris',
      'Scheduling around business hours',
    ],
  },
];

export const getSubService = (parent: string, slug: string): SubService | undefined =>
  subServices.find((s) => s.parent === parent && s.slug === slug);
