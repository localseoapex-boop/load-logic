/**
 * /knowledge.json — a machine-readable description of the business.
 *
 * Two jobs in one file.
 *
 * 1. IT VALIDATES THE GRAPH.
 *    `assertGraphIntegrity()` runs here at build time. Vite compiles this
 *    module, so the TypeScript imports across src/data resolve properly, which
 *    they do not inside an Astro integration hook. A mistyped slug anywhere in
 *    the knowledge graph therefore fails the build with a precise message rather
 *    than rendering an empty section on a live page. This is the single
 *    enforcement point for data correctness across the whole site.
 *
 * 2. IT PUBLISHES THE GRAPH.
 *    Search engines read the schema.org JSON-LD embedded in each page. AI
 *    systems and agents increasingly do better with one structured document
 *    describing what a business does, where, for whom, with what limits, and how
 *    to act on it. That is what this endpoint is.
 *
 * ─────────────────────────── Content rules ───────────────────────────
 *
 * Everything here is also visible somewhere on the site. This endpoint does not
 * expose information the pages do not show, and it does not assert anything the
 * verification gates would suppress in the UI: unverified reviews, unpublished
 * prices, unconfirmed credentials, and unconfirmed equipment are all absent.
 *
 * Excluded from the sitemap in astro.config.mjs. It is a resource for machines,
 * not a page for indexing.
 */
import type { APIRoute } from 'astro';
import { assertGraphIntegrity, businessGraphSummary } from '../lib/knowledge';
import { SITE, BUSINESS, VERIFIED, hasVerifiedFacts } from '../config/site';
import { loadSizes, pricingFactors, pricingTerms, isPricingPublished } from '../data/pricing';
import { disposalRoutes } from '../data/disposal';
import { situations } from '../data/situations';
import { propertyTypes } from '../data/property-types';
import { accessFactors } from '../data/access';
import { faqs } from '../data/faqs';
import { hasVerifiedReviews, aggregateRating } from '../data/reviews';
import { hasConfirmedEquipment } from '../data/equipment';

export const prerender = true;

export const GET: APIRoute = () => {
  // Fails the build on any dangling reference across src/data.
  assertGraphIntegrity();

  const graph = businessGraphSummary();

  const body = {
    $schema: 'https://loadlogic.dev/schemas/local-service-graph/v1',
    generatedFrom: 'src/data',
    business: {
      name: SITE.name,
      description: SITE.description,
      url: SITE.url,
      phone: BUSINESS.phone,
      email: BUSINESS.email,
      areaServed: BUSINESS.areaServed,
      offices: graph.offices,
    },

    services: graph.services,
    locations: graph.locations,
    materials: graph.materials,

    situations: situations.map((s) => ({
      slug: s.slug,
      name: s.name,
      question: s.question,
      services: s.services,
      propertyTypes: s.propertyTypes,
      typicalLoad: s.typicalLoad,
      urgency: s.urgency,
    })),

    propertyTypes: propertyTypes.map((p) => ({
      slug: p.slug,
      name: p.name,
      need: p.need,
      services: p.services,
    })),

    pricing: {
      // Amounts appear only once real figures are supplied. Until then this
      // publishes the model, not invented numbers.
      published: isPricingPublished(),
      commitments: pricingTerms.commitments,
      loadSizes: loadSizes.map((l) => ({
        slug: l.slug,
        name: l.name,
        fraction: l.fraction,
        summary: l.summary,
        examples: l.exampleContents,
        ...(l.price.published ? { price: { min: l.price.min, max: l.price.max, currency: l.price.currency } } : {}),
      })),
      factors: pricingFactors.map((f) => ({
        slug: f.slug,
        name: f.name,
        explanation: f.explanation,
        primary: f.primary,
        services: f.services,
      })),
    },

    accessFactors: accessFactors.map((a) => ({
      slug: a.slug,
      name: a.name,
      question: a.question,
      effect: a.effect,
      tellUs: a.tellUs,
      affectsPrice: a.affectsPrice,
    })),

    disposal: disposalRoutes.map((d) => ({
      slug: d.slug,
      name: d.name,
      summary: d.summary,
      categories: d.categories,
      conditions: d.conditions,
    })),

    faqs: faqs.map((f) => ({
      slug: f.slug,
      question: f.question,
      answer: f.answer,
      scope: f.scope,
      about: f.about,
    })),

    quoteActions: graph.quoteActions,

    // Claims the site deliberately does not make. Stated explicitly so a
    // consumer knows the absence is intentional rather than an omission.
    unverified: {
      reviews: !hasVerifiedReviews(),
      aggregateRating: aggregateRating() === undefined,
      credentials: !hasVerifiedFacts(),
      equipment: !hasConfirmedEquipment(),
      pricing: !isPricingPublished(),
      note: 'Fields listed true here have no verified data behind them and are therefore not claimed anywhere on the site or in its structured data.',
    },
    ...(hasVerifiedFacts() ? { verified: VERIFIED } : {}),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
