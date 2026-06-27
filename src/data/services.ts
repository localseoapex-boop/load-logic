/**
 * services.ts — the service catalog (requirement #6: content model).
 *
 * One entry per service line. This drives:
 *   - /services/[service] pages (one per entry)
 *   - /locations/[city]/[service] pages (entry × location)
 *   - "Related services" internal links
 *
 * `related` holds sibling slugs for cross-linking. The deeper, page-level copy
 * (overview paragraphs, what-we-remove, problem/solution, special handling, and
 * FAQs) lives in src/data/service-content.ts, keyed by the same slug — this file
 * stays a lean catalog. Adding a service here (plus a content entry) generates
 * its pages automatically — no new route files.
 */
export interface Service {
  slug: string;
  name: string;
  /** Closest schema.org business type (junk hauling has no dedicated type). */
  schemaType: string;
  /** One-line hero subhead. */
  tagline: string;
  /** Meta-description base (kept under ~160 chars). */
  description: string;
  /** Opening body paragraph. */
  intro: string;
  /** Bulleted "what we do" list. */
  features: string[];
  /** Slugs of related services for internal linking. */
  related: string[];
}

export const services: Service[] = [
  {
    slug: 'junk-removal',
    name: 'Junk Removal',
    schemaType: 'LocalBusiness',
    tagline: 'Full-service hauling for bulky items, clutter, and cleanouts.',
    description:
      'Full-service junk removal in Mesa and the East Valley for bulky items, mixed clutter, move-outs, and property cleanups with upfront pricing.',
    intro:
      'When you have more junk than a trash can can hold and no easy way to haul it, one crew can clear it all in a single visit. We handle the loading, hauling, sorting, and cleanup so you never touch a heavy item or rent a dumpster.',
    features: [
      'Mixed household and garage junk',
      'Bulky and oversized items',
      'Curbside, garage, or in-home pickup',
      'Move-out and cleanup debris',
      'Upfront, volume-based pricing',
    ],
    related: ['furniture-removal', 'appliance-removal', 'garage-cleanouts', 'same-day-junk-removal'],
  },
  {
    slug: 'furniture-removal',
    name: 'Furniture Removal',
    schemaType: 'LocalBusiness',
    tagline: 'Sofas, mattresses, tables, and bulky pieces hauled away.',
    description:
      'Furniture removal in Mesa for sofas, sectionals, mattresses, tables, dressers, and patio furniture. We do the lifting and loading for you.',
    intro:
      'Large furniture is heavy, awkward, and rough on walls and floors when you move it alone. Our crew carries it out from inside the home, garage, patio, or curb, and routes usable pieces toward donation when we can.',
    features: [
      'Sofas, sectionals, and recliners',
      'Dressers, tables, and bed frames',
      'Patio and outdoor furniture',
      'In-home and upstairs removal',
      'Donation routing when items are usable',
    ],
    related: ['mattress-removal', 'estate-cleanouts', 'junk-removal', 'appliance-removal'],
  },
  {
    slug: 'appliance-removal',
    name: 'Appliance Removal',
    schemaType: 'LocalBusiness',
    tagline: 'Refrigerators, washers, dryers, and water heaters gone.',
    description:
      'Appliance removal in Mesa for refrigerators, washers, dryers, ovens, dishwashers, freezers, and water heaters, with recycling when possible.',
    intro:
      'Old appliances are heavy, sharp-edged, and a hassle to dispose of correctly. Once the unit is disconnected, our crew loads and hauls it away and routes it toward recycling when possible.',
    features: [
      'Refrigerators and freezers',
      'Washers, dryers, and dishwashers',
      'Ovens, ranges, and water heaters',
      'Garage and laundry-room pickup',
      'Recycling routing when available',
    ],
    related: ['junk-removal', 'garage-cleanouts', 'furniture-removal', 'same-day-junk-removal'],
  },
  {
    slug: 'garage-cleanouts',
    name: 'Garage Cleanouts',
    schemaType: 'LocalBusiness',
    tagline: 'Turn a packed garage back into usable space.',
    description:
      'Garage cleanouts in Mesa for boxes, shelving, old tools, sports gear, storage bins, and bulky household overflow, cleared in one visit.',
    intro:
      'A garage cleanout turns months of weekend dread into a single appointment. We load boxes, broken equipment, old furniture, and mixed clutter so you can park inside again or pass a rental inspection.',
    features: [
      'Boxes, totes, and shelving',
      'Old tools and broken equipment',
      'Exercise gear and sports equipment',
      'Bulky household overflow',
      'Light sweep after loading',
    ],
    related: ['junk-removal', 'shed-removal', 'estate-cleanouts', 'appliance-removal'],
  },
  {
    slug: 'estate-cleanouts',
    name: 'Estate Cleanouts',
    schemaType: 'LocalBusiness',
    tagline: 'Respectful, room-by-room cleanouts at your pace.',
    description:
      'Estate cleanouts in Mesa for furniture, household goods, garages, and donation-ready items, handled with care and clear communication.',
    intro:
      'Clearing an estate is physical and emotional work. Our crew removes approved items room by room while family members or executors decide what stays, and prioritizes donation for usable goods.',
    features: [
      'Room-by-room removal',
      'Furniture and household goods',
      'Garage and storage areas',
      'Donation sorting and routing',
      'Coordination with realtors and family',
    ],
    related: ['furniture-removal', 'hoarder-cleanouts', 'foreclosure-cleanouts', 'garage-cleanouts'],
  },
  {
    slug: 'hot-tub-removal',
    name: 'Hot Tub Removal',
    schemaType: 'LocalBusiness',
    tagline: 'Old spas cut up, hauled out, and disposed of.',
    description:
      'Hot tub removal in Mesa with cut-up, heavy loading, hauling, and disposal for old backyard spas, even in tight side yards.',
    intro:
      'A dead hot tub is one of the hardest things to get rid of on your own. Once it is drained and disconnected, our crew cuts it down, navigates gates and side yards, and hauls every piece away.',
    features: [
      'Acrylic spa cut-up and teardown',
      'Covers, steps, and surrounds',
      'Tight backyard and gate access',
      'Heavy loading and hauling',
      'Cleanup of the removal area',
    ],
    related: ['construction-debris-removal', 'yard-waste-removal', 'junk-removal', 'shed-removal'],
  },
  {
    slug: 'construction-debris-removal',
    name: 'Construction Debris Removal',
    schemaType: 'LocalBusiness',
    tagline: 'Remodel debris cleared without renting a dumpster.',
    description:
      'Construction debris removal in Mesa for drywall, lumber, flooring, cabinets, fixtures, and packaging from small remodels and repairs.',
    intro:
      'Small remodels make big piles. When a full dumpster is overkill, our crew loads drywall, lumber, flooring, old cabinets, and packaging so your work area is clear for the next phase.',
    features: [
      'Drywall, lumber, and trim',
      'Flooring, tile, and carpet',
      'Old cabinets and fixtures',
      'Bagged construction trash',
      'Small jobsite and remodel cleanup',
    ],
    related: ['junk-removal', 'yard-waste-removal', 'garage-cleanouts', 'hot-tub-removal'],
  },
  {
    slug: 'yard-waste-removal',
    name: 'Yard Waste Removal',
    schemaType: 'LocalBusiness',
    tagline: 'Branches, brush, and green waste hauled away.',
    description:
      'Yard waste removal in Mesa for branches, brush, leaves, palm fronds, and landscaping debris after cleanups, trims, and storms.',
    intro:
      'Arizona yards generate more debris than a green bin can take, especially after a trim or a monsoon. We haul branches, brush, palm fronds, and bagged green waste so your yard is clean again fast.',
    features: [
      'Branches, brush, and limbs',
      'Palm fronds and leaves',
      'Post-storm and monsoon debris',
      'Old landscaping and sod',
      'Bagged and loose green waste',
    ],
    related: ['junk-removal', 'construction-debris-removal', 'shed-removal', 'garage-cleanouts'],
  },
  {
    slug: 'mattress-removal',
    name: 'Mattress Removal',
    schemaType: 'LocalBusiness',
    tagline: 'Mattresses and box springs out the door for good.',
    description:
      'Mattress removal in Mesa for mattresses, box springs, bed frames, and headboards, picked up from any room and hauled away.',
    intro:
      'Mattresses are bulky, hard to fit in a vehicle, and rarely accepted by regular trash service. We pick them up from the bedroom, garage, or curb, frame and headboard included, with no heavy lifting on your end.',
    features: [
      'Mattresses and box springs',
      'Bed frames and headboards',
      'Bedroom and apartment pickup',
      'Move-out and rental turnover',
      'No tying it to your car roof',
    ],
    related: ['furniture-removal', 'junk-removal', 'estate-cleanouts', 'same-day-junk-removal'],
  },
  {
    slug: 'shed-removal',
    name: 'Shed Removal',
    schemaType: 'LocalBusiness',
    tagline: 'Old sheds and their contents cleared out.',
    description:
      'Shed removal and cleanouts in Mesa for old tools, garden supplies, outdoor clutter, broken equipment, and the structure itself.',
    intro:
      'Whether you are emptying a packed shed or tearing down a rusted one, our crew clears the contents, sorts what is safe to haul, and can break down and remove the structure so the space is ready to reuse.',
    features: [
      'Old tools and garden supplies',
      'Outdoor clutter and bins',
      'Broken equipment and shelving',
      'Shed teardown and haul-away',
      'Backyard access planning',
    ],
    related: ['garage-cleanouts', 'yard-waste-removal', 'junk-removal', 'construction-debris-removal'],
  },
  {
    slug: 'hoarder-cleanouts',
    name: 'Hoarder Cleanouts',
    schemaType: 'LocalBusiness',
    tagline: 'Discreet, judgment-free whole-home cleanouts.',
    description:
      'Hoarder cleanouts in Mesa handled with discretion and care, clearing packed rooms safely while protecting anything that should stay.',
    intro:
      'Hoarding cleanouts take patience, discretion, and a steady plan. Our crew works room by room at a comfortable pace, protecting valuables and keepsakes while safely clearing the clutter that is in the way.',
    features: [
      'Discreet, judgment-free service',
      'Room-by-room, paced removal',
      'Careful sorting for valuables',
      'Heavy, packed-in clutter',
      'Coordination with family and helpers',
    ],
    related: ['estate-cleanouts', 'foreclosure-cleanouts', 'junk-removal', 'furniture-removal'],
  },
  {
    slug: 'office-cleanouts',
    name: 'Office Cleanouts',
    schemaType: 'LocalBusiness',
    tagline: 'Desks, chairs, and fixtures cleared with low disruption.',
    description:
      'Office and commercial cleanouts in Mesa for desks, chairs, cubicles, shelving, fixtures, and tenant debris, scheduled around your hours.',
    intro:
      'Office refreshes, moves, and downsizes leave behind furniture and equipment your team should not have to haul. We clear desks, chairs, cubicles, and fixtures with scheduling that works around your business hours.',
    features: [
      'Desks, chairs, and cubicles',
      'Shelving, racks, and displays',
      'Old electronics and equipment',
      'Tenant turnover debris',
      'After-hours scheduling available',
    ],
    related: ['junk-removal', 'furniture-removal', 'foreclosure-cleanouts', 'construction-debris-removal'],
  },
  {
    slug: 'foreclosure-cleanouts',
    name: 'Foreclosure Cleanouts',
    schemaType: 'LocalBusiness',
    tagline: 'Fast cleanouts to get a property rent- or sale-ready.',
    description:
      'Foreclosure and eviction cleanouts in Mesa for abandoned belongings, furniture, trash, and turnover debris so repairs can start sooner.',
    intro:
      'Foreclosure and eviction cleanouts are time-sensitive. Once legal access is complete, our crew clears abandoned furniture, trash, and debris from the unit, garage, and yard so cleaning, repairs, and re-listing can begin.',
    features: [
      'Abandoned furniture and belongings',
      'Bagged trash and household items',
      'Garage, patio, and yard debris',
      'Fast turnover scheduling',
      'Property-manager coordination',
    ],
    related: ['estate-cleanouts', 'hoarder-cleanouts', 'office-cleanouts', 'junk-removal'],
  },
  {
    slug: 'same-day-junk-removal',
    name: 'Same-Day Junk Removal',
    schemaType: 'LocalBusiness',
    tagline: 'Need it gone today? Call early and send photos.',
    description:
      'Same-day junk removal in Mesa and the East Valley when routes allow. Call early, send photos, and we fit you into the day when we can.',
    intro:
      'Sometimes junk cannot wait. When you call early and send photos, we work your job into an existing East Valley route for same-day or next-day pickup, with the same upfront pricing as any other booking.',
    features: [
      'Same-day pickup when routes allow',
      'Photo estimates for a fast quote',
      'Furniture, appliances, and clutter',
      'Move-out and last-minute cleanups',
      'Upfront price before we load',
    ],
    related: ['junk-removal', 'furniture-removal', 'appliance-removal', 'mattress-removal'],
  },
];

export const getService = (slug: string): Service | undefined =>
  services.find((s) => s.slug === slug);

/** All service slugs — used as the default service set for a location. */
export const allServiceSlugs = services.map((s) => s.slug);
