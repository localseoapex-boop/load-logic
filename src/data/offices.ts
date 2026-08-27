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
 * The Mesa street address is verified and published, so `street` and
 * `postalCode` are populated. Both the footer's <address> block and the
 * LocalBusiness schema render the complete address; they were already written
 * to include those fields whenever present.
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
  /**
   * Long-form business description for structured data ONLY.
   *
   * Deliberately separate from SITE.description, which is the site tagline: it
   * is the footer copy and the default <meta name="description">, so it has to
   * stay short. Schema has room for the full description; the page does not.
   */
  description?: string;
  address: {
    /** Optional so a future office can be listed before its lease is signed. */
    street?: string;
    city: string;
    region: string;
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
    phone: '+1-480-650-0905',
    email: 'info@loadlogicjr.com',
    description:
      "Load Logic Junk Removal is Mesa's straightforward junk hauling service with upfront, published pricing with no surprise fees, no bait-and-switch estimates. Serving Mesa, Gilbert, Chandler, Queen Creek, Apache Junction, and Tempe, we remove furniture, appliances, mattresses, yard debris, construction waste, hot tubs, and full garage, estate, and moving cleanouts. Our team does all the lifting, loading, and hauling, then sweeps the space clean before we leave. We donate and recycle whatever we can to keep usable items out of the landfill. Same-day and next-day appointments available across the East Valley. Locally owned and operated. Call or book online for an all-inclusive quote you can trust.",
    address: {
      street: '314 S 91st St',
      city: 'Mesa',
      region: 'AZ',
      postalCode: '85208',
      country: 'US',
    },
    // The business location, NOT the Mesa city centroid. locations.ts carries a
    // separate `mesa-az` geo for the city itself; the two are different points
    // and must not be collapsed into one.
    geo: { latitude: 33.4092607, longitude: -111.638184 },
    // Sunday is closed, so it is absent: a day with no OpeningHoursSpecification
    // reads as closed in schema.org. Listing it with 00:00-00:00 would say the
    // same thing more obscurely.
    hours: [
      { days: WEEKDAYS, opens: '08:00', closes: '18:00' },
      { days: ['Saturday'], opens: '08:00', closes: '16:00' },
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
