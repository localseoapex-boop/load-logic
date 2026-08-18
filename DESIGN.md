# Design System: Load Logic Junk Removal

Single source of truth for the visual system. Every component, page and generated
image must conform to this document. If a design decision is not covered here,
extend this file rather than improvising in a template.

---

## 1. Visual Theme & Atmosphere

**A working company's field record, set in editorial type.**

The site should read like documentation of real jobs: photographs of actual
loading work, plain measured language, spec-sheet numbers, and typography with
weight and authority. Warm concrete-and-bone neutrals, deep spruce green blocks
that behave like painted equipment panels, and a single hi-vis accent used only
where the visitor is meant to act.

The reference is a well-made trade catalogue or an equipment manual, not a SaaS
landing page. Surfaces are flat and matte. Hierarchy comes from type weight,
scale, rules and background tone, almost never from shadow. Photography carries
the emotional load; the interface stays quiet and gets out of its way.

**Dials**

| Dial | Value | Reasoning |
|---|---|---|
| `DESIGN_VARIANCE` | **7** | Asymmetric, editorial composition. Not chaotic: this is a trust-first local service business where a homeowner needs to find the phone number in two seconds. |
| `MOTION_INTENSITY` | **3** | Deliberate. The project philosophy bans unnecessary JavaScript and the site must stay statically rendered with excellent Core Web Vitals. CSS transitions and one IntersectionObserver reveal only. No scroll hijack, no GSAP, no animation library. Honest low dial beats half-built motion. |
| `VISUAL_DENSITY` | **6** | Higher than a typical marketing site. This site's competitive advantage is substantial useful content. Density is managed with editorial structure, not by deleting content. |

**Theme lock:** light mode only, committed and fully painted. No dark mode, no
section inverting to a different theme family. Deep spruce full-bleed blocks are
part of the light palette, used as deliberate punctuation at a maximum of three
per page.

---

## 2. Color Palette & Roles

One accent. Warm neutral base. The deep green is a brand *block* color, not a tint
sprayed across every surface.

| Token | Hex | Role |
|---|---|---|
| `--bone` | `#F4F2ED` | Page base. Warm concrete/paper neutral. Never green-tinted. |
| `--bone-2` | `#EAE7DF` | Recessed band, table stripe, inset panel |
| `--surface` | `#FFFFFF` | Raised panel, form field, photo mat |
| `--ink` | `#171A17` | Primary text. Off-black with the faintest green cast. Never `#000000`. |
| `--ink-2` | `#565C57` | Secondary text, captions, metadata |
| `--ink-3` | `#878D87` | Tertiary, disabled, placeholder |
| `--rule` | `#D8D3C8` | Hairlines, table rules, field borders. Warm, matches bone. |
| `--rule-strong` | `#B9B3A5` | Emphasized divider, input border on focus-within |
| `--spruce` | `#123329` | Brand block fill, footer, full-bleed punctuation |
| `--spruce-2` | `#1D5443` | Mid green: links, active nav, icon strokes on light |
| `--spruce-3` | `#2E6E58` | Hover state for spruce-2 |
| `--hi-vis` | `#CFE034` | **The only accent.** Primary CTA fill, focus ring, active step marker. |
| `--hi-vis-press` | `#BACC28` | Pressed state |
| `--rust` | `#A8462A` | **Semantic only.** Prohibited items, warnings, "we can't take this". Never decorative. |

**Rules**

- One accent (`--hi-vis`) used identically on every page. A hi-vis CTA is honest
  for a hauling company: it is the color of the safety gear the work is done in.
- `--rust` conveys state, never decoration. If it appears next to something that
  is not a restriction or a warning, it is a bug.
- Text on `--hi-vis` is always `--ink`. Never white. (Contrast: 12.4:1.)
- Text on `--spruce` is `--bone` or `#FFFFFF`. Never `--ink`.
- Grays are one warm family. Do not introduce a cool gray anywhere.
- No gradients as surface fills. The only permitted gradient is a bottom-up
  scrim over photography for text legibility, and it must be near-black at low
  alpha, not a brand color.

---

## 3. Typography

**One variable family, three registers.** Payload stays small, character stays high.

| Register | Face | Usage |
|---|---|---|
| Display | **Archivo** (variable, `wdth` 100-125, `wght` 600-800) | H1, H2, section heads, large numbers. Expanded widths for the biggest moments only. |
| Text | **Archivo** (variable, `wght` 400-500, `wdth` 100) | Body, lists, captions, UI labels |
| Data | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace` | Prices, load volumes, ZIP codes, job specs, time on site, phone numbers in ledgers |

Archivo is an American grotesque built for signage and highlights. It carries the
industrial, workmanlike tone without costume, and it is genuinely readable at text
sizes so a single family covers both roles. System mono handles the data register
at zero download cost.

**Self-hosted.** Two `woff2` files in `src/assets/fonts/`, declared with
`@font-face` and `font-display: swap`, with the text weight preloaded. No Google
Fonts `<link>`. No `@fontsource` dependency.

**Scale** (fluid, `clamp()`):

| Step | Size | Tracking | Leading | Use |
|---|---|---|---|---|
| `d1` | `clamp(2.75rem, 6vw, 5rem)` | `-0.03em` | `0.95` | Hero H1 only |
| `d2` | `clamp(2rem, 4vw, 3.25rem)` | `-0.02em` | `1.02` | Section H2 |
| `d3` | `clamp(1.375rem, 2vw, 1.75rem)` | `-0.01em` | `1.15` | Sub-section H3, card titles |
| `t1` | `1.1875rem` | `0` | `1.6` | Lead paragraph |
| `t2` | `1.0625rem` | `0` | `1.65` | Body |
| `t3` | `0.9375rem` | `0` | `1.55` | Secondary, captions |
| `lbl` | `0.75rem` | `0.08em` | `1.2` | Uppercase label, mono data key |

**Rules**

- Body copy is capped at `68ch`. Long-form service content uses a measured column,
  never full container width.
- `text-wrap: balance` on all headings, `text-wrap: pretty` on paragraphs.
- Numbers in any comparative or spec context use the data register with
  `font-variant-numeric: tabular-nums`.
- Weight and color carry hierarchy. Do not reach for a larger size when a heavier
  weight or a rule will do.
- Maximum one uppercase micro-label per three sections. The section's position on
  the page already tells the visitor what it is.
- No all-caps headlines. No letter-spaced body copy.

---

## 4. Spacing & Content Widths

An 8px base scale. Every margin, padding and gap resolves to a token.

`--s1 4px` · `--s2 8px` · `--s3 12px` · `--s4 16px` · `--s5 24px` · `--s6 32px`
`--s7 48px` · `--s8 64px` · `--s9 96px` · `--s10 128px` · `--s11 160px`

**Section rhythm** — vertical padding varies by section weight. Identical padding
on every section is what makes the current site feel templated.

| Weight | Padding | Use |
|---|---|---|
| Tight | `clamp(--s6, 5vw, --s7)` | Action strips, checkers, inline tools |
| Standard | `clamp(--s7, 8vw, --s9)` | Most content sections |
| Feature | `clamp(--s8, 11vw, --s11)` | Signature moments: load scale, before/after |

Bottom padding runs roughly 1.15x top padding on standard sections for optical
balance.

**Widths**

| Token | Value | Use |
|---|---|---|
| `--w-prose` | `68ch` | Long-form reading column |
| `--w-narrow` | `860px` | Forms, focused single-column sections |
| `--w-content` | `1180px` | Default container |
| `--w-wide` | `1440px` | Ledgers, load scale, wide photo grids |
| `--w-bleed` | `100%` | Full-bleed photo and spruce blocks |

---

## 5. Radius, Rules & Elevation

**Radius — one documented system, applied everywhere:**

| Element class | Radius |
|---|---|
| Photography, full-bleed blocks | `0` |
| Panels, cards, form fields, buttons | `4px` |
| Chips and filter pills (a distinct interactive class) | `999px` |
| Circular step markers and avatars | `50%` |

Square-cornered photography is a deliberate signature. It reads as document and
record rather than app card, and it is the single fastest way to separate this
site from the soft-8px-rounded template look it is replacing.

**Rules over boxes.** Hierarchy is built with `1px solid var(--rule)` hairlines,
background tone changes, and space. A container gets a border only when it is
genuinely a discrete object.

**Elevation is nearly banned.** Exactly two shadows exist:

```
--shadow-float: 0 1px 2px rgba(23,26,23,.06), 0 8px 24px rgba(18,51,41,.10);
--shadow-lift:  0 12px 40px rgba(18,51,41,.16);
```

`--shadow-float` is reserved for elements that genuinely float above the page:
the sticky mobile action bar and the sticky quote card. `--shadow-lift` is for
the one open overlay state. Content cards get no shadow. Both are tinted with
the spruce hue, never neutral black.

---

## 6. Photography & Image Treatment

Photography is the primary visual asset of this site and the main reason it will
stop looking generated. See `docs/image-art-direction.md` for the full generation
brief.

**Treatment rules**

- Square corners. No rounded photo cards.
- No pills, tags or captions overlaid on images. A caption sits directly below
  the image in the data register, and only when it carries real information
  ("Gilbert garage cleanout, 3/4 load, two crew, 90 minutes").
- Scrims only where text sits over an image: a bottom-up `rgba(12,20,16,…)` ramp,
  never a brand-colored wash.
- Every image ships through `astro:assets` `<Image>` with explicit dimensions,
  `loading="lazy"` except the hero (`loading="eager"`, `fetchpriority="high"`),
  and real descriptive alt text.
- Aspect ratios are part of the system: `16:9` full-bleed, `4:3` service and
  situation blocks, `3:2` before/after pairs, `1:1` load-scale steps, `21:9`
  wide equipment strips. Mixing ratios deliberately is what breaks grid monotony.
- No image is decorative filler. If a photograph does not carry information the
  copy cannot, cut it.

**People in generated imagery**

Generated figures are anonymous working hands, never the Load Logic team. This is
a content-integrity rule, not a style preference.

- No "meet the team", owner portrait, or staff-headshot section exists until real
  photography is supplied.
- No caption, alt text or surrounding copy identifies a generated figure as a
  Load Logic employee, owner or crew member. Alt text describes the *work*
  ("two workers carrying a sofa down a driveway"), never the *company*.
- Prefer framing where faces are turned away, obscured by the load, or cropped by
  the frame. The subject of every photograph is the job, not the person.
- `src/assets/photos/team/` stays empty and reserved for real photography.

---

## 7. Iconography

- **Phosphor Icons**, Regular weight (1.5px stroke), delivered as inline SVG
  sprites in `src/components/icons/`. One family, one stroke weight, everywhere.
- Icons are functional wayfinding and category markers, never decoration beside
  every heading.
- The `✓` and `→` text characters currently doing icon duty are removed entirely.
- Icon color is `--spruce-2` on light surfaces, `--bone` on spruce blocks. Icons
  never take the accent color; the accent belongs to actions only.
- No emoji anywhere in markup, copy or comments.

---

## 8. Component Stylings

**Buttons**

| Variant | Fill | Text | Border | Use |
|---|---|---|---|---|
| Primary | `--hi-vis` | `--ink` | none | The single most important action on the view |
| Solid | `--spruce` | `#FFFFFF` | none | Phone CTA on light surfaces |
| Outline | transparent | `--ink` | `1px --rule-strong` | Secondary navigation actions |
| Quiet | transparent | `--spruce-2` | none, underline on hover | Tertiary, inline |

- Radius `4px`, min height `48px`, horizontal padding `--s5`, weight 600.
- `:hover` shifts fill one step. `:active` applies `translateY(1px)`.
- `:focus-visible` gets a `2px` `--hi-vis` ring with a `2px` offset, on every
  interactive element without exception.
- Labels are 1-3 words and must never wrap at desktop.
- One CTA label per intent across the whole site. There are exactly two
  conversion intents and each owns one label:

  | Intent | Label | Variant | Placement |
  |---|---|---|---|
  | Quote | **Get a Photo Quote** | Primary (`--hi-vis`) | The primary action on every page. Never also worded "Free quote", "Request estimate" or "Get started". |
  | Phone | **Call Now** | Solid (`--spruce`) | Secondary action, paired with the quote CTA in the header, the sticky mobile bar and every closing CTA block. Never worded "Call us", "Contact us" or "Talk to us". |

- On mobile the two sit side by side in the sticky action bar at equal width.
  Phone remains a first-class conversion path; the quote form supplements it
  rather than replacing it.

**Panels**

Flat `--surface` on `--bone`, `1px --rule`, radius `4px`, no shadow. Used only
where the content is a discrete object (a job record, a form, a review). Grouped
information uses hairline-separated rows instead.

**Ledger** (the workhorse for pricing factors, DIY comparison, load specs)

A hairline-ruled table in the data register. Rule below each row only, never both
top and bottom. Keys in `--ink-2` at `lbl` size, values in mono `--ink`. Groups of
more than five rows get chunked under a subhead rather than running as one long
list.

**Form fields**

Label above at `lbl` size in `--ink-2`. Field is `--surface` with `1px --rule`,
radius `4px`, min height `48px`, text at `t2`. Helper text below in `--ink-3`.
Error text below in `--rust` with a matching `--rust` field border, announced with
`aria-describedby` and `aria-invalid`. Never placeholder-as-label. All contrast
verified at WCAG AA.

**Chips**

Radius `999px`, `--bone-2` fill, `1px --rule`, `t3` text. Used for filterable item
tags and the "can you take this" browser only.

---

## 9. Layout Families

A page must use at least four distinct families, and no family may appear twice
on the same page. No more than two consecutive sections may use an image-and-text
split.

1. **Full-bleed photo block** — edge-to-edge photograph, copy in a lower-left
   well over a scrim. Hero, chapter breaks.
2. **Editorial column + sticky rail** — measured prose column with a sticky quote
   card or contents rail alongside. The service page backbone.
3. **Ledger** — hairline data table, mono values. Pricing, comparisons, specs.
4. **Typographic index** — dense two-column category → item list, hairline
   separated, no cards. What we remove, what we don't.
5. **Scale strip** — horizontal sequence at equal ratio reading as a measurement
   instrument. The load-size estimator, drawn as SVG diagrams rather than
   photographs so every step is exactly proportional and the trailer is identical
   at each reading. See `docs/image-art-direction.md` section 5.2.
6. **Asymmetric split** — `2fr 1fr` or `1fr 2fr` photo/text, alternating anchor
   side. Situations, equipment.
7. **Panel grid** — genuine card grid, permitted at most once per page, and only
   for objects that really are peers (job records, reviews).
8. **Pull quote** — one large review set in display type with attribution.
9. **Full-bleed spruce block** — brand-colored punctuation carrying a CTA or a
   single statement. Maximum three per page.

**Grid**: CSS Grid throughout. No flexbox percentage math. Multi-column layouts
declare their sub-768px collapse in the same component.

---

## 10. Responsive Rules

Mobile is the primary conversion surface. Roughly seven of every ten visitors to a
junk removal site arrive on a phone, mid-task, in a garage.

- Breakpoints: `sm 480`, `md 768`, `lg 1024`, `xl 1280`.
- Every multi-column layout collapses to a single column below `768px`. No
  exceptions, no horizontal overflow ever.
- **The header collapses to a single 64px bar** at mobile: wordmark left, call
  button right, menu trigger. The current three-row stack that consumes 170px
  before the hero is a defect being fixed.
- **The sticky action bar renders on every page**, not just the homepage. Two
  targets: `Call` and `Get a photo quote`. It uses `--shadow-float` and respects
  `env(safe-area-inset-bottom)`.
- All tap targets are at least `48px`. Phone links are the largest targets on the
  page.
- Full-height sections use `min-height: 100dvh`, never `100vh`.
- Photo scale strips become horizontal scroll-snap carousels below `768px`, with
  visible partial next-item so the affordance is obvious.
- Before/after becomes a stacked pair with labels below `768px`, not a slider.
- Section padding scales down through the `clamp()` floors, and body text never
  drops below `1rem`.

---

## 11. Motion

`MOTION_INTENSITY: 3`. Motion is functional feedback, not decoration. Every
animation must justify itself as hierarchy, feedback or state change.

**Permitted**

- `:hover` and `:active` transitions on interactive elements, 180ms,
  `cubic-bezier(.2,.7,.3,1)`, on `transform`, `opacity`, `background-color`,
  `border-color` only.
- A single scroll-reveal: a 16px rise and fade on section entry, driven by
  `IntersectionObserver` in one small inline script, staggered at 60ms across
  direct children.
- `<details>` disclosure height transition where supported.

**Banned**

- Animation libraries of any kind. No GSAP, no Motion, no ScrollTrigger.
- `window.addEventListener('scroll')`.
- Parallax, scroll hijack, pinned sections, marquees, carousels with autoplay.
- Infinite loops of any kind, including pulsing dots and shimmer.
- Animating `top`, `left`, `width`, `height`.

**Reduced motion**: everything above collapses to instant under
`@media (prefers-reduced-motion: reduce)`. The scroll-reveal script exits early
and renders all content visible.

---

## 12. Accessibility

- WCAG AA minimum on all text, AAA target for body copy on `--bone`.
- Visible `--hi-vis` focus ring on every interactive element.
- A "Skip to content" link as the first focusable element.
- One `<h1>` per page, no skipped heading levels.
- Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`,
  `<aside>`, `<footer>`.
- Real descriptive alt text on every meaningful image.
- Form errors are inline, text-based, and programmatically associated. Never
  color-only, never `window.alert()`.
- The site remains fully functional and navigable with JavaScript disabled. The
  ZIP checker, item search and quote form all degrade to working static content.

---

## 13. Anti-Patterns (Banned)

Enforced at review. Any of these appearing in output is a defect.

**Layout and surface**

- Centered hero with an eyebrow, a headline, a lead and translucent trust pills.
- Linear brand-color gradient as a section background.
- Three or four identical text-only cards as a feature row.
- The same card recipe (white + border + radius + shadow) reused for content,
  navigation and social proof alike.
- Alternating light/tinted bands as the page's entire structural rhythm.
- Identical vertical padding on every section.
- Uniform radius and a single shadow applied to every element.
- Internal-link grids stacked at the bottom of a page as visible SEO plumbing.
- Rounded photo cards.

**Typography and copy**

- `system-ui` or Inter as the display face.
- Em dashes (`—`) and en dashes (`–`) anywhere in visible copy. Rewrite the
  sentence, or use a comma, colon, period or parenthesis. This is also the
  project's own documented copy standard.
- Uppercase micro-labels above every section heading.
- Section-number eyebrows (`01 / SERVICES`), scroll cues, version stamps, locale
  or weather strips, decorative status dots, decorative middle dots.
- Marketing filler: "elevate", "seamless", "unleash", "comprehensive solutions",
  "industry-leading", "game-changing", "cutting-edge".
- Title Case On Every Heading. Sentence case throughout.

**Content integrity**

- Fabricated reviews, ratings, awards, certifications, years in business,
  insurance status, or job counts. Every trust component renders only what is
  supplied as verified data and hides itself when data is absent.
- Representative examples presented as documented customer jobs. Anything not
  verified is explicitly labeled as a representative example.
- Invented dollar figures. Pricing components render structure and factors; real
  numbers appear only when supplied to `pricing.ts` and marked published.
- Schema describing anything not visible on the page.

**Imagery**

- Hyper-polished stock photography, spotless crews, HDR, oversaturation.
- Workers grinning at the camera.
- Text or fake logos rendered inside generated images.
- Physically impossible trailer loads or floating debris.
- Decorative photography that carries no information.

---

## 14. What This System Preserves

The redesign is visual and structural. These are load-bearing and must not change:

- All 175 existing URLs, the five `getStaticPaths()` generators, and every slug.
- `src/lib/links.ts` and `src/lib/urls.ts` public APIs, including
  `serviceAreaLocations` and the home-city exclusion rule.
- `BaseHead.astro` canonical, Open Graph and Twitter output.
- BreadcrumbList, LocalBusiness, Service, FAQPage and Article JSON-LD, including
  the `${SITE.url}/#business` provider `@id` contract.
- The sitemap integration, `robots.txt`, and the `site` / `SITE.url` sync.
- The blog content collection schema and its build-time validation.
- Static output with no SSR for content pages.
