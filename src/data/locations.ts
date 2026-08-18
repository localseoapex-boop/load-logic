/**
 * locations.ts — the city catalog (requirements #2, #5).
 *
 * One entry per city served. This drives:
 *   - /locations/[city] pages (one per entry)
 *   - /locations/[city]/[service] pages (entry × its services)
 *   - "Nearby cities" internal links (via `nearby`)
 *
 * `officeId` ties a city to the office that services it (multi-office support).
 * `services` is optional: omit it and the city offers ALL services. Load Logic
 * runs every service across the whole East Valley, so none are restricted.
 *
 * `intro` + `neighborhoods` add unique, local copy to each city page (good for
 * local SEO — avoids thin, templated city pages). Mesa is the primary focus.
 *
 * Adding a city here automatically generates its city page AND one location-
 * service page per offered service — the core of programmatic scale.
 */
export interface Location {
  /** URL slug, "city-state" pattern, e.g. "mesa-az". */
  slug: string;
  city: string;
  region: string;
  geo: { latitude: number; longitude: number };
  /** Which office (offices.ts) serves this city. */
  officeId: string;
  /** Slugs of nearby cities for internal linking. */
  nearby: string[];
  /** Service slugs offered here. Omit = all services. */
  services?: string[];
  /** Unique opening paragraph for the city page. */
  intro?: string;
  /** Recognizable local areas, woven into the city page for local relevance. */
  neighborhoods?: string[];

  /* ─────────────── Structured local knowledge (all optional) ───────────────
   *
   * These fields exist to solve the thin-content problem on the 126 city and
   * service pages WITHOUT generating city-swapped filler. Every field holds a
   * verifiable fact about the place, so a page differentiates itself with real
   * local information or it does not differentiate itself at all.
   *
   * All optional by design: a city with none of them still builds and still
   * renders correctly, and pages improve progressively as real detail is added.
   *
   * RELATIONSHIP OWNERSHIP: location owns each of these edges. Inverses
   * (locationsForSituation, locationsForPropertyType) derive in lib/knowledge.ts.
   */

  /**
   * Real postal codes served. Powers the service-area checker.
   *
   * NOTE: these are compiled from public postal data and should be confirmed
   * against the business's actual service boundary before launch. The checker is
   * deliberately built to treat an unlisted ZIP as "ask us" rather than "no", so
   * an omission never turns away a customer we could serve.
   */
  zips?: string[];
  /** Property type slugs that dominate this market. CANONICAL. */
  propertyMix?: string[];
  /** Situation slugs that come up unusually often here. CANONICAL. */
  situations?: string[];
  /**
   * Access factor slugs this market genuinely involves, paired with a local
   * detail explaining why. This is the strongest differentiator available for
   * a city and service page, because it is specific and operationally true.
   */
  accessNotes?: { factor: string; note: string }[];
  /** Where material from this area typically goes. Verifiable public fact. */
  disposalNote?: string;
}

export const locations: Location[] = [
  {
    slug: 'mesa-az',
    city: 'Mesa',
    region: 'AZ',
    geo: { latitude: 33.4152, longitude: -111.8315 },
    officeId: 'mesa',
    nearby: ['gilbert-az', 'chandler-az', 'tempe-az', 'apache-junction-az'],
    intro:
      'Mesa is our home base and primary service area. From garage cleanouts in Red Mountain to rental turnovers near downtown, our crews handle bulky furniture, old appliances, mattresses, yard waste, and full-property cleanouts without you renting a dumpster or lifting a thing.',
    neighborhoods: ['Eastmark', 'Las Sendas', 'Red Mountain Ranch', 'Dobson Ranch', 'The Groves'],
    zips: ['85201', '85202', '85203', '85204', '85205', '85206', '85207', '85208', '85209', '85210', '85212', '85213', '85215'],
    propertyMix: ['homeowner', 'renter', 'landlord', 'property-manager'],
    situations: ['garage-reset', 'rental-turnover', 'estate-settlement', 'moving-out'],
    accessNotes: [
      { factor: 'gated-community', note: 'Las Sendas and Red Mountain Ranch both have gate access, so send the code or list the crew ahead of the appointment.' },
      { factor: 'tight-access', note: 'Older central Mesa homes often have narrow side yards and alley access, which decides how a backyard job gets loaded.' },
    ],
    disposalNote:
      'Mesa loads are close to our base, so mixed material is sorted at the truck and split between reuse, recycling, and a licensed transfer station in the same run.',
  },
  {
    slug: 'chandler-az',
    city: 'Chandler',
    region: 'AZ',
    geo: { latitude: 33.3062, longitude: -111.8413 },
    officeId: 'mesa',
    nearby: ['gilbert-az', 'mesa-az', 'tempe-az', 'ahwatukee-az'],
    intro:
      'Chandler jobs often involve family homes, garages, and move-outs — donation-ready furniture, appliances, and bulky junk that needs to clear out before a sale or rental turnover. We schedule around HOA pickup windows and property access.',
    neighborhoods: ['Ocotillo', 'Fulton Ranch', 'Downtown Chandler', 'Sun Groves', 'Layton Lakes'],
    zips: ['85224', '85225', '85226', '85248', '85249', '85286'],
    propertyMix: ['homeowner', 'realtor', 'renter'],
    situations: ['pre-sale-prep', 'garage-reset', 'downsizing', 'replacing-furniture'],
    accessNotes: [
      { factor: 'gated-community', note: 'Ocotillo and Fulton Ranch have controlled entries, and several communities restrict how long anything can sit at the curb.' },
      { factor: 'curbside', note: 'HOA bulk pickup windows vary by community, which is often why a pile needs to be gone before a specific day.' },
    ],
    disposalNote:
      'Chandler cleanouts tend to produce a high share of donation-ready furniture, so usable pieces are separated at the property before the rest is loaded.',
  },
  {
    slug: 'gilbert-az',
    city: 'Gilbert',
    region: 'AZ',
    geo: { latitude: 33.3528, longitude: -111.789 },
    officeId: 'mesa',
    nearby: ['chandler-az', 'mesa-az', 'queen-creek-az', 'san-tan-valley-az'],
    intro:
      'Gilbert homeowners call us for garage resets, furniture removal, mattress haul-away, yard waste, and bulky-item cleanup before a move or home project. Photos help us confirm truck space and separate donation-ready items first.',
    neighborhoods: ['Agritopia', 'Power Ranch', 'Val Vista Lakes', 'Seville', 'Morrison Ranch'],
    zips: ['85233', '85234', '85295', '85296', '85297', '85298'],
    propertyMix: ['homeowner', 'realtor', 'landlord'],
    situations: ['garage-reset', 'pre-sale-prep', 'replacing-furniture', 'yard-cleanup'],
    accessNotes: [
      { factor: 'gated-community', note: 'Seville and Power Ranch have gated sections, and several HOAs restrict container placement on driveways.' },
      { factor: 'tight-access', note: 'Newer builds tend to have narrow side gates between the garage and back yard, which matters for hot tubs and sheds.' },
    ],
    disposalNote:
      'Gilbert garages produce a lot of clean recyclable metal shelving and cardboard, which is separated rather than sent to disposal with the rest.',
  },
  {
    slug: 'tempe-az',
    city: 'Tempe',
    region: 'AZ',
    geo: { latitude: 33.4255, longitude: -111.94 },
    officeId: 'mesa',
    nearby: ['mesa-az', 'chandler-az', 'ahwatukee-az', 'scottsdale-az'],
    intro:
      'Tempe removals often mean apartments, student-housing turnovers, tight parking, and quick timelines near ASU and downtown. Share elevator, loading-zone, and parking details up front and we plan the pickup around them.',
    neighborhoods: ['Maple-Ash', 'Mitchell Park', 'Tempe Gardens', 'Warner Ranch', 'Downtown Tempe'],
    zips: ['85281', '85282', '85283', '85284'],
    propertyMix: ['renter', 'property-manager', 'landlord', 'small-business'],
    situations: ['rental-turnover', 'moving-out', 'replacing-furniture'],
    accessNotes: [
      { factor: 'apartment', note: 'Student housing turnovers cluster around the end of the academic year, when loading zones near campus are busiest.' },
      { factor: 'elevator', note: 'Several downtown buildings require the service elevator to be reserved in advance and a certificate of insurance on file.' },
      { factor: 'long-carry', note: 'Street parking near ASU often means a longer carry from the unit to where the truck can legally stop.' },
    ],
    disposalNote:
      'Tempe turnovers produce a high volume of mattresses and particle-board furniture, which have limited reuse value, so the recyclable and donation share is usually smaller here.',
  },
  {
    slug: 'queen-creek-az',
    city: 'Queen Creek',
    region: 'AZ',
    geo: { latitude: 33.2487, longitude: -111.6343 },
    officeId: 'mesa',
    nearby: ['san-tan-valley-az', 'gilbert-az', 'gold-canyon-az', 'mesa-az'],
    intro:
      'Queen Creek properties tend to be larger, with sheds, garages, and yards that collect bulky junk and green waste. We clear furniture, appliances, construction debris, and full cleanouts across new builds and established acreage alike.',
    neighborhoods: ['Encanterra', 'Hastings Farms', 'Cortina', 'Pecan Creek', 'Queen Creek Station'],
    zips: ['85142', '85140'],
    propertyMix: ['homeowner', 'contractor', 'landlord'],
    situations: ['yard-cleanup', 'backyard-project', 'renovation-cleanup', 'garage-reset'],
    accessNotes: [
      { factor: 'gated-community', note: 'Encanterra and several newer communities are gated, so entry needs arranging before the crew leaves Mesa.' },
      { factor: 'long-carry', note: 'Acreage properties often mean a long haul from an outbuilding or back fence line to where a truck can park.' },
    ],
    disposalNote:
      'Larger lots here generate a lot of clean green waste and untreated wood, which goes to a green waste facility rather than to disposal when it is kept separate from trash.',
  },
  {
    slug: 'san-tan-valley-az',
    city: 'San Tan Valley',
    region: 'AZ',
    geo: { latitude: 33.1937, longitude: -111.5806 },
    officeId: 'mesa',
    nearby: ['queen-creek-az', 'gilbert-az', 'gold-canyon-az', 'apache-junction-az'],
    intro:
      'San Tan Valley jobs range from garage and shed cleanouts to rental turnovers and post-storm yard waste. Our crews make the drive out so you do not have to haul heavy loads into town yourself.',
    neighborhoods: ['Johnson Ranch', 'Circle Cross Ranch', 'Pecan Creek', 'Skyline Ranch', 'Copper Basin'],
    zips: ['85140', '85143', '85144'],
    propertyMix: ['homeowner', 'landlord', 'renter'],
    situations: ['garage-reset', 'yard-cleanup', 'rental-turnover', 'backyard-project'],
    accessNotes: [
      { factor: 'long-carry', note: 'Deeper lots and detached outbuildings mean the carry to the truck is often longer than in town.' },
      { factor: 'unoccupied', note: 'Distance means plenty of turnover jobs here run without anyone on site, which works when scope and access are agreed in advance.' },
    ],
    disposalNote:
      'Jobs out here are batched with nearby routes where possible so the drive is not carried by a single small load.',
  },
  {
    slug: 'apache-junction-az',
    city: 'Apache Junction',
    region: 'AZ',
    geo: { latitude: 33.4151, longitude: -111.5496 },
    officeId: 'mesa',
    nearby: ['gold-canyon-az', 'mesa-az', 'san-tan-valley-az', 'queen-creek-az'],
    intro:
      'Apache Junction calls often involve estate and foreclosure cleanouts, older homes, and outbuildings packed with years of stored items. We sort, load, and haul at a pace that works for families and property owners.',
    neighborhoods: ['Gold Canyon foothills', 'Superstition Mountain', 'Mountain View', 'Sun Lakes edge', 'Goldfield'],
    zips: ['85119', '85120', '85117'],
    propertyMix: ['homeowner', 'executor', 'foreclosure-buyer', 'landlord'],
    situations: ['estate-settlement', 'foreclosure-turnover', 'hoarding-cleanup', 'garage-reset'],
    accessNotes: [
      { factor: 'tight-access', note: 'Older properties and park models often have narrow drives and carports that limit how close a truck can get.' },
      { factor: 'heavy-items', note: 'Long-held properties frequently turn up safes, workshop equipment, and appliances that need more than two people.' },
    ],
    disposalNote:
      'Estate work here produces a wide mix, so sorting happens room by room during loading rather than all at once at the truck.',
  },
  {
    slug: 'gold-canyon-az',
    city: 'Gold Canyon',
    region: 'AZ',
    geo: { latitude: 33.3706, longitude: -111.4435 },
    officeId: 'mesa',
    nearby: ['apache-junction-az', 'san-tan-valley-az', 'queen-creek-az', 'mesa-az'],
    intro:
      'Gold Canyon homes near the Superstitions often need hot tub removal, yard waste hauling, and full cleanouts during remodels or moves. We plan around gated communities and longer driveways so arrival stays smooth.',
    neighborhoods: ['Superstition Mountain', 'Mountainbrook Village', 'Peralta Trails', 'Entrada del Oro', 'Kings Ranch'],
    zips: ['85118'],
    propertyMix: ['homeowner', 'realtor'],
    situations: ['backyard-project', 'downsizing', 'renovation-cleanup', 'yard-cleanup'],
    accessNotes: [
      { factor: 'gated-community', note: 'Superstition Mountain and several communities here are guard-gated, so the crew needs to be listed in advance.' },
      { factor: 'long-carry', note: 'Long private driveways are common, which affects how close the truck can get to the work.' },
      { factor: 'disassembly', note: 'Hot tubs and built-in outdoor features come up often here and usually need cutting down on site.' },
    ],
    disposalNote:
      'Desert landscaping means green waste here skews toward cactus, palm, and hardy shrub material, which is kept separate from construction debris.',
  },
  {
    slug: 'scottsdale-az',
    city: 'Scottsdale',
    region: 'AZ',
    geo: { latitude: 33.4942, longitude: -111.9261 },
    officeId: 'mesa',
    nearby: ['tempe-az', 'mesa-az', 'ahwatukee-az'],
    intro:
      'Scottsdale jobs often mean careful removal from condos, gated communities, vacation rentals, and homes prepping for a listing or remodel. Share gate instructions with your quote and we keep the property clean from start to finish.',
    neighborhoods: ['Old Town', 'McCormick Ranch', 'Gainey Ranch', 'North Scottsdale', 'DC Ranch'],
    zips: ['85250', '85251', '85254', '85255', '85257', '85258', '85259', '85260', '85262'],
    propertyMix: ['homeowner', 'realtor', 'property-manager', 'renter'],
    situations: ['pre-sale-prep', 'downsizing', 'renovation-cleanup', 'replacing-furniture'],
    accessNotes: [
      { factor: 'gated-community', note: 'DC Ranch, Gainey Ranch, and much of North Scottsdale are gated or guard-managed, and several require vendors to be registered.' },
      { factor: 'apartment', note: 'Old Town condos and short-term rentals often have restricted loading zones and set service hours.' },
      { factor: 'after-hours', note: 'Vacation rental turnovers frequently have to happen between a checkout and the next check-in.' },
    ],
    disposalNote:
      'Pre-listing and remodel work here produces a higher share of genuinely reusable furniture and fixtures, so more of the load is separated for reuse.',
  },
  {
    slug: 'ahwatukee-az',
    city: 'Ahwatukee',
    region: 'AZ',
    geo: { latitude: 33.3431, longitude: -111.9839 },
    officeId: 'mesa',
    nearby: ['tempe-az', 'chandler-az', 'scottsdale-az'],
    intro:
      'Ahwatukee homeowners call for garage cleanouts, furniture and appliance removal, and pre-sale resets across the Foothills. We work around HOA rules and tucked-away cul-de-sacs to clear bulky items in a single visit.',
    neighborhoods: ['Foothills', 'Mountain Park Ranch', 'Lakewood', 'Club West', 'The Foothills Reserve'],
    zips: ['85044', '85045', '85048'],
    propertyMix: ['homeowner', 'realtor', 'landlord'],
    situations: ['garage-reset', 'pre-sale-prep', 'downsizing', 'replacing-appliance'],
    accessNotes: [
      { factor: 'tight-access', note: 'Hillside lots and cul-de-sac driveways can be steep and narrow, which limits how a truck approaches the property.' },
      { factor: 'gated-community', note: 'Several Foothills communities are gated, and HOA rules commonly govern what can sit at the curb and for how long.' },
    ],
    disposalNote:
      'Ahwatukee sits on the far west of the service area, so jobs here are scheduled alongside Tempe and Chandler work to keep the route efficient.',
  },
];

export const getLocation = (slug: string): Location | undefined =>
  locations.find((l) => l.slug === slug);

/**
 * Resolve a ZIP code to the city that covers it.
 *
 * Returns undefined for an unlisted ZIP. Callers MUST treat that as "not on our
 * list, ask us" rather than a refusal, because the ZIP data is compiled from
 * public sources and may not exactly match the real service boundary.
 */
export const locationForZip = (zip: string): Location | undefined => {
  const clean = zip.trim().slice(0, 5);
  return locations.find((l) => l.zips?.includes(clean));
};

/** Every ZIP the business lists, de-duplicated and sorted. */
export const servedZips = (): string[] =>
  [...new Set(locations.flatMap((l) => l.zips ?? []))].sort();
