/**
 * comparisons.ts — decision support for people weighing their options.
 *
 * Someone deciding between renting a truck for a Saturday, ordering a dumpster,
 * or hiring a crew is not yet a customer. They are trying to work out which
 * option fits their job. Answering that honestly, including the cases where
 * Load Logic is the wrong choice, is more persuasive than a page of claims.
 *
 * ─────────────────────────── Honesty contract ───────────────────────────
 *
 * The dumpster comparison ships with `available: false`, because dumpster rental
 * is not a service the business currently offers. It exists as a decision aid
 * only. Nothing in the UI advertises it as bookable, and the component reads the
 * flag to decide whether to present it as a comparison or as an offering.
 *
 * The DIY comparison is deliberately not fear-based. Renting a truck genuinely is
 * the right answer for some jobs, and saying so is what makes the rest credible.
 */
import type { ComparisonRow } from './ontology';

export interface Comparison {
  slug: string;
  /** The alternative being weighed against full-service removal. */
  alternative: string;
  title: string;
  intro: string;
  /** Column headings, alternative first. */
  columns: [string, string];
  rows: ComparisonRow[];
  /** When the alternative is genuinely the better choice. */
  chooseAlternativeWhen: string[];
  /** When full service is the better choice. */
  chooseLoadLogicWhen: string[];
  /**
   * Whether the alternative is something the business currently offers. Gates
   * whether the UI can present it as bookable.
   */
  available: boolean;
}

export const comparisons: Comparison[] = [
  {
    slug: 'diy-vs-full-service',
    alternative: 'Doing it yourself',
    title: 'Renting a truck versus hiring a crew',
    intro:
      'Plenty of junk removal jobs are worth doing yourself. The question is whether the time, the lifting, and the dump run add up to less hassle than paying someone to handle it.',
    columns: ['Doing it yourself', 'Load Logic'],
    rows: [
      {
        dimension: 'Time',
        alternative: 'Most of a day once you count the rental, the loading, the drive, and the return.',
        loadLogic: 'A scheduled window. You point at what goes and the crew handles the rest.',
      },
      {
        dimension: 'Vehicle',
        alternative: 'A rental truck or a borrowed trailer, plus fuel and a deposit.',
        loadLogic: 'Included. Nothing to rent, book, or return.',
      },
      {
        dimension: 'Loading',
        alternative: 'You and whoever you can talk into helping.',
        loadLogic: 'A crew who does this daily and knows how to get a sofa around a corner.',
      },
      {
        dimension: 'Heavy items',
        alternative: 'Appliances and furniture on stairs are where most injuries happen.',
        loadLogic: 'Handled with dollies, straps, and enough people to do it safely.',
      },
      {
        dimension: 'Dump fees',
        alternative: 'Paid separately at the facility, usually by weight, often more than expected.',
        loadLogic: 'Included in the quoted price.',
      },
      {
        dimension: 'Sorting',
        alternative: 'You work out what can be donated or recycled and where each goes.',
        loadLogic: 'Usable items separated during loading and routed for reuse.',
      },
      {
        dimension: 'Number of trips',
        alternative: 'Often two, because the first load never fits everything.',
        loadLogic: 'Sized at the quote. Multiple loads are planned rather than discovered.',
      },
      {
        dimension: 'Cleanup',
        alternative: 'Yours.',
        loadLogic: 'The area is swept before the crew leaves.',
      },
      {
        dimension: 'Risk',
        alternative: 'Strained backs, scratched floors, and damaged door frames are common.',
        loadLogic: 'The crew carries the risk, not your weekend.',
      },
    ],
    chooseAlternativeWhen: [
      'You have one or two light items and a vehicle that fits them',
      'You already have help and a free afternoon',
      'The material is clean, sorted, and going to one place',
      'You are close to a facility that accepts what you have',
    ],
    chooseLoadLogicWhen: [
      'The items are heavy, awkward, or upstairs',
      'You do not have a truck or anyone to help lift',
      'You want it gone today rather than next weekend',
      'The load is mixed and would need several different drop-offs',
      'You are working to a deadline like a closing, listing, or lease end',
    ],
    available: true,
  },
  {
    slug: 'dumpster-vs-full-service',
    alternative: 'Renting a dumpster',
    title: 'Dumpster rental versus full-service removal',
    intro:
      'A dumpster and a junk removal crew solve different problems. A dumpster is a container you fill over time. Full service is labor that removes things now. Which one fits depends mostly on whether you want to do the loading.',
    columns: ['Dumpster rental', 'Load Logic'],
    rows: [
      {
        dimension: 'Who loads it',
        alternative: 'You do, over as many days as the rental lasts.',
        loadLogic: 'The crew does, in one visit.',
      },
      {
        dimension: 'Timing',
        alternative: 'Suits projects that generate debris gradually over days or weeks.',
        loadLogic: 'Suits work that is already done or already piled up.',
      },
      {
        dimension: 'Space needed',
        alternative: 'A driveway or street spot for the whole rental, sometimes with a permit.',
        loadLogic: 'A parking spot for the length of the appointment.',
      },
      {
        dimension: 'Property impact',
        alternative: 'Heavy containers can mark driveways and take a parking space for days.',
        loadLogic: 'Nothing is left behind on the property.',
      },
      {
        dimension: 'Cost structure',
        alternative: 'A rental period plus weight overages once you exceed the included tonnage.',
        loadLogic: 'One price agreed before loading, based on the space your items take.',
      },
      {
        dimension: 'Heavy material',
        alternative: 'Works well for sustained volumes of concrete, tile, and roofing.',
        loadLogic: 'Handled, but weight limits apply per load.',
      },
      {
        dimension: 'HOA rules',
        alternative: 'Many communities restrict how long a container can sit on a property.',
        loadLogic: 'Arrives and leaves the same day, so restrictions rarely apply.',
      },
    ],
    chooseAlternativeWhen: [
      'You are running a multi-day renovation that keeps producing debris',
      'You want to work through a cleanout gradually at your own pace',
      'You have large sustained volumes of heavy construction material',
      'You have the space and permission to keep a container on site',
    ],
    chooseLoadLogicWhen: [
      'The junk already exists and you want it gone now',
      'You do not want to do the loading',
      'You cannot keep a container on the property',
      'You want one price rather than a rental plus weight overages',
    ],
    available: false,
  },
];

export const getComparison = (slug: string): Comparison | undefined =>
  comparisons.find((c) => c.slug === slug);

/** Comparisons safe to present as offerings rather than decision aids. */
export const availableComparisons = (): Comparison[] =>
  comparisons.filter((c) => c.available);
