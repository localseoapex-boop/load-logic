/**
 * links.ts — internal-linking helpers (requirement #4).
 *
 * Internal linking is how programmatic-SEO sites pass relevance between pages
 * and help crawlers discover hundreds of URLs. These pure functions answer the
 * questions every template asks:
 *
 *   - relatedServices(slug)      → "Related services" block
 *   - nearbyCities(slug)         → "Nearby cities" block
 *   - locationsForService(slug)  → "Available in these areas" (related locations)
 *   - servicesForLocation(loc)   → which services a city offers
 *
 * Keeping this logic out of the templates means every page links consistently
 * and the rules live in one testable place.
 */
import { services, getService, allServiceSlugs, type Service } from '../data/services';
import { locations, getLocation, type Location } from '../data/locations';
import { subServices, type SubService } from '../data/subservices';
import { primaryOffice } from '../data/offices';
import { SITE } from '../config/site';

/**
 * Service-area routing model.
 *
 * The primary office's home city (Mesa) is represented by the homepage and the
 * canonical /services/* pages, NOT by a /locations/* page — so we never generate
 * or link to a duplicate home-city location page. The set of EXCLUDED city slugs
 * is derived from data (offices[0].homeCitySlug) and gated by a config flag, so
 * the rule is reusable for any future business with a different home city.
 *
 * Every place that generates location pages or links to them MUST go through
 * `serviceAreaLocations` / `isServiceAreaLocation` so the architecture stays
 * consistent and no broken (home-city) routes are ever produced.
 */
const excludedCitySlugs = new Set<string>(
  SITE.excludeHomeCityFromServiceAreas && primaryOffice.homeCitySlug
    ? [primaryOffice.homeCitySlug]
    : [],
);

/** True when a location should exist as a /locations/* service-area page. */
export const isServiceAreaLocation = (loc: Location): boolean =>
  !excludedCitySlugs.has(loc.slug);

/** True when a city slug is a home-market city (no dedicated location page). */
export const isHomeCity = (slug: string): boolean => excludedCitySlugs.has(slug);

/**
 * The cities that get generated /locations/* pages — every location EXCEPT the
 * excluded home-market city. This is the single source of truth for location
 * page generation, the Areas We Serve hub, and homepage area cards.
 */
export const serviceAreaLocations: Location[] = locations.filter(isServiceAreaLocation);

/** The service slugs a given location offers (defaults to all). */
export const serviceSlugsFor = (loc: Location): string[] => loc.services ?? allServiceSlugs;

/** Is a specific service offered in a specific location? */
export const isServiceAvailable = (loc: Location, serviceSlug: string): boolean =>
  serviceSlugsFor(loc).includes(serviceSlug);

/** Full Service objects offered in a location, in catalog order. */
export const servicesForLocation = (loc: Location): Service[] =>
  serviceSlugsFor(loc)
    .map(getService)
    .filter((s): s is Service => Boolean(s));

/**
 * Related services for cross-linking. Prefers the curated `related` list, then
 * backfills with other catalog services so the block is never sparse.
 */
export const relatedServices = (serviceSlug: string, limit = 4): Service[] => {
  const svc = getService(serviceSlug);
  const curated = (svc?.related ?? [])
    .map(getService)
    .filter((s): s is Service => Boolean(s));
  if (curated.length >= limit) return curated.slice(0, limit);
  const backfill = services.filter(
    (s) => s.slug !== serviceSlug && !curated.some((c) => c.slug === s.slug),
  );
  return [...curated, ...backfill].slice(0, limit);
};

/**
 * Cities where a given service is available ("related locations" for a service).
 * Excludes the home-market city — its service page IS the canonical (Mesa) page,
 * so service pages link out only to surrounding service-area cities.
 */
export const locationsForService = (serviceSlug: string, limit?: number): Location[] => {
  const result = serviceAreaLocations.filter((l) => isServiceAvailable(l, serviceSlug));
  return limit ? result.slice(0, limit) : result;
};

/**
 * Nearby cities for a location, resolved from its `nearby` slugs. Home-market
 * cities are filtered out so we never link to a location page that isn't
 * generated (Mesa can still appear in raw `nearby` data — it's dropped here).
 */
export const nearbyCities = (citySlug: string, limit = 4): Location[] => {
  const loc = getLocation(citySlug);
  return (loc?.nearby ?? [])
    .map(getLocation)
    .filter((l): l is Location => Boolean(l) && isServiceAreaLocation(l))
    .slice(0, limit);
};

/**
 * Sub-services belonging to a category, in catalog order. Empty for categories
 * that have none yet (e.g. 'insulation'), so callers can render unconditionally.
 */
export const subServicesForCategory = (categorySlug: string): SubService[] =>
  subServices.filter((s) => s.parent === categorySlug);
