/**
 * jobs.ts — worked examples of what a job actually involves.
 *
 * The most useful thing you can show someone trying to judge a junk removal
 * company is a complete job: what came out, how much space it took, how many
 * people, how long, and where the material went. It answers the volume question,
 * the price question, and the trust question at the same time.
 *
 * ─────────────────────────── Honesty contract ───────────────────────────
 *
 * Every entry here is `representative: true` and `verified: false`. These are
 * illustrations of typical work assembled from the service catalogue, NOT
 * records of specific customer jobs.
 *
 * The UI must therefore:
 *   - label every rendered job visibly as a representative example
 *   - never attach a customer name, date, or address to one
 *   - never emit them as schema.org Review, or as any claim of completed work
 *
 * When real documented jobs arrive, they replace these entries with
 * `representative: false`, `verified: true`, and a source. The component then
 * drops the label automatically. Nothing else has to change.
 *
 * ─────────────────────── Relationship ownership ───────────────────────
 *
 * JOB owns:
 *   job -> location, service, propertyType, situation, loadSize
 *   job -> materials (what came out)
 *   job -> disposal split (where it went)
 *
 * This makes a job the densest node in the graph: it is the one place every
 * other entity meets, which is exactly what makes it useful to both a visitor
 * and a machine trying to understand what this business does.
 */
import type { Verifiable } from './ontology';

export interface DisposalSplit {
  /** Disposal route slug from disposal.ts. */
  route: string;
  /** Rough share of the load, as a percentage. Should total about 100. */
  share: number;
}

export interface Job extends Verifiable {
  slug: string;
  /** Short descriptive title, no customer identity. */
  title: string;
  /** Location slug. CANONICAL. */
  location: string;
  /** Service slug. CANONICAL. */
  service: string;
  /** Property type slug. CANONICAL. */
  propertyType: string;
  /** Situation slug. CANONICAL. */
  situation: string;
  /** Load size slug from pricing.ts, per load. CANONICAL. */
  loadSize: string;
  /**
   * Number of trailer loads the job took. Defaults to 1.
   *
   * The business tows one trailer at a time (see equipment.ts `fleetLimits`), so
   * a whole-property cleanout is several trips rather than one enormous load.
   * Recording it keeps the volume figures honest.
   */
  loadCount?: number;
  /** Material slugs removed. CANONICAL. */
  materials: string[];
  /** Access factor slugs that shaped the work. CANONICAL. */
  accessFactors: string[];
  /** Which trailer the job ran with, when it is worth stating. CANONICAL. */
  vehicle?: string;
  /** Number of crew on site. */
  crew: number;
  /** Time on site, in minutes. */
  minutesOnSite: number;
  /** Where the load went. */
  disposal: DisposalSplit[];
  /** What made this job non-obvious. The detail that makes it feel real. */
  note: string;
  /** Image ids for the before and after states, when available. */
  images?: { before?: string; after?: string };
  /**
   * TRUE means this is an illustration, not a customer job. The UI labels it.
   * Real jobs set this false and set `verified` true with a source.
   */
  representative: boolean;
}

export const jobs: Job[] = [
  {
    slug: 'gilbert-garage-reset',
    title: 'Two-car garage cleared before a listing',
    location: 'gilbert-az',
    service: 'garage-cleanouts',
    propertyType: 'homeowner',
    situation: 'pre-sale-prep',
    loadSize: 'three-quarter',
    materials: ['shelving', 'boxes', 'exercise-equipment', 'hand-tools', 'sports-gear', 'patio-furniture'],
    accessFactors: ['curbside', 'tight-access'],
    crew: 2,
    minutesOnSite: 150,
    disposal: [
      { route: 'donation', share: 25 },
      { route: 'recycling', share: 20 },
      { route: 'transfer-station', share: 55 },
    ],
    note: 'Old paint cans found at the back had to be left behind, since liquid paint cannot go in a general load. The homeowner was pointed to a county collection event for them.',
    images: { before: 'ba-garage-before', after: 'ba-garage-after' },
    representative: true,
    verified: false,
  },
  {
    slug: 'mesa-estate-clear',
    title: 'Whole-home estate cleanout over two days',
    location: 'mesa-az',
    service: 'estate-cleanouts',
    propertyType: 'executor',
    situation: 'estate-settlement',
    loadSize: 'full',
    loadCount: 3,
    materials: ['sofa', 'dresser', 'boxes', 'clothing', 'kitchenware', 'books', 'mattress'],
    accessFactors: ['stairs', 'inside-home'],
    crew: 3,
    minutesOnSite: 420,
    disposal: [
      { route: 'donation', share: 40 },
      { route: 'transfer-station', share: 45 },
      { route: 'landfill', share: 15 },
    ],
    note: 'Three full trailer loads across two days, since one trailer is towed at a time. Family sorted room by room ahead of the crew, which is what kept the donation share high. Photo albums and documents were set aside and never loaded.',
    representative: true,
    verified: false,
  },
  {
    slug: 'tempe-apartment-turnover',
    title: 'One-bedroom apartment turnover after a move-out',
    location: 'tempe-az',
    service: 'foreclosure-cleanouts',
    propertyType: 'property-manager',
    situation: 'rental-turnover',
    loadSize: 'half',
    materials: ['mattress', 'sofa', 'bagged-clutter', 'television', 'small-appliance'],
    accessFactors: ['apartment', 'elevator', 'long-carry'],
    crew: 2,
    minutesOnSite: 120,
    disposal: [
      { route: 'donation', share: 15 },
      { route: 'e-waste', share: 10 },
      { route: 'transfer-station', share: 75 },
    ],
    note: 'The building required the service elevator to be booked in advance. Arranging that ahead of time is what kept it to a single visit.',
    representative: true,
    verified: false,
  },
  {
    slug: 'gold-canyon-hot-tub',
    title: 'Hot tub cut down and removed from a back yard',
    location: 'gold-canyon-az',
    service: 'hot-tub-removal',
    propertyType: 'homeowner',
    situation: 'backyard-project',
    loadSize: 'three-quarter',
    materials: ['hot-tub'],
    accessFactors: ['tight-access', 'disassembly', 'heavy-items', 'long-carry'],
    crew: 3,
    minutesOnSite: 180,
    disposal: [
      { route: 'recycling', share: 30 },
      { route: 'transfer-station', share: 70 },
    ],
    note: 'A 36 inch side gate meant the spa had to be cut into sections in place. It was drained and electrically disconnected before the crew arrived, which is what kept it to one visit.',
    vehicle: 'dump-trailer',
    representative: true,
    verified: false,
  },
  {
    slug: 'chandler-yard-cleanup',
    title: 'Yard cleared after a monsoon and a palm trim',
    location: 'chandler-az',
    service: 'yard-waste-removal',
    propertyType: 'homeowner',
    situation: 'yard-cleanup',
    loadSize: 'quarter',
    materials: ['palm-fronds', 'branches', 'leaves-clippings'],
    accessFactors: ['curbside'],
    crew: 2,
    minutesOnSite: 60,
    disposal: [{ route: 'green-waste', share: 100 }],
    note: 'Everything was clean green waste with no trash mixed in, so the entire load went to a green waste facility rather than to disposal.',
    representative: true,
    verified: false,
  },
];

export const getJob = (slug: string): Job | undefined => jobs.find((j) => j.slug === slug);

export const jobsForLocation = (locationSlug: string): Job[] =>
  jobs.filter((j) => j.location === locationSlug);

export const jobsForService = (serviceSlug: string): Job[] =>
  jobs.filter((j) => j.service === serviceSlug);

export const jobsForLocationService = (locationSlug: string, serviceSlug: string): Job[] =>
  jobs.filter((j) => j.location === locationSlug && j.service === serviceSlug);

/** Real documented jobs only. Empty until verified records exist. */
export const documentedJobs = (): Job[] => jobs.filter((j) => !j.representative && j.verified);

/** Total volume a job moved, in cubic yards, or undefined if unknown. */
export const jobVolume = (job: Job, loadCubicYards: number | undefined): number | undefined =>
  typeof loadCubicYards === 'number' ? loadCubicYards * (job.loadCount ?? 1) : undefined;

/** Human-readable time on site, e.g. "2 hr 30 min". */
export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
};
