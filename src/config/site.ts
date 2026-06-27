/**
 * Central site configuration — brand-level settings and navigation.
 *
 * Per-office NAP/hours live in src/data/offices.ts (multi-office support).
 * BUSINESS below is derived from the PRIMARY office plus org-level fields, so
 * existing references (BUSINESS.phone, BUSINESS.address, ...) keep working with
 * zero duplicated data.
 */
import { primaryOffice } from '../data/offices';

export const SITE = {
  /** Must match `site` in astro.config.mjs. Used to build absolute/canonical URLs. */
  url: 'https://load-logic.vercel.app',
  /** Brand / business name, reused in titles, schema, and footer. */
  name: 'Load Logic Junk Removal',
  /** Short tagline used as the default meta description fallback. */
  description:
    'Full-service junk removal and cleanouts in Mesa and the East Valley. Upfront pricing, fast scheduling, and all the heavy lifting handled.',
  /** Default social share image (lives in /public). 1200x630, regenerated on build. */
  defaultOgImage: '/og-default.png',
  /** Default language for the <html lang> attribute. */
  locale: 'en',
  /** Twitter/X handle for twitter:site card attribution. */
  twitter: '@loadlogicjunk',
} as const;

/**
 * Org-level business defaults, derived from the primary office. Used for the
 * site-wide NAP shortcuts (nav CTA, service-page provider, etc.). For
 * multi-office data (footer, schema) iterate `offices` from src/data/offices.ts.
 */
export const BUSINESS = {
  legalName: primaryOffice.legalName,
  type: primaryOffice.type,
  priceRange: primaryOffice.priceRange,
  phone: primaryOffice.phone,
  /** Human-friendly phone for display in CTAs and copy. */
  phoneDisplay: '(480) 712-0431',
  email: primaryOffice.email,
  address: primaryOffice.address,
  geo: primaryOffice.geo,
  openingHours: primaryOffice.hours,
  /** All cities served — handy for area-served lists. */
  areaServed: [
    'Mesa',
    'Chandler',
    'Gilbert',
    'Tempe',
    'Queen Creek',
    'San Tan Valley',
    'Apache Junction',
    'Gold Canyon',
    'Scottsdale',
    'Ahwatukee',
  ],
} as const;

/** Primary navigation links rendered in the header. */
export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Service Areas', href: '/locations' },
  { label: 'Blog', href: '/blog' },
] as const;

/** Footer link groups. */
export const FOOTER_LINKS = [
  {
    title: 'Popular Services',
    links: [
      { label: 'Junk Removal', href: '/services/junk-removal' },
      { label: 'Furniture Removal', href: '/services/furniture-removal' },
      { label: 'Garage Cleanouts', href: '/services/garage-cleanouts' },
      { label: 'Same-Day Junk Removal', href: '/services/same-day-junk-removal' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'All Services', href: '/services' },
      { label: 'Service Areas', href: '/locations' },
      { label: 'Mesa, AZ', href: '/locations/mesa-az' },
      { label: 'Blog', href: '/blog' },
    ],
  },
] as const;
