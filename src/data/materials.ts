/**
 * materials.ts — what the business takes, what it does not, and under what terms.
 *
 * This is the most heavily reused module in the graph. It answers the single
 * most common pre-quote question ("can you take this?") and it feeds the
 * what-we-remove index, the item lookup, the prohibited-items component, the
 * disposal flow, and the material coverage shown on every service page.
 *
 * The vocabulary is grounded in the business's own existing service copy
 * (src/data/service-content.ts `detailGroups`) and its own stated exclusions
 * (the shared FAQ and the per-service `specialNote` fields), so nothing here
 * invents a capability or a restriction the site was not already claiming.
 *
 * ─────────────────────── Relationship ownership ───────────────────────
 *
 * CATEGORY owns:
 *   category -> services   (which services routinely handle this material)
 *   category -> disposal   (typical routes, cross-checked against disposal.ts)
 *
 * ITEM owns:
 *   item -> category       (exactly one parent)
 *   item -> services       (OPTIONAL override when an item is handled by a
 *                           different set of services than its category)
 *
 * The inverses (materialsForService, categoriesForDisposalRoute, and so on) are
 * derived in src/lib/knowledge.ts. Never store them here.
 *
 * `aliases` exists so the item lookup matches what a homeowner actually types
 * ("couch", "fridge", "weight bench") rather than the catalogue term. It is also
 * the field that makes this data useful to AI systems answering natural-language
 * questions about coverage.
 */
import type { AcceptanceStatus } from './ontology';

export interface MaterialCategory {
  slug: string;
  name: string;
  /** One line for the what-we-remove index. */
  summary: string;
  /** Service slugs that routinely handle this category. CANONICAL. */
  services: string[];
  /** Disposal route slugs this category typically follows. CANONICAL. */
  disposal: string[];
  /** True when volume is not the limiting factor, weight is. Drives pricing copy. */
  weightDriven?: boolean;
  /** Display order in the index. */
  order: number;
}

export interface Material {
  slug: string;
  name: string;
  /** Parent category slug. */
  category: string;
  status: AcceptanceStatus;
  /** What a homeowner might actually call it. Powers search and AI matching. */
  aliases: string[];
  /** Required for `restricted` and `prohibited`. Explains the condition or reason. */
  note?: string;
  /** For prohibited items, where the customer should go instead. */
  alternative?: string;
  /** Needs two people, disassembly, or special handling. Affects the quote. */
  heavy?: boolean;
  /** Overrides the category's service list when this item is handled differently. */
  services?: string[];
}

/* ───────────────────────────── Categories ───────────────────────────── */

export const materialCategories: MaterialCategory[] = [
  {
    slug: 'furniture',
    name: 'Furniture',
    summary: 'Sofas, tables, dressers, and anything too big to move without help.',
    services: ['furniture-removal', 'junk-removal', 'estate-cleanouts', 'foreclosure-cleanouts', 'same-day-junk-removal'],
    disposal: ['donation', 'transfer-station', 'landfill'],
    order: 1,
  },
  {
    slug: 'mattresses-bedding',
    name: 'Mattresses and bedding',
    summary: 'Mattresses, box springs, and bed frames that regular trash service will not take.',
    services: ['mattress-removal', 'furniture-removal', 'junk-removal', 'estate-cleanouts'],
    disposal: ['transfer-station', 'landfill'],
    order: 2,
  },
  {
    slug: 'appliances',
    name: 'Appliances',
    summary: 'Kitchen and laundry appliances, once they are disconnected.',
    services: ['appliance-removal', 'junk-removal', 'garage-cleanouts', 'estate-cleanouts'],
    disposal: ['donation', 'recycling', 'transfer-station'],
    order: 3,
  },
  {
    slug: 'electronics',
    name: 'Electronics',
    summary: 'Televisions, computers, and office equipment that needs its own disposal path.',
    services: ['junk-removal', 'office-cleanouts', 'garage-cleanouts', 'estate-cleanouts'],
    disposal: ['donation', 'e-waste'],
    order: 4,
  },
  {
    slug: 'household-goods',
    name: 'Household goods',
    summary: 'Boxes, bagged clutter, decor, and the general contents of a room.',
    services: ['junk-removal', 'estate-cleanouts', 'hoarder-cleanouts', 'foreclosure-cleanouts'],
    disposal: ['donation', 'transfer-station', 'landfill'],
    order: 5,
  },
  {
    slug: 'garage-storage',
    name: 'Garage and storage',
    summary: 'Shelving, totes, tools, sports gear, and years of accumulated overflow.',
    services: ['garage-cleanouts', 'shed-removal', 'junk-removal', 'estate-cleanouts'],
    disposal: ['donation', 'recycling', 'transfer-station'],
    order: 6,
  },
  {
    slug: 'yard-green-waste',
    name: 'Yard and green waste',
    summary: 'Branches, brush, palm fronds, and landscaping debris.',
    services: ['yard-waste-removal', 'junk-removal', 'shed-removal'],
    disposal: ['green-waste', 'transfer-station'],
    order: 7,
  },
  {
    slug: 'construction-debris',
    name: 'Construction debris',
    summary: 'Drywall, lumber, flooring, and fixtures from a remodel or repair.',
    services: ['construction-debris-removal', 'junk-removal'],
    disposal: ['recycling', 'transfer-station', 'heavy-material'],
    order: 8,
  },
  {
    slug: 'outdoor-structures',
    name: 'Outdoor structures',
    summary: 'Hot tubs, sheds, and play structures that need teardown before hauling.',
    services: ['hot-tub-removal', 'shed-removal', 'construction-debris-removal'],
    disposal: ['recycling', 'transfer-station', 'heavy-material'],
    order: 9,
  },
  {
    slug: 'office-commercial',
    name: 'Office and commercial',
    summary: 'Desks, cubicles, fixtures, and the contents of a business space.',
    services: ['office-cleanouts', 'junk-removal', 'foreclosure-cleanouts'],
    disposal: ['donation', 'recycling', 'e-waste', 'transfer-station'],
    order: 10,
  },
  {
    slug: 'heavy-materials',
    name: 'Heavy materials',
    summary: 'Dense debris priced by weight rather than by the space it takes up.',
    services: ['construction-debris-removal', 'yard-waste-removal', 'junk-removal'],
    disposal: ['heavy-material', 'specialty'],
    weightDriven: true,
    order: 11,
  },
  {
    slug: 'prohibited',
    name: 'What we cannot take',
    summary: 'Material that needs a licensed handler rather than a junk removal truck.',
    services: [],
    disposal: ['specialty'],
    order: 12,
  },
];

/* ─────────────────────────────── Items ─────────────────────────────── */

export const materials: Material[] = [
  /* Furniture */
  { slug: 'sofa', name: 'Sofa', category: 'furniture', status: 'accepted', aliases: ['couch', 'settee', 'loveseat', 'davenport'], heavy: true },
  { slug: 'sectional', name: 'Sectional', category: 'furniture', status: 'accepted', aliases: ['corner sofa', 'l shaped couch', 'modular sofa'], heavy: true },
  { slug: 'recliner', name: 'Recliner', category: 'furniture', status: 'accepted', aliases: ['armchair', 'lazy boy', 'lounge chair'], heavy: true },
  { slug: 'dresser', name: 'Dresser', category: 'furniture', status: 'accepted', aliases: ['chest of drawers', 'bureau'], heavy: true },
  { slug: 'wardrobe', name: 'Wardrobe', category: 'furniture', status: 'accepted', aliases: ['armoire', 'closet cabinet'], heavy: true },
  { slug: 'dining-table', name: 'Dining table', category: 'furniture', status: 'accepted', aliases: ['kitchen table', 'dining set'] },
  { slug: 'coffee-table', name: 'Coffee table', category: 'furniture', status: 'accepted', aliases: ['side table', 'end table'] },
  { slug: 'desk', name: 'Desk', category: 'furniture', status: 'accepted', aliases: ['office desk', 'writing desk', 'computer desk'] },
  { slug: 'bookshelf', name: 'Bookshelf', category: 'furniture', status: 'accepted', aliases: ['bookcase', 'shelving unit'] },
  { slug: 'entertainment-center', name: 'Entertainment center', category: 'furniture', status: 'accepted', aliases: ['tv stand', 'media console', 'tv cabinet'], heavy: true },
  { slug: 'patio-furniture', name: 'Patio furniture', category: 'furniture', status: 'accepted', aliases: ['outdoor furniture', 'patio set', 'lawn chairs'] },
  { slug: 'office-chair', name: 'Office chair', category: 'furniture', status: 'accepted', aliases: ['desk chair', 'rolling chair'] },
  { slug: 'piano', name: 'Piano', category: 'furniture', status: 'restricted', aliases: ['upright piano', 'organ', 'grand piano'], heavy: true, note: 'Pianos and organs are extremely heavy and awkward. Send photos and note any stairs so we can plan crew size before quoting.' },
  { slug: 'safe', name: 'Safe', category: 'furniture', status: 'restricted', aliases: ['gun safe', 'floor safe', 'strongbox'], heavy: true, note: 'Weight varies enormously. We need the dimensions, whether it is bolted down, and the path to the truck before we can quote it.' },

  /* Mattresses and bedding */
  { slug: 'mattress', name: 'Mattress', category: 'mattresses-bedding', status: 'accepted', aliases: ['bed', 'king mattress', 'queen mattress', 'twin mattress'] },
  { slug: 'box-spring', name: 'Box spring', category: 'mattresses-bedding', status: 'accepted', aliases: ['foundation', 'bed base'] },
  { slug: 'bed-frame', name: 'Bed frame', category: 'mattresses-bedding', status: 'accepted', aliases: ['bedframe', 'platform bed', 'metal frame'] },
  { slug: 'headboard', name: 'Headboard', category: 'mattresses-bedding', status: 'accepted', aliases: ['footboard', 'bed head'] },
  { slug: 'crib', name: 'Crib', category: 'mattresses-bedding', status: 'accepted', aliases: ['cot', 'toddler bed', 'bassinet'] },

  /* Appliances */
  { slug: 'refrigerator', name: 'Refrigerator', category: 'appliances', status: 'restricted', aliases: ['fridge', 'freezer', 'icebox', 'garage fridge'], heavy: true, note: 'Taken once disconnected. Units containing refrigerant need handling that keeps them out of a general load, so tell us it is coming.' },
  { slug: 'washer', name: 'Washing machine', category: 'appliances', status: 'restricted', aliases: ['washer', 'laundry machine'], heavy: true, note: 'Must be disconnected from water and drain lines before we arrive. We do not disconnect plumbing.' },
  { slug: 'dryer', name: 'Dryer', category: 'appliances', status: 'restricted', aliases: ['clothes dryer', 'tumble dryer'], heavy: true, note: 'Must be disconnected. Gas dryers need the gas line shut off and disconnected by a qualified person first.' },
  { slug: 'dishwasher', name: 'Dishwasher', category: 'appliances', status: 'restricted', aliases: ['dish washer'], note: 'Must be disconnected from water, drain, and power before pickup.' },
  { slug: 'oven', name: 'Oven or range', category: 'appliances', status: 'restricted', aliases: ['stove', 'range', 'cooktop', 'wall oven'], heavy: true, note: 'Gas units need the gas line safely disconnected before we arrive.' },
  { slug: 'water-heater', name: 'Water heater', category: 'appliances', status: 'restricted', aliases: ['hot water tank', 'boiler'], heavy: true, note: 'Must be drained and disconnected from water, power, or gas before pickup.' },
  { slug: 'microwave', name: 'Microwave', category: 'appliances', status: 'accepted', aliases: ['microwave oven'] },
  { slug: 'small-appliance', name: 'Small appliances', category: 'appliances', status: 'accepted', aliases: ['toaster', 'blender', 'coffee maker', 'kettle', 'air fryer'] },
  { slug: 'air-conditioner', name: 'Air conditioner', category: 'appliances', status: 'restricted', aliases: ['ac unit', 'window unit', 'swamp cooler', 'hvac'], heavy: true, note: 'Units containing refrigerant are separated from the general load. Let us know before the pickup.' },

  /* Electronics */
  { slug: 'television', name: 'Television', category: 'electronics', status: 'accepted', aliases: ['tv', 'flat screen', 'crt', 'plasma'] },
  { slug: 'computer', name: 'Computer', category: 'electronics', status: 'accepted', aliases: ['pc', 'desktop', 'laptop', 'tower', 'mac'] },
  { slug: 'monitor', name: 'Monitor', category: 'electronics', status: 'accepted', aliases: ['screen', 'display'] },
  { slug: 'printer', name: 'Printer', category: 'electronics', status: 'accepted', aliases: ['copier', 'scanner', 'fax machine', 'all in one'] },
  { slug: 'stereo', name: 'Stereo equipment', category: 'electronics', status: 'accepted', aliases: ['speakers', 'receiver', 'hi fi', 'sound system', 'subwoofer'] },
  { slug: 'small-electronics', name: 'Small electronics', category: 'electronics', status: 'accepted', aliases: ['cables', 'router', 'dvd player', 'game console', 'phone', 'tablet'] },

  /* Household goods */
  { slug: 'boxes', name: 'Boxes and totes', category: 'household-goods', status: 'accepted', aliases: ['cardboard', 'moving boxes', 'storage bins', 'plastic totes'] },
  { slug: 'bagged-clutter', name: 'Bagged clutter', category: 'household-goods', status: 'accepted', aliases: ['trash bags', 'garbage bags', 'bagged junk', 'household trash'] },
  { slug: 'clothing', name: 'Clothing and textiles', category: 'household-goods', status: 'accepted', aliases: ['clothes', 'linens', 'curtains', 'bedding', 'towels'] },
  { slug: 'toys', name: 'Toys', category: 'household-goods', status: 'accepted', aliases: ['kids toys', 'playhouse', 'stuffed animals', 'board games'] },
  { slug: 'decor', name: 'Decor', category: 'household-goods', status: 'accepted', aliases: ['pictures', 'mirrors', 'lamps', 'vases', 'wall art', 'artificial plants'] },
  { slug: 'kitchenware', name: 'Kitchenware', category: 'household-goods', status: 'accepted', aliases: ['dishes', 'pots and pans', 'glassware', 'cutlery', 'small kitchen items'] },
  { slug: 'books', name: 'Books and paper', category: 'household-goods', status: 'accepted', aliases: ['magazines', 'newspapers', 'documents', 'files'] },
  { slug: 'carpet-rug', name: 'Carpet and rugs', category: 'household-goods', status: 'accepted', aliases: ['area rug', 'carpet roll', 'padding', 'flooring'], heavy: true },

  /* Garage and storage */
  { slug: 'shelving', name: 'Shelving', category: 'garage-storage', status: 'accepted', aliases: ['garage shelves', 'racking', 'wire shelving', 'storage rack'] },
  { slug: 'workbench', name: 'Workbench', category: 'garage-storage', status: 'accepted', aliases: ['work table', 'tool bench'], heavy: true },
  { slug: 'hand-tools', name: 'Tools', category: 'garage-storage', status: 'accepted', aliases: ['hand tools', 'power tools', 'toolbox', 'drill', 'saw'] },
  { slug: 'exercise-equipment', name: 'Exercise equipment', category: 'garage-storage', status: 'accepted', aliases: ['treadmill', 'weight bench', 'elliptical', 'home gym', 'weights', 'peloton'], heavy: true },
  { slug: 'sports-gear', name: 'Sports gear', category: 'garage-storage', status: 'accepted', aliases: ['bikes', 'golf clubs', 'skis', 'basketball hoop', 'kayak'] },
  { slug: 'ladder', name: 'Ladders', category: 'garage-storage', status: 'accepted', aliases: ['step ladder', 'extension ladder'] },
  { slug: 'garden-supplies', name: 'Garden supplies', category: 'garage-storage', status: 'accepted', aliases: ['planters', 'pots', 'hoses', 'garden tools', 'wheelbarrow'] },
  { slug: 'lawn-mower', name: 'Lawn mower', category: 'garage-storage', status: 'restricted', aliases: ['mower', 'edger', 'trimmer', 'leaf blower', 'generator'], note: 'Gas-powered equipment must have the fuel tank and oil drained before we can take it.' },
  { slug: 'bbq-grill', name: 'BBQ grill', category: 'garage-storage', status: 'restricted', aliases: ['barbecue', 'smoker', 'gas grill', 'weber'], note: 'Propane tanks are not accepted and must be removed. The grill itself is fine.' },
  { slug: 'patio-heater', name: 'Patio heater', category: 'garage-storage', status: 'restricted', aliases: ['fire pit', 'outdoor heater', 'chiminea'], note: 'Propane tanks must be removed first.' },

  /* Yard and green waste */
  { slug: 'branches', name: 'Branches and limbs', category: 'yard-green-waste', status: 'accepted', aliases: ['tree branches', 'brush', 'trimmings', 'wood limbs'] },
  { slug: 'palm-fronds', name: 'Palm fronds', category: 'yard-green-waste', status: 'accepted', aliases: ['palm leaves', 'fronds', 'palm trimmings'] },
  { slug: 'leaves-clippings', name: 'Leaves and clippings', category: 'yard-green-waste', status: 'accepted', aliases: ['grass clippings', 'yard waste', 'garden waste', 'weeds'] },
  { slug: 'sod-plants', name: 'Sod and removed plants', category: 'yard-green-waste', status: 'accepted', aliases: ['turf', 'grass', 'shrubs', 'bushes', 'cactus'] },
  { slug: 'tree-stump', name: 'Tree stumps', category: 'yard-green-waste', status: 'restricted', aliases: ['stump', 'root ball', 'tree trunk'], heavy: true, note: 'Small stumps that are already cut and out of the ground are fine. We do not perform stump grinding or excavation.' },
  { slug: 'fencing', name: 'Fencing', category: 'yard-green-waste', status: 'accepted', aliases: ['fence panels', 'wood fence', 'chain link', 'gate'], heavy: true },

  /* Construction debris */
  { slug: 'drywall', name: 'Drywall', category: 'construction-debris', status: 'accepted', aliases: ['sheetrock', 'plasterboard', 'gypsum'], heavy: true },
  { slug: 'lumber', name: 'Lumber and trim', category: 'construction-debris', status: 'accepted', aliases: ['wood', 'framing', 'baseboards', 'moulding', 'plywood', 'pallets'] },
  { slug: 'flooring', name: 'Flooring', category: 'construction-debris', status: 'accepted', aliases: ['laminate', 'vinyl plank', 'hardwood', 'subfloor'], heavy: true },
  { slug: 'cabinets', name: 'Cabinets', category: 'construction-debris', status: 'accepted', aliases: ['kitchen cabinets', 'vanity', 'cupboards'], heavy: true },
  { slug: 'fixtures', name: 'Fixtures', category: 'construction-debris', status: 'accepted', aliases: ['sink', 'toilet', 'bathtub', 'faucet', 'light fixture', 'shower'], heavy: true },
  { slug: 'doors-windows', name: 'Doors and windows', category: 'construction-debris', status: 'accepted', aliases: ['old door', 'window frame', 'screen door', 'glass door'], heavy: true },
  { slug: 'construction-trash', name: 'Bagged construction trash', category: 'construction-debris', status: 'accepted', aliases: ['jobsite trash', 'packaging', 'scrap', 'renovation waste'] },
  { slug: 'insulation', name: 'Insulation', category: 'construction-debris', status: 'restricted', aliases: ['fiberglass', 'batt insulation', 'blown insulation'], note: 'Modern insulation is fine when bagged. Anything from a pre-1980s building that could contain asbestos needs testing and a licensed abatement contractor first.' },

  /* Outdoor structures */
  { slug: 'hot-tub', name: 'Hot tub', category: 'outdoor-structures', status: 'restricted', aliases: ['spa', 'jacuzzi', 'whirlpool', 'swim spa'], heavy: true, note: 'Must be drained and electrically disconnected before we arrive. We cut it down on site, so we need gate width and the path to the truck in advance.' },
  { slug: 'shed', name: 'Shed', category: 'outdoor-structures', status: 'restricted', aliases: ['storage shed', 'tuff shed', 'garden shed', 'outbuilding'], heavy: true, note: 'We tear down and haul wood and metal sheds. Concrete slabs and anything requiring a permit are outside what we do.' },
  { slug: 'playset', name: 'Play structure', category: 'outdoor-structures', status: 'restricted', aliases: ['swing set', 'playground', 'jungle gym', 'trampoline', 'playhouse'], heavy: true, note: 'Disassembly is included. Anything set in concrete footings needs to be discussed before we quote it.' },
  { slug: 'above-ground-pool', name: 'Above-ground pool', category: 'outdoor-structures', status: 'restricted', aliases: ['pool', 'swimming pool', 'kiddie pool'], heavy: true, note: 'Must be fully drained first. In-ground pool demolition is not something we do.' },
  { slug: 'pergola', name: 'Pergola or gazebo', category: 'outdoor-structures', status: 'restricted', aliases: ['gazebo', 'awning', 'patio cover', 'ramada'], heavy: true, note: 'Freestanding structures are fine. Anything attached to the house needs to be assessed first.' },

  /* Office and commercial */
  { slug: 'cubicles', name: 'Cubicles', category: 'office-commercial', status: 'accepted', aliases: ['office partitions', 'workstations', 'dividers'], heavy: true },
  { slug: 'file-cabinet', name: 'File cabinets', category: 'office-commercial', status: 'accepted', aliases: ['filing cabinet', 'lateral file', 'storage cabinet'], heavy: true },
  { slug: 'retail-fixtures', name: 'Retail fixtures', category: 'office-commercial', status: 'accepted', aliases: ['displays', 'racks', 'shelving units', 'mannequins', 'counters'] },
  { slug: 'commercial-appliance', name: 'Breakroom appliances', category: 'office-commercial', status: 'accepted', aliases: ['office fridge', 'vending machine', 'water cooler', 'commercial microwave'], heavy: true },

  /* Heavy materials */
  { slug: 'concrete', name: 'Concrete', category: 'heavy-materials', status: 'restricted', aliases: ['cement', 'slab', 'concrete chunks', 'pavers'], heavy: true, note: 'Priced by weight rather than volume, and limited by what the equipment can safely carry. Send photos so we can quote it properly.' },
  { slug: 'brick-block', name: 'Brick and block', category: 'heavy-materials', status: 'restricted', aliases: ['bricks', 'cinder block', 'masonry', 'retaining wall'], heavy: true, note: 'Priced by weight. Let us know roughly how many so we can plan the load.' },
  { slug: 'tile-stone', name: 'Tile and stone', category: 'heavy-materials', status: 'restricted', aliases: ['ceramic tile', 'granite', 'countertop', 'flagstone', 'slate'], heavy: true, note: 'Priced by weight. Countertops need two people and advance notice.' },
  { slug: 'dirt-rock', name: 'Dirt, rock, and gravel', category: 'heavy-materials', status: 'restricted', aliases: ['soil', 'landscape rock', 'gravel', 'sand', 'decomposed granite'], heavy: true, note: 'Accepted in limited quantities only, priced by weight, and it has to be separated from other debris.' },
  { slug: 'roofing', name: 'Roofing material', category: 'heavy-materials', status: 'restricted', aliases: ['shingles', 'roof tiles', 'tar paper'], heavy: true, note: 'Very heavy for its volume. Tear-off quantities need to be quoted from photos.' },

  /* Prohibited */
  { slug: 'hazardous-waste', name: 'Hazardous waste', category: 'prohibited', status: 'prohibited', aliases: ['hazmat', 'toxic waste', 'poison'], note: 'Requires a licensed hazardous waste handler.', alternative: 'Maricopa County runs household hazardous waste collection events. Check the county environmental services schedule.' },
  { slug: 'wet-paint', name: 'Wet paint and solvents', category: 'prohibited', status: 'prohibited', aliases: ['paint cans', 'stain', 'thinner', 'varnish', 'lacquer'], note: 'Liquid paint cannot go in a general load.', alternative: 'Fully dried-out latex paint can often be disposed of normally. Solvents and oil-based paint need a household hazardous waste drop-off.' },
  { slug: 'fuels-oils', name: 'Fuels and oils', category: 'prohibited', status: 'prohibited', aliases: ['gasoline', 'diesel', 'motor oil', 'propane tank', 'kerosene', 'antifreeze'], note: 'Flammable and regulated. This includes propane tanks of any size.', alternative: 'Auto parts stores commonly accept used motor oil. Propane tanks can usually be exchanged at a retailer.' },
  { slug: 'chemicals', name: 'Chemicals', category: 'prohibited', status: 'prohibited', aliases: ['pool chemicals', 'pesticides', 'herbicide', 'fertilizer', 'cleaning chemicals', 'acid'], note: 'Requires a licensed handler.', alternative: 'Take these to a county household hazardous waste collection event.' },
  { slug: 'asbestos', name: 'Asbestos', category: 'prohibited', status: 'prohibited', aliases: ['popcorn ceiling', 'asbestos tile', 'pipe wrap'], note: 'Legally requires a licensed abatement contractor.', alternative: 'Have the material tested, then hire a licensed asbestos abatement contractor.' },
  { slug: 'biohazard', name: 'Biohazards', category: 'prohibited', status: 'prohibited', aliases: ['bodily fluids', 'sewage', 'animal waste', 'mold remediation', 'crime scene'], note: 'Requires specialist remediation, not junk removal.', alternative: 'Contact a biohazard remediation company.' },
  { slug: 'medical-waste', name: 'Medical waste', category: 'prohibited', status: 'prohibited', aliases: ['needles', 'sharps', 'syringes', 'medication', 'prescription drugs'], note: 'Regulated disposal stream.', alternative: 'Pharmacies commonly take back medication, and sharps containers have dedicated drop-off points.' },
  { slug: 'ammunition', name: 'Ammunition and explosives', category: 'prohibited', status: 'prohibited', aliases: ['ammo', 'fireworks', 'flares', 'gunpowder'], note: 'Cannot be transported in a junk removal load.', alternative: 'Contact your local police department for safe disposal guidance.' },
];

/* ─────────────────────────── Local helpers ─────────────────────────── */

export const getMaterialCategory = (slug: string): MaterialCategory | undefined =>
  materialCategories.find((c) => c.slug === slug);

export const getMaterial = (slug: string): Material | undefined =>
  materials.find((m) => m.slug === slug);

/** Items in a category, in declaration order. */
export const materialsInCategory = (categorySlug: string): Material[] =>
  materials.filter((m) => m.category === categorySlug);

/** Categories in display order, excluding the prohibited pseudo-category. */
export const acceptedCategories = (): MaterialCategory[] =>
  materialCategories.filter((c) => c.slug !== 'prohibited').sort((a, b) => a.order - b.order);

/** Everything the business will not take, for the exclusions component. */
export const prohibitedMaterials = (): Material[] =>
  materials.filter((m) => m.status === 'prohibited');

/** Accepted-with-conditions items, which drive most pre-quote questions. */
export const restrictedMaterials = (): Material[] =>
  materials.filter((m) => m.status === 'restricted');

/**
 * Free-text lookup across names and aliases. Powers the item search and gives
 * AI systems a deterministic way to resolve a natural-language item to a
 * coverage answer.
 */
export const findMaterials = (query: string): Material[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return materials.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.slug.includes(q) ||
      m.aliases.some((a) => a.includes(q)),
  );
};
