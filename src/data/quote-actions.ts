/**
 * quote-actions.ts — the conversion paths, modelled as first-class entities.
 *
 * Most sites treat "the contact form" as a template detail. Here it is part of
 * the knowledge graph, because the actions a business will accept are genuinely
 * part of what the business IS. A visitor, a search engine, and an AI assistant
 * all need the same answer to "how do I actually book this and what do you need
 * from me".
 *
 * Modelling it explicitly also means:
 *   - the quote form fields are generated from the same source that documents
 *     them, so the two cannot drift apart
 *   - schema.org can describe the action rather than just linking to a page
 *   - the "what do I need to tell you" content on service pages is derived, not
 *     written twice
 *
 * ─────────────────────── Relationship ownership ───────────────────────
 *
 * QUOTE ACTION owns:
 *   quoteAction -> inputs        (what we ask for and why)
 *   quoteAction -> accessFactors (the conditions worth mentioning)
 *
 * The `endpoint` is the contract the form posts to. It is declared here so the
 * UI, the API route, and the documentation share one definition.
 */

export type InputKind = 'text' | 'tel' | 'email' | 'postal' | 'select' | 'textarea' | 'file' | 'radio';

export interface QuoteInput {
  name: string;
  label: string;
  kind: InputKind;
  required: boolean;
  /** Why we ask. Shown as helper text and used in the docs. */
  reason: string;
  /** Shown in the first, short version of the form. */
  initial: boolean;
  /** Where options come from, for select and radio inputs. */
  optionsFrom?: 'services' | 'loadSizes' | 'timing' | 'contactPreference';
  /** Accepted file types and limits, for file inputs. */
  accept?: string;
  maxFiles?: number;
  maxFileSizeMb?: number;
}

export interface QuoteAction {
  slug: string;
  name: string;
  /** The CTA label. Must match the label locked in DESIGN.md. */
  label: string;
  description: string;
  /** Where the action happens. */
  href: string;
  /** The POST target. Empty for actions that are not form submissions. */
  endpoint?: string;
  inputs: QuoteInput[];
  /** Access factor slugs worth mentioning in a request. CANONICAL. */
  accessFactors: string[];
  /** What happens after submission, shown on the confirmation page. */
  nextSteps: string[];
  primary: boolean;
}

export const quoteActions: QuoteAction[] = [
  {
    slug: 'photo-quote',
    name: 'Photo quote request',
    label: 'Get a Photo Quote',
    description:
      'Send photos of what needs to go and get an estimate back, usually the same day. Photos let us judge volume and access, which is most of what sets the price.',
    href: '/quote',
    endpoint: '/api/quote',
    inputs: [
      {
        name: 'name',
        label: 'Your name',
        kind: 'text',
        required: true,
        reason: 'So we know who we are talking to.',
        initial: true,
      },
      {
        name: 'phone',
        label: 'Phone number',
        kind: 'tel',
        required: true,
        reason: 'The fastest way to confirm details and give you a number.',
        initial: true,
      },
      {
        name: 'zip',
        label: 'ZIP code',
        kind: 'postal',
        required: true,
        reason: 'Confirms the property is in the service area before we quote it.',
        initial: true,
      },
      {
        name: 'service',
        label: 'What do you need removed?',
        kind: 'select',
        required: true,
        reason: 'Points the request at the right crew and equipment.',
        initial: true,
        optionsFrom: 'services',
      },
      {
        name: 'photos',
        label: 'Photos',
        kind: 'file',
        required: false,
        reason:
          'The single most useful thing you can send. Shoot from far enough back to show the whole pile, plus the path to where a truck can park.',
        initial: true,
        accept: 'image/*',
        maxFiles: 8,
        maxFileSizeMb: 10,
      },
      {
        name: 'loadSize',
        label: 'Roughly how much is there?',
        kind: 'radio',
        required: false,
        reason: 'A rough size gets you a closer estimate before anyone visits.',
        initial: false,
        optionsFrom: 'loadSizes',
      },
      {
        name: 'timing',
        label: 'When do you need it done?',
        kind: 'select',
        required: false,
        reason: 'Tells us whether to look at today, this week, or further out.',
        initial: false,
        optionsFrom: 'timing',
      },
      {
        name: 'email',
        label: 'Email',
        kind: 'email',
        required: false,
        reason: 'Useful if you would rather get the estimate in writing.',
        initial: false,
      },
      {
        name: 'address',
        label: 'Service address',
        kind: 'text',
        required: false,
        reason: 'Needed to schedule, but not to get an estimate.',
        initial: false,
      },
      {
        name: 'access',
        label: 'Anything we should know about access?',
        kind: 'textarea',
        required: false,
        reason:
          'Stairs, gates, long carries, and elevator rules are the things that change a quote after the fact. Telling us up front keeps the price accurate.',
        initial: false,
      },
      {
        name: 'contactPreference',
        label: 'How should we reach you?',
        kind: 'radio',
        required: false,
        reason: 'So we contact you the way you actually want to be contacted.',
        initial: false,
        optionsFrom: 'contactPreference',
      },
    ],
    accessFactors: ['stairs', 'long-carry', 'tight-access', 'gated-community', 'apartment', 'heavy-items', 'unoccupied'],
    nextSteps: [
      'We review your photos and details and confirm we cover your area',
      'You get an estimate back with the soonest available windows',
      'If it works, we schedule the pickup',
      'The crew confirms the final price on site before anything is loaded',
    ],
    primary: true,
  },
  {
    slug: 'call',
    name: 'Phone call',
    label: 'Call Now',
    description:
      'Talk it through directly. Best when the job is urgent, unusual, or easier to explain than to photograph.',
    href: 'tel:',
    inputs: [],
    accessFactors: [],
    nextSteps: [],
    primary: false,
  },
  {
    slug: 'text-photos',
    name: 'Text photos',
    label: 'Text Photos',
    description:
      'Send photos straight from your phone to the same number you would call. Often the quickest route when you are already standing in the garage.',
    href: 'sms:',
    inputs: [],
    accessFactors: [],
    nextSteps: [],
    primary: false,
  },
];

/** Option sets for inputs whose choices are not drawn from another module. */
export const timingOptions = [
  { value: 'today', label: 'Today if possible' },
  { value: 'this-week', label: 'This week' },
  { value: 'next-week', label: 'Next week' },
  { value: 'flexible', label: 'I am flexible' },
  { value: 'planning', label: 'Just planning ahead' },
];

export const contactPreferenceOptions = [
  { value: 'call', label: 'Call me' },
  { value: 'text', label: 'Text me' },
  { value: 'email', label: 'Email me' },
];

export const getQuoteAction = (slug: string): QuoteAction | undefined =>
  quoteActions.find((a) => a.slug === slug);

export const primaryQuoteAction = (): QuoteAction => quoteActions[0];

/** The short first pass of the form. */
export const initialInputs = (slug = 'photo-quote'): QuoteInput[] =>
  getQuoteAction(slug)?.inputs.filter((i) => i.initial) ?? [];

/** Fields revealed after the first pass. */
export const additionalInputs = (slug = 'photo-quote'): QuoteInput[] =>
  getQuoteAction(slug)?.inputs.filter((i) => !i.initial) ?? [];
