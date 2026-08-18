/**
 * equipment.ts — what the business actually hauls with, and what that enables.
 *
 * Confirmed by the owner on 2026-08-18: a dump trailer of roughly 6 cubic yards
 * and an open utility trailer of roughly 9 cubic yards, with ONE tow vehicle, so
 * only one trailer is in service at a time.
 *
 * That last detail is the most operationally important thing in this file. It
 * means a large cleanout is several trips rather than one big load, and it sets
 * the honest ceiling on what a single visit can clear. `fleetLimits` below states
 * it, and the UI is expected to surface it rather than imply unlimited capacity.
 *
 * The 9 cubic yard utility trailer is the reference volume for the load size
 * scale in src/data/pricing.ts, because it is the larger single-trip capacity.
 * The dump trailer is the heavy-material option: less volume, but a floor and
 * walls built to take dense debris and tip it out.
 *
 * ─────────────────────── Relationship ownership ───────────────────────
 *
 * EQUIPMENT owns:
 *   equipment -> services  (what this equipment makes possible)
 *   equipment -> loadSizes (the sizes it can handle in one trip)
 *
 * A vehicle only lists a load size it can genuinely carry in ONE trip, so the
 * dump trailer stops at a half load: three quarters of the reference volume is
 * about 6.75 cubic yards, which is more than it holds.
 */
import type { Verifiable } from './ontology';

export type VehicleKind =
  | 'open-trailer'
  | 'dump-trailer'
  | 'enclosed-trailer'
  | 'box-truck'
  | 'dump-truck'
  | 'pickup';

export interface Vehicle extends Verifiable {
  slug: string;
  name: string;
  kind: VehicleKind;
  /** Usable capacity in cubic yards. Drives absolute load volumes in pricing.ts. */
  cubicYards?: number;
  /** Interior length, width, and wall height in feet. */
  dimensions?: { length: number; width: number; height: number };
  /** Safe payload in pounds. Governs how much heavy material can go in one trip. */
  maxPayloadLbs?: number;
  /** What having this equipment lets the business do. */
  enables: string[];
  /** Honest limits. Stated so a customer can rule themselves in or out. */
  limits: string[];
  /** Service slugs this vehicle supports. CANONICAL. */
  services: string[];
  /** Load size slugs achievable in a single trip. CANONICAL. */
  loadSizes: string[];
}

const CONFIRMED = {
  verified: true as const,
  source: 'Confirmed by the business owner',
  confirmedAt: '2026-08-18',
};

export const vehicles: Vehicle[] = [
  {
    slug: 'utility-trailer',
    name: 'Open utility trailer',
    kind: 'open-trailer',
    cubicYards: 9,
    enables: [
      'Bulky household loads where volume matters more than weight',
      'Loading long or awkward items over the side rather than through a door',
      'Seeing exactly how full the load is, so the volume you are quoted is the volume you can check',
      'Full garage, room, and whole-property cleanouts',
    ],
    limits: [
      'One trailer is in service at a time, so larger jobs run as multiple trips',
      'Not the right choice for dense debris, which is what the dump trailer is for',
    ],
    services: [
      'junk-removal',
      'furniture-removal',
      'appliance-removal',
      'garage-cleanouts',
      'estate-cleanouts',
      'mattress-removal',
      'shed-removal',
      'hoarder-cleanouts',
      'office-cleanouts',
      'foreclosure-cleanouts',
      'same-day-junk-removal',
      'hot-tub-removal',
    ],
    loadSizes: ['single-item', 'small', 'quarter', 'half', 'three-quarter', 'full'],
    ...CONFIRMED,
  },
  {
    slug: 'dump-trailer',
    name: 'Dump trailer',
    kind: 'dump-trailer',
    cubicYards: 6,
    enables: [
      'Dense material like concrete, tile, brick, soil, and roofing debris',
      'Tipping a load out rather than unloading it by hand, which keeps heavy jobs to one trip',
      'Loading debris at ground level off a low tailgate',
      'Remodel and landscaping debris that would be unsafe to stack high',
    ],
    limits: [
      'Less volume than the utility trailer, so it is the wrong pick for bulky light loads',
      'Heavy material is limited by weight before it is limited by space',
      'One trailer is in service at a time, so a job needing both runs as separate trips',
    ],
    services: ['construction-debris-removal', 'yard-waste-removal', 'junk-removal', 'hot-tub-removal'],
    loadSizes: ['single-item', 'small', 'quarter', 'half'],
    ...CONFIRMED,
  },
];

/**
 * The honest ceiling on a single visit.
 *
 * One tow vehicle means one trailer in service at a time. Components that talk
 * about large cleanouts must reflect this rather than implying a job of any size
 * clears in one load.
 */
export const fleetLimits = {
  simultaneousTrailers: 1,
  reason: 'One tow vehicle, so one trailer is hitched at a time.',
  consequence:
    'Jobs larger than a single trailer are planned as multiple trips and quoted together, rather than discovered halfway through the day.',
  /** Largest volume clearable in one trip, in cubic yards. */
  maxSingleTripCubicYards: 9,
};

export interface Tool {
  slug: string;
  name: string;
  /** What it is for, in terms a customer benefits from. */
  purpose: string;
}

/**
 * Standard hand equipment. These are ordinary tools of the trade rather than
 * claims about a specific fleet, so they are safe to state.
 */
export const tools: Tool[] = [
  { slug: 'dollies', name: 'Appliance dollies', purpose: 'Moving heavy appliances without dragging them across floors.' },
  { slug: 'straps', name: 'Lifting straps', purpose: 'Carrying awkward furniture safely down stairs and through doorways.' },
  { slug: 'floor-protection', name: 'Floor and door protection', purpose: 'Keeping walls, floors, and door frames undamaged on the way out.' },
  { slug: 'hand-tools', name: 'Hand tools', purpose: 'Disassembling furniture, sheds, and structures on site.' },
  { slug: 'reciprocating-saw', name: 'Cutting tools', purpose: 'Breaking down hot tubs and outdoor structures into haulable pieces.' },
  { slug: 'brooms', name: 'Brooms and cleanup gear', purpose: 'Sweeping the area once the approved items are gone.' },
];

export const getVehicle = (slug: string): Vehicle | undefined =>
  vehicles.find((v) => v.slug === slug);

/** Gate for every equipment claim on the site. */
export const hasConfirmedEquipment = (): boolean => vehicles.some((v) => v.verified);

/**
 * Largest volume clearable in ONE trip, or undefined if nothing is confirmed.
 *
 * Deliberately the maximum across vehicles, never the sum. Only one trailer is
 * hitched at a time, so adding the two capacities together would claim a
 * single-trip capacity the business does not have.
 */
export const confirmedCapacityCubicYards = (): number | undefined => {
  const known = vehicles
    .filter((v) => v.verified && typeof v.cubicYards === 'number')
    .map((v) => v.cubicYards as number);
  return known.length > 0 ? Math.max(...known) : undefined;
};

/** The vehicle best suited to a service, preferring capacity for bulky work. */
export const vehiclesForService = (serviceSlug: string): Vehicle[] =>
  vehicles.filter((v) => v.verified && v.services.includes(serviceSlug));

/** The heavy-material option, when one is confirmed. */
export const heavyMaterialVehicle = (): Vehicle | undefined =>
  vehicles.find((v) => v.verified && (v.kind === 'dump-trailer' || v.kind === 'dump-truck'));
