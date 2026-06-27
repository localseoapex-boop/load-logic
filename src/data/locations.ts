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
  },
];

export const getLocation = (slug: string): Location | undefined =>
  locations.find((l) => l.slug === slug);
