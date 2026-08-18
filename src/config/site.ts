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
  /**
   * When true, the PRIMARY office's home city (offices[0].homeCitySlug) is NOT
   * generated as a /locations/* service-area page — it is represented directly
   * by the homepage and the canonical /services/* pages instead. This avoids
   * duplicate "home city" pages. Flip to false for businesses that DO want a
   * dedicated location page for their home city. See src/lib/links.ts.
   */
  excludeHomeCityFromServiceAreas: true,
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

/**
 * VERIFIED — checkable claims about the business.
 *
 * Every field is optional and every one starts absent. `TrustFacts` renders ONLY
 * the fields that are present, and renders nothing at all when none are. This is
 * the mechanism that keeps the site from claiming credentials it does not have.
 *
 * Do not populate a field to "fill out the section". Populate it when the fact is
 * true and checkable, and add `since` or a reference where one exists. An empty
 * trust section is honest. A fabricated one is not, and for a licensed trade it
 * is the kind of claim a customer may rely on.
 */
export const VERIFIED: {
  /** Year the business began operating. */
  operatingSince?: number;
  /** General liability insurance, once confirmed. */
  insured?: { confirmed: true; detail: string };
  /** Business registration, e.g. an Arizona LLC filing. */
  registered?: { confirmed: true; detail: string };
  /** Any license the trade requires in this jurisdiction. */
  licensed?: { confirmed: true; detail: string };
  /** Profiles that corroborate the business, used for schema `sameAs`. */
  profiles?: { platform: string; url: string }[];
  /** Free-form verified differentiators, each with something backing it. */
  claims?: { label: string; detail: string; source?: string }[];
} = {
  // Intentionally empty. Populate only with facts that can be checked.
};

/** True when there is at least one verified fact worth showing. */
export const hasVerifiedFacts = (): boolean =>
  Boolean(
    VERIFIED.operatingSince ||
      VERIFIED.insured ||
      VERIFIED.registered ||
      VERIFIED.licensed ||
      (VERIFIED.profiles && VERIFIED.profiles.length > 0) ||
      (VERIFIED.claims && VERIFIED.claims.length > 0),
  );

/** Primary navigation links rendered in the header. */
export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Areas We Serve', href: '/locations' },
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
      { label: 'Areas We Serve', href: '/locations' },
      // Mesa is the home market — represented by the homepage, not a location page.
      { label: 'Mesa Junk Removal', href: '/' },
      { label: 'Blog', href: '/blog' },
    ],
  },
] as const;
