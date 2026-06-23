/**
 * services.ts — the service catalog (requirement #6: content model).
 *
 * One entry per service line. This drives:
 *   - /services/[service] pages (one per entry)
 *   - /locations/[city]/[service] pages (entry × location)
 *   - "Related services" internal links
 *
 * `related` holds sibling slugs for cross-linking; `schemaType` is the closest
 * schema.org business type if you later emit per-service LocalBusiness nodes.
 * Adding a service here automatically generates its pages — no new files.
 */
export interface Service {
  slug: string;
  name: string;
  /** Closest schema.org business type for this trade. */
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
    slug: 'hvac',
    name: 'HVAC',
    schemaType: 'HVACBusiness',
    tagline: 'Heating and cooling repair, installation, and maintenance.',
    description:
      'Expert HVAC repair, AC installation, and heating maintenance to keep your home comfortable year-round.',
    intro:
      'From summer AC breakdowns to winter heating tune-ups, our licensed HVAC technicians keep your home comfortable in every season.',
    features: [
      'AC repair and replacement',
      'Furnace and heat pump service',
      'Seasonal maintenance plans',
      'Thermostat installation',
      'Indoor air quality solutions',
    ],
    related: ['insulation', 'electrical', 'plumbing'],
  },
  {
    slug: 'plumbing',
    name: 'Plumbing',
    schemaType: 'Plumber',
    tagline: 'Licensed plumbers for repairs, installs, and emergencies.',
    description:
      'Licensed plumbers for leaks, water heaters, drain cleaning, and 24/7 emergency repairs.',
    intro:
      'Leaks, clogs, and water heater failures never happen at a good time. Our licensed plumbers offer upfront pricing and same-day service.',
    features: [
      'Leak detection and pipe repair',
      'Water heater install & replacement',
      'Fixture and faucet installation',
      'Repiping and remodels',
      '24/7 emergency plumbing',
    ],
    related: ['drain-cleaning', 'hvac', 'electrical'],
  },
  {
    slug: 'electrical',
    name: 'Electrical',
    schemaType: 'Electrician',
    tagline: 'Safe, code-compliant electrical work for your home.',
    description:
      'Licensed electricians for panel upgrades, wiring, outlets, lighting, and electrical safety inspections.',
    intro:
      'Electrical work is no place to cut corners. Our licensed electricians handle everything from a flickering outlet to a full panel upgrade.',
    features: [
      'Panel upgrades and replacements',
      'Outlet, switch, and wiring repair',
      'Lighting installation',
      'EV charger installation',
      'Electrical safety inspections',
    ],
    related: ['hvac', 'plumbing', 'insulation'],
  },
  {
    slug: 'drain-cleaning',
    name: 'Drain Cleaning',
    schemaType: 'Plumber',
    tagline: 'Fast clog removal and drain maintenance.',
    description:
      'Professional drain cleaning and clog removal — kitchen, bathroom, and main sewer lines.',
    intro:
      'A slow or backed-up drain can quickly become a mess. We clear clogs fast and use camera inspection to find the root cause.',
    features: [
      'Kitchen and bathroom drains',
      'Main sewer line clearing',
      'Hydro jetting',
      'Camera line inspection',
      'Recurring clog diagnosis',
    ],
    related: ['plumbing', 'hvac', 'electrical'],
  },
  {
    slug: 'insulation',
    name: 'Insulation',
    schemaType: 'GeneralContractor',
    tagline: 'Lower bills and a more comfortable home.',
    description:
      'Attic, wall, and crawl space insulation to cut energy bills and improve home comfort.',
    intro:
      'Proper insulation is one of the highest-ROI upgrades for an Arizona home — lower energy bills and a more even temperature in every room.',
    features: [
      'Attic insulation and air sealing',
      'Wall and crawl space insulation',
      'Blown-in and batt insulation',
      'Energy efficiency assessment',
      'Radiant barrier installation',
    ],
    related: ['hvac', 'electrical', 'plumbing'],
  },
];

export const getService = (slug: string): Service | undefined =>
  services.find((s) => s.slug === slug);

/** All service slugs — used as the default service set for a location. */
export const allServiceSlugs = services.map((s) => s.slug);
