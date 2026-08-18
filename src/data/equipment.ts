/**
 * equipment.ts — what the business actually hauls with, and what that enables.
 *
 * ─────────────────────────── Unconfirmed state ───────────────────────────
 *
 * The real vehicle and its capacity have NOT been confirmed yet. That single
 * fact blocks three things, so it is tracked here rather than guessed:
 *
 *   1. Absolute load volumes in src/data/pricing.ts. A "half load" only becomes
 *      a real number once you know the size of the thing being half filled.
 *   2. Generated photography. The vehicle appears in nearly every image, so a
 *      wrong one would have to be regenerated across the whole set. See
 *      docs/image-art-direction.md section 2.1.
 *   3. Honest capability claims. Telling a customer with a hot tub that it fits
 *      in one trip is a promise about equipment we do not have on file.
 *
 * Until `confirmed` is true, `EquipmentCapability` renders nothing and the site
 * makes no claim about fleet, capacity, or what fits in a single trip.
 *
 * ─────────────────────── Relationship ownership ───────────────────────
 *
 * EQUIPMENT owns:
 *   equipment -> services  (what this equipment makes possible)
 *   equipment -> loadSizes (the sizes it can handle in one trip)
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

/**
 * Empty until the real equipment is confirmed. Populating this with a plausible
 * trailer would create a fictional fleet, which is exactly the failure mode this
 * module is structured to avoid.
 */
export const vehicles: Vehicle[] = [];

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

/** Total single-trip capacity across confirmed vehicles, or undefined. */
export const confirmedCapacityCubicYards = (): number | undefined => {
  const known = vehicles.filter((v) => v.verified && typeof v.cubicYards === 'number');
  if (known.length === 0) return undefined;
  return known.reduce((sum, v) => sum + (v.cubicYards ?? 0), 0);
};
