/**
 * Central site configuration — brand-level settings and navigation.
 *
 * Per-office NAP/hours now live in src/data/offices.ts (multi-office support).
 * BUSINESS below is derived from the PRIMARY office plus org-level fields, so
 * existing references (BUSINESS.phone, BUSINESS.address, ...) keep working with
 * zero duplicated data.
 */
import { primaryOffice } from '../data/offices';

export const SITE = {
  /** Must match `site` in astro.config.mjs. Used to build absolute/canonical URLs. */
  url: 'https://load-logic.vercel.app',
  /** Brand / business name, reused in titles, schema, and footer. */
  name: 'Load Logic',
  /** Short tagline used as the default meta description fallback. */
  description:
    'Licensed, insured home service professionals — plumbing, HVAC, and electrical. Fast, honest, and local.',
  /** Default social share image (lives in /public). Replace with a real 1200x630 image. */
  defaultOgImage: '/og-default.png',
  /** Default language for the <html lang> attribute. */
  locale: 'en',
  /** Twitter/X handle for twitter:site card attribution. */
  twitter: '@loadlogic',
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
  email: primaryOffice.email,
  address: primaryOffice.address,
  geo: primaryOffice.geo,
  openingHours: primaryOffice.hours,
  /** All cities served across every office — handy for area-served lists. */
  areaServed: ['Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler', 'Tucson', 'Oro Valley'],
} as const;

/** Primary navigation links rendered in the header. */
export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Locations', href: '/locations' },
  { label: 'Blog', href: '/blog' },
] as const;

/** Footer link groups. */
export const FOOTER_LINKS = [
  {
    title: 'Services',
    links: [
      { label: 'HVAC', href: '/services/hvac' },
      { label: 'Plumbing', href: '/services/plumbing' },
      { label: 'Electrical', href: '/services/electrical' },
      { label: 'Drains', href: '/services/drains' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Service Areas', href: '/locations/phoenix-az' },
    ],
  },
] as const;
