/**
 * situations.ts — the life events that make someone need junk removal.
 *
 * People do not search for "junk removal" in the abstract. They search because
 * they are moving, closing out a parent's house, or standing in a garage they
 * cannot park in. Situations are the entry point into the service catalogue and
 * the connective tissue between a visitor's actual problem and the page that
 * solves it.
 *
 * The vocabulary is grounded in the `reasons` arrays already present in
 * src/data/service-content.ts, so these reflect reasons the business was already
 * telling customers it handles.
 *
 * ─────────────────────── Relationship ownership ───────────────────────
 *
 * SITUATION owns:
 *   situation -> services        (what solves it, most relevant first)
 *   situation -> propertyTypes   (who tends to be in this situation)
 *   situation -> materialCategories (what usually comes out)
 *   situation -> typicalLoad     (a load size slug from pricing.ts)
 *
 * The inverses (situationsForService, situationsForPropertyType) are derived in
 * src/lib/knowledge.ts.
 */

export interface Situation {
  slug: string;
  name: string;
  /**
   * The situation phrased the way the person in it would say it. Used as the
   * visible label in decision-support UI, and as natural-language matching
   * surface for AI systems.
   */
  question: string;
  summary: string;
  /** Service slugs, most relevant first. CANONICAL. */
  services: string[];
  /** Property type slugs commonly in this situation. CANONICAL. */
  propertyTypes: string[];
  /** Material category slugs that usually come out of this job. CANONICAL. */
  materialCategories: string[];
  /** Load size slug from pricing.ts that this situation typically produces. */
  typicalLoad: string;
  /** How time-sensitive this situation usually is. Drives CTA emphasis. */
  urgency: 'flexible' | 'scheduled' | 'urgent';
  order: number;
}

export const situations: Situation[] = [
  {
    slug: 'moving-out',
    name: 'Moving out',
    question: 'I am moving and there is a pile of stuff I am not taking',
    summary:
      'Whatever does not make it onto the moving truck has to go somewhere, usually on a deadline set by the closing or the lease end.',
    services: ['junk-removal', 'furniture-removal', 'mattress-removal', 'same-day-junk-removal'],
    propertyTypes: ['homeowner', 'renter'],
    materialCategories: ['furniture', 'household-goods', 'mattresses-bedding', 'garage-storage'],
    typicalLoad: 'half',
    urgency: 'urgent',
    order: 1,
  },
  {
    slug: 'garage-reset',
    name: 'Garage reset',
    question: 'I want to park in my garage again',
    summary:
      'Years of storage, broken equipment, and boxes nobody has opened since the last move, cleared in one appointment.',
    services: ['garage-cleanouts', 'junk-removal', 'appliance-removal'],
    propertyTypes: ['homeowner'],
    materialCategories: ['garage-storage', 'household-goods', 'furniture', 'appliances'],
    typicalLoad: 'half',
    urgency: 'flexible',
    order: 2,
  },
  {
    slug: 'downsizing',
    name: 'Downsizing',
    question: 'I am moving somewhere smaller and cannot take it all',
    summary:
      'Moving to a smaller home means deciding what stays, and then getting the rest out without filling a dumpster on the driveway.',
    services: ['furniture-removal', 'junk-removal', 'estate-cleanouts'],
    propertyTypes: ['homeowner'],
    materialCategories: ['furniture', 'household-goods', 'garage-storage'],
    typicalLoad: 'three-quarter',
    urgency: 'scheduled',
    order: 3,
  },
  {
    slug: 'estate-settlement',
    name: 'Settling an estate',
    question: 'I am clearing out a family member’s home',
    summary:
      'Emotional, physical work that usually runs room by room while family members decide what to keep. It moves at whatever pace the family needs.',
    services: ['estate-cleanouts', 'furniture-removal', 'junk-removal'],
    propertyTypes: ['executor', 'homeowner', 'realtor'],
    materialCategories: ['furniture', 'household-goods', 'garage-storage', 'appliances'],
    typicalLoad: 'full',
    urgency: 'scheduled',
    order: 4,
  },
  {
    slug: 'rental-turnover',
    name: 'Rental turnover',
    question: 'A tenant moved out and left things behind',
    summary:
      'Every day the unit sits full is a day it is not earning. Turnovers need speed and a crew that can work around a repair schedule.',
    services: ['foreclosure-cleanouts', 'junk-removal', 'same-day-junk-removal', 'furniture-removal'],
    propertyTypes: ['landlord', 'property-manager'],
    materialCategories: ['furniture', 'household-goods', 'mattresses-bedding', 'appliances'],
    typicalLoad: 'half',
    urgency: 'urgent',
    order: 5,
  },
  {
    slug: 'pre-sale-prep',
    name: 'Getting a house listed',
    question: 'I need the house cleared before photos and showings',
    summary:
      'Empty rooms photograph better and show larger. This work usually happens against a listing date.',
    services: ['junk-removal', 'furniture-removal', 'garage-cleanouts', 'yard-waste-removal'],
    propertyTypes: ['realtor', 'homeowner', 'executor'],
    materialCategories: ['furniture', 'household-goods', 'garage-storage', 'yard-green-waste'],
    typicalLoad: 'three-quarter',
    urgency: 'urgent',
    order: 6,
  },
  {
    slug: 'renovation-cleanup',
    name: 'Renovation cleanup',
    question: 'My remodel left a pile of debris',
    summary:
      'A small remodel makes more debris than people expect, and a full dumpster rental is usually overkill for it.',
    services: ['construction-debris-removal', 'junk-removal'],
    propertyTypes: ['homeowner', 'contractor'],
    materialCategories: ['construction-debris', 'heavy-materials'],
    typicalLoad: 'half',
    urgency: 'scheduled',
    order: 7,
  },
  {
    slug: 'yard-cleanup',
    name: 'Yard cleanup',
    question: 'My yard is full of branches and green waste',
    summary:
      'Arizona yards produce more debris than a green bin can hold, especially after a trim or a monsoon.',
    services: ['yard-waste-removal', 'junk-removal', 'shed-removal'],
    propertyTypes: ['homeowner', 'landlord'],
    materialCategories: ['yard-green-waste', 'outdoor-structures'],
    typicalLoad: 'quarter',
    urgency: 'flexible',
    order: 8,
  },
  {
    slug: 'replacing-furniture',
    name: 'Replacing furniture',
    question: 'The new couch is coming and the old one has to go',
    summary:
      'Delivery crews rarely take the old piece, and a sofa does not fit in a car. One item, out the door, done.',
    services: ['furniture-removal', 'mattress-removal', 'same-day-junk-removal'],
    propertyTypes: ['homeowner', 'renter'],
    materialCategories: ['furniture', 'mattresses-bedding'],
    typicalLoad: 'single-item',
    urgency: 'urgent',
    order: 9,
  },
  {
    slug: 'replacing-appliance',
    name: 'Replacing an appliance',
    question: 'I have an old fridge or washer to get rid of',
    summary:
      'Once it is disconnected, the hard part is getting a heavy appliance out of the house without damaging a doorway.',
    services: ['appliance-removal', 'same-day-junk-removal', 'junk-removal'],
    propertyTypes: ['homeowner', 'renter', 'landlord'],
    materialCategories: ['appliances'],
    typicalLoad: 'single-item',
    urgency: 'urgent',
    order: 10,
  },
  {
    slug: 'foreclosure-turnover',
    name: 'Foreclosure or eviction cleanout',
    question: 'I took possession of a property full of belongings',
    summary:
      'Once legal access is complete, the property needs clearing before cleaning, repairs, and re-listing can start.',
    services: ['foreclosure-cleanouts', 'estate-cleanouts', 'junk-removal'],
    propertyTypes: ['foreclosure-buyer', 'property-manager', 'landlord', 'realtor'],
    materialCategories: ['furniture', 'household-goods', 'appliances', 'yard-green-waste'],
    typicalLoad: 'full',
    urgency: 'urgent',
    order: 11,
  },
  {
    slug: 'hoarding-cleanup',
    name: 'Clearing a packed home',
    question: 'A home has become too full to live in safely',
    summary:
      'This work needs patience and discretion. It runs room by room at a pace the household can handle, protecting anything that matters.',
    services: ['hoarder-cleanouts', 'estate-cleanouts', 'junk-removal'],
    propertyTypes: ['homeowner', 'executor', 'property-manager'],
    materialCategories: ['household-goods', 'furniture', 'garage-storage'],
    typicalLoad: 'full',
    urgency: 'scheduled',
    order: 12,
  },
  {
    slug: 'office-change',
    name: 'Office move or downsize',
    question: 'We are changing offices and have furniture to clear',
    summary:
      'Desks, chairs, and fixtures your team should not be carrying, cleared around your operating hours.',
    services: ['office-cleanouts', 'junk-removal', 'furniture-removal'],
    propertyTypes: ['small-business', 'property-manager'],
    materialCategories: ['office-commercial', 'electronics', 'furniture'],
    typicalLoad: 'three-quarter',
    urgency: 'scheduled',
    order: 13,
  },
  {
    slug: 'backyard-project',
    name: 'Removing a backyard structure',
    question: 'I need a hot tub, shed, or playset gone',
    summary:
      'These need teardown before they can be hauled, plus a plan for getting the pieces from the backyard to the truck.',
    services: ['hot-tub-removal', 'shed-removal', 'construction-debris-removal'],
    propertyTypes: ['homeowner', 'landlord'],
    materialCategories: ['outdoor-structures', 'construction-debris'],
    typicalLoad: 'three-quarter',
    urgency: 'scheduled',
    order: 14,
  },
];

export const getSituation = (slug: string): Situation | undefined =>
  situations.find((s) => s.slug === slug);

export const situationsByUrgency = (urgency: Situation['urgency']): Situation[] =>
  situations.filter((s) => s.urgency === urgency);
