/**
 * generate-photos.mjs — generate the site photography set through fal.ai.
 *
 * Enforces the continuity brief in docs/image-art-direction.md by construction:
 * every prompt is assembled as BASE + SCENE + ENVIRONMENT + NEGATIVE from the
 * same constants, so no single shot can drift away from the set. Editing a shot
 * means editing its SCENE line only.
 *
 * Auth: the fal CLI's existing OAuth session. No FAL_KEY, no SDK, no dependency.
 *
 * Usage:
 *   node scripts/generate-photos.mjs                 all unblocked shots
 *   node scripts/generate-photos.mjs svc-garage      one or more shot ids
 *   node scripts/generate-photos.mjs --list          show the shot list and status
 *   node scripts/generate-photos.mjs --force         regenerate existing files
 *
 * Shots marked `needsVehicle` are SKIPPED until the real hauling equipment is
 * confirmed. The vehicle appears in nearly every frame, so generating those
 * before it is known would mean regenerating the whole set. See
 * docs/image-art-direction.md section 2.1.
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { homedir } from 'node:os';

const run = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FAL = join(homedir(), '.local/bin/fal');
const MODEL = 'fal-ai/flux/dev';
/**
 * Before-and-after pairs are generated as a derivation, not as two independent
 * prompts. Two text-to-image runs produce two different rooms, which destroys
 * the entire point of the comparison. The "after" frame is instead produced by
 * running image-to-image over the "before" frame, so the architecture, camera
 * position and light carry across and only the contents change.
 */
const MODEL_I2I = 'fal-ai/flux/dev/image-to-image';
const PHOTOS = resolve(root, 'src/assets/photos');

/* ─────────────────────── The constant brief ─────────────────────── */

const BASE =
  'documentary photograph, natural available light, shot on a 35mm lens at eye level, ' +
  'muted natural color, mild film grain, slightly imperfect candid framing, realistic working conditions';

const ENVIRONMENT =
  'Arizona East Valley suburban setting, stucco house with tile roof, gravel xeriscape landscaping, ' +
  'desert shrubs, wide concrete driveway, overcast bright sky';

const WORKERS =
  'two working adults in dark green work polo shirts, jeans, work gloves and work boots, ' +
  'mid-task, faces turned away from camera or obscured by the item they are carrying';

const NEGATIVE =
  'no HDR, no oversaturation, no lens flare, no studio lighting, no posed smiling at camera, ' +
  'no floating objects, no impossible loads, no visible text, no logos, no signage, no watermarks, ' +
  'no distorted hands, no extra limbs';

/**
 * Appended to shots that must contain no one. The model adds incidental people
 * unless told repeatedly, and an unbriefed figure in workwear reads as a claim
 * about who works here. Set `empty: true` on a shot to apply it.
 */
/**
 * The locked vehicle. Confirmed by the owner on 2026-08-18: a pickup towing an
 * open utility trailer of roughly 9 cubic yards. One tow vehicle, so a frame must
 * never show two trailers or two staged loads.
 */
const TRAILER =
  'a white pickup truck towing a large open utility trailer with mesh side rails, plain and unbranded with no lettering or decals';

/** The heavy-material trailer, for equipment shots only. */
const DUMP_TRAILER =
  'a black hydraulic dump trailer with solid high walls behind a white pickup truck, plain and unbranded with no lettering or decals';

/**
 * The load-size scale shows the TRAILER ONLY, with no tow vehicle.
 *
 * The first attempt included the pickup and failed: the truck dominated every
 * frame, the trailer was small and clipped, the fill level was unreadable, and
 * the model swapped in a different truck each time with visible brand badges. The
 * scale is a measuring instrument, so the thing being measured has to fill the
 * frame and nothing else may compete with it.
 */
const SCALE_TRAILER =
  'a single large open utility trailer with mesh side rails, unhitched and standing alone on a plain concrete driveway, ' +
  'photographed square on from the side with the full length of the trailer filling the frame, ' +
  'no truck and no tow vehicle anywhere in the picture, plain and unbranded with no lettering or decals, ' +
  'flat even overcast light, plain background';

const EMPTY =
  'completely unoccupied, not a single person anywhere in the frame, no people, no human figures, ' +
  'no silhouettes, empty of all people';

/** Aspect presets mapped to the model's image_size values. */
const RATIO = {
  '16:9': 'landscape_16_9',
  '4:3': 'landscape_4_3',
  '3:2': 'landscape_4_3',
  '21:9': 'landscape_16_9',
  '1:1': 'square_hd',
  '4:5': 'portrait_4_3',
  '3:4': 'portrait_4_3',
  '9:16': 'portrait_16_9',
};

/* ───────────────────────────── Shot list ───────────────────────────── */

const SHOTS = [
  /* Hero and chapter breaks */
  {
    id: 'hero-carry',
    dir: 'home',
    ratio: '16:9',
    scene: `${WORKERS}, carrying a large worn sofa out through an open garage door and down a driveway`,
    env: true,
  },
  {
    id: 'hero-mobile',
    dir: 'home',
    ratio: '4:5',
    scene:
      'extreme close up detail photograph of one gloved hand gripping the wooden frame rail under a worn fabric sofa being lifted, ' +
      'a dark green polo sleeve and forearm fill the upper frame, shallow depth of field, blurred concrete driveway behind, ' +
      'macro detail shot, no head, no face, no torso, no full body visible',
    env: false,
  },
  {
    id: 'chapter-garage',
    dir: 'home',
    ratio: '21:9',
    scene:
      'a half-cleared two-car garage with boxes, totes and old shelving staged out on the driveway, empty floor visible at the back',
    env: true,
    empty: true,
  },
  {
    id: 'hero-load-vehicle',
    dir: 'home',
    ratio: '16:9',
    scene: `${WORKERS}, lifting a worn sofa up over the side rail into ${TRAILER} parked on the driveway`,
    env: true,
  },
  {
    id: 'chapter-street',
    dir: 'home',
    ratio: '21:9',
    scene: `${TRAILER} parked at the kerb, the trailer piled with mixed household junk and furniture`,
    env: true,
    empty: true,
  },

  /* Service imagery */
  {
    id: 'svc-furniture',
    dir: 'services',
    ratio: '4:3',
    scene: `${WORKERS}, carrying a heavy upholstered sofa through a suburban living room doorway, floor protection down`,
    env: false,
  },
  {
    id: 'svc-appliance',
    dir: 'services',
    ratio: '4:3',
    scene: `${WORKERS}, moving an old white refrigerator on an appliance dolly out of a laundry room`,
    env: false,
  },
  {
    id: 'svc-garage',
    dir: 'services',
    ratio: '4:3',
    /*
     * env was false here, which is why the first version read Midwest: the
     * Arizona environment line was never applied and the model filled the walls
     * with timber. An Arizona garage is painted drywall or block over a bare
     * concrete slab, and the door opens onto gravel rather than lawn, so those
     * are now stated explicitly as well as inherited.
     */
    scene:
      'the interior of a packed suburban two-car garage in Arizona, photographed from just inside the open roll-up door, ' +
      'plain painted drywall walls and exposed ceiling framing, a bare grey concrete slab floor, no wood panelling anywhere, ' +
      'full of stacked plastic storage totes, metal utility shelving, cardboard boxes, a bicycle, a folded stepladder and ' +
      'general household overflow along both side walls, ' +
      'through the open door behind the camera position the light is flat and bright off a concrete driveway and gravel yard, ' +
      'muted desert palette of grey concrete, beige walls and dusty plastics, ' +
      'nobody in frame, ordinary weekday, nothing tidied for a photograph',
    env: true,
    empty: true,
  },
  {
    id: 'svc-estate',
    dir: 'services',
    ratio: '4:3',
    scene:
      'a bedroom in an older family home crowded with stacked cardboard boxes, an old wooden dresser and household belongings, sorted piles beginning to form',
    env: false,
    empty: true,
  },
  {
    id: 'svc-hottub',
    dir: 'services',
    ratio: '4:3',
    scene:
      'an old drained acrylic hot tub in a residential back yard, weathered cover leaning against a block wall, partially cut into sections',
    env: false,
  },
  {
    id: 'svc-construction',
    dir: 'services',
    ratio: '4:3',
    scene:
      'a pile of remodel debris in a stripped empty room, broken drywall sheets, cut lumber, old kitchen cabinets and torn up flooring',
    env: false,
    empty: true,
  },
  {
    id: 'svc-yard',
    dir: 'services',
    ratio: '4:3',
    scene:
      'a large pile of cut palm fronds, tree branches and brush stacked at the edge of a gravel front yard after a trim',
    env: true,
  },
  {
    id: 'svc-shed',
    dir: 'services',
    ratio: '4:3',
    scene:
      'an old weathered metal storage shed in a back yard with its doors open, packed with hand tools, planters, buckets and outdoor clutter',
    env: false,
    empty: true,
  },
  {
    id: 'svc-office',
    dir: 'services',
    ratio: '4:3',
    scene:
      'an emptied small office space with stacked desks, office chairs on their sides and disassembled cubicle panels leaning against a wall',
    env: false,
  },
  {
    id: 'svc-turnover',
    dir: 'services',
    ratio: '4:3',
    scene:
      'an empty rental apartment living room with abandoned belongings left behind, a stained mattress leaning by the door and bagged trash on the floor',
    env: false,
  },

  /* Before and after pairs.
     DERIVATION RUNS BACKWARDS ON PURPOSE. The empty "after" frame is generated
     first and the packed "before" frame is derived from it by image-to-image.
     Asking a generative model to ADD contents to a room it can see is reliable.
     Asking it to REMOVE them is not: it repopulates the space with something
     else every time. Generating the empty state first is what makes both frames
     genuinely the same room. */
  {
    id: 'ba-garage-after',
    dir: 'before-after',
    ratio: '3:2',
    scene:
      'an completely empty two-car suburban garage, clean swept bare concrete floor, plain bare drywall walls, ' +
      'nothing stored inside at all, viewed straight on from the open garage door',
    env: false,
    empty: true,
  },
  {
    id: 'ba-garage-before',
    dir: 'before-after',
    ratio: '3:2',
    derivedFrom: 'ba-garage-after',
    strength: 0.82,
    scene:
      'the same two-car suburban garage now packed full of stacked cardboard boxes, storage totes, an old bicycle, ' +
      'a broken dresser and household clutter covering the entire floor, identical garage, identical camera position and lighting',
    env: false,
    empty: true,
  },
  {
    id: 'ba-estate-after',
    dir: 'before-after',
    ratio: '3:2',
    scene:
      'a completely empty bedroom in an older home, bare clean carpet, blank painted walls, one window with no curtains, ' +
      'no furniture at all, viewed straight on from the doorway',
    env: false,
    empty: true,
  },
  {
    id: 'ba-estate-before',
    dir: 'before-after',
    ratio: '3:2',
    derivedFrom: 'ba-estate-after',
    strength: 0.82,
    scene:
      'the same bedroom now crowded with an old wooden dresser, stacked cardboard moving boxes and piled household belongings ' +
      'covering the floor, identical room, identical window, identical camera position and lighting',
    env: false,
    empty: true,
  },
  {
    id: 'ba-yard-after',
    dir: 'before-after',
    ratio: '3:2',
    scene:
      'a clear empty corner of a residential back yard, clean raked gravel ground, bare grey block wall, ' +
      'a few small desert plants, nothing on the ground',
    env: false,
    empty: true,
  },
  {
    id: 'ba-yard-before',
    dir: 'before-after',
    ratio: '3:2',
    derivedFrom: 'ba-yard-after',
    strength: 0.82,
    scene:
      'the same corner of the residential back yard now piled with cut tree branches, old wooden pallets and a rusted barbecue grill ' +
      'heaped on the gravel, identical block wall, identical camera position and lighting',
    env: false,
    empty: true,
  },

  /* Equipment and capability */
  {
    id: 'equip-tools',
    dir: 'equipment',
    ratio: '3:2',
    scene:
      'close overhead flat lay of moving equipment neatly arranged on a concrete driveway, a red two wheel hand truck lying flat, ' +
      'coiled orange ratchet straps, a folded moving blanket, a pair of worn leather work gloves and a push broom',
    env: false,
    empty: true,
  },
  {
    id: 'equip-sorting',
    dir: 'equipment',
    ratio: '3:2',
    scene:
      'household items separated into two distinct groups on a driveway, one group of clean usable furniture and working appliances, one group of broken damaged items, nobody in frame',
    env: true,
  },
  {
    id: 'equip-vehicle',
    dir: 'equipment',
    ratio: '21:9',
    scene: `${TRAILER}, empty, parked on a driveway with its rear gate lowered as a ramp`,
    env: true,
    empty: true,
  },
  {
    id: 'equip-dump-trailer',
    dir: 'equipment',
    ratio: '21:9',
    scene: `${DUMP_TRAILER}, empty, parked on a driveway, the heavy material option`,
    env: true,
    empty: true,
  },

  /* City context, reused across all nine location pages */
  {
    id: 'ctx-suburb',
    dir: 'cities',
    ratio: '3:2',
    scene:
      'a quiet suburban residential street of single story stucco homes with tile roofs and gravel front yards, no people, no vehicles in frame',
    env: true,
  },
  {
    id: 'ctx-gated',
    dir: 'cities',
    ratio: '3:2',
    scene:
      'the entrance to a gated residential community, a closed wrought iron gate, a stucco wall and desert landscaping, no people',
    env: true,
  },
  {
    id: 'ctx-apartment',
    dir: 'cities',
    ratio: '3:2',
    scene:
      'a two story apartment complex exterior with exterior stairwells and a marked loading area, desert landscaping, no people',
    env: true,
  },

  /* Load size scale.
     Every fill level is DERIVED from one empty trailer frame, so the trailer,
     the driveway, the camera position and the light are identical across the
     whole scale. That consistency is the entire point: the visitor is reading a
     measuring instrument, not looking at seven different trailers.
     See section 5.1 of docs/image-art-direction.md for why derivation runs from
     the empty state outwards. */
  {
    id: 'load-empty',
    dir: 'loads',
    ratio: '3:2',
    scene: `${SCALE_TRAILER}, the deck completely empty and bare`,
    env: false,
    empty: true,
  },
  /* In a derived frame the source image ALREADY supplies the trailer, so the
     prompt leads with the load and mentions the trailer only briefly. The first
     attempt re-described the trailer in full and the model dutifully rendered an
     empty trailer every time, ignoring the load entirely. Describe the change,
     not what is already there.

     Strength scales with how much of the frame has to change: a single sofa needs
     far fewer new pixels than a heaped full load. */
  ...[
    ['load-single-item', 'a single worn beige three-seat sofa sitting on the trailer deck', 0.84],
    ['load-small', 'a small pile of about ten cardboard boxes and a wooden chair stacked on the trailer deck', 0.86],
    [
      'load-quarter',
      'a pile of boxes, bin bags and a small dresser stacked on the trailer deck, reaching a quarter of the way up the mesh side rails',
      0.88,
    ],
    [
      'load-half',
      'a large pile of old furniture, mattresses, bin bags and boxes stacked on the trailer, reaching halfway up the mesh side rails',
      0.9,
    ],
    [
      'load-three-quarter',
      'a very large pile of old furniture, mattresses, bin bags and boxes stacked high on the trailer, reaching almost to the top of the mesh side rails',
      0.92,
    ],
    [
      'load-full',
      'an enormous heaped pile of old furniture, mattresses, bin bags, boxes and junk packed onto the trailer, ' +
        'overflowing above the top of the mesh side rails, the trailer completely full',
      0.94,
    ],
  ].map(([id, fill, strength]) => ({
    id,
    dir: 'loads',
    ratio: '3:2',
    derivedFrom: 'load-empty',
    strength,
    scene:
      `${fill}, on a large open utility trailer with mesh side rails standing on a concrete driveway, ` +
      'photographed square on from the side, no truck or tow vehicle in the picture, unbranded, flat overcast light',
    env: false,
    empty: true,
  })),

  /* ─── Homepage imagery pass ───
     Three genuine gaps. Everything else the homepage needs was already
     generated and vetted in phase 3 and is reused rather than regenerated. */
  {
    id: 'load-side',
    dir: 'loads',
    ratio: '16:9',
    scene:
      'an open utility trailer with mesh side rails hitched to a white pickup truck, loaded with mixed household junk, ' +
      'old furniture, cardboard boxes and a mattress stacked to the top of the rails, photographed square on from the side ' +
      'in a residential driveway',
    env: true,
    empty: true,
  },
  {
    id: 'quote-photo',
    dir: 'home',
    ratio: '16:9',
    scene:
      'over the shoulder view of one person holding up a smartphone to photograph a pile of old furniture, boxes and ' +
      'household clutter in an open garage, the phone seen from behind at an angle so no screen content is visible, ' +
      'only a hand and forearm in frame, no face',
    env: false,
  },
  {
    id: 'proof-loaded',
    dir: 'home',
    ratio: '16:9',
    scene: `${WORKERS}, lifting the rear gate closed on a fully loaded open utility trailer heaped with old furniture and boxes, work finished, empty swept driveway behind them`,
    env: true,
  },
];

/*
 * ─────────────────── 2026 homepage set ───────────────────
 *
 * HERO, ART DIRECTED IN TWO CROPS. One wide file letterboxed into a phone gives
 * a hero where the subject is a strip of driveway, so the desktop and mobile
 * heroes are generated as two compositions of ONE scene rather than two crops of
 * one file: the wide frame carries the environment, the tall frame moves in on
 * the staged load with the trailer behind it. Both keep the left third quiet,
 * because that is where the headline sits.
 *
 * BEFORE/AFTER runs the derivation in the documented direction: the clean frame
 * is generated first and the cluttered frame is derived from it, so the house,
 * the camera position and the light are the same picture in both states.
 */
/**
 * The first run of the 2026 heroes came back with an enclosed box truck and an
 * enclosed cargo trailer. "Open utility trailer with mesh side rails" was not
 * enough: the model reads "trailer at a house with furniture" as a moving
 * company and supplies the vehicle that scene usually contains. Load Logic tows
 * an OPEN trailer, so the openness has to be stated as the subject, repeated,
 * and defended in the negatives, or the image makes a false claim about the
 * equipment the business owns.
 */
const OPEN_TRAILER =
  'a white pickup truck towing a completely open flatbed utility trailer, the trailer has a flat deck with low mesh side rails ' +
  'about waist height and absolutely no roof and no walls, fully open to the sky so the furniture loaded on it is visible from above, ' +
  'plain and unbranded with no lettering or decals';

const NO_FACE =
  'no visible face, no facial features, no eyes, no portrait, nobody looking toward the camera, nobody facing the camera';

const NOT_A_BOX_TRUCK =
  'the trailer must not be enclosed, no box truck, no moving van, no cargo trailer, no enclosed trailer, ' +
  'no roof over the trailer, no solid trailer walls, no roll up door, no shipping container';

const HOMEPAGE_2026 = [
  {
    id: 'hero-drive-wide',
    dir: 'home',
    ratio: '16:9',
    scene:
      'a modest single storey suburban home on an ordinary residential street, a household cleanout in progress on the driveway: ' +
      'a worn three seat sofa, a chest of drawers, several stacked cardboard boxes and two storage totes set out in a loose group on the concrete, ' +
      OPEN_TRAILER +
      ' parked side on in the driveway with a partial load of furniture stacked on the open deck, ' +
      'the black mesh side rails of the trailer are clearly visible along its whole length, ' +
      NOT_A_BOX_TRUCK + ', ' + NO_FACE + ', ' +
      'one working adult in a dark green work polo, jeans and work gloves photographed strictly from behind, ' +
      'their back is fully to the camera and only the back of their head and shoulders is visible, walking away from the camera carrying a box, ' +
      'the face is completely hidden and no facial features are visible at all, ' +
      'the trailer and the load sit in the right two thirds of the frame, the left third is empty open driveway and gravel yard with nothing in it, ' +
      'ordinary weekday, nothing staged for a photograph',
    env: true,
  },
  {
    id: 'hero-drive-tall',
    dir: 'home',
    ratio: '3:4',
    scene:
      'vertical portrait photograph looking along a suburban driveway, ' +
      'in the foreground a household cleanout staged on the concrete: a worn three seat sofa, a chest of drawers, ' +
      'stacked cardboard boxes and two storage totes grouped together, ' +
      'behind them and further away ' +
      OPEN_TRAILER +
      ' parked side on to the camera so the flat open deck and its low mesh rails are seen from the side against the sky with furniture stacked on top, ' +
      NOT_A_BOX_TRUCK +
      ', the camera is outside on the driveway looking at the side of the trailer, never looking into the back of any vehicle, ' +
      'a stucco house with a tile roof behind, ' +
      'the staged furniture fills the lower half of the frame and the roofline and open sky fill the upper part, ' +
      'ordinary weekday, nothing staged for a photograph',
    env: true,
    empty: true,
  },

  {
    id: 'cleanout-after',
    dir: 'before-after',
    ratio: '3:2',
    scene:
      'a completely clear and empty suburban driveway in front of an open two car garage, ' +
      'the concrete swept clean with nothing on it at all, the garage interior visible and completely bare, ' +
      'bare painted drywall and a bare swept concrete garage floor with absolutely nothing in the garage, ' +
      'no shelving, no storage, no tools, no bicycles, no boxes, no furniture, no appliances, no vehicles, no trailer, ' +
      'an entirely emptied garage immediately after a professional cleanout, ' +
      'photographed square on from the street at eye level',
    env: true,
    empty: true,
  },
  {
    id: 'cleanout-before',
    dir: 'before-after',
    ratio: '3:2',
    derivedFrom: 'cleanout-after',
    strength: 0.82,
    scene:
      'the identical suburban driveway and open two car garage, same house, same camera position, same light, ' +
      'now completely full: the garage packed wall to wall and floor to ceiling with stacked cardboard boxes, storage totes, ' +
      'a broken dresser, an old bicycle, paint cans and bagged household clutter with no floor space visible, ' +
      'and more of the same overflowing out onto the driveway in front of it, a worn sofa and a stack of boxes standing on the concrete, ' +
      'years of accumulated household junk, identical house, identical camera position, identical light',
    env: true,
    empty: true,
  },
];

/* The 2026 set is appended rather than spread into the SHOTS literal above: it
   is declared after it, so referencing it inside the literal would hit the
   temporal dead zone at module evaluation. */
/*
 * ─────────────── Background hero pair ───────────────
 *
 * Composed for text ON the image, which the earlier hero pair was not. Those
 * were framed as pictures to sit ABOVE the copy, so the trailer landed dead
 * centre — exactly where a left-aligned headline goes. Overlaying type on them
 * would have meant a scrim heavy enough to destroy the photograph.
 *
 * So the subject is deliberately pushed out of the reading zone: right of frame
 * on the wide crop, upper half on the tall one, with plain driveway and wall
 * left behind it. Overcast light throughout, because hard Arizona sun puts blown
 * highlights right where white text has to stay legible.
 */
const HERO_BG = [
  {
    id: 'hero-bg-wide',
    dir: 'home',
    ratio: '16:9',
    scene:
      'wide photograph looking across a large empty concrete driveway apron, ' +
      'the foreground and the whole left side of the picture is nothing but bare empty concrete and gravel with absolutely nothing on it, ' +
      'far away in the RIGHT THIRD of the frame and small in the distance, ' +
      OPEN_TRAILER +
      ' parked side on, loaded with a worn sofa, a chest of drawers and stacked cardboard boxes, mesh side rails visible, ' +
      'a stucco house with a tile roof behind it on the right, ' +
      NOT_A_BOX_TRUCK + ', ' +
      'the truck and trailer must stay entirely within the right third of the picture and must not extend into the left half, ' +
      'flat even overcast light with no bright sky and no blown highlights, ' +
      'ordinary weekday, nothing staged for a photograph',
    env: true,
    empty: true,
  },
  {
    id: 'hero-bg-tall',
    dir: 'home',
    ratio: '3:4',
    scene:
      'vertical portrait photograph of a household cleanout on a suburban driveway, ' +
      'the subject sits in the UPPER HALF of the frame: ' +
      OPEN_TRAILER +
      ' parked side on with a worn sofa, a chest of drawers and stacked cardboard boxes loaded on the open deck, ' +
      'the black mesh side rails clearly visible, a stucco house with a tile roof behind it, ' +
      NOT_A_BOX_TRUCK + ', ' + NO_FACE + ', ' +
      'the ENTIRE LOWER HALF of the frame is plain empty swept concrete driveway running toward the camera, ' +
      'completely clear and uncluttered with nothing on it at all, ' +
      'flat even overcast light with no bright sky and no blown highlights, ' +
      'ordinary weekday, nothing staged for a photograph',
    env: true,
    empty: true,
  },
];

/*
 * ─────────────── Service page heroes ───────────────
 *
 * One per service page, framed for the split hero: the photograph fills a tall
 * column beside the type on desktop and becomes a band above it on a phone, so
 * it is shot at 4:3 — square enough to survive the column crop, wide enough to
 * survive the band crop. No text sits on it, so no reading zone is reserved.
 */
/*
 * ─────────────── Service page background heroes ───────────────
 *
 * The 4:3 service heroes were framed to sit BESIDE the copy in a split layout.
 * As a full-width background they lose about half their height to the crop and
 * the subject gets cut, so these are shot 16:9 specifically to be a background:
 * the subject sits centre-right and the left third is deliberately quiet, which
 * is where the headline, the intro and the buttons land.
 *
 * The 4:3 originals are kept and serve the mobile crop, where a tall container
 * suits them far better than a letterboxed 16:9 strip would.
 */
const HERO_BG_FRAMING =
  'composed as a wide background photograph: the subject sits in the centre and right of the frame, ' +
  'and the left third is deliberately quiet and uncluttered — open ground, plain wall or plain floor with nothing important in it, ' +
  'flat even overcast light with no blown highlights and no deep shadows';

/*
 * ─────────────── City page heroes ───────────────
 *
 * A city page is a local landing page, so its hero establishes the PLACE rather
 * than the job: an ordinary East Valley residential street, with the work
 * present but incidental. Deliberately no landmarks, no readable signage and
 * nothing that would imply an office in that city — Mesa is the home base, and
 * these frames are Arizona suburban context, not a claim about a specific town.
 *
 * Two crops, as on the service pages: 16:9 for the wide hero with the left third
 * kept quiet for the copy, 3:4 for the tall crop a phone gives it.
 */
const CITY_HEROES = [
  {
    id: 'city-bg-desertedge-wide',
    dir: 'cities',
    ratio: '16:9',
    /*
     * Second framing. The first put the staged items on the LEFT, which is the
     * one part of the frame this hero system reserves for the headline, and the
     * desert edge never appeared. Both are stated positionally now rather than
     * descriptively.
     */
    scene:
      'an Arizona stucco home standing at the outer edge of a suburban development, positioned in the RIGHT HALF of ' +
      'the picture, with open undeveloped desert scrub and low distant hills filling the background behind and to the ' +
      'right of it, ' +
      'low water landscaping of decorative gravel, creosote and a barrel cactus, a plain concrete driveway, ' +
      'a worn armchair, a small side table and two cardboard boxes set out for collection on the driveway close to the ' +
      'house on the RIGHT, ' +
      'the entire LEFT HALF of the picture is nothing but empty gravel ground and open desert with no objects in it at all, ' +
      'no signs, no plaques, no house numbers, no lettering, no landmarks, no recognisable mountain peaks, ' +
      'flat even overcast light with no blown highlights, nobody in frame, documentary and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'city-bg-desertedge-tall',
    dir: 'cities',
    ratio: '3:4',
    scene:
      'vertical portrait photograph of an Arizona stucco home on the outer edge of a suburban development where the ' +
      'street meets open desert, low water landscaping of decorative gravel, creosote and a barrel cactus, ' +
      'low desert hills visible beyond the house in the upper part of the frame, ' +
      'in the upper half a few household items set out on the driveway for collection: a worn armchair, a small table ' +
      'and two boxes, ' +
      'the lower half of the frame is plain empty driveway and gravel with nothing on it, ' +
      'absolutely no signs, no plaques, no house numbers, no lettering anywhere, no landmarks, no recognisable peaks, ' +
      'flat even overcast light with no blown highlights, nobody in frame, documentary and unstaged',
    env: true,
    empty: true,
  },

  {
    id: 'city-bg-driveway-wide',
    dir: 'cities',
    ratio: '16:9',
    scene:
      'an ordinary Arizona suburban home with a wide concrete driveway, stucco walls and a tile roof, ' +
      'gravel xeriscape front yard with desert shrubs, ' +
      'toward the right of frame a household pickup staged on the driveway: stacked cardboard boxes, ' +
      'two storage totes and a folded rug set out together ready for collection, ' +
      'the whole left third of the picture is open driveway and gravel with nothing in it, ' +
      'no readable signage of any kind, no street signs, no house numbers, no landmarks, ' +
      HERO_BG_FRAMING + ', nobody in frame, ordinary weekday, documentary and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'city-bg-driveway-tall',
    dir: 'cities',
    ratio: '3:4',
    scene:
      'vertical portrait photograph of an ordinary Arizona suburban home, stucco walls and a tile roof above, ' +
      'gravel xeriscape front yard, a wide concrete driveway, ' +
      'in the upper half a household pickup staged on the driveway: stacked cardboard boxes, two storage totes ' +
      'and a folded rug set out ready for collection, ' +
      'the lower half of the frame is plain empty driveway and sidewalk with nothing on it, ' +
      'no readable signage of any kind, no street signs, no house numbers, no landmarks, ' +
      'flat even overcast light with no blown highlights, nobody in frame, documentary and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'city-bg-xeriscape-wide',
    dir: 'cities',
    ratio: '16:9',
    scene:
      'a newer Arizona suburban property with clean pale stucco, a low tile roof and a crisp xeriscape front yard ' +
      'of raked decorative gravel, young agave and small ornamental boulders, a paver walkway, ' +
      'toward the right of frame an old sofa and a broken office chair set out at the edge of the driveway for collection, ' +
      'the whole left third of the picture is open gravel and paving with nothing in it, ' +
      'no readable signage of any kind, no street signs, no house numbers, no landmarks, ' +
      HERO_BG_FRAMING + ', nobody in frame, ordinary weekday, documentary and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'city-bg-xeriscape-tall',
    dir: 'cities',
    ratio: '3:4',
    scene:
      'vertical portrait photograph of a newer Arizona suburban property, clean pale stucco and a low tile roof above, ' +
      'a crisp xeriscape front yard of raked decorative gravel with young agave and ornamental boulders, ' +
      'in the upper half an old sofa and a broken office chair set out at the edge of the driveway for collection, ' +
      'the lower half of the frame is plain raked gravel and paving with nothing on it, ' +
      'no readable signage of any kind, no street signs, no house numbers, no landmarks, ' +
      'flat even overcast light with no blown highlights, nobody in frame, documentary and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'city-bg-mature-wide',
    dir: 'cities',
    ratio: '16:9',
    /*
     * Third framing. Version one put a small plaque beside the front door;
     * version two, prompted hard against signs, produced three of them — naming
     * a thing is a reliable way to summon it. So the fix is compositional rather
     * than negative: the entry is out of shot entirely, the garage door and the
     * yard carry the frame, and there is no doorway left for a plaque to sit
     * beside.
     */
    scene:
      'an older established Arizona residential property photographed square on to the closed garage door and the ' +
      'gravel front yard, the front entry completely out of shot, ' +
      'weathered stucco and a low pitched tile roof, mature landscaping with a large shade tree overhanging from the ' +
      'left and grown shrubs along the yard, ' +
      'toward the right of frame a chest of drawers, a bagged mattress and a few boxes set out on the driveway for collection, ' +
      'the whole left third of the picture is open driveway and shaded gravel with nothing in it, ' +
      'plain unbroken stucco wall surfaces, no doorway, no porch, no wall fittings of any kind, ' +
      HERO_BG_FRAMING + ', nobody in frame, ordinary weekday, documentary and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'city-bg-mature-tall',
    dir: 'cities',
    ratio: '3:4',
    scene:
      'vertical portrait photograph of an older established Arizona residential property, weathered stucco and a ' +
      'low tile roof, mature landscaping with a large shade tree and grown citrus above, ' +
      'in the upper half a chest of drawers, a bagged mattress and a few boxes set out on the driveway for collection, ' +
      'the lower half of the frame is plain empty driveway with nothing on it, ' +
      'no readable signage of any kind, no street signs, no house numbers, no landmarks, ' +
      'flat even overcast light with no blown highlights, nobody in frame, documentary and unstaged',
    env: true,
    empty: true,
  },

  {
    id: 'city-bg-eastvalley-wide',
    dir: 'cities',
    ratio: '16:9',
    scene:
      'a quiet ordinary residential street in an Arizona East Valley suburb, single storey stucco houses with ' +
      'tile roofs set back behind gravel xeriscape front yards, desert shrubs and a young palm, wide concrete ' +
      'driveways and a clean sidewalk, ' +
      'on one driveway toward the right of frame a small group of household items set out for collection: ' +
      'a worn armchair, a few stacked boxes and a rolled carpet, ' +
      'the whole left third of the picture is open street, sidewalk and gravel yard with nothing in it, ' +
      'no readable signage of any kind, no street signs, no house numbers, no landmarks, ' +
      HERO_BG_FRAMING + ', nobody in frame, ordinary weekday, documentary and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'city-bg-eastvalley-tall',
    dir: 'cities',
    ratio: '3:4',
    scene:
      'vertical portrait photograph of a quiet ordinary residential street in an Arizona East Valley suburb, ' +
      'a single storey stucco house with a tile roof behind a gravel xeriscape front yard, desert shrubs and a palm, ' +
      'a wide concrete driveway with a small group of household items set out for collection in the upper half: ' +
      'a worn armchair, a few stacked boxes and a rolled carpet, ' +
      'the lower half of the frame is plain empty driveway and sidewalk with nothing on it, ' +
      'no readable signage of any kind, no street signs, no house numbers, no landmarks, ' +
      'flat even overcast light with no blown highlights, nobody in frame, documentary and unstaged',
    env: true,
    empty: true,
  },
];

SHOTS.push(...CITY_HEROES);

const SERVICE_HERO_BG = [
  {
    id: 'svc-bg-junk-removal',
    dir: 'services',
    ratio: '16:9',
    scene:
      'a general junk removal pickup at an ordinary suburban home, a mixed pile of household items set out on the ' +
      'concrete driveway toward the right of frame: a broken office chair, bagged clutter, a small table and stacked boxes, ' +
      OPEN_TRAILER + ' backed in beside the pile with a partial load on the deck, ' + NOT_A_BOX_TRUCK + ', ' +
      HERO_BG_FRAMING + ', nobody in frame, ordinary weekday, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-bg-furniture-removal',
    dir: 'services',
    ratio: '16:9',
    scene:
      'a furniture removal outside an ordinary suburban home, a worn three seat sofa, a chest of drawers and a dining ' +
      'chair set out together on the concrete driveway toward the right of frame, the open garage behind them, ' +
      HERO_BG_FRAMING + ', nobody in frame, ordinary weekday, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-bg-appliance-removal',
    dir: 'services',
    ratio: '16:9',
    scene:
      'an appliance removal outside an ordinary suburban home, an old white refrigerator with its doors taped shut and ' +
      'a top loading washer standing together on the driveway toward the right of frame, an appliance dolly beside them, ' +
      HERO_BG_FRAMING + ', nobody in frame, ordinary weekday, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-bg-estate-cleanouts',
    dir: 'services',
    ratio: '16:9',
    scene:
      'a full property cleanout in an ordinary older home, a wide living room with packed cardboard boxes stacked along ' +
      'the right hand wall, an old armchair and a side table, framed pictures leaning against the skirting, ' +
      'bare floor across the left of the room, ' +
      HERO_BG_FRAMING + ', nobody in frame, respectful and matter of fact',
    env: false,
    empty: true,
  },
  {
    id: 'svc-bg-hot-tub-removal',
    dir: 'services',
    ratio: '16:9',
    scene:
      'an old worn out hot tub on the back patio of a suburban home toward the right of frame, side access panels ' +
      'removed and leaning against it, the shell empty and stained, a wide sweep of clean patio concrete across the left, ' +
      HERO_BG_FRAMING + ', nobody in frame, ordinary weekday, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-bg-construction-debris-removal',
    dir: 'services',
    ratio: '16:9',
    scene:
      'renovation debris stacked on a driveway outside a suburban home mid remodel, broken drywall sheets, offcut ' +
      'lumber, torn out laminate flooring and a bucket of tile fragments sorted into rough piles toward the right of frame, ' +
      HERO_BG_FRAMING + ', nobody in frame, ordinary weekday, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-bg-yard-waste-removal',
    dir: 'services',
    ratio: '16:9',
    scene:
      'a yard waste pile on the gravel yard of a suburban Arizona home toward the right of frame, cut palm fronds, ' +
      'trimmed branches and dried brush heaped beside the driveway, a wide clean concrete driveway across the left, ' +
      HERO_BG_FRAMING + ', nobody in frame, ordinary weekday, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-bg-mattress-removal',
    dir: 'services',
    ratio: '16:9',
    scene:
      'an old mattress and its box spring standing upright against the garage wall on a driveway toward the right of ' +
      'frame, a bed frame leaning beside them, a wide empty apron of clean concrete across the left, ' +
      HERO_BG_FRAMING + ', nobody in frame, ordinary weekday, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-bg-shed-removal',
    dir: 'services',
    ratio: '16:9',
    scene:
      'a small old backyard storage shed being taken down at a suburban home toward the right of frame, doors open and ' +
      'the contents cleared out, two wall panels unbolted and leaning on the gravel, open gravel yard across the left, ' +
      HERO_BG_FRAMING + ', nobody in frame, work part done, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-bg-hoarder-cleanouts',
    dir: 'services',
    ratio: '16:9',
    scene:
      'a heavily cluttered but ordinary domestic living room during a careful cleanout, stacked boxes, bags and ' +
      'belongings along the right hand wall, a clear swept walking path and bare floor across the left, ' +
      'clean and dry, not squalid, no rubbish on the floor, no pests, no damage, ' +
      HERO_BG_FRAMING + ', nobody in frame, respectful and matter of fact',
    env: false,
    empty: true,
  },
  {
    id: 'svc-bg-office-cleanouts',
    dir: 'services',
    ratio: '16:9',
    /*
     * The first version came back as a furnished office still in use, which
     * says "office" but not "cleanout". The clearance has to be legible: things
     * pulled apart, stacked and grouped, and floor showing where they used to be.
     */
    scene:
      'a small commercial office part way through being cleared out, ' +
      'desks unbolted and tipped on their sides, task chairs stacked in a group, cubicle partitions taken down and leaning flat against a wall, ' +
      'empty metal shelving pulled away from the wall and a few packed boxes, all grouped toward the right of frame, ' +
      'a wide area of bare carpet tile across the left where furniture has already been removed, ' +
      'suspended ceiling and window blinds, the room clearly being emptied rather than in use, ' +
      HERO_BG_FRAMING + ', nobody in frame, ordinary weekday, practical and unstaged',
    env: false,
    empty: true,
  },
  {
    id: 'svc-bg-foreclosure-cleanouts',
    dir: 'services',
    ratio: '16:9',
    scene:
      'a bright empty room in a vacant single family house being cleared, clean painted walls and a clean tiled floor, ' +
      'a leftover sofa, a dining chair and several boxes gathered toward the right of frame, ' +
      'the rest of the floor completely clear and swept, no litter, no stains, no damage, ' +
      HERO_BG_FRAMING + ', nobody in frame, matter of fact and unstaged',
    env: false,
    empty: true,
  },
  {
    id: 'svc-bg-same-day-junk-removal',
    dir: 'services',
    ratio: '16:9',
    scene:
      'a small household pickup staged and ready to go on a suburban driveway, a few bulky items set out beside ' +
      OPEN_TRAILER + ' which is already partly loaded, positioned toward the right of frame, ' + NOT_A_BOX_TRUCK + ', ' +
      'a wide clean driveway across the left, ' +
      HERO_BG_FRAMING + ', nobody in frame, ordinary weekday, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-bg-garage-cleanouts',
    dir: 'services',
    ratio: '16:9',
    scene:
      'a garage cleanout in progress at an ordinary suburban home, the sectional garage door rolled fully up, ' +
      'the garage still half full of stacked cardboard boxes, storage totes, an old dresser and a bicycle, ' +
      'a group of items already carried out and set down on the concrete driveway, ' +
      'a wide empty apron of clean concrete driveway across the left of the picture, ' +
      HERO_BG_FRAMING + ', nobody in frame, ordinary weekday, work half done',
    env: true,
    empty: true,
  },
];

const SERVICE_HEROES = [
  {
    id: 'svc-hero-junk',
    dir: 'services',
    ratio: '4:3',
    scene:
      'a general junk removal pickup at an ordinary suburban home, ' +
      'a mixed pile of household items set out on the concrete driveway: a broken office chair, bagged clutter, ' +
      'a small table, stacked cardboard boxes and a rolled carpet, ' +
      OPEN_TRAILER + ' backed in beside the pile with a partial load already on the deck, ' +
      NOT_A_BOX_TRUCK + ', nobody in frame, ' +
      'ordinary weekday, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-hero-hottub',
    dir: 'services',
    ratio: '4:3',
    scene:
      'an old worn out hot tub on a back patio of a suburban home, being taken apart for removal, ' +
      'the side access panels removed and leaning against it, the shell empty and stained, the cover folded on the ground, ' +
      'a reciprocating saw and a pry bar set on the concrete beside it, gravel and desert planting beyond the patio, ' +
      'nobody in frame, work part done, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-hero-construction',
    dir: 'services',
    ratio: '4:3',
    scene:
      'renovation debris stacked on a driveway outside a suburban home mid remodel, ' +
      'broken sheets of drywall, offcut lumber, torn out laminate flooring, a rolled up underlay and a bucket of tile fragments, ' +
      'the debris sorted into rough piles rather than scattered, the open garage behind, ' +
      'nobody in frame, ordinary weekday, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-hero-yard',
    dir: 'services',
    ratio: '4:3',
    scene:
      'a yard waste pile on the gravel front yard of a suburban Arizona home, ' +
      'cut palm fronds, trimmed branches, dried brush and bagged clippings heaped together beside the driveway, ' +
      'desert planting and a stucco wall behind, loppers resting on the pile, ' +
      'nobody in frame, ordinary weekday, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-hero-mattress',
    dir: 'services',
    ratio: '4:3',
    scene:
      'an old mattress and its box spring carried out of a house and standing upright against the garage wall on the driveway, ' +
      'the mattress visibly worn and sagging, a bed frame leaning beside it, ' +
      'nobody in frame, ordinary weekday, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-hero-shed',
    dir: 'services',
    ratio: '4:3',
    scene:
      'a small old backyard storage shed being taken down at a suburban home, ' +
      'the shed doors open and the contents already cleared out, two wall panels unbolted and leaning on the gravel beside it, ' +
      'a cordless drill and a stack of removed roof sheets on the ground, ' +
      'nobody in frame, work part done, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-hero-hoarder',
    dir: 'services',
    ratio: '4:3',
    scene:
      'a heavily cluttered but ordinary domestic hallway and living room during a careful cleanout, ' +
      'stacked boxes, bags and household belongings along the walls with a clear walking path opened down the middle, ' +
      'a few boxes already labelled and set aside for keeping, daylight from a window at the end, ' +
      'clean and dry, not squalid, no rubbish on the floor, no pests, no damage, ' +
      'respectful and matter of fact, nobody in frame',
    env: false,
    empty: true,
  },
  {
    id: 'svc-hero-office',
    dir: 'services',
    ratio: '4:3',
    scene:
      'a small commercial office suite being cleared out, ' +
      'office desks pulled away from the walls, stacked task chairs, a dismantled cubicle partition leaning flat, ' +
      'empty metal shelving and a few packed boxes on the carpet tiles, suspended ceiling and blinds, ' +
      'nobody in frame, ordinary weekday, practical and unstaged',
    env: false,
    empty: true,
  },
  {
    id: 'svc-hero-foreclosure',
    dir: 'services',
    ratio: '4:3',
    /*
     * The first version came back derelict — water-stained walls, litter across
     * the floor, gloomy light. That reads as blight rather than as a property
     * being cleared, and it was the only frame in the set that looked grim. A
     * vacant house waiting on a cleanout is usually just empty and bright.
     */
    scene:
      'a bright empty room in a vacant single family house being cleared of the contents left behind, ' +
      'clean painted walls and a clean tiled floor, plenty of daylight through large uncovered windows, ' +
      'a few leftover pieces gathered together near the doorway ready to be carried out: a sofa, a dining chair and several boxes, ' +
      'the rest of the floor completely clear and swept, no litter, no stains, no damage, no damp, ' +
      'matter of fact and unstaged, nobody in frame',
    env: false,
    empty: true,
  },
  {
    id: 'svc-hero-sameday',
    dir: 'services',
    ratio: '4:3',
    scene:
      'a small household pickup staged and ready to go on a suburban driveway, ' +
      'a few bulky items set out together beside ' + OPEN_TRAILER + ' that is already partly loaded, ' +
      NOT_A_BOX_TRUCK + ', ' +
      'the load neat and ready rather than mid chaos, nobody in frame, ' +
      'ordinary weekday, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-mattress',
    dir: 'services',
    ratio: '4:3',
    scene:
      'a worn mattress and box spring set out flat on a concrete driveway ready for collection, ' +
      'plastic mattress bags folded beside them, nobody in frame, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-hoarder',
    dir: 'services',
    ratio: '4:3',
    scene:
      'a domestic room part way through a careful cleanout, boxes and household belongings sorted into groups along one wall, ' +
      'a cleared area of bare floor in the foreground where items have already been removed, ' +
      'clean and dry, not squalid, respectful and matter of fact, nobody in frame',
    env: false,
    empty: true,
  },
  {
    id: 'svc-hero-furniture',
    dir: 'services',
    ratio: '4:3',
    scene:
      'a furniture removal in progress outside an ordinary suburban home, ' +
      'a worn three seat sofa and a wooden chest of drawers set down on the concrete driveway in the foreground, ' +
      'the front door of the house open behind them, ' +
      'one working adult in a dark green work polo, jeans and work gloves photographed strictly from behind with their back fully to the camera, ' +
      'carrying the end of a dining chair toward the driveway, ' +
      NO_FACE + ', ' +
      'ordinary weekday, work half done, nothing tidied for a photograph',
    env: true,
  },
  {
    id: 'svc-hero-appliance',
    dir: 'services',
    ratio: '4:3',
    scene:
      'an appliance removal outside an ordinary suburban home, ' +
      'an old white refrigerator with its doors taped shut and a top loading washing machine standing together on the concrete driveway, ' +
      'water and power lines already disconnected and coiled, the open garage behind them, ' +
      'a heavy duty appliance dolly leaning beside them, ' +
      'nobody in frame, ' +
      'ordinary weekday, practical and unstaged',
    env: true,
    empty: true,
  },
  {
    id: 'svc-hero-estate',
    dir: 'services',
    ratio: '4:3',
    scene:
      'a full property cleanout in progress inside an ordinary older home, ' +
      'a living room with mixed household contents part sorted: packed cardboard boxes stacked along one wall, ' +
      'an old armchair, a side table, framed pictures leaning against the skirting and bagged soft furnishings, ' +
      'daylight through a window with the curtains taken down, bare floor showing where furniture has already gone, ' +
      'nobody in frame, respectful and matter of fact, not squalid and not staged',
    env: false,
    empty: true,
  },
  {
    id: 'svc-garage-hero',
    dir: 'services',
    ratio: '4:3',
    scene:
      'a garage cleanout in progress at an ordinary suburban home, the sectional garage door rolled fully up, ' +
      'the garage behind still half full of stacked cardboard boxes, storage totes, an old dresser and a bicycle, ' +
      'a group of items already carried out and set down on the concrete driveway in the foreground, ' +
      'one working adult in a dark green work polo, jeans and work gloves photographed strictly from behind, ' +
      'their back fully to the camera, carrying a box out toward the driveway, ' +
      NO_FACE + ', ' +
      'ordinary weekday, work half done, nothing tidied for a photograph',
    env: true,
  },
];

SHOTS.push(...SERVICE_HERO_BG);
SHOTS.push(...SERVICE_HEROES);

SHOTS.push(...HERO_BG);

SHOTS.push(...HOMEPAGE_2026);

/* ───────────────────────────── Generation ───────────────────────────── */

const buildPrompt = (shot) =>
  [BASE, shot.scene, shot.env ? ENVIRONMENT : null, shot.empty ? EMPTY : null, NEGATIVE]
    .filter(Boolean)
    .join(', ');

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

async function generate(shot, force, urls) {
  const dir = join(PHOTOS, shot.dir);
  const out = join(dir, `${shot.id}.jpg`);

  if (!force && (await exists(out))) {
    console.log(`[skip]  ${shot.id} already exists`);
    return { id: shot.id, status: 'skipped' };
  }

  await mkdir(dir, { recursive: true });

  // A derived shot needs its source's remote URL, which only exists after the
  // source has been generated in this same run.
  const sourceUrl = shot.derivedFrom ? urls.get(shot.derivedFrom) : undefined;
  if (shot.derivedFrom && !sourceUrl) {
    console.error(`[fail]  ${shot.id}: source "${shot.derivedFrom}" was not generated in this run`);
    return { id: shot.id, status: 'failed' };
  }

  const args = sourceUrl
    ? [
        'api',
        MODEL_I2I,
        `image_url=${sourceUrl}`,
        `prompt=${buildPrompt(shot)}`,
        `strength=${shot.strength ?? 0.88}`,
        'num_images=1',
      ]
    : [
        'api',
        MODEL,
        `prompt=${buildPrompt(shot)}`,
        /* NOTE: the preset tops out at 1024px on the long edge. Passing explicit
           pixels as image_size.width / image_size.height was tried and is NOT
           accepted by the CLI — it silently fell back to a 1024x768 default and
           broke the aspect ratio of both hero frames. If a larger source is ever
           needed, the arg has to be passed as real nested JSON, not dotted keys. */
        `image_size=${RATIO[shot.ratio]}`,
        'num_images=1',
      ];

  const { stdout } = await run(FAL, args, { maxBuffer: 1024 * 1024 * 8 });

  // The CLI prints a Python dict repr, not JSON, so the URL is pulled with a
  // regex rather than parsed. Do not reach for JSON.parse here.
  const match = stdout.match(/https:\/\/[^\s'"]+\.(?:jpg|jpeg|png|webp)/i);
  if (!match) {
    console.error(`[fail]  ${shot.id}: no image URL in fal output`);
    return { id: shot.id, status: 'failed' };
  }

  const res = await fetch(match[0]);
  if (!res.ok) {
    console.error(`[fail]  ${shot.id}: download returned ${res.status}`);
    return { id: shot.id, status: 'failed' };
  }

  await writeFile(out, Buffer.from(await res.arrayBuffer()));
  urls.set(shot.id, match[0]);
  console.log(
    `[ok]    ${shot.id} -> src/assets/photos/${shot.dir}/${shot.id}.jpg${sourceUrl ? ' (derived)' : ''}`,
  );
  return { id: shot.id, status: 'generated' };
}

/* ─────────────────────────────── Entry ─────────────────────────────── */

const args = process.argv.slice(2);
const force = args.includes('--force');
const ids = args.filter((a) => !a.startsWith('--'));

if (args.includes('--list')) {
  for (const shot of SHOTS) {
    const path = join(PHOTOS, shot.dir, `${shot.id}.jpg`);
    const state = shot.needsVehicle
      ? 'BLOCKED (vehicle unconfirmed)'
      : (await exists(path))
        ? 'present'
        : 'missing';
    console.log(`${shot.id.padEnd(22)} ${shot.ratio.padEnd(6)} ${shot.dir.padEnd(14)} ${state}`);
  }
  process.exit(0);
}

// A derived shot cannot run without its source, so requesting the derived shot
// by id pulls the source in alongside it.
const requested = new Set(ids);
for (const shot of SHOTS) {
  if (requested.has(shot.id) && shot.derivedFrom) requested.add(shot.derivedFrom);
}

const queue = SHOTS.filter((s) => (ids.length > 0 ? requested.has(s.id) : true)).filter((s) => {
  if (s.needsVehicle && !ids.includes(s.id)) {
    console.log(`[block] ${s.id} needs the confirmed vehicle type. Skipping.`);
    return false;
  }
  return true;
});

console.log(`\nGenerating ${queue.length} shot(s) with ${MODEL}\n`);

const results = [];
// Remote URLs from this run, keyed by shot id, so derived shots can reference
// their source without uploading anything.
const urls = new Map();
for (const shot of queue) {
  try {
    // A source whose derived shot is also queued must be regenerated even if it
    // exists on disk, because the derivation needs a live URL.
    const neededAsSource = queue.some((q) => q.derivedFrom === shot.id);
    results.push(await generate(shot, force || neededAsSource, urls));
  } catch (err) {
    console.error(`[fail]  ${shot.id}: ${err.message}`);
    results.push({ id: shot.id, status: 'failed' });
  }
}

const count = (status) => results.filter((r) => r.status === status).length;
console.log(
  `\nDone. ${count('generated')} generated, ${count('skipped')} skipped, ${count('failed')} failed.`,
);
console.log('Every generated image must pass the review gate in docs/image-art-direction.md.\n');
