/**
 * service-images.ts — the photography each service page uses.
 *
 * ServiceLayout2026 is generic; this is where the per-service art direction
 * lives, so adding or reshooting a service's imagery never touches the template.
 *
 * ─────────────────────────── The contract ───────────────────────────
 *
 *   hero      REQUIRED. The MOBILE hero background, and the fallback everywhere
 *             `heroWide` is missing. Shot 4:3, which suits the tall crop a phone
 *             gives it. It is the LCP element, so it is loaded eagerly.
 *
 *   heroWide  The DESKTOP hero background, shot 16:9 and framed for text: the
 *             subject sits centre-right and the left third is left quiet. The
 *             4:3 frames cannot do this job — a 2.5-ratio container crops about
 *             half their height away and cuts the subject with it.
 *
 *   support   Optional. Sits beside the "What we take" heading.
 *
 *   outcome   Optional. Sits beside the problem/solution heading. Usually a
 *             cleared or finished state, so the section it accompanies reads as
 *             the resolution rather than the problem.
 *
 * A service with only a hero renders fine; the two optional slots simply do not
 * appear. That is deliberate — three images suit a garage cleanout and would pad
 * a mattress removal.
 *
 * ─────────────────────────── Honesty ───────────────────────────
 *
 * All of this is generated documentary photography, not photographs of real
 * Load Logic jobs, and none of it is captioned as a specific customer's job. It
 * should be replaced with real job photography as that becomes available; see
 * docs/image-art-direction.md. Every frame is held to the same rules: one truck
 * and one trailer at most, no readable branding, no identifiable faces.
 */
import type { ImageMetadata } from 'astro';

/* Heroes — one per service, generated for this rollout. */
/* Desktop background heroes — 16:9, framed with a quiet left third for the copy. */
import bgJunkRemoval from '../assets/photos/services/svc-bg-junk-removal.jpg';
import bgFurnitureRemoval from '../assets/photos/services/svc-bg-furniture-removal.jpg';
import bgApplianceRemoval from '../assets/photos/services/svc-bg-appliance-removal.jpg';
import bgGarageCleanouts from '../assets/photos/services/svc-bg-garage-cleanouts.jpg';
import bgEstateCleanouts from '../assets/photos/services/svc-bg-estate-cleanouts.jpg';
import bgHotTubRemoval from '../assets/photos/services/svc-bg-hot-tub-removal.jpg';
import bgConstructionDebrisRemoval from '../assets/photos/services/svc-bg-construction-debris-removal.jpg';
import bgYardWasteRemoval from '../assets/photos/services/svc-bg-yard-waste-removal.jpg';
import bgMattressRemoval from '../assets/photos/services/svc-bg-mattress-removal.jpg';
import bgShedRemoval from '../assets/photos/services/svc-bg-shed-removal.jpg';
import bgHoarderCleanouts from '../assets/photos/services/svc-bg-hoarder-cleanouts.jpg';
import bgOfficeCleanouts from '../assets/photos/services/svc-bg-office-cleanouts.jpg';
import bgForeclosureCleanouts from '../assets/photos/services/svc-bg-foreclosure-cleanouts.jpg';
import bgSameDayJunkRemoval from '../assets/photos/services/svc-bg-same-day-junk-removal.jpg';

import heroJunk from '../assets/photos/services/svc-hero-junk.jpg';
import heroFurniture from '../assets/photos/services/svc-hero-furniture.jpg';
import heroAppliance from '../assets/photos/services/svc-hero-appliance.jpg';
import heroGarage from '../assets/photos/services/svc-garage-hero.jpg';
import heroEstate from '../assets/photos/services/svc-hero-estate.jpg';
import heroHotTub from '../assets/photos/services/svc-hero-hottub.jpg';
import heroConstruction from '../assets/photos/services/svc-hero-construction.jpg';
import heroYard from '../assets/photos/services/svc-hero-yard.jpg';
import heroMattress from '../assets/photos/services/svc-hero-mattress.jpg';
import heroShed from '../assets/photos/services/svc-hero-shed.jpg';
import heroHoarder from '../assets/photos/services/svc-hero-hoarder.jpg';
import heroOffice from '../assets/photos/services/svc-hero-office.jpg';
import heroForeclosure from '../assets/photos/services/svc-hero-foreclosure.jpg';
import heroSameDay from '../assets/photos/services/svc-hero-sameday.jpg';

/* Supporting frames — mostly approved assets from earlier phases, reused. */
import supSorting from '../assets/photos/equipment/equip-sorting.jpg';
import supFurniture from '../assets/photos/services/svc-furniture.jpg';
import supAppliance from '../assets/photos/services/svc-appliance.jpg';
import supGarage from '../assets/photos/services/svc-garage.jpg';
import supEstate from '../assets/photos/services/svc-estate.jpg';
import supHotTub from '../assets/photos/services/svc-hottub.jpg';
import supConstruction from '../assets/photos/services/svc-construction.jpg';
import supYard from '../assets/photos/services/svc-yard.jpg';
import supMattress from '../assets/photos/services/svc-mattress.jpg';
import supShed from '../assets/photos/services/svc-shed.jpg';
import supHoarder from '../assets/photos/services/svc-hoarder.jpg';
import supOffice from '../assets/photos/services/svc-office.jpg';
import supTurnover from '../assets/photos/services/svc-turnover.jpg';
import supLoad from '../assets/photos/loads/load-side.jpg';

/* Outcome frames — a cleared or finished state. */
import outGarage from '../assets/photos/before-after/ba-garage-after.jpg';
import outEstate from '../assets/photos/before-after/ba-estate-after.jpg';
import outYard from '../assets/photos/before-after/ba-yard-after.jpg';

export interface ServiceImage {
  src: ImageMetadata;
  /** Describes what is happening, never the company. */
  alt: string;
}

export interface ServiceImages {
  hero: ServiceImage;
  heroWide?: ServiceImage;
  support?: ServiceImage;
  outcome?: ServiceImage;
}

export const serviceImages: Record<string, ServiceImages> = {
  'junk-removal': {
    hero: {
      src: heroJunk,
      alt: 'A pickup and an open utility trailer part loaded with household items on a suburban driveway',
    },
    heroWide: {
      src: bgJunkRemoval,
      alt: 'A pickup and an open utility trailer beside a pile of household items on a suburban driveway',
    },
    support: {
      src: supSorting,
      alt: 'Household furniture and belongings staged on a driveway ready to be loaded',
    },
  },

  'furniture-removal': {
    hero: {
      src: heroFurniture,
      alt: 'A worn sofa and a chest of drawers carried out to a driveway outside an open garage',
    },
    heroWide: {
      src: bgFurnitureRemoval,
      alt: 'A worn sofa, a chest of drawers and a dining chair set out on a driveway outside an open garage',
    },
    support: {
      src: supFurniture,
      alt: 'A worn three-seat sofa and an armchair set out on a driveway ready to be loaded',
    },
  },

  'appliance-removal': {
    hero: {
      src: heroAppliance,
      alt: 'An old refrigerator and a dryer standing disconnected on a suburban driveway beside an appliance dolly',
    },
    heroWide: {
      src: bgApplianceRemoval,
      alt: 'An old refrigerator and a washer standing disconnected on a suburban driveway beside an appliance dolly',
    },
    support: {
      src: supAppliance,
      alt: 'A disconnected refrigerator and washer standing on a concrete driveway',
    },
  },

  'garage-cleanouts': {
    hero: {
      src: heroGarage,
      alt: 'A worker carrying a box out of an open suburban garage stacked with cardboard boxes and storage totes',
    },
    heroWide: {
      src: bgGarageCleanouts,
      alt: 'An open suburban garage packed with boxes, storage totes and a bicycle, with a clear concrete driveway in front of it',
    },
    support: {
      src: supGarage,
      alt: 'A packed two-car garage filled with storage totes, utility shelving, boxes and a bicycle',
    },
    outcome: {
      src: outGarage,
      alt: 'A two-car garage completely empty with a clean swept concrete floor',
    },
  },

  'estate-cleanouts': {
    hero: {
      src: heroEstate,
      alt: 'A living room part way through a full property cleanout, with packed boxes and furniture still in place',
    },
    heroWide: {
      src: bgEstateCleanouts,
      alt: 'A living room part way through a property cleanout, with packed boxes stacked along one wall and bare floor beside them',
    },
    support: {
      src: supEstate,
      alt: 'A room of mixed household contents, furniture and packed boxes mid-cleanout',
    },
    outcome: {
      src: outEstate,
      alt: 'The same room cleared and empty with bare floor',
    },
  },

  'hot-tub-removal': {
    hero: {
      src: heroHotTub,
      alt: 'An old hot tub on a back patio with its side panels removed, part way through being taken apart',
    },
    heroWide: {
      src: bgHotTubRemoval,
      alt: 'An old hot tub on a back patio with its side panels removed, part way through being taken apart',
    },
    support: {
      src: supHotTub,
      alt: 'A worn out hot tub on a residential patio ready for removal',
    },
  },

  'construction-debris-removal': {
    hero: {
      src: heroConstruction,
      alt: 'Broken drywall, offcut lumber and torn out flooring stacked on a driveway during a remodel',
    },
    heroWide: {
      src: bgConstructionDebrisRemoval,
      alt: 'Broken drywall, offcut lumber and torn out flooring sorted into piles on a driveway during a remodel',
    },
    support: {
      src: supConstruction,
      alt: 'Renovation debris including drywall, lumber and flooring piled for removal',
    },
  },

  'yard-waste-removal': {
    hero: {
      src: heroYard,
      alt: 'Cut palm fronds, branches and dried brush heaped on the gravel yard of a suburban home',
    },
    heroWide: {
      src: bgYardWasteRemoval,
      alt: 'Cut palm fronds, branches and dried brush heaped on the gravel yard of a suburban home',
    },
    support: {
      src: supYard,
      alt: 'Branches, palm fronds and green waste gathered beside a driveway',
    },
    outcome: {
      src: outYard,
      alt: 'The same yard cleared, with the gravel raked clean',
    },
  },

  'mattress-removal': {
    hero: {
      src: heroMattress,
      alt: 'A worn mattress and box spring standing upright against a garage wall on a driveway',
    },
    heroWide: {
      src: bgMattressRemoval,
      alt: 'A worn mattress and box spring standing upright against a garage wall on a driveway',
    },
    support: {
      src: supMattress,
      alt: 'A mattress and box spring laid out on a driveway ready for collection',
    },
  },

  'shed-removal': {
    hero: {
      src: heroShed,
      alt: 'A small backyard storage shed part way through being taken down, with wall panels unbolted and leaning beside it',
    },
    heroWide: {
      src: bgShedRemoval,
      alt: 'A small backyard storage shed part way through being taken down, with wall panels unbolted beside it',
    },
    support: {
      src: supShed,
      alt: 'An old backyard shed emptied and ready to be dismantled',
    },
  },

  'hoarder-cleanouts': {
    hero: {
      src: heroHoarder,
      alt: 'A cluttered domestic hallway with boxes and belongings stacked along the walls and a clear path opened down the middle',
    },
    heroWide: {
      src: bgHoarderCleanouts,
      alt: 'A cluttered living room with boxes and belongings stacked along one wall and a clear swept path beside them',
    },
    support: {
      src: supHoarder,
      alt: 'A room part way through a careful cleanout, belongings sorted into groups with bare floor showing',
    },
  },

  'office-cleanouts': {
    hero: {
      src: heroOffice,
      alt: 'A small office suite being cleared, with desks pulled out, chairs stacked and shelving emptied',
    },
    heroWide: {
      src: bgOfficeCleanouts,
      alt: 'A small office suite being cleared, with desks pulled out, chairs stacked and shelving emptied',
    },
    support: {
      src: supOffice,
      alt: 'Office desks, chairs and shelving gathered for removal',
    },
  },

  'foreclosure-cleanouts': {
    hero: {
      src: heroForeclosure,
      alt: 'A bright empty room in a vacant house with a leftover sofa, chair and boxes gathered ready to be carried out',
    },
    heroWide: {
      src: bgForeclosureCleanouts,
      alt: 'A bright empty room in a vacant house with a leftover sofa, chair and boxes gathered ready to be carried out',
    },
    support: {
      src: supTurnover,
      alt: 'A vacated rental property with leftover contents waiting to be cleared',
    },
  },

  'same-day-junk-removal': {
    hero: {
      src: heroSameDay,
      alt: 'A pickup and an open utility trailer loaded and ready to leave a suburban driveway',
    },
    heroWide: {
      src: bgSameDayJunkRemoval,
      alt: 'A pickup and an open utility trailer loaded and ready to leave a suburban driveway',
    },
    support: {
      src: supLoad,
      alt: 'An open utility trailer with mesh side rails loaded with boxes and household junk',
    },
  },
};

/** Images for a service, or undefined if none are registered yet. */
export const imagesForService = (slug: string): ServiceImages | undefined =>
  serviceImages[slug];
