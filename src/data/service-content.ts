/**
 * service-content.ts — deep, page-level copy for each service (req #6).
 *
 * Keyed by the same slug as src/data/services.ts, this holds the long-form
 * content the ServiceLayout renders below the hero: overview paragraphs, common
 * reasons, "what we remove" groups, problem/solution pairs, prep + special-
 * handling notes, and per-service FAQs (which also feed FAQPage schema).
 *
 * Keeping the catalog (services.ts) and the rich content (here) separate means
 * the catalog stays scannable while every service page gets unique, substantial
 * copy — important for local SEO and for actually helping the visitor.
 */
export interface ServiceContent {
  /** 2–3 overview paragraphs rendered under the hero. */
  overview: string[];
  /** "Common reasons customers call" chips. */
  reasons: string[];
  /** "What we remove" grouped cards. */
  detailGroups: { title: string; items: string[] }[];
  /** Problem → solution pairs. */
  problems: { problem: string; solution: string }[];
  /** One-line prep tip. */
  prepTip: string;
  /** Special-handling / not-accepted note. */
  specialNote: string;
  /** Service-specific FAQs (merged with shared FAQs at render time). */
  faqs: { question: string; answer: string }[];
}

/** Four-step "how it works" process, shared across service pages. */
export const serviceProcess = [
  { title: 'Request a free quote', text: 'Call or send the form with a few details about the job.' },
  { title: 'Send photos or a description', text: 'Photos help us estimate volume, access, and truck space.' },
  { title: 'Schedule your pickup', text: 'Pick a time window that works for the property and our route.' },
  { title: 'We load it and clean up', text: 'The crew hauls approved items away and tidies the area.' },
];

/** "Why choose us" bullets, shared across service pages. */
export const whyChoose = [
  'Upfront, volume-based quotes before we start loading',
  'Full-service hauling, so you never rent a dumpster',
  'Fast scheduling across Mesa and the East Valley',
  'Donation and recycling considered before the landfill',
  'Professional cleanup after the approved items are gone',
];

/** Short trust bullets for the service hero. */
export const serviceTrustBullets = [
  'Upfront pricing before loading',
  'Fast East Valley scheduling',
  'Full-service removal and hauling',
  'Locally owned and operated',
];

/** FAQs shared by every service page (appended after the service-specific ones). */
export const sharedServiceFaqs = [
  {
    question: 'How is junk removal priced?',
    answer:
      'Most jobs are priced by how much space your items take up in the truck, plus any unusual labor, access, or disposal needs. You approve the price before loading starts.',
  },
  {
    question: 'Can I get same-day or next-day pickup?',
    answer:
      'Often yes — when you contact us early, send photos, and the job fits an existing Mesa or East Valley route. Reach out as soon as you can for the best chance at same-day service.',
  },
  {
    question: 'What items do you not take?',
    answer:
      'We do not haul hazardous waste, wet paint, fuels, oils, chemicals, asbestos, biohazards, or medical waste. Contact us first if you are unsure and we will help you find the right disposal route.',
  },
];

export const serviceContent: Record<string, ServiceContent> = {
  'junk-removal': {
    overview: [
      'Junk removal is the simplest option when you have several unwanted items and no easy way to haul them. One crew can remove bulky items, bagged clutter, garage overflow, furniture, appliances, and general household junk in a single visit.',
      'Doing it yourself usually means borrowing a truck, lifting heavy items, finding a disposal site, and making more than one trip. Full-service removal saves time because the crew handles the loading, hauling, sorting, and cleanup.',
      'This is the best starting point when your project does not fit one single category. We can break the job into furniture removal, appliance removal, or a garage cleanout if that makes scheduling easier.',
    ],
    reasons: ['Move-outs and downsizing', 'Garage or room cleanouts', 'Bulky item removal', 'Rental property cleanup', 'Storage clutter', 'Small remodel debris'],
    detailGroups: [
      { title: 'Household junk', items: ['Bagged clutter', 'Boxes', 'Decor', 'Old toys', 'Small household items'] },
      { title: 'Bulky items', items: ['Furniture', 'Mattresses', 'Exercise equipment', 'Patio items', 'Large boxes'] },
      { title: 'Pickup options', items: ['Curbside pickup', 'Garage pickup', 'In-home removal', 'Light cleanup', 'Single or full loads'] },
    ],
    problems: [
      { problem: 'Mixed junk will not fit in your vehicle', solution: 'Book one general pickup for several item types at once.' },
      { problem: 'You need space cleared before a move', solution: 'Send photos for a quote and schedule before moving day.' },
      { problem: 'The job is too heavy for one person', solution: 'Use full-service removal so the crew handles the lifting.' },
    ],
    prepTip: 'Group small loose items together when you can, and mark anything that should stay.',
    specialNote: 'Hazardous waste, chemicals, wet paint, fuel, asbestos, and biohazards may require special disposal. Contact us first if you are unsure.',
    faqs: [
      { question: 'Do I need to move everything outside first?', answer: 'No. Curbside pickup is fastest, but our crew can remove approved items from inside the home, the garage, the patio, or the yard whenever access is safe.' },
      { question: 'How big of a job can you handle?', answer: 'Anything from a single bulky item to a full truckload. For very large jobs we can plan multiple trips or a dedicated crew.' },
    ],
  },
  'furniture-removal': {
    overview: [
      'Furniture removal is for sofas, sectionals, recliners, dressers, tables, bed frames, and patio furniture that are hard to move alone. It is common during moves, remodels, estate cleanouts, and home updates.',
      'Large furniture can damage walls, door frames, and floors when it is moved without help. Our crew handles the lifting and can remove items from inside the home, garage, patio, or curb when access is safe.',
      'If a piece is clean and usable, donation may be possible. If not, we route it toward the most practical disposal option.',
    ],
    reasons: ['Replacing old furniture', 'Moving out', 'Clearing a rental', 'Estate cleanouts', 'Removing patio furniture', 'Making room for deliveries'],
    detailGroups: [
      { title: 'Living room', items: ['Sofas', 'Sectionals', 'Recliners', 'Coffee tables', 'TV stands'] },
      { title: 'Bedroom and dining', items: ['Dressers', 'Bed frames', 'Wardrobes', 'Dining tables', 'Chairs'] },
      { title: 'Outdoor and bulky', items: ['Patio sets', 'Outdoor chairs', 'Large shelves', 'Entertainment centers', 'Office desks'] },
    ],
    problems: [
      { problem: 'A sofa will not fit in your vehicle', solution: 'Book full-service removal with the loading included.' },
      { problem: 'New furniture is being delivered soon', solution: 'Schedule pickup before delivery day to clear the space.' },
      { problem: 'Furniture is upstairs or awkward to carry', solution: 'Share access notes so the crew can plan safe removal.' },
    ],
    prepTip: 'Empty drawers, shelves, and cushions of personal items before pickup.',
    specialNote: 'Furniture with active pest infestation, biohazards, or unsafe damage may need special handling. Contact us first.',
    faqs: [
      { question: 'Can you donate furniture that is still good?', answer: 'When a piece is clean, complete, and in usable shape, we do our best to route it to a donation partner before considering disposal.' },
      { question: 'Will you take just one piece?', answer: 'Yes. We handle single-item pickups as well as whole-house furniture removal.' },
    ],
  },
  'appliance-removal': {
    overview: [
      'Appliance removal handles old refrigerators, washers, dryers, ovens, dishwashers, freezers, and water heaters. These items are heavy, awkward, and often need the right disposal route.',
      'Hauling appliances yourself is risky because of weight, sharp edges, water lines, and tight spaces. Once an appliance is safely disconnected, our crew loads and hauls it away.',
      'Many appliances are recyclable. Tell us what you have, where it is located, and whether it is already disconnected before we schedule.',
    ],
    reasons: ['Kitchen appliance upgrades', 'Washer or dryer replacement', 'Rental turnover', 'Garage appliance cleanup', 'Water heater replacement', 'Moving out'],
    detailGroups: [
      { title: 'Kitchen', items: ['Refrigerators', 'Freezers', 'Ovens', 'Ranges', 'Dishwashers'] },
      { title: 'Laundry and utility', items: ['Washers', 'Dryers', 'Water heaters', 'Small appliances', 'Garage fridges'] },
      { title: 'Pickup locations', items: ['Kitchen', 'Laundry room', 'Garage', 'Curbside', 'Storage area'] },
    ],
    problems: [
      { problem: 'The appliance is too heavy to move', solution: 'Schedule removal once it has been disconnected.' },
      { problem: 'A new appliance is being delivered', solution: 'Clear the old unit before or right after delivery.' },
      { problem: 'You are not sure if it can be recycled', solution: 'Send photos and details and we will advise on routing.' },
    ],
    prepTip: 'Disconnect water, gas, and electrical connections before pickup when required.',
    specialNote: 'Live utility connections, leaking units, refrigerant issues, and commercial appliances may require a licensed professional first.',
    faqs: [
      { question: 'Do you disconnect the appliance for me?', answer: 'For safety, appliances should be disconnected from water, gas, and power before we arrive. We focus on the loading, hauling, and disposal.' },
      { question: 'Do you recycle old appliances?', answer: 'When recycling is available for the unit, we route it that way instead of straight to disposal.' },
    ],
  },
  'garage-cleanouts': {
    overview: [
      'Garage cleanouts turn packed storage back into usable square footage. Jobs often include boxes, bins, shelves, old tools, exercise equipment, sports gear, furniture, and general overflow.',
      'Clearing a garage alone can take several weekends and multiple disposal trips. Our crew loads bulky items, bagged clutter, and mixed junk in one planned visit.',
      'Garage cleanouts are useful before moving, selling a home, parking vehicles inside again, or starting a home project.',
    ],
    reasons: ['Garage too cluttered to park', 'Moving or downsizing', 'Home sale prep', 'Old storage piles', 'Exercise equipment removal', 'Seasonal cleanup'],
    detailGroups: [
      { title: 'Storage clutter', items: ['Boxes', 'Totes', 'Shelving', 'Cabinets', 'Bagged junk'] },
      { title: 'Bulky garage items', items: ['Exercise equipment', 'Old furniture', 'Sports gear', 'Ladders', 'Workbench pieces'] },
      { title: 'Common add-ons', items: ['Appliances', 'Mattresses', 'Patio items', 'Donation-ready goods', 'Light sweeping'] },
    ],
    problems: [
      { problem: 'You cannot park in the garage', solution: 'Schedule a cleanout to remove bulky and mixed clutter.' },
      { problem: 'You do not know where to start', solution: 'Sort keep items first, then let the crew load the rest.' },
      { problem: 'Some items might be hazardous', solution: 'Set chemicals and paints aside and contact us first.' },
    ],
    prepTip: 'Create a clear keep pile and point out anything that should stay before loading begins.',
    specialNote: 'Paint, fuel, oils, pool chemicals, and pesticides cannot go in a standard garage cleanout load.',
    faqs: [
      { question: 'Do I have to be home for the whole cleanout?', answer: 'It helps to walk the crew through what stays and what goes at the start. After that, you are free to step away while we work.' },
      { question: 'Can you sweep the garage when you finish?', answer: 'Yes. A light sweep of the cleared area is part of the job.' },
    ],
  },
  'estate-cleanouts': {
    overview: [
      'Estate cleanouts require patience, communication, and careful sorting. The work can include furniture, household goods, garage storage, donation-ready items, and general clutter throughout the home.',
      'Handling an estate alone can be emotionally and physically difficult. Our crew removes approved items room by room while family members, executors, or owners decide what stays.',
      'Estate cleanouts often support a real estate sale, a family transition, or downsizing after belongings have been reviewed.',
    ],
    reasons: ['Preparing a home for sale', 'Family estate cleanup', 'Downsizing', 'Clearing garage storage', 'Donation sorting', 'Removing bulky furniture'],
    detailGroups: [
      { title: 'Inside the home', items: ['Furniture', 'Household goods', 'Decor', 'Bagged clutter', 'Small appliances'] },
      { title: 'Storage areas', items: ['Garage items', 'Boxes', 'Closet contents', 'Shelving', 'Patio items'] },
      { title: 'Helpful sorting', items: ['Keep piles', 'Donation piles', 'Remove piles', 'Room-by-room loading', 'Light cleanup'] },
    ],
    problems: [
      { problem: 'The home has years of belongings', solution: 'Work room by room and remove items after family review.' },
      { problem: 'Some items may be donated', solution: 'Separate usable items before pickup when possible.' },
      { problem: 'The property needs to be listed', solution: 'Clear bulky items before cleaning and staging.' },
    ],
    prepTip: 'Review documents, valuables, photos, and keepsakes before the cleanout appointment.',
    specialNote: 'Documents, valuables, firearms, medications, and hazardous materials should be set aside and reviewed before removal.',
    faqs: [
      { question: 'Can you work with our realtor or executor?', answer: 'Yes. We regularly coordinate with families, executors, and realtors on timing, access, and what gets removed.' },
      { question: 'Can the cleanout happen in stages?', answer: 'Absolutely. Many estate cleanouts are done over more than one visit as decisions are made room by room.' },
    ],
  },
  'hot-tub-removal': {
    overview: [
      'Hot tub removal is for old spas that need to be cut up, loaded, hauled, and disposed of. These projects are heavy, awkward, and hard to handle without the right tools and crew.',
      'Doing it yourself is difficult because hot tubs are large, often tucked into tight backyards, and may be wired to electrical systems. The spa should be drained and disconnected before removal begins.',
      'Access matters. Gates, side yards, decks, stairs, and landscaping all affect the removal plan, so photos help us prepare.',
    ],
    reasons: ['Old spa no longer works', 'Backyard remodel', 'Preparing to sell a home', 'Leaking hot tub', 'Deck or patio update', 'Creating more yard space'],
    detailGroups: [
      { title: 'Hot tub items', items: ['Acrylic spas', 'Spa covers', 'Detached steps', 'Wood surrounds', 'Small accessories'] },
      { title: 'Removal needs', items: ['Cut-up service', 'Heavy loading', 'Backyard access', 'Hauling', 'Cleanup'] },
      { title: 'Planning details', items: ['Gate width', 'Deck placement', 'Electrical disconnect', 'Drain status', 'Path to truck'] },
    ],
    problems: [
      { problem: 'The hot tub is too large to move whole', solution: 'Book removal with cut-up and hauling included.' },
      { problem: 'The spa is in a tight backyard', solution: 'Share access photos so the crew can plan the route.' },
      { problem: 'You are not sure if it is disconnected', solution: 'Have the electrical handled before removal day.' },
    ],
    prepTip: 'Drain the hot tub, clear the access path, and confirm the electrical is disconnected before removal.',
    specialNote: 'Live electrical hookups, in-ground spas, and unsafe decking may require special handling before removal.',
    faqs: [
      { question: 'Do you cut the hot tub up on site?', answer: 'Yes. Most spas are cut down on site so the pieces can be carried out through gates and side yards and loaded for hauling.' },
      { question: 'Does the spa need to be empty?', answer: 'It should be drained and disconnected from power before we arrive so the crew can focus on teardown and removal.' },
    ],
  },
  'construction-debris-removal': {
    overview: [
      'Construction debris removal is for small remodels, repairs, and jobsite cleanup where debris has piled up but a full dumpster is not practical. Common loads include drywall, lumber, flooring, cabinets, fixtures, and packaging.',
      'Hauling debris yourself can mean sharp materials, heavy loads, dust, and multiple dump runs. Our crew loads the debris and helps leave the work area cleaner.',
      'This service works best for small to mid-size debris piles. Large commercial jobs or regulated materials may need a different disposal plan.',
    ],
    reasons: ['Bathroom or kitchen remodel', 'Flooring replacement', 'DIY renovation', 'Cabinet removal', 'Small contractor cleanup', 'Rental repair debris'],
    detailGroups: [
      { title: 'Remodel debris', items: ['Drywall', 'Lumber', 'Trim', 'Cabinets', 'Fixtures'] },
      { title: 'Flooring and surfaces', items: ['Carpet', 'Tile debris', 'Laminate', 'Baseboards', 'Packaging'] },
      { title: 'Jobsite cleanup', items: ['Loose debris', 'Bagged construction trash', 'Small fixtures', 'Scrap materials', 'Sweep-ready cleanup'] },
    ],
    problems: [
      { problem: 'A remodel pile is blocking the work area', solution: 'Clear it before the next phase of the project.' },
      { problem: 'You do not need a full dumpster', solution: 'Use junk removal for smaller debris loads.' },
      { problem: 'Sharp debris is hard to transport', solution: 'Let the crew load and haul the approved materials.' },
    ],
    prepTip: 'Stack debris in one safe area when possible and keep nails, sharp edges, and dust in mind.',
    specialNote: 'Asbestos, wet concrete, chemicals, and regulated jobsite waste may require special disposal. Contact us first.',
    faqs: [
      { question: 'Do you work with contractors?', answer: 'Yes. We help contractors, handymen, and DIY remodelers clear debris between phases without tying up a dumpster.' },
      { question: 'Can you take heavy materials like tile?', answer: 'We take many heavy remodel materials in reasonable amounts. Send photos so we can confirm weight and volume for the quote.' },
    ],
  },
  'yard-waste-removal': {
    overview: [
      'Yard waste removal clears the branches, brush, leaves, and landscaping debris that pile up faster than a green bin can take, especially after a big trim, a tree removal, or a monsoon storm.',
      'Instead of cramming green waste into your bin over many weeks or hauling sharp limbs in your own vehicle, our crew loads it all at once and gets your yard clean again.',
      'We handle loose and bagged green waste, old sod, and the debris left behind after landscaping projects.',
    ],
    reasons: ['Post-storm cleanup', 'Tree or shrub trimming', 'Landscaping projects', 'Palm frond removal', 'Overgrown yard reset', 'Sod and dirt removal'],
    detailGroups: [
      { title: 'Green waste', items: ['Branches and limbs', 'Brush and clippings', 'Leaves', 'Palm fronds', 'Weeds'] },
      { title: 'Landscaping debris', items: ['Old sod', 'Removed plants', 'Bagged yard waste', 'Small stumps', 'Trimmings'] },
      { title: 'Pickup options', items: ['Loose piles', 'Bagged waste', 'Side yard access', 'Front or back yard', 'Sweep-ready finish'] },
    ],
    problems: [
      { problem: 'A storm left branches everywhere', solution: 'Book a yard waste pickup to clear the debris fast.' },
      { problem: 'Your green bin is far too small', solution: 'We haul the full pile in one visit instead of weeks of bins.' },
      { problem: 'Sharp limbs will not fit in your car', solution: 'Let the crew load and haul the green waste for you.' },
    ],
    prepTip: 'Pile green waste in one spot with a clear path to the truck when you can.',
    specialNote: 'Treated lumber, large stumps, rock, and dirt loads may need a different plan. Contact us first so we can size the job.',
    faqs: [
      { question: 'Do you remove palm fronds and cactus?', answer: 'Yes. Palm fronds and trimmed cactus are common East Valley pickups. Let us know the volume and we will plan the load.' },
      { question: 'Can you take green waste and other junk together?', answer: 'Yes. We can combine yard waste with furniture, junk, or cleanout items in the same visit.' },
    ],
  },
  'mattress-removal': {
    overview: [
      'Mattress removal handles mattresses, box springs, bed frames, headboards, and related bedroom furniture. Mattresses are bulky, hard to fit in a vehicle, and not always accepted through regular trash service.',
      'Our crew removes the mattress from a bedroom, hallway, garage, or curbside pickup area. That is easier than tying a mattress to your car or waiting for a limited bulk pickup day.',
      'Mattress jobs are common during moves, guest room updates, rental turnovers, and estate cleanouts.',
    ],
    reasons: ['Replacing an old bed', 'Moving out', 'Rental turnover', 'Guest room cleanup', 'Estate cleanout', 'Clearing a storage space'],
    detailGroups: [
      { title: 'Bedding items', items: ['Mattresses', 'Box springs', 'Bed frames', 'Headboards', 'Platform beds'] },
      { title: 'Bedroom items', items: ['Nightstands', 'Dressers', 'Bedroom chairs', 'Small shelves', 'Bagged clutter'] },
      { title: 'Pickup options', items: ['Bedroom pickup', 'Garage pickup', 'Curbside pickup', 'Apartment pickup', 'Multiple beds'] },
    ],
    problems: [
      { problem: 'The mattress will not fit in your car', solution: 'Book removal with loading and hauling included.' },
      { problem: 'A rental needs a bed removed', solution: 'Schedule pickup before cleaning or repairs begin.' },
      { problem: 'You have the frame and headboard too', solution: 'Add them to the same pickup at no extra trip.' },
    ],
    prepTip: 'Strip the bedding and clear a path from the bedroom to the exit before pickup.',
    specialNote: 'Mattresses with bed bug activity or biohazard contamination may require special handling. Contact us first.',
    faqs: [
      { question: 'Can you take more than one mattress?', answer: 'Yes. Whether it is a single mattress or every bed in a rental, we load and haul them in one visit.' },
      { question: 'Do you recycle mattresses?', answer: 'When a recycling option is available, we route mattresses that way. Otherwise we handle responsible disposal.' },
    ],
  },
  'shed-removal': {
    overview: [
      'Shed removal clears old tools, garden supplies, outdoor clutter, broken equipment, bins, and shelves, and can take down the structure itself. It is useful before replacing a shed or cleaning up a backyard.',
      'Sheds often hold items that are dusty, sharp, heavy, or mixed with materials that need special handling. Our crew removes the approved contents and can break down the shed so the space is ready to reuse.',
      'Before pickup, separate chemicals, fuel, and pesticides from regular junk so the removal plan stays safe.',
    ],
    reasons: ['Replacing an old shed', 'Backyard cleanup', 'Moving out', 'Clearing garden clutter', 'Removing broken equipment', 'Home sale prep'],
    detailGroups: [
      { title: 'Shed contents', items: ['Old tools', 'Bins', 'Shelving', 'Garden supplies', 'Outdoor clutter'] },
      { title: 'Yard storage', items: ['Broken equipment', 'Planters', 'Hoses', 'Small furniture', 'Scrap pieces'] },
      { title: 'Structure removal', items: ['Wood and metal sheds', 'Teardown', 'Hauling', 'Backyard access', 'Site cleanup'] },
    ],
    problems: [
      { problem: 'The shed is too packed to use', solution: 'Clear the contents and identify what should stay.' },
      { problem: 'Old garden supplies may be unsafe', solution: 'Set chemicals aside and contact us before pickup.' },
      { problem: 'You are replacing the shed', solution: 'We can clear the contents and tear down the structure.' },
    ],
    prepTip: 'Open the shed before arrival and point out chemicals, fuel, or anything that should not be loaded.',
    specialNote: 'Pool chemicals, pesticides, fuel, oils, and wet paint cannot go in a standard shed cleanout load.',
    faqs: [
      { question: 'Can you remove the shed itself, not just the contents?', answer: 'Yes. We clear the contents and can break down and haul away many wood and metal sheds. Send photos so we can plan the teardown.' },
      { question: 'Do you clean up the site afterward?', answer: 'We clear the debris and tidy the footprint so the area is ready for whatever comes next.' },
    ],
  },
  'hoarder-cleanouts': {
    overview: [
      'Hoarder cleanouts take patience, discretion, and a clear plan. Our crew works room by room at a comfortable pace, clearing heavy, packed-in clutter while protecting the things that matter.',
      'These jobs are handled without judgment. We coordinate closely with the homeowner, family members, or helping professionals so everyone is comfortable with what is being removed.',
      'Because every situation is different, we sort carefully for valuables, documents, and keepsakes before anything leaves the property.',
    ],
    reasons: ['Whole-home decluttering', 'Family or caregiver support', 'Preparing a home for sale', 'Safety and access concerns', 'Property cleanup', 'Downsizing after a transition'],
    detailGroups: [
      { title: 'Throughout the home', items: ['Packed-in clutter', 'Furniture', 'Bagged items', 'Boxes', 'Household goods'] },
      { title: 'Careful sorting', items: ['Valuables', 'Documents', 'Photos and keepsakes', 'Keep piles', 'Donation piles'] },
      { title: 'Whole-property', items: ['Garage', 'Yard and patio', 'Storage areas', 'Room-by-room work', 'Final cleanup'] },
    ],
    problems: [
      { problem: 'The home feels overwhelming to start', solution: 'We work one room at a time at a pace that feels manageable.' },
      { problem: 'Valuables may be mixed in the clutter', solution: 'The crew sorts carefully and sets aside anything that should stay.' },
      { problem: 'A family member needs support', solution: 'We coordinate with family and helpers with discretion and care.' },
    ],
    prepTip: 'Mark a few clear keep areas first, and tell us about anything especially important to protect.',
    specialNote: 'Biohazards, mold, and unsafe conditions may require specialty cleaning before a standard cleanout. We will let you know if so.',
    faqs: [
      { question: 'Is the service discreet?', answer: 'Yes. We handle hoarder cleanouts with discretion and respect, on your schedule and at your pace.' },
      { question: 'Can family members be involved?', answer: 'Of course. Many cleanouts involve family or caregivers, and we coordinate closely on what stays and what goes.' },
    ],
  },
  'office-cleanouts': {
    overview: [
      'Office cleanouts clear desks, chairs, cubicles, fixtures, shelving, and equipment from offices, retail spaces, and small businesses with less disruption to your team.',
      'Doing a business cleanout in-house pulls staff away from their work and creates safety issues with heavy, awkward loads. Our crew handles the labor, hauling, and cleanup so your team stays focused.',
      'These pickups go smoothly when access, loading zones, building rules, and scheduling windows are shared early. We can plan around your operating hours.',
    ],
    reasons: ['Office refreshes', 'Retail fixture removal', 'Storage room cleanouts', 'Tenant turnover', 'Old equipment removal', 'Downsizing or relocating'],
    detailGroups: [
      { title: 'Office items', items: ['Desks', 'Chairs', 'Cubicle pieces', 'Tables', 'File cabinets'] },
      { title: 'Retail and storage', items: ['Displays', 'Shelving', 'Racks', 'Packaging', 'Backroom clutter'] },
      { title: 'Equipment', items: ['Old electronics', 'Printers and copiers', 'Breakroom appliances', 'Bulk trash', 'Light cleanup'] },
    ],
    problems: [
      { problem: 'Old office furniture is taking up space', solution: 'Schedule a cleanout before new furniture arrives.' },
      { problem: 'A storage room is no longer usable', solution: 'Clear shelving, boxes, and outdated inventory in one visit.' },
      { problem: 'A tenant left debris behind', solution: 'Clear it so repairs and re-leasing can start sooner.' },
    ],
    prepTip: 'Confirm building access, loading areas, elevator rules, and any items that must stay before the crew arrives.',
    specialNote: 'Sensitive records, regulated electronics, and industrial hazardous waste may require specialty handling.',
    faqs: [
      { question: 'Can you work after business hours?', answer: 'Yes. We can schedule around your operating hours, including evenings, to keep disruption to a minimum.' },
      { question: 'Do you remove old office electronics?', answer: 'We remove most office electronics and equipment. Let us know what you have so we can advise on responsible routing.' },
    ],
  },
  'foreclosure-cleanouts': {
    overview: [
      'Foreclosure and eviction cleanouts remove abandoned belongings, furniture, trash, and turnover debris after legal access is complete, so repairs, cleaning, and re-listing can move forward.',
      'These jobs are often time-sensitive and include a mix of furniture, bagged trash, mattresses, garage debris, patio items, and storage clutter. Our crew helps reduce downtime between owners or tenants.',
      'Before scheduling, confirm the legal process is complete and that all items are approved for removal.',
    ],
    reasons: ['Bank or REO turnover', 'Tenant lockout completed', 'Abandoned belongings', 'Trash left behind', 'Furniture removal', 'Garage or yard debris'],
    detailGroups: [
      { title: 'Inside the unit', items: ['Furniture', 'Mattresses', 'Bagged trash', 'Household items', 'Small appliances'] },
      { title: 'Exterior areas', items: ['Garage debris', 'Patio junk', 'Yard waste', 'Bulk trash', 'Loose clutter'] },
      { title: 'Turnover support', items: ['Fast scheduling', 'Photo estimates', 'Property-manager coordination', 'Whole-property clearing', 'Light sweeping'] },
    ],
    problems: [
      { problem: 'A unit is full after a lockout', solution: 'Schedule a cleanout once legal removal is approved.' },
      { problem: 'Repairs cannot start yet', solution: 'Clear furniture and trash so vendors can access the space.' },
      { problem: 'There is debris in the garage or yard', solution: 'Include the exterior areas in the same cleanout scope.' },
    ],
    prepTip: 'Confirm legal access and mark any items that should be held, documented, or left in place.',
    specialNote: 'Biohazards, hazardous waste, legal holds, and disputed belongings may require special handling before a standard cleanout.',
    faqs: [
      { question: 'How fast can you turn a property around?', answer: 'Once access and approval are confirmed, we move quickly — often within a day or two — so cleaning and repairs can start.' },
      { question: 'Do you work with property managers and agents?', answer: 'Yes. We regularly coordinate with property managers, REO agents, and landlords on access, scope, and timing.' },
    ],
  },
  'same-day-junk-removal': {
    overview: [
      'Same-day junk removal is for the jobs that cannot wait. When you call early and send photos, we work your pickup into an existing East Valley route for same-day or next-day service when openings exist.',
      'You still get the same upfront, volume-based pricing and the same full-service crew, just on a faster timeline. It is ideal for last-minute move-outs, surprise inspections, and items that need to be gone today.',
      'Availability depends on how the day is already routed, so reaching out as early as possible gives you the best shot at same-day pickup.',
    ],
    reasons: ['Last-minute move-out', 'Surprise inspection or showing', 'Just-replaced appliance', 'Quick rental turnover', 'Single bulky item gone today', 'Photo-estimate booking'],
    detailGroups: [
      { title: 'Fast pickups', items: ['Furniture', 'Appliances', 'Mattresses', 'Bagged junk', 'Single bulky items'] },
      { title: 'How it speeds up', items: ['Photo estimates', 'Early call', 'Route-based scheduling', 'Curbside-ready items', 'Upfront pricing'] },
      { title: 'Where we go', items: ['Mesa', 'Gilbert', 'Chandler', 'Tempe', 'Across the East Valley'] },
    ],
    problems: [
      { problem: 'You need it gone today', solution: 'Call early and send photos so we can fit you into the route.' },
      { problem: 'A showing or inspection is coming up', solution: 'Book a fast pickup to clear the property in time.' },
      { problem: 'You want a price before we come', solution: 'Send photos for a quick estimate before we head out.' },
    ],
    prepTip: 'Have items curbside or in an easy-access spot to speed up a same-day pickup.',
    specialNote: 'Same-day service depends on existing routes and crew availability. We will tell you honestly what is possible when you call.',
    faqs: [
      { question: 'Can you really come the same day?', answer: 'Often yes, when you call early, send photos, and your job fits an existing East Valley route. We will confirm the soonest window when you reach out.' },
      { question: 'Does same-day service cost more?', answer: 'No. You get the same upfront, volume-based pricing as any other booking — just on a faster timeline.' },
    ],
  },
};

export const getServiceContent = (slug: string): ServiceContent | undefined =>
  serviceContent[slug];

/** Visible FAQs for a service page: service-specific first, then shared. */
export const getServiceFaqs = (slug: string) => {
  const content = serviceContent[slug];
  return [...(content?.faqs ?? []), ...sharedServiceFaqs];
};
