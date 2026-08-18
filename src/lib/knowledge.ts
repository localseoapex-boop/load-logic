/**
 * knowledge.ts — the query layer over the business knowledge graph.
 *
 * src/data/* holds entities and stores each relationship in exactly ONE
 * direction. This module resolves those relationships in BOTH directions, so a
 * template can ask a natural question without knowing which side of the edge
 * happens to own it:
 *
 *   materialsForService('hot-tub-removal')     // inverse of category -> services
 *   situationsForService('garage-cleanouts')   // inverse of situation -> services
 *   canWeTake('couch')                         // a complete coverage answer
 *
 * It complements src/lib/links.ts rather than replacing it. links.ts owns the
 * routing and internal-linking rules that the SEO architecture depends on and is
 * deliberately untouched. This module owns everything else.
 *
 * ─────────────────────────── Why derive, not store ───────────────────────────
 *
 * Storing both directions of an edge means two places to update and one place to
 * forget. Every inverse below is computed from the canonical side at build time.
 * The site is fully static, so this all runs once during the build and costs
 * nothing at runtime.
 *
 * `assertGraphIntegrity()` walks every edge and throws on a dangling reference,
 * which turns a typo in a slug into a failed build rather than a silently empty
 * section on a live page.
 */
import { services, getService, type Service } from '../data/services';
import { locations, getLocation, type Location } from '../data/locations';
import { subServices } from '../data/subservices';
import { offices } from '../data/offices';
import {
  materialCategories,
  materials,
  getMaterial,
  getMaterialCategory,
  materialsInCategory,
  findMaterials,
  type Material,
  type MaterialCategory,
} from '../data/materials';
import { situations, getSituation, type Situation } from '../data/situations';
import { propertyTypes, getPropertyType, type PropertyType } from '../data/property-types';
import { loadSizes, pricingFactors, getLoadSize, type LoadSize, type PricingFactor } from '../data/pricing';
import { accessFactors, getAccessFactor, type AccessFactor } from '../data/access';
import { disposalRoutes, getDisposalRoute, type DisposalRoute } from '../data/disposal';
import { faqs, type Faq } from '../data/faqs';
import { jobs, type Job } from '../data/jobs';
import { verifiedReviews } from '../data/reviews';
import { quoteActions } from '../data/quote-actions';
import { vehicles, confirmedCapacityCubicYards } from '../data/equipment';
import { getServiceFaqs } from '../data/service-content';
import { serviceSlugsFor } from './links';

/* ═══════════════════════════ Service-centred ═══════════════════════════ */

/** Material categories this service handles. Inverse of category -> services. */
export const categoriesForService = (serviceSlug: string): MaterialCategory[] =>
  materialCategories
    .filter((c) => c.services.includes(serviceSlug))
    .sort((a, b) => a.order - b.order);

/** Every individual item this service handles, via its categories plus overrides. */
export const materialsForService = (serviceSlug: string): Material[] => {
  const categorySlugs = new Set(categoriesForService(serviceSlug).map((c) => c.slug));
  return materials.filter(
    (m) =>
      m.status !== 'prohibited' &&
      (m.services ? m.services.includes(serviceSlug) : categorySlugs.has(m.category)),
  );
};

/** Situations that lead someone to this service. Inverse of situation -> services. */
export const situationsForService = (serviceSlug: string): Situation[] =>
  situations.filter((s) => s.services.includes(serviceSlug)).sort((a, b) => a.order - b.order);

/** Buyers who typically book this service. Inverse of propertyType -> services. */
export const propertyTypesForService = (serviceSlug: string): PropertyType[] =>
  propertyTypes.filter((p) => p.services.includes(serviceSlug)).sort((a, b) => a.order - b.order);

/** Load sizes this service commonly runs at. Inverse of loadSize -> services. */
export const loadSizesForService = (serviceSlug: string): LoadSize[] =>
  loadSizes.filter((l) => l.services.includes(serviceSlug)).sort((a, b) => a.order - b.order);

/** Pricing inputs that apply to this service. */
export const pricingFactorsForService = (serviceSlug: string): PricingFactor[] =>
  pricingFactors.filter((f) => f.services === 'all' || f.services.includes(serviceSlug));

/** Disposal routes the material from this service typically follows. */
export const disposalRoutesForService = (serviceSlug: string): DisposalRoute[] => {
  const categorySlugs = new Set(categoriesForService(serviceSlug).map((c) => c.slug));
  return disposalRoutes
    .filter((r) => r.categories.some((c) => categorySlugs.has(c)))
    .sort((a, b) => a.order - b.order);
};

/** Access conditions this service commonly runs into, via its situations. */
export const accessFactorsForService = (serviceSlug: string): AccessFactor[] => {
  const fromJobs = jobs.filter((j) => j.service === serviceSlug).flatMap((j) => j.accessFactors);
  const fromPropertyTypes = propertyTypesForService(serviceSlug).flatMap((p) => p.accessFactors);
  const slugs = new Set([...fromJobs, ...fromPropertyTypes]);
  return accessFactors.filter((a) => slugs.has(a.slug)).sort((a, b) => a.order - b.order);
};

/**
 * Every question relevant to a service page: the service's own questions from
 * service-content.ts first, then the global bank. Returned in a shape both the
 * FAQ component and the FAQPage schema emitter can consume.
 */
export const faqsForService = (serviceSlug: string): { question: string; answer: string }[] => {
  const own = getServiceFaqs(serviceSlug);
  const global = faqs
    .filter((f) => f.scope.kind === 'service' && f.scope.slug === serviceSlug)
    .map((f) => ({ question: f.question, answer: f.answer }));
  return [...own, ...global];
};

/* ═══════════════════════════ Material-centred ═══════════════════════════ */

/** Services that handle a given item. Inverse of category -> services. */
export const servicesForMaterial = (materialSlug: string): Service[] => {
  const material = getMaterial(materialSlug);
  if (!material) return [];
  if (material.services) {
    return material.services.map(getService).filter((s): s is Service => Boolean(s));
  }
  const category = getMaterialCategory(material.category);
  return (category?.services ?? []).map(getService).filter((s): s is Service => Boolean(s));
};

/** Where a given item is likely to end up. */
export const disposalRoutesForMaterial = (materialSlug: string): DisposalRoute[] => {
  const material = getMaterial(materialSlug);
  if (!material) return [];
  return disposalRoutes
    .filter((r) => r.categories.includes(material.category))
    .sort((a, b) => a.order - b.order);
};

/** Material categories that a disposal route accepts. */
export const categoriesForDisposalRoute = (routeSlug: string): MaterialCategory[] => {
  const route = getDisposalRoute(routeSlug);
  if (!route) return [];
  return materialCategories.filter((c) => route.categories.includes(c.slug));
};

/**
 * The complete answer to "can you take this?".
 *
 * Returns everything a visitor or an AI system needs in one object: whether it
 * is taken, any condition attached, which service covers it, where it goes, and
 * what to do instead when the answer is no.
 */
export interface CoverageAnswer {
  material: Material;
  category: MaterialCategory | undefined;
  accepted: boolean;
  /** The condition, for restricted items. The reason, for prohibited ones. */
  condition?: string;
  /** Where to go instead, for prohibited items. */
  alternative?: string;
  services: Service[];
  disposal: DisposalRoute[];
  /** Needs extra hands or planning, which is worth flagging in a quote. */
  heavy: boolean;
}

export const coverageFor = (materialSlug: string): CoverageAnswer | undefined => {
  const material = getMaterial(materialSlug);
  if (!material) return undefined;
  return {
    material,
    category: getMaterialCategory(material.category),
    accepted: material.status !== 'prohibited',
    condition: material.note,
    alternative: material.alternative,
    services: servicesForMaterial(materialSlug),
    disposal: disposalRoutesForMaterial(materialSlug),
    heavy: Boolean(material.heavy),
  };
};

/** Natural-language lookup returning full coverage answers. */
export const canWeTake = (query: string): CoverageAnswer[] =>
  findMaterials(query)
    .map((m) => coverageFor(m.slug))
    .filter((c): c is CoverageAnswer => Boolean(c));

/* ═══════════════════════════ Situation-centred ═══════════════════════════ */

export const servicesForSituation = (situationSlug: string): Service[] =>
  (getSituation(situationSlug)?.services ?? [])
    .map(getService)
    .filter((s): s is Service => Boolean(s));

/** Situations relevant to a buyer. Inverse of situation -> propertyTypes. */
export const situationsForPropertyType = (propertyTypeSlug: string): Situation[] =>
  situations
    .filter((s) => s.propertyTypes.includes(propertyTypeSlug))
    .sort((a, b) => a.order - b.order);

/** Cities where a situation is called out as common. Inverse of location -> situations. */
export const locationsForSituation = (situationSlug: string): Location[] =>
  locations.filter((l) => l.situations?.includes(situationSlug));

/* ═══════════════════════════ Location-centred ═══════════════════════════ */

/** Situations this city calls out, resolved to full entities. */
export const situationsForLocation = (locationSlug: string): Situation[] => {
  const location = getLocation(locationSlug);
  return (location?.situations ?? [])
    .map(getSituation)
    .filter((s): s is Situation => Boolean(s));
};

/** Buyer mix for this city, resolved to full entities. */
export const propertyTypesForLocation = (locationSlug: string): PropertyType[] => {
  const location = getLocation(locationSlug);
  return (location?.propertyMix ?? [])
    .map(getPropertyType)
    .filter((p): p is PropertyType => Boolean(p));
};

/** Access conditions this city genuinely involves, with the local explanation. */
export const accessNotesForLocation = (
  locationSlug: string,
): { factor: AccessFactor; note: string }[] => {
  const location = getLocation(locationSlug);
  return (location?.accessNotes ?? [])
    .map((n) => {
      const factor = getAccessFactor(n.factor);
      return factor ? { factor, note: n.note } : undefined;
    })
    .filter((n): n is { factor: AccessFactor; note: string } => Boolean(n));
};

/**
 * Local detail for a specific city and service page.
 *
 * This is the function that solves the thin-content problem on the 126 deep
 * pages. It returns only the local facts that are genuinely relevant to THIS
 * service in THIS city, so a page either has real differentiation to show or it
 * renders nothing extra. It never manufactures filler.
 */
export interface LocalServiceContext {
  situations: Situation[];
  accessNotes: { factor: AccessFactor; note: string }[];
  propertyTypes: PropertyType[];
  jobs: Job[];
  disposalNote?: string;
  neighborhoods: string[];
  zips: string[];
  /** True when there is enough here to render a differentiated section. */
  hasContext: boolean;
}

export const localContextFor = (
  locationSlug: string,
  serviceSlug: string,
): LocalServiceContext => {
  const location = getLocation(locationSlug);

  // Situations this city calls out that this service actually solves.
  const relevantSituations = situationsForLocation(locationSlug).filter((s) =>
    s.services.includes(serviceSlug),
  );

  // Access conditions this city has that this service actually runs into.
  const serviceAccessSlugs = new Set(accessFactorsForService(serviceSlug).map((a) => a.slug));
  const allLocalNotes = accessNotesForLocation(locationSlug);
  const relevantNotes = allLocalNotes.filter((n) => serviceAccessSlugs.has(n.factor.slug));

  // Buyers in this market who book this service.
  const relevantPropertyTypes = propertyTypesForLocation(locationSlug).filter((p) =>
    p.services.includes(serviceSlug),
  );

  const relevantJobs = jobs.filter((j) => j.location === locationSlug && j.service === serviceSlug);

  return {
    situations: relevantSituations,
    // Fall back to the city's general access notes when none match this service,
    // since they are still true and still local.
    accessNotes: relevantNotes.length > 0 ? relevantNotes : allLocalNotes,
    propertyTypes: relevantPropertyTypes,
    jobs: relevantJobs,
    disposalNote: location?.disposalNote,
    neighborhoods: location?.neighborhoods ?? [],
    zips: location?.zips ?? [],
    hasContext:
      relevantSituations.length > 0 || allLocalNotes.length > 0 || relevantJobs.length > 0,
  };
};

/* ═══════════════════════════ Graph integrity ═══════════════════════════ */

/**
 * Walk every stored relationship and collect dangling references.
 *
 * Called from a build-time entry point so a mistyped slug fails the build
 * instead of quietly rendering an empty section on a live page.
 */
export const graphIntegrityErrors = (): string[] => {
  const errors: string[] = [];

  const serviceSlugs = new Set(services.map((s) => s.slug));
  const locationSlugs = new Set(locations.map((l) => l.slug));
  const categorySlugs = new Set(materialCategories.map((c) => c.slug));
  const materialSlugs = new Set(materials.map((m) => m.slug));
  const situationSlugs = new Set(situations.map((s) => s.slug));
  const propertyTypeSlugs = new Set(propertyTypes.map((p) => p.slug));
  const loadSizeSlugs = new Set(loadSizes.map((l) => l.slug));
  const pricingFactorSlugs = new Set(pricingFactors.map((f) => f.slug));
  const accessFactorSlugs = new Set(accessFactors.map((a) => a.slug));
  const disposalSlugs = new Set(disposalRoutes.map((d) => d.slug));

  const check = (
    ok: boolean,
    where: string,
    field: string,
    value: string,
    kind: string,
  ): void => {
    if (!ok) errors.push(`${where}: ${field} references unknown ${kind} "${value}"`);
  };

  materialCategories.forEach((c) => {
    c.services.forEach((s) => check(serviceSlugs.has(s), `materialCategory:${c.slug}`, 'services', s, 'service'));
    c.disposal.forEach((d) => check(disposalSlugs.has(d), `materialCategory:${c.slug}`, 'disposal', d, 'disposalRoute'));
  });

  materials.forEach((m) => {
    check(categorySlugs.has(m.category), `material:${m.slug}`, 'category', m.category, 'materialCategory');
    m.services?.forEach((s) => check(serviceSlugs.has(s), `material:${m.slug}`, 'services', s, 'service'));
    if (m.status !== 'accepted' && !m.note) {
      errors.push(`material:${m.slug}: status "${m.status}" requires a note explaining the condition`);
    }
  });

  situations.forEach((s) => {
    s.services.forEach((v) => check(serviceSlugs.has(v), `situation:${s.slug}`, 'services', v, 'service'));
    s.propertyTypes.forEach((v) => check(propertyTypeSlugs.has(v), `situation:${s.slug}`, 'propertyTypes', v, 'propertyType'));
    s.materialCategories.forEach((v) => check(categorySlugs.has(v), `situation:${s.slug}`, 'materialCategories', v, 'materialCategory'));
    check(loadSizeSlugs.has(s.typicalLoad), `situation:${s.slug}`, 'typicalLoad', s.typicalLoad, 'loadSize');
  });

  propertyTypes.forEach((p) => {
    p.services.forEach((v) => check(serviceSlugs.has(v), `propertyType:${p.slug}`, 'services', v, 'service'));
    p.accessFactors.forEach((v) => check(accessFactorSlugs.has(v), `propertyType:${p.slug}`, 'accessFactors', v, 'accessFactor'));
  });

  loadSizes.forEach((l) => {
    l.services.forEach((v) => check(serviceSlugs.has(v), `loadSize:${l.slug}`, 'services', v, 'service'));
    l.situations.forEach((v) => check(situationSlugs.has(v), `loadSize:${l.slug}`, 'situations', v, 'situation'));
  });

  pricingFactors.forEach((f) => {
    if (f.services !== 'all') {
      f.services.forEach((v) => check(serviceSlugs.has(v), `pricingFactor:${f.slug}`, 'services', v, 'service'));
    }
  });

  accessFactors.forEach((a) => {
    a.pricingFactors.forEach((v) => check(pricingFactorSlugs.has(v), `accessFactor:${a.slug}`, 'pricingFactors', v, 'pricingFactor'));
  });

  disposalRoutes.forEach((d) => {
    d.categories.forEach((v) => check(categorySlugs.has(v), `disposalRoute:${d.slug}`, 'categories', v, 'materialCategory'));
  });

  locations.forEach((l) => {
    l.propertyMix?.forEach((v) => check(propertyTypeSlugs.has(v), `location:${l.slug}`, 'propertyMix', v, 'propertyType'));
    l.situations?.forEach((v) => check(situationSlugs.has(v), `location:${l.slug}`, 'situations', v, 'situation'));
    l.accessNotes?.forEach((n) => check(accessFactorSlugs.has(n.factor), `location:${l.slug}`, 'accessNotes', n.factor, 'accessFactor'));
    l.services?.forEach((v) => check(serviceSlugs.has(v), `location:${l.slug}`, 'services', v, 'service'));
  });

  jobs.forEach((j) => {
    check(locationSlugs.has(j.location), `job:${j.slug}`, 'location', j.location, 'location');
    check(serviceSlugs.has(j.service), `job:${j.slug}`, 'service', j.service, 'service');
    check(propertyTypeSlugs.has(j.propertyType), `job:${j.slug}`, 'propertyType', j.propertyType, 'propertyType');
    check(situationSlugs.has(j.situation), `job:${j.slug}`, 'situation', j.situation, 'situation');
    check(loadSizeSlugs.has(j.loadSize), `job:${j.slug}`, 'loadSize', j.loadSize, 'loadSize');
    j.materials.forEach((v) => check(materialSlugs.has(v), `job:${j.slug}`, 'materials', v, 'material'));
    j.accessFactors.forEach((v) => check(accessFactorSlugs.has(v), `job:${j.slug}`, 'accessFactors', v, 'accessFactor'));
    j.disposal.forEach((d) => check(disposalSlugs.has(d.route), `job:${j.slug}`, 'disposal', d.route, 'disposalRoute'));

    const total = j.disposal.reduce((sum, d) => sum + d.share, 0);
    if (Math.abs(total - 100) > 1) {
      errors.push(`job:${j.slug}: disposal shares total ${total}%, expected about 100%`);
    }
    // Representative examples must never also be marked verified, or the UI
    // would drop the label while still showing illustrative content as fact.
    if (j.representative && j.verified) {
      errors.push(`job:${j.slug}: cannot be both representative and verified`);
    }
  });

  verifiedReviews().forEach((r) => {
    if (!r.source) errors.push(`review:${r.slug}: verified reviews require a source`);
    if (r.location) check(locationSlugs.has(r.location), `review:${r.slug}`, 'location', r.location, 'location');
    if (r.service) check(serviceSlugs.has(r.service), `review:${r.slug}`, 'service', r.service, 'service');
  });

  quoteActions.forEach((a) => {
    a.accessFactors.forEach((v) => check(accessFactorSlugs.has(v), `quoteAction:${a.slug}`, 'accessFactors', v, 'accessFactor'));
  });

  vehicles.forEach((v) => {
    v.services.forEach((s) => check(serviceSlugs.has(s), `vehicle:${v.slug}`, 'services', s, 'service'));
    v.loadSizes.forEach((l) => check(loadSizeSlugs.has(l), `vehicle:${v.slug}`, 'loadSizes', l, 'loadSize'));
    if (v.verified && !v.source) {
      errors.push(`vehicle:${v.slug}: verified equipment requires a source`);
    }
    // A vehicle must not claim a single-trip load size larger than it holds, or
    // the load scale would promise a capacity the equipment does not have.
    if (typeof v.cubicYards === 'number') {
      v.loadSizes.forEach((slug) => {
        const load = getLoadSize(slug);
        if (load && typeof load.cubicYards === 'number' && load.cubicYards > v.cubicYards + 0.01) {
          errors.push(
            `vehicle:${v.slug}: claims load size "${slug}" (${load.cubicYards} cu yd) but holds only ${v.cubicYards} cu yd`,
          );
        }
      });
    }
  });

  // Load volumes are derived from the reference trailer, so the full load must
  // match the largest confirmed single-trip capacity.
  const capacity = confirmedCapacityCubicYards();
  const fullLoad = loadSizes.find((l) => l.fraction === 1);
  if (capacity !== undefined && fullLoad && fullLoad.cubicYards !== capacity) {
    errors.push(
      `loadSize:full: ${fullLoad.cubicYards} cu yd does not match the largest confirmed vehicle capacity of ${capacity} cu yd`,
    );
  }

  jobs.forEach((j) => {
    if (j.vehicle) {
      check(
        vehicles.some((v) => v.slug === j.vehicle),
        `job:${j.slug}`,
        'vehicle',
        j.vehicle,
        'vehicle',
      );
    }
    if (j.loadCount !== undefined && j.loadCount < 1) {
      errors.push(`job:${j.slug}: loadCount must be at least 1`);
    }
  });

  // Every service should be reachable through at least one situation, or no
  // visitor journey leads to it.
  services.forEach((s) => {
    if (situationsForService(s.slug).length === 0) {
      errors.push(`service:${s.slug}: no situation routes to this service`);
    }
  });

  return errors;
};

/** Throws on any dangling reference. Call from a build-time entry point. */
export const assertGraphIntegrity = (): void => {
  const errors = graphIntegrityErrors();
  if (errors.length > 0) {
    throw new Error(
      `Knowledge graph integrity check failed with ${errors.length} error(s):\n  - ${errors.join('\n  - ')}`,
    );
  }
};

/* ═══════════════════════════ Graph summary ═══════════════════════════ */

/**
 * A machine-readable description of the whole business, assembled from the
 * graph. This is what makes the data useful to AI systems and future agentic
 * experiences: one place that states what the business does, where, for whom,
 * with what limits, and how to act on it.
 *
 * Consumed later by a static JSON endpoint. Contains only information that is
 * also visible somewhere on the site.
 */
export const businessGraphSummary = () => ({
  services: services.map((s) => ({
    slug: s.slug,
    name: s.name,
    materials: materialsForService(s.slug).map((m) => m.slug),
    situations: situationsForService(s.slug).map((x) => x.slug),
    propertyTypes: propertyTypesForService(s.slug).map((p) => p.slug),
    loadSizes: loadSizesForService(s.slug).map((l) => l.slug),
    pricingFactors: pricingFactorsForService(s.slug).map((f) => f.slug),
    disposalRoutes: disposalRoutesForService(s.slug).map((d) => d.slug),
    subServices: subServices.filter((sub) => sub.parent === s.slug).map((sub) => sub.slug),
    locations: locations.filter((l) => serviceSlugsFor(l).includes(s.slug)).map((l) => l.slug),
  })),
  locations: locations.map((l) => ({
    slug: l.slug,
    city: l.city,
    region: l.region,
    zips: l.zips ?? [],
    services: serviceSlugsFor(l),
    situations: l.situations ?? [],
    propertyTypes: l.propertyMix ?? [],
    office: l.officeId,
  })),
  materials: materials.map((m) => ({
    slug: m.slug,
    name: m.name,
    aliases: m.aliases,
    category: m.category,
    status: m.status,
    note: m.note,
    alternative: m.alternative,
  })),
  offices: offices.map((o) => ({
    id: o.id,
    city: o.address.city,
    region: o.address.region,
    phone: o.phone,
    serves: o.serves,
  })),
  quoteActions: quoteActions.map((a) => ({
    slug: a.slug,
    label: a.label,
    href: a.href,
    requires: a.inputs.filter((i) => i.required).map((i) => i.name),
  })),
});
