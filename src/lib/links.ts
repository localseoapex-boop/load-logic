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

/** Cities where a given service is available ("related locations" for a service). */
export const locationsForService = (serviceSlug: string, limit?: number): Location[] => {
  const result = locations.filter((l) => isServiceAvailable(l, serviceSlug));
  return limit ? result.slice(0, limit) : result;
};

/** Nearby cities for a location, resolved from its `nearby` slugs. */
export const nearbyCities = (citySlug: string, limit = 4): Location[] => {
  const loc = getLocation(citySlug);
  return (loc?.nearby ?? [])
    .map(getLocation)
    .filter((l): l is Location => Boolean(l))
    .slice(0, limit);
};
