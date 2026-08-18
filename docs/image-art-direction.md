# Image Art Direction

The generation brief for every photograph on the Load Logic site. Reusing this
brief across all generations is what makes the images read as one company
documenting its own work rather than a stock library.

Generation runs through the authenticated fal CLI. No API key and no SDK are
required.

---

## 1. The Constant Brief

Every prompt is assembled as:

```
[BASE STYLE] + [SCENE] + [SUBJECT ACTION] + [ENVIRONMENT] + [NEGATIVE]
```

**BASE STYLE** (verbatim in every prompt, never edited):

> documentary photograph, natural available light, shot on a 35mm lens at eye
> level, muted natural color, mild film grain, slightly imperfect candid framing,
> realistic working conditions, no text, no logos, no signage

**ENVIRONMENT** (verbatim wherever a location is visible):

> Arizona East Valley suburban setting, stucco house with tile roof, gravel
> xeriscape landscaping, desert shrubs, wide concrete driveway, overcast bright
> sky or early morning sun

**NEGATIVE** (verbatim in every prompt):

> no HDR, no oversaturation, no lens flare, no studio lighting, no posed smiling
> at camera, no floating objects, no impossible loads, no visible text, no logos,
> no watermarks, no distorted hands, no extra limbs

---

## 2. Continuity Locks

These details must be identical in every image so the site reads as one operation
rather than a stock library.

| Element | Locked description |
|---|---|
| Workers | Two working adults, dark green work polo shirts, jeans, work gloves, work boots. Mixed build and appearance. Always mid-task. **Faces turned away, obscured by the load, or cropped by the frame.** Never facing or acknowledging the camera. |
| Vehicle | **Pending confirmation of the real equipment.** See section 2.1. Whatever is confirmed becomes the single locked vehicle across every image. |
| Light | Overcast bright, or low early-morning sun. Never midday harsh, never golden-hour glamour. |
| Palette | Muted. Desert tan, concrete gray, dusty green. Nothing neon except the work gloves. |
| Camera | Eye level, 35mm. Occasionally 50mm for detail shots. Never drone, never worm's-eye, never wide-angle distortion. |
| Framing | Slightly loose and candid. Subject occasionally cropped by the frame edge. Never centered and symmetrical. |

### 2.1 Equipment must match the real operation

Generated equipment represents the actual type of vehicle and gear the business
runs. Inventing a fleet that does not exist is a fabricated business fact and
misleads a customer trying to judge whether their job fits.

The vehicle type must be confirmed before the image set is generated, because it
is the one detail visible in nearly every frame and it also determines the load
volumes in `pricing.ts`. Until confirmed, no vehicle-visible image is generated.

**Vehicles stay unbranded.** Generated text is unreliable and a fabricated decal
would invent a business fact. Real branded photography replaces these images as it
becomes available.

### 2.2 Generated people are never the team

Anonymous working figures only. No generated person is presented, captioned or
described as a Load Logic employee, owner or crew member anywhere on the site.

- No team, owner or staff-portrait imagery is generated at all.
- Alt text describes the work, never the company. "Two workers lifting a sofa into
  a trailer", never "the Load Logic crew".
- `src/assets/photos/team/` stays empty and is reserved for real photography.

---

## 3. Tone

Aim for:

- Real physical effort. Bent knees, braced arms, weight being carried.
- Ordinary properties. Lived-in garages, cluttered patios, normal suburban homes.
- Honest mess in the "before" state and genuine order in the "after".
- Quiet competence. Nobody performing enthusiasm.

Avoid:

- Luxury homes as the default setting. Most jobs are ordinary houses.
- Spotless uniforms and pristine equipment.
- Anyone looking at or gesturing toward the camera.
- Dramatic skies, sunset rim light, cinematic color grading.
- Empty "hero shot" compositions with a single item placed artfully.

---

## 4. Shot List

Approximately 32 unique images. Images are reused strategically across the 175
pages; only the pages where imagery changes the visitor's understanding get a
dedicated shot.

### Hero and chapter breaks (4)

| ID | Ratio | Scene |
|---|---|---|
| `hero-load` | 16:9 | Two crew lifting a sofa into the open trailer, driveway, mid-motion |
| `hero-mobile` | 4:5 | Tighter vertical crop of the same action for small screens |
| `chapter-garage` | 21:9 | Wide view of a half-cleared garage, boxes staged on the driveway |
| `chapter-street` | 21:9 | Truck and loaded trailer parked on a residential street, crew walking back |

### Load size scale (6)

The signature component. Same trailer, same driveway, same camera position, same
light. Only the fill level changes. Generated from a single locked seed with
image-to-image so the trailer and background stay identical.

`load-single-item` · `load-small` · `load-quarter` · `load-half` ·
`load-three-quarter` · `load-full` — all 1:1.

### Before and after (3 pairs, 6 images)

Identical camera position and light within each pair. Only the state changes.

| Pair | Scene |
|---|---|
| `ba-garage` | Packed two-car garage, then the same garage empty with a swept floor |
| `ba-estate` | Crowded bedroom of stored furniture and boxes, then the same room clear |
| `ba-yard` | Backyard pile of branches, pallets and an old grill, then clear gravel |

### Service imagery (10)

Mapped across all 14 services; related services share an image.

| ID | Ratio | Serves |
|---|---|---|
| `svc-furniture` | 4:3 | furniture-removal, mattress-removal |
| `svc-appliance` | 4:3 | appliance-removal |
| `svc-garage` | 4:3 | garage-cleanouts |
| `svc-estate` | 4:3 | estate-cleanouts, hoarder-cleanouts |
| `svc-hottub` | 4:3 | hot-tub-removal |
| `svc-construction` | 4:3 | construction-debris-removal |
| `svc-yard` | 4:3 | yard-waste-removal |
| `svc-shed` | 4:3 | shed-removal |
| `svc-office` | 4:3 | office-cleanouts, commercial-junk-removal |
| `svc-turnover` | 4:3 | foreclosure-cleanouts, same-day-junk-removal, junk-removal |

### Equipment and capability (3)

Generated only after the real vehicle type is confirmed (section 2.1).

`equip-vehicle` (21:9, the confirmed vehicle with its loading surface open) ·
`equip-tools` (3:2, straps, dollies, gloves staged on a tailgate) ·
`equip-sorting` (3:2, items separated into donation and disposal groups)

### Context (3)

Reused across all nine city pages. Cities are differentiated by structured local
data, not by pretending to have photographed each one.

`ctx-suburb` · `ctx-gated` · `ctx-apartment` — all 3:2.

---

## 5. Generation Workflow

```bash
# authenticated already; verify with:
~/.local/bin/fal auth whoami

# generate
~/.local/bin/fal api fal-ai/flux/dev \
  prompt="<BASE STYLE>, <SCENE>, <ENVIRONMENT>, <NEGATIVE>" \
  image_size=landscape_16_9 \
  num_images=1
```

**Notes**

- The CLI prints a Python dict, not JSON. Extract the URL with a regex, not `jq`.
- Download the returned URL, then store it as described below. The fal URL is
  temporary and must never be referenced from the site.
- Hero images may use a higher-tier model if `flux/dev` output is not strong
  enough at full-bleed scale. Evaluate before committing.

### 5.1 Paired shots: generate the EMPTY state first

Two independent text-to-image runs will never produce the same room twice, which
destroys the entire point of a before-and-after. Pairs are produced as a
derivation through `fal-ai/flux/dev/image-to-image`, passing the source frame's
returned URL as `image_url`.

**The derivation runs backwards.** Generate the EMPTY "after" frame first, then
derive the PACKED "before" frame from it.

This is counter-intuitive and it is the whole trick. Asking the model to ADD
contents to a room it can already see is reliable. Asking it to REMOVE them is
not: it preserves the architecture but repopulates the space with something else
every time. Emptying a packed garage produced a garage containing a car.

Tuning, established by iteration:

| `strength` | Result |
|---|---|
| `0.72` | Room preserved, but too little added. A thin, unconvincing "before". |
| **`0.82`** | **Correct.** Architecture, camera and light hold, contents fill convincingly. |
| `0.88` | Too loose. The model rebuilds the room into a different one. |

The same technique applies to the load-size scale, where the empty vehicle is the
base frame and each fill level is derived from it.

**Workflow limitation to know about:** a derived shot needs a live URL for its
source, so regenerating a derived frame re-rolls its source too. Iterating on
one half of a pair in isolation is not currently possible without uploading the
stored file first.

---

## 6. Storage and Delivery

```
src/assets/photos/home/          hero and chapter breaks
src/assets/photos/services/      per-service imagery
src/assets/photos/cities/        reusable context shots
src/assets/photos/before-after/  paired states
src/assets/photos/equipment/     trailer, tools, sorting
src/assets/photos/loads/         the load size scale
src/assets/photos/team/          crew candids
src/assets/brand/                wordmark, mark, favicon sources
```

- Everything lives in `src/assets/` and is delivered through `astro:assets`
  `<Image>`, which handles WebP/AVIF conversion, responsive `srcset` and
  intrinsic dimensions that prevent layout shift.
- Nothing photographic goes in `public/`. That directory is reserved for files
  needing a fixed public URL: favicon, `og-default.png`, `robots.txt`.
- Source files are stored as JPEG at the generated resolution. Do not commit
  multiple hand-made sizes; the build pipeline produces them.
- Filenames match the shot-list IDs above.

---

## 7. Review Gate

Before an image is committed, it must pass all of the following:

- [ ] Hands, arms and posture are anatomically correct
- [ ] The load is physically plausible and nothing floats
- [ ] No text, signage, watermark or logo is legible anywhere in the frame
- [ ] Nobody is looking at or posing for the camera, and no face is a focal point
- [ ] Worker wardrobe matches the continuity locks
- [ ] The vehicle matches the confirmed real equipment type
- [ ] Light and color match the rest of the set
- [ ] The image carries information the copy alone does not
- [ ] Real descriptive alt text has been written for it

Any image failing a check is regenerated, not accepted with an excuse.
