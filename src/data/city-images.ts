/**
 * city-images.ts — the hero photography each city page uses.
 *
 * ─────────────────── A regional library, not a photo per city ───────────────────
 *
 * There are five concepts, not nine. That is a truthfulness constraint before it
 * is an economy: generated photography cannot depict a named town, so producing
 * nine "city" frames would only produce nine indistinguishable Arizona suburbs
 * while implying each one is somewhere specific. Four distinct residential
 * situations distributed across the pages keeps them from looking like one
 * template, without any frame claiming to be anywhere in particular.
 *
 * For the same reason ALT TEXT NEVER NAMES A CITY. It says East Valley, which is
 * the region these actually depict and the region the business actually serves.
 * A caption saying "a home in Chandler" would be a claim nobody can support.
 *
 * Each concept ships two crops, as everywhere else on the site: 16:9 for the
 * wide hero with a quiet left third for the copy, 3:4 for the tall crop a phone
 * gives it.
 */
import type { ImageMetadata } from 'astro';

import streetWide from '../assets/photos/cities/city-bg-eastvalley-wide.jpg';
import streetTall from '../assets/photos/cities/city-bg-eastvalley-tall.jpg';
import drivewayWide from '../assets/photos/cities/city-bg-driveway-wide.jpg';
import drivewayTall from '../assets/photos/cities/city-bg-driveway-tall.jpg';
import xeriscapeWide from '../assets/photos/cities/city-bg-xeriscape-wide.jpg';
import xeriscapeTall from '../assets/photos/cities/city-bg-xeriscape-tall.jpg';
import matureWide from '../assets/photos/cities/city-bg-mature-wide.jpg';
import matureTall from '../assets/photos/cities/city-bg-mature-tall.jpg';
import desertEdgeWide from '../assets/photos/cities/city-bg-desertedge-wide.jpg';
import desertEdgeTall from '../assets/photos/cities/city-bg-desertedge-tall.jpg';

export interface CityHero {
  wide: ImageMetadata;
  tall: ImageMetadata;
  /** Never names a city. See the note above. */
  alt: string;
  /**
   * object-position for the wide crop. Each concept puts its subject at a
   * different height, and a 2.4-ratio hero crops roughly half the frame away —
   * a single shared value pushed the staged items in the driveway frame off the
   * bottom edge, which is exactly the detail that makes it a junk-removal photo
   * rather than a house photo.
   */
  focus: string;
}

/** The library. Five residential situations across the East Valley. */
export const cityHeroes = {
  street: {
    wide: streetWide,
    tall: streetTall,
    alt: 'An armchair and a rolled carpet set out for collection outside a home on an East Valley residential street',
    focus: 'center 58%',
  },
  driveway: {
    wide: drivewayWide,
    tall: drivewayTall,
    alt: 'Stacked boxes and storage totes staged on the driveway of an East Valley home ready for removal',
    /* Items sit low in this frame; the default crop cut them off. */
    focus: 'center 74%',
  },
  xeriscape: {
    wide: xeriscapeWide,
    tall: xeriscapeTall,
    alt: 'An old sofa and a broken chair set out beside the driveway of a newer East Valley home with a gravel yard',
    focus: 'center 64%',
  },
  mature: {
    wide: matureWide,
    tall: matureTall,
    alt: 'A chest of drawers, a wrapped mattress and boxes set out on the driveway of an older East Valley home',
    focus: 'center 58%',
  },
  desertEdge: {
    wide: desertEdgeWide,
    tall: desertEdgeTall,
    alt: 'An armchair, a side table and boxes set out for collection outside a home on the desert edge of an East Valley neighbourhood',
    /* Items sit low-left in this frame; the crop keeps them under the copy
       rather than behind the headline. */
    focus: 'center 62%',
  },
} satisfies Record<string, CityHero>;

export type CityHeroKey = keyof typeof cityHeroes;

/**
 * Which concept each city gets.
 *
 * Distributed so no two adjacent cities in the nearby-city lists share a frame,
 * which is where a visitor is most likely to click straight from one page to
 * another and notice a repeat. The older-property frame goes to the two cities
 * with the most established housing stock.
 */
const assignment: Record<string, CityHeroKey> = {
  'gilbert-az': 'street',
  'queen-creek-az': 'street',
  'chandler-az': 'driveway',
  'apache-junction-az': 'driveway',
  'tempe-az': 'xeriscape',
  'san-tan-valley-az': 'xeriscape',
  /* Gold Canyon sits where the development actually meets open desert, so it
     takes the desert-edge frame. It also breaks up the one concept that was
     carrying three cities: nothing is on more than two now. */
  'gold-canyon-az': 'desertEdge',
  'scottsdale-az': 'mature',
  'ahwatukee-az': 'mature',
};

/** The hero for a city, falling back to the street frame for any new city. */
export const heroForCity = (slug: string): CityHero =>
  cityHeroes[assignment[slug] ?? 'street'];

/** Which concept a city uses, for reporting and QA. */
export const heroKeyForCity = (slug: string): CityHeroKey => assignment[slug] ?? 'street';
