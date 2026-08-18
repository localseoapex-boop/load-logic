# Load Logic Redesign Plan

Working branch: `redesign/2026-visual-system`
Companion documents: `DESIGN.md`, `docs/image-art-direction.md`

---

## 1. Mode and Read

**Design read:** redesign of a local home-service site for East Valley homeowners
and property managers making an urgent, physical, mid-consideration decision,
with a field-documentation and editorial language, leaning toward a self-hosted
Archivo type system on vanilla CSS custom properties inside the existing Astro
architecture.

**Mode:** *Redesign - Overhaul (visual), Preserve (content, IA, SEO).* The
information architecture, URL structure, relationship engine and structured data
are the strongest assets in the project and are treated as fixed. The visual
system, component library, conversion path and content presentation are rebuilt.

**Tech stack is not migrating.** Astro stays. Vanilla CSS stays. No React, no
Tailwind, no animation library, no UI framework. The one dependency question is
the quote endpoint, covered in section 6.

---

## 2. What Is Wrong Today (verified against the running site)

Screenshots captured at 1440px and 390px confirm the audit:

- **Zero photography** across 175 pages. This is the single largest cause of the
  generated-template read.
- **Homepage is six consecutive card grids.** Services, cities, process,
  testimonials and FAQs all render as the same bordered rectangle in the same
  four-column grid with the same 8px radius and the same green shadow.
- **The hero is the canonical AI hero:** 135-degree green gradient, eyebrow,
  centered-ish headline, lead, two buttons, four translucent trust pills.
- **Service pages bury genuinely good content** in undifferentiated boxes. The
  long-form copy in `service-content.ts` is substantial and useful, and the layout
  gives the visitor no way to navigate it.
- **City-and-service pages are roughly 70% internal-link grids.** One paragraph
  and a five-item checklist carry the entire page across 126 URLs.
- **Internal linking is visually indistinguishable from content**, so SEO plumbing
  reads as the page's substance.
- **Mobile header consumes 170px** in a three-row stack before the hero begins.
- **The sticky action bar exists only on the homepage**, so 174 pages, including
  every organic landing page, have no persistent mobile conversion element.
- **No form exists** while the copy instructs visitors to "send the form" and
  "send photos" in more than twenty places.

---

## 3. Phase Plan

Each phase ends in a reviewable state. Nothing is deployed and nothing touches
`main` without explicit approval.

| Phase | Scope | Output |
|---|---|---|
| **1. Audit and system** *(complete)* | Read all docs and source, run and screenshot the site, load taste skills, validate fal | `DESIGN.md`, `docs/image-art-direction.md`, this plan |
| **2. Data foundation** | Extract hardcoded content, add agentic data modules, extend `locations.ts`, keep all existing public APIs intact | 11 data modules, zero template changes, build still green |
| **3. Brand and imagery** | Wordmark, mark, favicon, OG source. Generate and vet the ~32 image set | `src/assets/brand/`, `src/assets/photos/**` |
| **4. Core components** | Type system, tokens, layout primitives, then the agentic component library | `src/styles/`, `src/components/**` |
| **5. Homepage** | Full recomposition against the new system | `src/pages/index.astro` |
| **6. Service template** | `ServiceLayout` rebuilt around the existing long-form content | Representative page reviewed at 3 widths |
| **7. Location template** | `CityLayout` with structured local modules | Representative page reviewed |
| **8. City-and-service template** | `LocationServiceLayout` with structured differentiation | Representative page reviewed |
| **9. Conversion** | Quote flow, photo upload, thank-you, service-area checker, sticky bar | Working end to end |
| **10. Visual QA** | Desktop, tablet, mobile screenshots of every template; anti-pattern sweep | Fix list worked to zero |
| **11. Rollout and technical QA** | Remaining templates, then full build, URL diff, schema validation, link check, Lighthouse | Build green, 175 URLs intact |

Phases 5 through 8 each stop for review before the next begins.

---

## 4. Data Architecture

### 4.1 Preserved without modification

`src/lib/links.ts`, `src/lib/urls.ts`, `src/data/offices.ts`,
`src/data/services.ts`, `src/data/subservices.ts`, `src/data/service-content.ts`,
`src/content.config.ts`, `astro.config.mjs`. Existing exports keep their
signatures so all five `getStaticPaths()` generators keep producing the same 175
paths.

### 4.2 Extended

**`src/data/locations.ts`** gains optional structured fields. All optional, so
nothing breaks and cities improve progressively:

```ts
zips?: string[]            // real postal codes, verifiable
propertyMix?: string[]     // 'HOA communities', 'student rentals', 'acreage'
accessNotes?: string[]     // gate codes, alley access, HOA pickup windows
situations?: string[]      // slugs into situations.ts
disposalNote?: string      // the transfer station serving this area
jobIds?: string[]          // slugs into jobs.ts
faqIds?: string[]          // slugs into faqs.ts
```

**`src/config/site.ts`** gains a `VERIFIED` block: a single place for facts that
trust components render only when supplied. Empty by default, so nothing is
fabricated and components self-hide.

### 4.3 New modules

| Module | Contents | Powers |
|---|---|---|
| `materials.ts` | Accepted categories and items, prohibited items with reasons, restricted items with conditions | What we remove, what we don't, item search |
| `pricing.ts` | Load sizes with volume and dimensions, pricing factors, minimum pickup, heavy-material and access surcharge structure, `published` flag per figure | Load estimator, pricing ledger, pricing FAQ |
| `faqs.ts` | Banks keyed `general`, `pricing`, `process`, `service:<slug>`, `city:<slug>`; merge helpers | Every FAQ surface and all FAQPage schema |
| `reviews.ts` | Author, platform, rating, date, city, service, text, `verified`, `sourceUrl` | Review components, future AggregateRating |
| `jobs.ts` | City, service, property type, items, volume, crew, time on site, disposal split, images, `representative` flag | Example jobs on home, service, city pages |
| `property-types.ts` | Homeowner, renter, property manager, landlord, realtor, executor, foreclosure buyer, contractor, small business | Property-type component, city context |
| `situations.ts` | Moving, downsizing, garage reset, rental turnover, foreclosure, estate, renovation, yard cleanup, furniture replacement, appliance swap | Situation navigation into services |
| `equipment.ts` | Trailer and truck capability, what each enables, honest limits | Equipment and capability component |
| `disposal.ts` | Donation, recycling, transfer station, landfill, specialty, with what routes where | Where it goes component |
| `access.ts` | Stairs, elevators, long carry, gated, apartment, tight access, heavy items, disassembly | Access factors, pricing explanation, prep |
| `comparisons.ts` | DIY versus full service, full service versus dumpster with an `available` flag | Decision-support components |

### 4.4 Content integrity rules

- Every module carries a verification flag. Components render nothing rather than
  render a placeholder that reads as fact.
- `jobs.ts` entries are labeled **Representative example** in the UI until real
  documented jobs replace them.
- `pricing.ts` ships structure and factors with no dollar figures until real
  numbers are supplied.
- `reviews.ts` ships empty. The review components render only when populated, and
  AggregateRating schema is emitted only when verified reviews exist.
- The dumpster comparison ships with `available: false` and is not advertised as
  an offered service.

---

## 5. Component Library

All components are `.astro`, data-driven through props, and independently
removable. Prefixed by domain so the library stays navigable.

**Shell**: `SiteHeader`, `SiteFooter`, `SkipLink`, `StickyActionBar`,
`Breadcrumbs` *(preserved, restyled, schema untouched)*

**Layout primitives**: `Section`, `Container`, `Bleed`, `Ledger`, `SplitBlock`,
`ProseColumn`, `StickyRail`

**Content**: `PhotoBlock`, `BeforeAfter`, `PhotoScale`, `PullQuote`, `IndexList`,
`StepLedger`, `FigureCaption`

**Agentic library**, mapping to the twenty-three requested components:

| Component | Backed by |
|---|---|
| `WhatWeRemove` | `materials.ts` |
| `WhatWeDontRemove` | `materials.ts` |
| `ItemLookup` | `materials.ts`, progressive-enhancement filter |
| `LoadSizeScale` | `pricing.ts` and the load photo set |
| `PricingFactors` | `pricing.ts` |
| `ExampleJob` | `jobs.ts` |
| `BeforeAfter` | image pairs |
| `DiyComparison` | `comparisons.ts` |
| `DumpsterComparison` | `comparisons.ts`, gated on `available` |
| `HowItWorks` | `service-content.ts` process, extended to eight steps |
| `QuoteForm` | new endpoint |
| `TextPhotosCta` | `BUSINESS.phone`, `sms:` link |
| `ServiceAreaChecker` | `locations.ts` zips |
| `PropertyTypes` | `property-types.ts` |
| `Situations` | `situations.ts` |
| `PreparationGuide` | `access.ts`, `service-content.ts` prep tips |
| `AccessFactors` | `access.ts` |
| `DisposalFlow` | `disposal.ts` |
| `LocalContext` | extended `locations.ts` |
| `FaqBlock` | `faqs.ts`, emits FAQPage schema |
| `ReviewWall` / `ReviewInline` | `reviews.ts` |
| `EquipmentCapability` | `equipment.ts` |
| `TrustFacts` | `site.ts` `VERIFIED` block |

**Internal linking**: `RelatedRail` replaces the stacked `InternalLinks` grids.
Same links, same `lib/links.ts` calls, same crawl paths, presented as designed
navigation rather than exposed plumbing.

---

## 6. Conversion System

The largest functional gap. Current state: no form, no upload, no thank-you page,
a mobile sticky bar on one page, and a "Free quote" button that goes to
`/services`.

**Target flow**

```
Any page
  -> sticky action bar (every page, mobile)     -> Call  |  Get a photo quote
  -> inline quote starter (ZIP + service)       -> /quote prefilled
  -> /quote  short form + photo upload          -> POST endpoint
  -> /quote/thanks  confirmation + next steps   -> noindex
```

**Form fields**, short first with progressive disclosure: name, phone, ZIP,
service type, then optional email, item description, approximate load size linked
to the estimator, timing, photos, preferred contact method, notes.

**Endpoint options** *(decision required, section 9)*

| Option | Mechanics | Trade |
|---|---|---|
| **A. Vercel Function** *(recommended)* | Add `@astrojs/vercel`, mark only the endpoint `prerender = false`, send via Resend, store photos in Vercel Blob | All 175 pages stay static; owns the data; needs two env vars |
| **B. Hosted form service** | Post to a third-party endpoint, no adapter | Fastest, no backend; upload limits and an external dependency |
| **C. UI only for now** | Build the full form, validation and thank-you against a documented contract, wire later | Unblocks design work; not a working lead path |

Option A keeps every content page static, which is the constraint that actually
matters. The adapter changes the build target but not the output of any existing
page.

**Service-area checker**: ZIP input matched against `locations.ts` zips, roughly
thirty lines of inline JavaScript, degrading to a complete visible city and ZIP
list when scripting is off.

**Text photos**: an `sms:` link on the existing business number, presented only
if the number accepts SMS. No second number is invented.

---

## 7. Page Compositions

### Homepage

Sixteen sections, nine distinct layout families, at most five micro-labels, no
three consecutive image-and-text splits.

1. Hero, full-bleed photo, one primary CTA
2. Quote starter strip, ZIP and service
3. What we remove, typographic index
4. How much junk do you have, photo scale
5. How pricing works, ledger
6. Common situations, asymmetric split
7. Before and after, full-bleed pair
8. One example job, single record
9. Equipment and capability, asymmetric split, mirrored
10. How it works, step ledger
11. Areas served with ZIP checker
12. Reviews, pull quote plus compact list
13. DIY versus Load Logic, comparison ledger
14. Where it goes, disposal flow
15. FAQs, two-column list
16. Quote CTA, full-bleed spruce block

### Service page

Existing long-form content is fully preserved and given navigation. Editorial
column with a sticky quote rail: service hero with photograph, key-answer summary,
overview, what we take, common reasons, situations, problems solved, example job,
pricing factors, load guidance, DIY comparison, preparation, how it works, before
and after, special handling, disposal, FAQs, related rail, areas rail, CTA.

### Location page

City hero, services available, neighborhoods and ZIP coverage, service-area
checker, local situations, property mix, local access notes, example job, local
reviews slot, disposal note, local FAQs, nearby areas rail, CTA.

### City-and-service page

The current thin template gains structured differentiation from real data rather
than city-swapped prose: city-scoped hero, service summary, city access notes,
service-in-this-city situations, neighborhoods, load and pricing context, example
job slot, local FAQ slot, sibling services rail, nearby cities rail, CTA. Every
differentiating field is optional, so pages improve as real data lands and none
of them fabricate local detail in the meantime.

---

## 8. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Breaking one of the 175 URLs | Capture the full URL list from the current build, diff after rollout, treat any delta as a blocker |
| Losing structured data | Schema emitters are untouched. Validate every page type before and after |
| Load-scale photo continuity | Locked seed plus image-to-image. Fallback: a drawn measurement diagram instead of photographs |
| Adapter changing deploy behavior | Only the quote endpoint is non-static. Verify the build output still lists 175 prerendered pages |
| Font payload hurting LCP | One variable family, subset to Latin, preloaded, `font-display: swap` |
| Content bloat hurting mobile | Progressive disclosure and in-page navigation, never deletion of useful content |
| Scope drift across 23 components | Build in dependency order; each phase ends reviewable |

---

## 9. Decisions Made

**Palette: bone + spruce + hi-vis.** Locked in `DESIGN.md` section 2. The warm
neutral base replaces the green tint currently applied to every surface, spruce
becomes a deliberate block color, and `--hi-vis` is the single accent owning
every action.

**Quote endpoint: option A, Vercel Function.** Add `@astrojs/vercel` and mark
only `src/pages/api/quote.ts` as `prerender = false`. Email delivery through
Resend, photo storage in Vercel Blob. Every one of the 175 content pages stays
prerendered. Two environment variables required before the endpoint goes live:
`RESEND_API_KEY` and `BLOB_READ_WRITE_TOKEN`.

**Real data: pricing figures only.** Consequences, applied as hard rules:

| Module | Behavior |
|---|---|
| `pricing.ts` | Real figures once supplied. **Actual numbers still needed before phase 2 closes.** Until then the structure ships with `published: false` and components render factors without amounts. |
| `reviews.ts` | Ships empty. `ReviewWall` and `ReviewInline` render nothing. **No AggregateRating and no Review schema is emitted.** Homepage and city review slots collapse cleanly rather than showing placeholders. The three testimonials currently hardcoded in `index.astro` are moved into `reviews.ts` as `verified: false` and are **not rendered** until confirmed real. |
| `TrustFacts` | Renders nothing. No insurance, licensing, registration or years-in-business claim appears anywhere on the site. |
| `jobs.ts` | Entries carry `representative: true` and every rendered job record is visibly labeled a representative example, never presented as documented customer work. |

**Punctuation cleanup: proceeding.** Existing copy contains em dashes throughout,
which both `docs/copywriting-standards.md` and the anti-slop standard prohibit. A
mechanical rewrite preserving meaning is applied in phase 2. No wording changes
beyond the punctuation itself.

---

## 10. Explicit Non-Goals

- No URL, slug or route changes.
- No content deletion. Long-form service copy stays and gets better presentation.
- No framework migration.
- No heavy animation.
- No fabricated reviews, credentials, statistics or prices.
- No deployment or push to `main` without approval.
