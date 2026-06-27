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
 */
export interface OfficeHours {
  days: string[];
  opens: string;
  closes: string;
}

export interface Office {
  id: string;
  /** Display name for the footer/schema, e.g. "Phoenix Office". */
  name: string;
  legalName: string;
  /** schema.org business @type. */
  type: string;
  priceRange: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
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
    id: 'phoenix',
    name: 'Phoenix Office',
    legalName: 'Load Logic LLC',
    type: 'HomeAndConstructionBusiness',
    priceRange: '$$',
    phone: '+1-602-555-0142',
    email: 'phoenix@loadlogic.com',
    address: {
      street: '123 Camelback Rd',
      city: 'Phoenix',
      region: 'AZ',
      postalCode: '85012',
      country: 'US',
    },
    geo: { latitude: 33.4942, longitude: -112.0662 },
    hours: [
      { days: WEEKDAYS, opens: '07:00', closes: '18:00' },
      { days: ['Saturday'], opens: '08:00', closes: '14:00' },
    ],
    serves: ['phoenix-az', 'scottsdale-az', 'tempe-az', 'mesa-az', 'chandler-az'],
  },
  {
    id: 'tucson',
    name: 'Tucson Office',
    legalName: 'Load Logic LLC',
    type: 'HomeAndConstructionBusiness',
    priceRange: '$$',
    phone: '+1-520-555-0177',
    email: 'tucson@loadlogic.com',
    address: {
      street: '456 Speedway Blvd',
      city: 'Tucson',
      region: 'AZ',
      postalCode: '85705',
      country: 'US',
    },
    geo: { latitude: 32.236, longitude: -110.949 },
    hours: [
      { days: WEEKDAYS, opens: '07:30', closes: '17:30' },
      { days: ['Saturday'], opens: '09:00', closes: '13:00' },
    ],
    serves: ['tucson-az', 'oro-valley-az'],
  },
];

/** The headquarters / default office. Feeds org-level config in site.ts. */
export const primaryOffice = offices[0];

export const getOffice = (id: string): Office | undefined =>
  offices.find((o) => o.id === id);

/** Resolve the canonical schema @id for an office node (primary shares /#business). */
export const officeNodeId = (siteUrl: string, office: Office): string =>
  office.id === primaryOffice.id ? `${siteUrl}/#business` : `${siteUrl}/#office-${office.id}`;
