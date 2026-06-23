/**
 * locations.ts — the city catalog (requirements #2, #5).
 *
 * One entry per city served. This drives:
 *   - /locations/[city] pages (one per entry)
 *   - /locations/[city]/[service] pages (entry × its services)
 *   - "Nearby cities" internal links (via `nearby`)
 *
 * `officeId` ties a city to the office that services it (multi-office support).
 * `services` is optional: omit it and the city offers ALL services; set it to a
 * subset when a location only offers some trades (see oro-valley-az).
 *
 * Adding a city here automatically generates its city page AND one location-
 * service page per offered service — the core of programmatic scale.
 */
export interface Location {
  /** URL slug, "city-state" pattern, e.g. "phoenix-az". */
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
}

export const locations: Location[] = [
  {
    slug: 'phoenix-az',
    city: 'Phoenix',
    region: 'AZ',
    geo: { latitude: 33.4484, longitude: -112.074 },
    officeId: 'phoenix',
    nearby: ['scottsdale-az', 'tempe-az', 'mesa-az', 'chandler-az'],
  },
  {
    slug: 'scottsdale-az',
    city: 'Scottsdale',
    region: 'AZ',
    geo: { latitude: 33.4942, longitude: -111.9261 },
    officeId: 'phoenix',
    nearby: ['phoenix-az', 'tempe-az', 'mesa-az'],
  },
  {
    slug: 'tempe-az',
    city: 'Tempe',
    region: 'AZ',
    geo: { latitude: 33.4255, longitude: -111.94 },
    officeId: 'phoenix',
    nearby: ['phoenix-az', 'scottsdale-az', 'mesa-az', 'chandler-az'],
  },
  {
    slug: 'mesa-az',
    city: 'Mesa',
    region: 'AZ',
    geo: { latitude: 33.4152, longitude: -111.8315 },
    officeId: 'phoenix',
    nearby: ['tempe-az', 'chandler-az', 'phoenix-az'],
  },
  {
    slug: 'chandler-az',
    city: 'Chandler',
    region: 'AZ',
    geo: { latitude: 33.3062, longitude: -111.8413 },
    officeId: 'phoenix',
    nearby: ['tempe-az', 'mesa-az', 'phoenix-az'],
  },
  {
    slug: 'tucson-az',
    city: 'Tucson',
    region: 'AZ',
    geo: { latitude: 32.2226, longitude: -110.9747 },
    officeId: 'tucson',
    nearby: ['oro-valley-az'],
  },
  {
    slug: 'oro-valley-az',
    city: 'Oro Valley',
    region: 'AZ',
    geo: { latitude: 32.391, longitude: -110.9665 },
    officeId: 'tucson',
    nearby: ['tucson-az'],
    // Partial coverage: this branch doesn't offer drain cleaning or insulation yet.
    services: ['hvac', 'plumbing', 'electrical'],
  },
];

export const getLocation = (slug: string): Location | undefined =>
  locations.find((l) => l.slug === slug);
