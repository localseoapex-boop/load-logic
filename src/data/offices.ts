/**
 * offices.ts — physical office locations (requirement #5: multiple offices).
 *
 * Each office is a real place with its own NAP (Name/Address/Phone), hours, and
 * the set of city slugs it serves. This is the source of truth for:
 *   - the multi-node LocalBusiness schema (one node per office)
 *   - the footer's per-office NAP blocks
 *   - the "serving office" phone shown on each city/location-service page
 *
 * `primaryOffice` (offices[0]) feeds the org-level BUSINESS defaults in
 * src/config/site.ts, so there's no duplicated business data anywhere.
 *
 * NOTE: Load Logic's Mesa street address is pending final move-in, so `street`
 * and `postalCode` are intentionally omitted. The footer and LocalBusiness
 * schema render the address with addressLocality ("Mesa") + region ("AZ") only,
 * which is the correct, Google-safe state until the full address is published.
 */
export interface OfficeHours {
  days: string[];
  opens: string;
  closes: string;
}

export interface Office {
  id: string;
  /** Display name for the footer/schema, e.g. "Mesa Office". */
  name: string;
  /**
   * Location slug (from locations.ts) of the city this office physically calls
   * home. The PRIMARY office's home city is represented directly by the homepage
   * and the canonical /services/* pages, so — when
   * SITE.excludeHomeCityFromServiceAreas is on — it is excluded from the
   * generated /locations/* service-area pages (no duplicate Mesa pages).
   * Data-driven: point this at whichever city slug an office occupies.
   */
  homeCitySlug: string;
  legalName: string;
  /** schema.org business @type. */
  type: string;
  priceRange: string;
  phone: string;
  email: string;
  address: {
    /** Omitted until the real Mesa street address is published. */
    street?: string;
    city: string;
    region: string;
    /** Omitted until the real Mesa address is published. */
    postalCode?: string;
    country: string;
  };
  geo: { latitude: number; longitude: number };
  hours: OfficeHours[];
  /** Location slugs (from locations.ts) this office is responsible for. */
  serves: string[];
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const offices: Office[] = [
  {
    id: 'mesa',
    name: 'Mesa Office',
    homeCitySlug: 'mesa-az',
    legalName: 'Load Logic Junk Removal LLC',
    type: 'LocalBusiness',
    priceRange: '$$',
    phone: '+1-480-712-0431',
    email: 'hello@loadlogicjunk.com',
    address: {
      // street + postalCode pending final Mesa move-in.
      city: 'Mesa',
      region: 'AZ',
      country: 'US',
    },
    geo: { latitude: 33.4152, longitude: -111.8315 },
    hours: [
      { days: WEEKDAYS, opens: '07:00', closes: '19:00' },
      { days: ['Saturday'], opens: '07:00', closes: '18:00' },
      { days: ['Sunday'], opens: '08:00', closes: '16:00' },
    ],
    serves: [
      'mesa-az',
      'chandler-az',
      'gilbert-az',
      'tempe-az',
      'queen-creek-az',
      'san-tan-valley-az',
      'apache-junction-az',
      'gold-canyon-az',
      'scottsdale-az',
      'ahwatukee-az',
    ],
  },
];

/** The headquarters / default office. Feeds org-level config in site.ts. */
export const primaryOffice = offices[0];

export const getOffice = (id: string): Office | undefined =>
  offices.find((o) => o.id === id);

/** Resolve the canonical schema @id for an office node (primary shares /#business). */
export const officeNodeId = (siteUrl: string, office: Office): string =>
  office.id === primaryOffice.id ? `${siteUrl}/#business` : `${siteUrl}/#office-${office.id}`;
