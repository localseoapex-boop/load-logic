# SEO Standards

## Status

First draft.

Every standard in this document is derived from [`docs/seo-methodology-interview.md`](seo-methodology-interview.md). Nothing here is added from generic SEO advice.

Where the methodology stopped short of a concrete rule, the gap was resolved from the existing framework implementation (the code is the authority) and, where the code was silent, from explicit framework decisions recorded on 2026-07-03. See "Resolved Decisions" at the end of this document.

Each section ends with a source reference. Standards derived from the methodology point back to the interview question that supports them. Standards derived from the implementation cite the relevant source file.

---

## Purpose

This document is the official SEO playbook for every website built from this framework.

The methodology interview explains the reasoning. This document turns that reasoning into standards developers and AI assistants can apply consistently without relying on memory or repeated prompts.

_Source: Methodology Interview, Section 1, Q5._

---

## 1. Foundational Principles

These principles govern every SEO decision. When standards below conflict with a specific request, these principles win.

- Put the user first. Every page exists to show users what they are looking for, match their intent, and answer their common questions.
- Write for people first and search engines second on every page.
- Every page must exist for a reason, provide genuine value, and satisfy a unique search intent.
- Do not create duplicate pages that compete with one another to increase page count. Quality and purpose matter more than quantity.
- SEO starts with a strong, scalable website architecture that makes sense for users and search engines.
- Prefer data-driven, reusable systems over one-off solutions so improvements benefit every future website.
- Do not fabricate credibility. Never invent statistics, awards, or exaggerated claims.
- Document important SEO decisions and turn them into standards so the framework keeps improving.

_Source: Methodology Interview, Section 1, Q1, Q4, Q5._

---

## 2. The Local SEO Model

This is the core architectural model every website follows.

- The primary office city is represented by the homepage and core service pages. These become the authoritative, canonical destination for those services in the primary market.
- Surrounding markets the business actively serves are represented by service-area pages.
- Consolidate authority for the primary market into the homepage and service pages instead of spreading it across multiple pages targeting the same market.
- Service-area pages expand geographic reach into nearby markets. They must complement, not compete with, the homepage and core service pages.
- Do not create a separate location page that targets the same service in the primary office city, because it creates duplicate search intent.

_Source: Methodology Interview, Section 2, Q8; Section 2, Q7._

---

## 3. Website Architecture Standards

- Structure the site as content clusters that support internal linking. A core service page sits at the top of its cluster, with related subpages beneath it that link to each other and back up to the core service page.
- The website architecture must reflect the real-world structure of the business (its physical offices and the markets it actively serves), not a list of keywords.
- Every page must fit into a logical hierarchy where it supports, rather than competes with, other pages.
- The exact cluster shape changes depending on the vertical being targeted.

_Source: Methodology Interview, Section 2, Q1; Section 3, Q1._

### Page purpose requirements

Every page must have a clearly defined role. A page must do at least one of the following:

- Establish authority for a service.
- Represent an important service area.
- Support the customer journey.
- Answer common questions.
- Strengthen the overall SEO strategy.

_Source: Methodology Interview, Section 2, Q5._

---

## 4. Page Type Standards

### 4.1 Homepage

The homepage is the foundation of the site. It represents the primary office location and primary market.

The homepage must:

- Clearly communicate who the business is, what services or verticals it offers, where it provides those services, and why homeowners should choose it over the competition.
- Introduce every major service and provide clear pathways to the individual service pages.
- Reinforce the areas served.
- Highlight the company's unique value.
- Showcase customer reviews and trust signals.
- Answer common questions.
- Make it easy for users to contact the business.
- Act as the central hub that connects services, service-area pages, and supporting content through strong internal linking.
- Target the primary office city and establish the overall topical authority of the business.

Every section on the homepage must have a purpose: educating the homeowner, building confidence, improving navigation, or encouraging conversions.

_Source: Methodology Interview, Section 2, Q2._

### 4.2 Service pages

A service page is the authoritative page for a specific service and targets the search intent for that service.

Every service page must:

- Explain the service being offered and the problems it solves.
- Describe the signs the service may be needed.
- Explain the available repair or installation options.
- Explain what customers can expect during the service process.
- Build trust by demonstrating experience and setting clear expectations, without exaggerated or unsupported claims.
- Highlight guarantees or differentiators.
- Answer common questions that help users make an informed decision.
- Include a unique title and meta description.
- Use a clear heading structure.
- Include relevant internal links to related services and locations.
- Include strong calls to action.
- Include supporting elements such as FAQs, reviews, or service-specific schema where appropriate.

Every section must serve a purpose: improving understanding, building trust, strengthening SEO, or increasing conversions. If a section does not do one of these, it should not be included.

_Source: Methodology Interview, Section 2, Q3; Section 5, Q3._

### 4.3 Service-area and location (city) pages

A service-area page is the local landing page for a market the business actively serves but where it may not have a physical office. It is similar to the homepage in structure and purpose, tailored to a specific city.

Every service-area / city page must:

- Communicate who the business is, what services or verticals it offers in that market, why homeowners in that area should choose it, and how to contact it.
- Include an overview of the services offered in that city and links to the primary service categories.
- Include information about the areas and neighborhoods served.
- Include locally relevant content unique to that market.
- Include customer reviews or testimonials when available.
- Include frequently asked questions.
- Include clear calls to action.
- Serve as the central hub for that market, connecting users to the appropriate services.
- Support the authority of the primary office location through internal linking.

If the city has a physical office, the page must also include the office address, hours, contact information, and an embedded map.

A service-area / city page must provide enough unique, locally relevant information to satisfy local search intent. It must not duplicate the homepage or another city page with only the city name changed.

_Source: Methodology Interview, Section 2, Q4; Section 5, Q4; Section 6, Q3._

---

## 5. Page Creation Rules

### 5.1 When a page should exist

Create a page only when the answer to all of these is yes:

- Does it answer a question not already covered elsewhere on the site, or serve a distinct search intent not already satisfied?
- Will it help a homeowner make a more informed decision?
- Does it support a service the business actually provides or a market it genuinely serves?
- Will it strengthen internal linking and topical authority without competing with an existing page?
- Can enough unique, high-quality content be created to make the page genuinely useful?

_Source: Methodology Interview, Section 2, Q5; Section 3, Q4._

### 5.2 When a page should NOT exist

Do not create a page when:

- It does not provide unique value to the user.
- It creates duplicate search intent, or its purpose already exists on another page.
- It targets a service the business does not offer.
- It targets a market the business does not realistically serve.
- It cannot be supported with meaningful, helpful content (thin or duplicate content).
- Its only justification is that a keyword has search volume.

Before creating a new page, first evaluate whether improving or expanding an existing page would better satisfy the user's needs. In many cases strengthening an existing page is more valuable than creating a new one.

_Source: Methodology Interview, Section 2, Q6; Section 3, Q4._

### 5.3 Avoiding duplicate search intent

- Every page must target a unique audience or search query.
- If two pages would rank for the same service in the same market, or answer the same question, do not create the second page. Improve the existing page or restructure the site instead.
- Reserve city-in-URL pages for surrounding markets, never for the primary office city (see the Local SEO Model).
- Test every proposed page against the question: "What unique purpose does this page serve that no other page already fulfills?" If it cannot answer that, do not create it.

_Source: Methodology Interview, Section 2, Q7._

---

## 6. URL Standards

- URL structure is decided by the physical locations a business operates from and the markets it actively serves, not by keyword opportunities.
- The primary office location is the foundation. The homepage and core service pages represent the primary market.
- Surrounding service areas are organized beneath the location architecture.
- The URL hierarchy must be predictable, scalable, and reflect the relationship between services, locations, and supporting content.

### 6.1 When a city appears in the URL

- Include a city in the URL only when the page targets a specific geographic market different from the primary office location.
- For a single-office business, the homepage and core service pages represent the primary office city without the city name in the URL. Surrounding service areas include the city in the URL.
- For a multi-office business, each office has its own location architecture reflecting the markets that office serves.
- Never add a city to a URL only because it has search volume.

_Source: Methodology Interview, Section 3, Q1, Q2._

### 6.2 When a service appears in the URL

- Give a service its own URL when it is a distinct service customers actively search for and it deserves its own authoritative page.
- Do not give every variation or task its own URL. If a topic can be covered within an existing service page without creating duplicate search intent, keep it part of that page.
- Service URLs must be simple, descriptive, and easy for users and search engines to understand.

_Source: Methodology Interview, Section 3, Q3._

### 6.3 URL patterns to avoid

- Multiple URL variations targeting the same service in the same market (for example, a core service page plus a duplicate location-specific version for the primary office city).
- Inconsistent URL structures that make the site hard to understand or maintain.
- Pages for cities the business does not actively serve.
- Pages for services the business does not offer.
- Service-and-location combinations that cannot be supported with meaningful content.
- Any URL created solely because a keyword has search volume.

_Source: Methodology Interview, Section 3, Q5._

### 6.4 URL formatting conventions

Defined in `src/lib/urls.ts`, the single source of truth for every path. Change a pattern there and every internal link, breadcrumb, and sitemap entry follows.

- Casing and separators: lowercase, hyphen-separated slugs (for example `/services/same-day-junk-removal`).
- No trailing slash. Paths end at the final segment (`/services/junk-removal`, not `/services/junk-removal/`). The trailing slashes in the methodology interview examples were illustrative. The code convention is authoritative.
- Maximum nesting depth is three path segments.
- Path patterns:
  - `/services/[service]` — core service page (primary market).
  - `/services/[service]/[subservice]` — service subpage.
  - `/locations/[city]` — service-area (city) hub.
  - `/locations/[city]/[service]` — city vertical page.
  - `/locations/[city]/[service]/[subservice]` — city sub-service page.
- The primary office city (Mesa) never appears in a URL. It is represented by the homepage and the `/services/*` pages. This is enforced in data by `SITE.excludeHomeCityFromServiceAreas`.

_Source: `src/lib/urls.ts`, `src/config/site.ts`; consistent with Methodology Interview, Section 3, Q1, Q2._

---

## 7. Internal Linking Standards

- Internal linking is one of the most important on-page optimizations. It helps users navigate and signals which pages the site values most.
- Do not distribute internal links evenly across all pages. Pages with the greatest business value and ranking potential receive the strongest internal linking signals.
- Authority should flow toward the most important, highest-value pages. Blog and supporting content support service pages, and service pages support each other.

_Source: Methodology Interview, Section 4, Q1, Q2._

### 7.1 Internal link priority

Prioritize internal links by SEO value, search demand, and revenue potential.

**Priority 1 – Core Service Pages (highest priority)**
Receive the greatest number of internal links. They target the highest-volume, evergreen search terms and represent the primary services.
Link them from: homepage, service hubs, location pages, city vertical pages, related service pages, blog articles, FAQs, and navigation.

**Priority 2 – City Vertical Pages**
Target high-value local search intent and receive strong internal support.
Link them from: location pages, core service pages, nearby city pages, relevant blog content, and Areas Served sections.

**Priority 3 – Location Pages**
Act as local hubs connecting users to city-specific service categories.
Link them from: homepage, locations index, nearby location pages, footer, and the contact page where appropriate.

**Priority 4 – Supporting Content**
Blog articles, FAQs, financing pages, and promotions exist primarily to strengthen the pages above by linking users to relevant service and location pages.

_Source: Methodology Interview, Section 4, Q3._

### 7.2 Linking related services

- Link related services when they naturally support the user's journey or provide a logical next step for the content being viewed.
- Links must be relevant and helpful, never added solely for SEO.
- Example relationships: an AC Repair page may link to AC Installation, AC Maintenance, or Ductless Mini Splits. A Drain Cleaning page may link to Sewer Line Repair, Hydro Jetting, or Leak Detection.

_Source: Methodology Interview, Section 4, Q4._

### 7.3 Linking nearby cities

- Link nearby cities when they are a logical next option for users and accurately reflect the service area.
- Prioritize geographically connected nearby cities. Do not link to every city the company serves.
- Example: a Gilbert location page may link to Chandler, Mesa, Queen Creek, and Tempe, but not to every service area across the state.

_Source: Methodology Interview, Section 4, Q5._

### 7.4 What should never be linked

- Unrelated services, irrelevant cities, and duplicate or low-value pages.
- Any content that does not naturally fit the context of the page.
- Site-wide links to pages with little SEO or business value, unless needed for navigation or compliance.
- Do not overuse internal links or force them into content.

_Source: Methodology Interview, Section 4, Q6._

### 7.5 Internal link counts

Defined in `src/lib/links.ts`:

- Related services: maximum 4. Curated siblings first, backfilled from the catalog so the block is never sparse.
- Nearby cities: maximum 4, resolved from each location's curated `nearby` list.
- "Available in these areas" (cities offering a service): no cap. Lists every service-area city that offers the service.
- Sub-services in a category: no cap. Lists all sub-services in the category.

_Source: `src/lib/links.ts`; consistent with Methodology Interview, Section 4, Q3, Q4, Q5._

---

## 8. Content Standards

### 8.1 Helpful content

- Content is created to answer the user's questions, solve their problem, and help them make an informed decision, not to rank for keywords.
- Every page must provide clear, accurate, relevant information that reflects the user's search intent and guides them toward the next step.
- Content must demonstrate real expertise and be unique to the business, service, or location it represents.
- The test: the content should be valuable even if search engines did not exist.

_Source: Methodology Interview, Section 5, Q1._

### 8.2 Thin content is prohibited

Thin content provides little or no unique value. It includes:

- Pages with very little information.
- Content repeated across multiple pages.
- Pages created solely to target keywords.
- Changing only the city name or service name while leaving the rest of the content unchanged.

If a page cannot provide meaningful value beyond what already exists on the site, strengthen an existing page instead of creating a new one.

_Source: Methodology Interview, Section 5, Q2._

### 8.3 AI-generated content

AI may be used to improve efficiency, not to replace expertise.

Acceptable AI use:

- First drafts, organizing information, expanding on ideas, and maintaining consistency across websites.

Required before publishing:

- Every AI-assisted page must be reviewed, edited, and enhanced to be accurate, helpful, and reflective of the company's brand, experience, and local knowledge.
- The final content must provide value beyond what AI produces on its own.
- Content must never be published simply because AI generated it. If the output is generic, repetitive, inaccurate, or fails search intent, rewrite it or combine it into a stronger page.

AI must never generate:

- Content that is inaccurate, misleading, fabricated, or presented as fact without verification.
- Invented customer reviews, certifications, awards, statistics, pricing, service offerings, employee information, or local experience.
- Large amounts of repetitive or low-value content to target keywords or inflate page count.

_Source: Methodology Interview, Section 5, Q5, Q6._

### 8.4 Minimum content standard

"Not thin" is enforced structurally, not by word count.

- Every page must fill its required sections (see the page type standards in Section 4) with unique, page-specific content.
- The framework does not set a minimum word count. A hard numeric floor is intentionally avoided because it conflicts with the principle that quality and purpose matter more than quantity.
- Page-specific data (service copy, local context) must be genuinely unique. Changing only a city or service name is thin content and is prohibited.

_Source: Framework decision, 2026-07-03; consistent with Methodology Interview, Section 5, Q1, Q2, and Section 1, Q5._

---

## 9. Local SEO Standards

### 9.1 Google Business Profile alignment

- Treat the Google Business Profile and the website as a single local SEO strategy, not separate assets.
- Both must consistently represent the same services, service areas, business information, and brand messaging.
- The website reinforces the topics and locations in the Google Business Profile, and the profile directs users to the most relevant pages on the website.

_Source: Methodology Interview, Section 6, Q1._

### 9.2 Choosing service areas

- Select service areas based on where the business can realistically and consistently provide service, not on where it wants to rank.
- Prioritize cities with a physical office, strong operational coverage, high demand, and meaningful revenue opportunity.
- Expand outward logically from each office to create a geographically connected service area, not isolated or unrealistic markets.
- The website, Google Business Profile, and local SEO strategy must all reflect the same service area strategy.

_Source: Methodology Interview, Section 6, Q2._

### 9.3 Valuable vs unnecessary location pages

A location page is valuable when it:

- Demonstrates that the business genuinely serves the community.
- Provides meaningful local context and shows the services available in that area.
- Connects users to relevant service pages, answers common questions, and makes it easy to contact or schedule service.
- Includes address, hours, and contact information when there is a physical office.

A location page is unnecessary when it:

- Provides no unique value beyond what already exists on the site.
- Targets the same search intent as another page.
- Is mostly duplicate content with only the city name changed.
- Represents a location already covered by the homepage.
- Exists only to increase the number of indexed pages.

_Source: Methodology Interview, Section 6, Q3, Q4._

---

## 10. Technical SEO Standards

### 10.1 Pre-launch checklist

Before launch, verify the site can be crawled, indexed, and understood:

- Page titles and meta descriptions.
- Heading structure.
- Canonical tags.
- robots.txt.
- XML sitemaps.
- Structured data.
- Internal linking.
- Image optimization.
- Redirects.
- URL structure.
- Mobile usability.
- Page speed and Core Web Vitals.
- Confirm all staging settings are removed and the site is fully crawlable and indexable.

Also verify:

- No broken links.
- No duplicate content.
- No missing metadata.
- Tracking is implemented: Google Analytics, Google Search Console verification, and any required conversion tracking.

_Source: Methodology Interview, Section 7, Q1._

### 10.2 Highest-priority technical risks

These issues prevent crawling, indexing, or understanding and must be treated as blocking:

- Broken internal links.
- Incorrect redirects.
- Duplicate content.
- Missing or incorrect canonical tags.
- Pages blocked in robots.txt.
- noindex tags left on important pages.
- Poor internal linking.
- XML sitemap issues.

Performance and user experience are also critical: slow page speed, poor Core Web Vitals, mobile usability issues, and large amounts of unnecessary JavaScript.

_Source: Methodology Interview, Section 7, Q2._

### 10.3 Automate vs manually review

Always automate (repetitive, standardized, per-page elements):

- Page titles and meta descriptions from templates where appropriate.
- Canonical tags, XML sitemaps, robots.txt.
- Structured data, breadcrumbs, internal navigation.
- Image optimization, redirects, and consistent page layouts.

Always manually review (anything affecting content quality, user experience, or business accuracy):

- Page content, internal linking, calls to action.
- Service descriptions, location information, business details.
- Metadata and images.
- All AI-generated content.

Automation handles the technical framework. Content and strategic decisions stay intentional. Automation must never replace final QA. Every site gets a final SEO review confirming pages are technically sound, content is unique and valuable, and links work.

_Source: Methodology Interview, Section 7, Q3, Q4._

### 10.4 Implementation standards

**Meta titles** (`src/components/BaseHead.astro`)
- Pattern: `{Page title} | {Brand}`. The homepage passes the brand alone.
- Core service pages target the primary city: `{Service} in Mesa, AZ`.
- Blog titles are capped at 70 characters (enforced by the content schema).

**Meta descriptions**
- 50 to 160 characters (enforced on blog posts by the content schema; the 150 to 160 window is the target for all page types).
- Pages without a specific description fall back to `SITE.description`.

**Heading structure**
- Exactly one `<h1>` per page.
- `<h2>` for major sections, `<h3>` for sub-items within a section.

**Structured data (schema.org)**, emitted as JSON-LD. Every page inherits the sitewide blocks, then adds schema for its page type:
- Sitewide (via `BaseLayout`): a LocalBusiness `@graph` with one node per office, plus a BreadcrumbList on every content page.
- Core service page (`/services/[service]`): Service and FAQPage. Provider is the primary office (`@id` `${SITE.url}/#business`) and `areaServed` is the full area-served list.
- Service subpage (`/services/[service]/[subservice]`): Service only. Same primary-office provider and area-served list.
- City hub (`/locations/[city]`): no page-specific schema. It relies on the sitewide LocalBusiness and BreadcrumbList blocks.
- City service page (`/locations/[city]/[service]`) and city sub-service page (`/locations/[city]/[service]/[subservice]`): Service only. Provider is the serving office node and `areaServed` is that specific city.
- Blog posts: Article.
- FAQPage is emitted only where FAQs are actually rendered on the page, which is currently the core service pages.
- The primary office keeps the stable `@id` `${SITE.url}/#business` so Service and Article schema can reference it. Branch offices use `#office-<id>`.

**Canonical URLs** (`src/components/BaseHead.astro`)
- Every page emits an absolute `<link rel="canonical">` built from the site origin plus the current path.
- No trailing slash, matching the URL formatting convention.
- The origin is set in `astro.config.mjs` (`site`) and must stay in sync with `SITE.url`.

**Redirects**
- Any renamed or removed URL receives a single 301 (permanent) redirect to its closest replacement.
- No redirect chains or loops. Redirect in one hop to the final destination.
- Redirects are verified in the pre-launch checklist (Section 10.1).

**Core Web Vitals and performance targets**
- Meet Google's "Good" thresholds at the 75th percentile: LCP under 2.5s, INP under 200ms, CLS under 0.1.
- Support these targets with the framework's performance approach: static output, minimal JavaScript, and image optimization.

_Source: `src/components/BaseHead.astro`, `src/content.config.ts`, `src/components/LocalBusinessSchema.astro`, `src/layouts/BaseLayout.astro`, `src/layouts/ServiceLayout.astro`, `src/layouts/SubServiceLayout.astro`, `src/layouts/CityLayout.astro`, `src/layouts/LocationServiceLayout.astro`, `src/layouts/LocationSubServiceLayout.astro`, `src/layouts/BlogPostLayout.astro`; framework decisions, 2026-07-03; consistent with Methodology Interview, Section 7, Q1 to Q3._

---

## 11. Framework Configuration Standards

### 11.1 Every website must include

- A logical URL structure and optimized page templates.
- Responsive design and clean navigation.
- Internal linking, XML sitemaps, robots.txt, canonical tags, structured data.
- Image optimization and fast page performance.
- Support for scalable content generation for services, locations, blogs, and FAQs without sacrificing quality.
- Helpful, trustworthy content that reflects the brand.

_Source: Methodology Interview, Section 8, Q1._

### 11.2 Never customize per website (without clear business or SEO justification)

- URL structure.
- Page hierarchy.
- Navigation patterns.
- Internal linking strategy.
- Structured data implementation.
- Technical SEO standards.

Keeping these standardized keeps the framework maintainable and scalable.

_Source: Methodology Interview, Section 8, Q2._

### 11.3 Always configurable

Brand-specific and location-specific information must be configurable without changing code or architecture:

- Branding, logos, colors.
- Contact information, office locations, service areas, business hours.
- Service offerings, reviews, calls to action, media.
- Content modules such as FAQs, promotions, financing options, and team information.

The framework provides a consistent foundation. Configuration controls the information shown on each site. Separate content from the framework.

_Source: Methodology Interview, Section 8, Q3._

### 11.4 Guidance for future developers

- Evaluate changes by their impact across the entire platform, not a single website.
- Understand the reasoning behind the existing architecture and follow established standards.
- New features must improve the framework as a whole, stay backward compatible, and preserve consistency.

_Source: Methodology Interview, Section 8, Q4._

---

## Resolved Decisions

The four items originally flagged as **Needs Framework Decision** have been resolved and folded into the sections above. They were grounded in the existing framework implementation (the code is the authority) and, where the code was silent, in explicit framework decisions made on 2026-07-03.

1. **URL formatting conventions** — resolved in Section 6.4, from `src/lib/urls.ts`. Lowercase hyphenated slugs, no trailing slash, three-segment maximum. This corrects the illustrative trailing slashes in the methodology interview.
2. **Internal link quantity** — resolved in Section 7.5, from `src/lib/links.ts`. Related services and nearby cities are capped at 4. Area and sub-service lists are uncapped.
3. **Minimum content standard** — resolved in Section 8.4. Structural (required sections plus unique data), no word-count minimum.
4. **Technical implementation details** — resolved in Section 10.4, from the head, schema, and content-config code, plus decisions on redirects (single 301s, no chains) and Core Web Vitals (Google "Good" thresholds).
