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

  /* ─────────────────────── Per-city questions ───────────────────────
   *
   * Two questions per city, surfaced by faqsForCity() on that city's page only.
   * Every answer is built from that city's own locations.ts data — accessNotes,
   * propertyMix, situations, disposalNote — so nothing here is a generic answer
   * with a city name pasted in. When adding a city, write questions its data can
   * actually support or add none at all.
   */

  /* Gilbert */
  {
    slug: 'gilbert-gated-communities',
    question: 'Can you pick up from gated communities in Gilbert?',
    answer:
      'Yes. Seville and Power Ranch both have gated sections — send the gate code with your quote request or have the crew added to the visitor list and entry is handled before arrival. Several Gilbert HOAs also restrict how long anything can sit on a driveway, so we load directly from the garage or yard rather than staging items outside.',
    scope: { kind: 'location', slug: 'gilbert-az' },
    about: [ref('location', 'gilbert-az'), ref('accessFactor', 'gated-community')],
  },
  {
    slug: 'gilbert-hot-tub-shed-access',
    question: 'Can you remove a hot tub or shed from a Gilbert back yard?',
    answer:
      'Yes. Newer Gilbert builds often have narrow side gates between the garage and the back yard, so hot tubs and sheds are usually cut down on site and carried through in sections. A photo of the side gate along with the item lets us plan the crew and the price before anyone arrives.',
    scope: { kind: 'location', slug: 'gilbert-az' },
    about: [ref('location', 'gilbert-az'), ref('accessFactor', 'tight-access'), ref('service', 'hot-tub-removal')],
  },

  /* Chandler */
  {
    slug: 'chandler-hoa-bulk-windows',
    question: 'Can you work around HOA bulk-trash rules in Chandler?',
    answer:
      'Yes — this is one of the most common reasons Chandler residents call. Bulk-pickup windows vary by community, and several neighborhoods restrict how long anything can sit at the curb, which is often why a pile needs to be gone before a specific day. Tell us the deadline and we schedule the removal ahead of it, loading from the garage or yard so nothing waits outside.',
    scope: { kind: 'location', slug: 'chandler-az' },
    about: [ref('location', 'chandler-az'), ref('accessFactor', 'curbside')],
  },
  {
    slug: 'chandler-pre-sale-clearout',
    question: 'Can you clear a Chandler home before a sale or rental turnover?',
    answer:
      'Yes. Pre-listing clear-outs and turnovers are a big share of our Chandler work. A lot of what comes out of Chandler homes is still genuinely usable, so donation-ready furniture is separated at the property and the rest is hauled for disposal — you get the space back in one visit, on a date that works for the listing or the lease.',
    scope: { kind: 'location', slug: 'chandler-az' },
    about: [ref('location', 'chandler-az'), ref('situation', 'pre-sale-prep')],
  },

  /* Tempe */
  {
    slug: 'tempe-apartment-cleanouts',
    question: 'Do you clear apartments and student housing in Tempe?',
    answer:
      'Yes — apartment and student-housing turnovers are a large part of what we do in Tempe. Several downtown buildings require the service elevator to be reserved in advance and a certificate of insurance on file, and street parking near ASU can mean a longer carry from the unit to the truck. Send the building details with your quote request and we arrange all of it before the appointment.',
    scope: { kind: 'location', slug: 'tempe-az' },
    about: [ref('location', 'tempe-az'), ref('accessFactor', 'apartment'), ref('accessFactor', 'elevator')],
  },
  {
    slug: 'tempe-semester-moveout',
    question: 'Can you handle end-of-lease move-outs near ASU?',
    answer:
      'Yes. Turnovers cluster around the end of the academic year, when loading zones near campus are at their busiest — booking earlier in that window gets the best pick of times. If the unit will be empty, plenty of Tempe jobs run without anyone on site once scope and access are agreed in advance.',
    scope: { kind: 'location', slug: 'tempe-az' },
    about: [ref('location', 'tempe-az'), ref('situation', 'moving-out')],
  },

  /* Queen Creek */
  {
    slug: 'queen-creek-acreage',
    question: 'Can you haul from acreage properties in Queen Creek?',
    answer:
      'Yes. Larger Queen Creek lots often mean a long carry from an outbuilding or a back fence line to wherever a truck can park, and that labor is planned into the quote rather than discovered on the day. Photos of the pile plus one of the path to where a truck can stand are what make the estimate accurate.',
    scope: { kind: 'location', slug: 'queen-creek-az' },
    about: [ref('location', 'queen-creek-az'), ref('accessFactor', 'long-carry')],
  },
  {
    slug: 'queen-creek-green-waste',
    question: 'Do you take green waste and old wood from Queen Creek properties?',
    answer:
      'Yes. Bigger lots here generate a lot of clean green waste and untreated wood, and when it is kept separate from other material it goes to a green-waste facility rather than to disposal. Mixed piles are fine too — we sort at the trailer.',
    scope: { kind: 'location', slug: 'queen-creek-az' },
    about: [ref('location', 'queen-creek-az'), ref('materialCategory', 'yard-green-waste')],
  },

  /* San Tan Valley */
  {
    slug: 'san-tan-valley-not-home',
    question: 'Can a San Tan Valley pickup happen while I am not there?',
    answer:
      'Usually, yes. A good share of jobs out here — rental turnovers especially — run without anyone on site. It works when the scope is agreed from photos in advance and the crew has access: a gate code, an unlocked side yard, or items staged where they can be reached. Payment and confirmation photos are handled remotely.',
    scope: { kind: 'location', slug: 'san-tan-valley-az' },
    about: [ref('location', 'san-tan-valley-az'), ref('accessFactor', 'unoccupied')],
  },
  {
    slug: 'san-tan-valley-scheduling',
    question: 'How does scheduling work for San Tan Valley?',
    answer:
      'San Tan Valley is part of our regular coverage, and jobs out here are batched with nearby routes where possible so the drive is not carried by a single small load. If your timing is flexible, say so with your quote request — it usually gets you an earlier window.',
    scope: { kind: 'location', slug: 'san-tan-valley-az' },
    about: [ref('location', 'san-tan-valley-az')],
  },

  /* Apache Junction */
  {
    slug: 'apache-junction-estate-pace',
    question: 'Can you clear a long-held or inherited property in Apache Junction?',
    answer:
      'Yes — estate and foreclosure cleanouts are a large share of our Apache Junction work. Sorting happens room by room during loading rather than all at once at the truck, so items worth keeping or donating are pulled aside as we go, at a pace that works for the family or the professional handling the property.',
    scope: { kind: 'location', slug: 'apache-junction-az' },
    about: [ref('location', 'apache-junction-az'), ref('situation', 'estate-settlement')],
  },
  {
    slug: 'apache-junction-narrow-drives',
    question: 'Can your truck reach a park model or an older property with a narrow drive?',
    answer:
      'Yes. Older Apache Junction properties and park models often have narrow drives and carports that limit how close a truck can get — the crew carries from the property to wherever the truck can legally park. Long-held places here also turn up safes, workshop equipment and appliances that need more than two people, so mention anything unusually heavy with your photos and we staff for it.',
    scope: { kind: 'location', slug: 'apache-junction-az' },
    about: [ref('location', 'apache-junction-az'), ref('accessFactor', 'tight-access'), ref('accessFactor', 'heavy-items')],
  },

  /* Gold Canyon */
  {
    slug: 'gold-canyon-guard-gates',
    question: 'Can you get into guard-gated Gold Canyon communities?',
    answer:
      'Yes. Superstition Mountain and several other communities here are guard-gated, so the crew needs to be listed with the gate in advance — we sort that out when the job is scheduled. Long private driveways are common too and affect where the truck can stand, so a photo of the drive helps us plan the carry.',
    scope: { kind: 'location', slug: 'gold-canyon-az' },
    about: [ref('location', 'gold-canyon-az'), ref('accessFactor', 'gated-community'), ref('accessFactor', 'long-carry')],
  },
  {
    slug: 'gold-canyon-hot-tubs',
    question: 'Do you remove hot tubs in Gold Canyon?',
    answer:
      'Yes — hot tubs and built-in outdoor features come up often in Gold Canyon and usually need cutting down on site before they can leave. That work is planned into the quote from your photos, so the price you approve already covers the disassembly.',
    scope: { kind: 'location', slug: 'gold-canyon-az' },
    about: [ref('location', 'gold-canyon-az'), ref('service', 'hot-tub-removal')],
  },

  /* Scottsdale */
  {
    slug: 'scottsdale-vendor-registration',
    question: 'Can you work in gated and guard-managed Scottsdale communities?',
    answer:
      'Yes. DC Ranch, Gainey Ranch and much of North Scottsdale are gated or guard-managed, and several communities require vendors to be registered — we handle the listing and any paperwork before the appointment. Send the community name with your quote request and it is arranged by the time the crew arrives.',
    scope: { kind: 'location', slug: 'scottsdale-az' },
    about: [ref('location', 'scottsdale-az'), ref('accessFactor', 'gated-community')],
  },
  {
    slug: 'scottsdale-str-turnover',
    question: 'Can you clear a Scottsdale vacation rental between guests?',
    answer:
      'Yes. Vacation-rental turnovers frequently have to happen between a checkout and the next check-in, and Old Town condos and short-term rentals often add restricted loading zones and set service hours. Give us the window and the building rules and we schedule the removal inside them.',
    scope: { kind: 'location', slug: 'scottsdale-az' },
    about: [ref('location', 'scottsdale-az'), ref('propertyType', 'property-manager')],
  },

  /* Ahwatukee */
  {
    slug: 'ahwatukee-steep-driveways',
    question: 'Can you work on steep or narrow Ahwatukee driveways?',
    answer:
      'Yes. Hillside lots and cul-de-sac driveways in the Foothills can be steep and narrow, which limits how a truck approaches the property — the crew stages the truck where it can stand safely and carries the rest. Note the slope or any tight turns with your photos so the estimate reflects the real job.',
    scope: { kind: 'location', slug: 'ahwatukee-az' },
    about: [ref('location', 'ahwatukee-az'), ref('accessFactor', 'tight-access')],
  },
  {
    slug: 'ahwatukee-hoa-curb-rules',
    question: 'Do you handle HOA and gated communities in Ahwatukee?',
    answer:
      'Yes. Several Foothills communities are gated, and HOA rules commonly govern what can sit at the curb and for how long. We load directly from the garage or yard so nothing has to wait outside, and gate access is arranged when the job is scheduled.',
    scope: { kind: 'location', slug: 'ahwatukee-az' },
    about: [ref('location', 'ahwatukee-az'), ref('accessFactor', 'gated-community')],
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

/** Questions scoped to one city, from the per-city bank above. */
export const faqsForCity = (citySlug: string): Faq[] =>
  faqs.filter((f) => f.scope.kind === 'location' && f.scope.slug === citySlug);
