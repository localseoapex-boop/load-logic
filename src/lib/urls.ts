/**
 * urls.ts — canonical URL builders.
 *
 * Centralizing URL construction means the routing scheme is defined in ONE
 * place. If you ever change /locations to /service-areas, you edit here and
 * every internal link, breadcrumb, and sitemap entry follows — no find-and-
 * replace across templates.
 */
import { SITE } from '../config/site';

export const serviceUrl = (slug: string): string => `/services/${slug}`;

export const cityUrl = (slug: string): string => `/locations/${slug}`;

/*
 * There is deliberately no locationServiceUrl / locationSubServiceUrl.
 *
 * The site used to generate /locations/[city]/[service] and
 * /locations/[city]/[service]/[subservice], which multiplied 9 cities by 14
 * services into 144 URLs that all asserted the same fact: the service is
 * available in the city. That fact is data, not a page. It still lives in
 * locations.ts and services.ts, is resolved by servicesForLocation and
 * locationsForService, and is published in /knowledge.json — it is simply
 * expressed now as a link between the two canonical pages instead of as a
 * generated page of its own.
 *
 * If a specific city ever earns genuinely distinct service content, it should be
 * a deliberate, individually written page — not a template fan-out.
 */


/** /services/[category]/[subservice] — parent sub-service page. */
export const subServiceUrl = (categorySlug: string, subSlug: string): string =>
  `/services/${categorySlug}/${subSlug}`;

/** /locations/[city]/[category]/[subservice] — location sub-service page. */
/** Build an absolute URL from a path, using the configured site origin. */
export const absoluteUrl = (path: string): string => new URL(path, SITE.url).href;
