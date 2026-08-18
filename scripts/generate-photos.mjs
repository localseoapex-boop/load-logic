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
    scene:
      'a packed suburban two-car garage full of storage totes, old shelving, bicycles and boxes stacked to the ceiling, nobody in frame',
    env: false,
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
];

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
    : ['api', MODEL, `prompt=${buildPrompt(shot)}`, `image_size=${RATIO[shot.ratio]}`, 'num_images=1'];

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
