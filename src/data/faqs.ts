/**
 * faqs.ts — the question bank, scoped and addressable.
 *
 * Replaces the four FAQs previously hardcoded in src/pages/index.astro and adds
 * the question banks the site was missing entirely: pricing, the quote process,
 * disposal, access, and per-city questions.
 *
 * Per-SERVICE questions deliberately still live in src/data/service-content.ts
 * alongside the rest of that service's long-form copy. Duplicating them here
 * would create two sources of truth for the same answer. `faqsForService()` in
 * src/lib/knowledge.ts merges the two banks at read time.
 *
 * ─────────────────────── Relationship ownership ───────────────────────
 *
 * FAQ owns:
 *   faq -> scope   (which page type it belongs on)
 *   faq -> about   (the entities it answers a question about)
 *
 * `about` exists so a question can be attached to the right schema.org node and
 * so an AI system can find the answer to "what does Load Logic not take" without
 * inferring it from prose. It is metadata about the answer, not display data.
 */
import type { EntityRef, Scope } from './ontology';
import { ref } from './ontology';

export interface Faq {
  slug: string;
  question: string;
  answer: string;
  scope: Scope;
  /** Entities this question is about. Powers schema and machine lookup. */
  about: EntityRef[];
  /** Surface this prominently rather than in the long list. */
  featured?: boolean;
}

export const faqs: Faq[] = [
  /* ───────────────────────── Pricing ───────────────────────── */
  {
    slug: 'how-is-pricing-determined',
    question: 'How is junk removal priced?',
    answer:
      'Most jobs are priced by how much space your items take up in the truck, plus any unusual labor, access, or disposal needs. You approve the price before loading starts.',
    scope: { kind: 'topic', slug: 'pricing' },
    about: [ref('pricingFactor', 'volume'), ref('pricingFactor', 'labor')],
    featured: true,
  },
  {
    slug: 'can-i-get-a-price-over-the-phone',
    question: 'Can you give me a price over the phone?',
    answer:
      'We can give you a close estimate from photos and a description, which is usually enough to decide. The firm price is confirmed when the crew sees the job, because access and volume are hard to judge from a description alone. Nothing gets loaded until you agree to the number.',
    scope: { kind: 'topic', slug: 'pricing' },
    about: [ref('quoteAction', 'photo-quote')],
    featured: true,
  },
  {
    slug: 'why-does-heavy-material-cost-more',
    question: 'Why does concrete or dirt cost more than furniture?',
    answer:
      'Disposal facilities charge by weight. A small pile of concrete, tile, or soil can weigh more than a truck full of furniture, so dense material is quoted on weight rather than on the space it takes up.',
    scope: { kind: 'topic', slug: 'pricing' },
    about: [ref('pricingFactor', 'weight'), ref('materialCategory', 'heavy-materials')],
  },
  {
    slug: 'is-there-a-minimum',
    question: 'Is there a minimum charge?',
    answer:
      'Yes. Every job has a minimum that covers bringing a crew and truck to the property, even for a single item. For one small item it is often worth checking whether you have anything else to add while we are there.',
    scope: { kind: 'topic', slug: 'pricing' },
    about: [ref('loadSize', 'single-item')],
  },
  {
    slug: 'do-stairs-cost-more',
    question: 'Does it cost more if the items are upstairs?',
    answer:
      'Sometimes. Stairs, long carries from the door to the truck, and tight access all add time and often need an extra pair of hands. Mentioning them when you request a quote is what keeps the estimate accurate.',
    scope: { kind: 'topic', slug: 'pricing' },
    about: [ref('accessFactor', 'stairs'), ref('accessFactor', 'long-carry')],
  },

  /* ───────────────────── Quote and process ───────────────────── */
  {
    slug: 'how-do-i-get-an-estimate',
    question: 'How do I get an estimate?',
    answer:
      'Send photos of what needs to go, along with your ZIP code and roughly when you need it done. Photos let us judge volume and access, which is most of the estimate. You can also call if you would rather talk it through.',
    scope: { kind: 'topic', slug: 'quote' },
    about: [ref('quoteAction', 'photo-quote')],
    featured: true,
  },
  {
    slug: 'can-i-send-photos',
    question: 'Can I just send photos?',
    answer:
      'Yes, and it is the fastest way to get a real number. Take a few shots from far enough back to show the whole pile, plus one of the path from the item to where a truck can park.',
    scope: { kind: 'topic', slug: 'quote' },
    about: [ref('quoteAction', 'photo-quote')],
    featured: true,
  },
  {
    slug: 'what-happens-after-i-request-a-quote',
    question: 'What happens after I request a quote?',
    answer:
      'We review your photos and details, confirm we cover your area, and come back with an estimate and the soonest windows available. If it works for you we schedule it, and the crew confirms the final price on site before anything is loaded.',
    scope: { kind: 'topic', slug: 'process' },
    about: [ref('quoteAction', 'photo-quote')],
  },
  {
    slug: 'how-quickly-can-you-come',
    question: 'How quickly can you come out?',
    answer:
      'Same-day pickup is often possible when you get in touch early, send photos, and the job fits an existing route. Otherwise next-day and later-in-the-week windows are usually available.',
    scope: { kind: 'topic', slug: 'process' },
    about: [ref('service', 'same-day-junk-removal')],
    featured: true,
  },
  {
    slug: 'do-i-need-to-be-home',
    question: 'Do I need to be there?',
    answer:
      'Not always. If the items are outside or you can arrange access, plenty of jobs run without anyone on site. It works best when the scope is agreed in advance so nothing needs a decision at the door.',
    scope: { kind: 'topic', slug: 'process' },
    about: [ref('accessFactor', 'unoccupied')],
  },
  {
    slug: 'do-i-need-to-move-things-outside',
    question: 'Do I need to move things outside first?',
    answer:
      'No. Curbside pickup is fastest, but the crew can remove approved items from inside the home, garage, patio, or yard whenever access is safe.',
    scope: { kind: 'topic', slug: 'process' },
    about: [ref('accessFactor', 'inside-home')],
    featured: true,
  },
  {
    slug: 'how-long-does-it-take',
    question: 'How long does a pickup take?',
    answer:
      'A single item is usually a matter of minutes once the crew arrives. A garage or a full room takes longer, and a whole-property cleanout can run most of a day. We give you a realistic window when the job is scheduled.',
    scope: { kind: 'topic', slug: 'process' },
    about: [ref('loadSize', 'single-item'), ref('loadSize', 'full')],
  },
  {
    slug: 'what-if-there-is-more-than-expected',
    question: 'What if there is more junk than I described?',
    answer:
      'The crew re-quotes on the spot and you decide before anything else is loaded. You are never billed for more than you agreed to.',
    scope: { kind: 'topic', slug: 'process' },
    about: [ref('pricingFactor', 'volume')],
  },

  /* ───────────────────── Materials and limits ───────────────────── */
  {
    slug: 'what-do-you-not-take',
    question: 'What will you not take?',
    answer:
      'We do not haul hazardous waste, wet paint, fuels, oils, chemicals, asbestos, biohazards, or medical waste. If you are not sure about something, ask first and we will tell you where it should go instead.',
    scope: { kind: 'global' },
    about: [ref('materialCategory', 'prohibited')],
    featured: true,
  },
  {
    slug: 'do-you-take-appliances',
    question: 'Do you take appliances?',
    answer:
      'Yes, once they are disconnected. Refrigerators, freezers, and air conditioners contain refrigerant, so let us know they are coming and we will keep them separate from the general load.',
    scope: { kind: 'global' },
    about: [ref('materialCategory', 'appliances')],
  },
  {
    slug: 'do-you-take-heavy-material',
    question: 'Do you take concrete, dirt, or tile?',
    answer:
      'In limited quantities, priced by weight rather than volume, and separated from other debris. Send photos and a rough quantity so we can confirm it fits within safe load limits.',
    scope: { kind: 'global' },
    about: [ref('materialCategory', 'heavy-materials')],
  },

  /* ───────────────────────── Disposal ───────────────────────── */
  {
    slug: 'where-does-it-go',
    question: 'Where does my stuff actually go?',
    answer:
      'Usable furniture, working appliances, and household goods are separated for reuse during loading. Metal, cardboard, and clean single-material loads go for recycling, electronics go to an electronics handler, and yard waste goes to a green waste facility. Whatever is left goes to a licensed disposal site.',
    scope: { kind: 'topic', slug: 'disposal' },
    about: [ref('disposalRoute', 'donation'), ref('disposalRoute', 'recycling')],
    featured: true,
  },
  {
    slug: 'do-you-donate',
    question: 'Do you donate items?',
    answer:
      'Items in genuinely reusable condition are set aside for reuse rather than disposal. Whether something qualifies depends on its condition, so the crew makes that call at the property while the load is going on.',
    scope: { kind: 'topic', slug: 'disposal' },
    about: [ref('disposalRoute', 'donation')],
  },
  {
    slug: 'can-i-get-a-donation-receipt',
    question: 'Can I get a donation receipt?',
    answer:
      'Ask when you book and we will tell you what is possible for your specific items. Receipts depend on where a given item ends up and on the receiving organisation, so it is not something we can promise in advance for every load.',
    scope: { kind: 'topic', slug: 'disposal' },
    about: [ref('disposalRoute', 'donation')],
  },

  /* ─────────────────────── Service area ─────────────────────── */
  {
    slug: 'do-you-serve-my-area',
    question: 'Do you serve my area?',
    answer:
      'We work across Mesa and the surrounding East Valley, including Chandler, Gilbert, Tempe, Queen Creek, San Tan Valley, Apache Junction, Gold Canyon, Scottsdale, and Ahwatukee. Check your ZIP code above, or just ask.',
    scope: { kind: 'global' },
    about: [ref('office', 'mesa')],
    featured: true,
  },
];

export const getFaq = (slug: string): Faq | undefined => faqs.find((f) => f.slug === slug);

/** Questions for a topic bank, e.g. pricing or process. */
export const faqsForTopic = (topic: 'pricing' | 'process' | 'quote' | 'disposal' | 'access'): Faq[] =>
  faqs.filter((f) => f.scope.kind === 'topic' && f.scope.slug === topic);

/** Site-wide questions, used on the homepage and as a fallback bank. */
export const globalFaqs = (): Faq[] => faqs.filter((f) => f.scope.kind === 'global');

/** The short, high-intent set for compact FAQ blocks. */
export const featuredFaqs = (): Faq[] => faqs.filter((f) => f.featured);

/** Questions scoped to one city. Empty until a city has its own. */
export const faqsForCity = (citySlug: string): Faq[] =>
  faqs.filter((f) => f.scope.kind === 'location' && f.scope.slug === citySlug);
