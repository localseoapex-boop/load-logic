/**
 * property-types.ts — who hires a junk removal company, and what each cares about.
 *
 * A homeowner clearing a garage and a property manager turning a unit are buying
 * the same truck for completely different reasons. A homeowner wants the heavy
 * lifting handled. A property manager wants the unit empty before Friday and an
 * invoice they can put against the property.
 *
 * This module lets service and location pages address the right buyer instead of
 * writing one generic paragraph for everyone.
 *
 * ─────────────────────── Relationship ownership ───────────────────────
 *
 * PROPERTY TYPE owns:
 *   propertyType -> services       (what this buyer typically books)
 *   propertyType -> accessFactors  (constraints their properties tend to have)
 *
 * situation -> propertyType is owned by situations.ts. The inverse
 * (situationsForPropertyType) is derived in src/lib/knowledge.ts.
 */

export interface PropertyType {
  slug: string;
  name: string;
  /** Plural label for headings, e.g. "Property managers". */
  plural: string;
  /** What this buyer is actually trying to accomplish. */
  need: string;
  /** What matters most to them in choosing a crew. Drives which proof to show. */
  priorities: string[];
  /** Service slugs this buyer commonly books. CANONICAL. */
  services: string[];
  /** Access factor slugs their properties commonly involve. CANONICAL. */
  accessFactors: string[];
  order: number;
}

export const propertyTypes: PropertyType[] = [
  {
    slug: 'homeowner',
    name: 'Homeowner',
    plural: 'Homeowners',
    need: 'Clear out space in a home you live in, without doing the lifting or renting a dumpster.',
    priorities: [
      'A price agreed before anything is loaded',
      'No damage to walls, floors, or door frames',
      'The area left clean when the crew leaves',
    ],
    services: ['junk-removal', 'garage-cleanouts', 'furniture-removal', 'appliance-removal', 'yard-waste-removal'],
    accessFactors: ['stairs', 'tight-access', 'gated-community'],
    order: 1,
  },
  {
    slug: 'renter',
    name: 'Renter',
    plural: 'Renters',
    need: 'Get bulky items out of a rental, often on a move-out deadline and with building rules to work around.',
    priorities: [
      'Scheduling that fits a lease end date',
      'Working within building loading and elevator rules',
      'Leaving the unit clean enough to protect the deposit',
    ],
    services: ['furniture-removal', 'mattress-removal', 'junk-removal', 'same-day-junk-removal'],
    accessFactors: ['apartment', 'elevator', 'long-carry', 'stairs'],
    order: 2,
  },
  {
    slug: 'landlord',
    name: 'Landlord',
    plural: 'Landlords',
    need: 'Turn a unit around quickly between tenants so it can be re-listed.',
    priorities: [
      'Fast scheduling that fits a turnover window',
      'A crew that can work from access instructions without you present',
      'Clear documentation of what was removed',
    ],
    services: ['foreclosure-cleanouts', 'junk-removal', 'furniture-removal', 'appliance-removal'],
    accessFactors: ['unoccupied', 'stairs', 'tight-access'],
    order: 3,
  },
  {
    slug: 'property-manager',
    name: 'Property manager',
    plural: 'Property managers',
    need: 'Clear units and common areas across a portfolio, on a schedule, with predictable invoicing.',
    priorities: [
      'Reliable arrival windows',
      'Coordination with on-site staff and access control',
      'Consistent pricing across repeat jobs',
    ],
    services: ['foreclosure-cleanouts', 'office-cleanouts', 'junk-removal', 'furniture-removal'],
    accessFactors: ['apartment', 'elevator', 'gated-community', 'unoccupied'],
    order: 4,
  },
  {
    slug: 'realtor',
    name: 'Realtor',
    plural: 'Realtors',
    need: 'Get a property photo-ready and show-ready before a listing goes live.',
    priorities: [
      'Hitting the listing or photography date',
      'Empty, swept rooms that show well',
      'Being able to hand off access and step away',
    ],
    services: ['junk-removal', 'estate-cleanouts', 'furniture-removal', 'garage-cleanouts'],
    accessFactors: ['unoccupied', 'gated-community', 'stairs'],
    order: 5,
  },
  {
    slug: 'executor',
    name: 'Estate executor',
    plural: 'Estate executors',
    need: 'Clear a family property respectfully while decisions about belongings are still being made.',
    priorities: [
      'Working at the pace the family sets',
      'Careful sorting so nothing important is lost',
      'Donation routed for anything still usable',
    ],
    services: ['estate-cleanouts', 'hoarder-cleanouts', 'furniture-removal', 'junk-removal'],
    accessFactors: ['stairs', 'tight-access', 'unoccupied'],
    order: 6,
  },
  {
    slug: 'foreclosure-buyer',
    name: 'Foreclosure buyer',
    plural: 'Foreclosure buyers',
    need: 'Empty a property you have just taken possession of so repairs can begin.',
    priorities: [
      'Moving quickly once legal access is confirmed',
      'Handling whole-property scope including garage and yard',
      'One crew rather than several trades',
    ],
    services: ['foreclosure-cleanouts', 'junk-removal', 'estate-cleanouts', 'yard-waste-removal'],
    accessFactors: ['unoccupied', 'heavy-items', 'tight-access'],
    order: 7,
  },
  {
    slug: 'contractor',
    name: 'Contractor',
    plural: 'Contractors',
    need: 'Clear debris between phases without tying up a dumpster on a small jobsite.',
    priorities: [
      'Scheduling that fits the build sequence',
      'Handling mixed and heavy debris',
      'Leaving the work area ready for the next trade',
    ],
    services: ['construction-debris-removal', 'junk-removal', 'shed-removal'],
    accessFactors: ['heavy-items', 'long-carry', 'tight-access'],
    order: 8,
  },
  {
    slug: 'small-business',
    name: 'Small business',
    plural: 'Small businesses',
    need: 'Clear old furniture, fixtures, and equipment without shutting down for a day.',
    priorities: [
      'Working around operating hours',
      'Following building and loading dock rules',
      'Routing usable equipment to donation where possible',
    ],
    services: ['office-cleanouts', 'junk-removal', 'furniture-removal'],
    accessFactors: ['elevator', 'long-carry', 'after-hours'],
    order: 9,
  },
];

export const getPropertyType = (slug: string): PropertyType | undefined =>
  propertyTypes.find((p) => p.slug === slug);
