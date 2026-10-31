/**
 * sms-consent.ts — the SMS consent disclosure, modelled as data.
 *
 * WHY THIS IS NOT A QUOTE FIELD. Every other question on the form lives in
 * `quote-actions.ts`, because it is part of what the business needs to price a
 * job. This one is not a question about the job at all: it is a permission,
 * and the thing that has to survive is not the answer on its own but the exact
 * wording the customer agreed to, the moment they agreed, and where they were
 * standing when they did it. A2P 10DLC registration and any later carrier or
 * platform audit asks "show us what they consented to", so the disclosure text
 * and its version id are kept together here and travel with the lead.
 *
 * VERSIONING IS THE POINT. `SMS_CONSENT_VERSION` identifies this exact wording.
 * If a word of the disclosure below ever changes, mint a NEW version id in the
 * same edit and leave the old one documented in the history list. Consent
 * already captured keeps naming the version it was given under, so an old lead
 * can still be shown the screen the customer actually saw.
 *
 * TRANSACTIONAL ONLY. This covers messages about a quote the customer asked
 * for: the estimate, scheduling, and the job itself. There is no marketing or
 * promotional consent on this site, and this checkbox must never be widened to
 * imply one. A separate permission, with its own disclosure and its own version
 * id, is what that would require.
 *
 * NEVER A CONDITION OF SERVICE. The box is unchecked, optional, and a quote is
 * delivered identically whether or not it is ticked. See QuoteForm.astro for
 * the rendering and quote-submission.ts for how the record is built.
 */

/** The form field name. Also the id the label points at. */
export const SMS_CONSENT_FIELD = 'smsConsent';

/**
 * The only value the server accepts as consent. An explicit word rather than
 * the browser's default "on", so a consent record can never be produced by an
 * empty or malformed checkbox arriving from somewhere else.
 */
export const SMS_CONSENT_VALUE = 'yes';

/** Identifies the exact disclosure below. Change the wording, mint a new id. */
export const SMS_CONSENT_VERSION = 'sms_quote_transactional_v1';

/** Where the consent was captured. The site has exactly one place today. */
export const SMS_CONSENT_SOURCE = 'website_quote_form';

/**
 * Version history, for the record. Keep every id that has ever been live.
 *
 *   sms_quote_transactional_v1  first disclosure, quote form, transactional only
 */

/**
 * The disclosure, in order, split only where a link has to be rendered.
 * `SMS_CONSENT_TEXT` rebuilds the plain sentence from these pieces, so the
 * wording shown to the customer and the wording stored as evidence cannot
 * drift apart: there is one source for both.
 */
export const SMS_CONSENT_SEGMENTS: { text: string; href?: string }[] = [
  {
    text:
      'I agree to receive text messages from Load Logic about my quote, scheduling, ' +
      'and service. Message frequency varies. Message and data rates may apply. Reply ' +
      'STOP to opt out or HELP for help. Consent is not a condition of purchase. See our ',
  },
  { text: 'Privacy Policy', href: '/privacy' },
  { text: ' and ' },
  { text: 'Terms & Conditions', href: '/terms' },
  { text: '.' },
];

/** The disclosure as one plain string, for the stored evidence. */
export const SMS_CONSENT_TEXT = SMS_CONSENT_SEGMENTS.map((segment) => segment.text).join('');

/**
 * What is preserved about the permission. Snake case because this travels
 * outward to the notification and the Business Agent reference, where it is
 * read as a record rather than as site code.
 */
export interface SmsConsentRecord {
  /** Whether the customer ticked the box on this submission. */
  sms_consent: boolean;
  /** Which disclosure was on screen. Recorded either way. */
  consent_version: string;
  /** Where it was captured. Recorded either way. */
  consent_source: string;
  /** Server clock, ISO 8601. Present only when consent was given. */
  consent_timestamp?: string;
  /** The exact wording agreed to. Present only when consent was given. */
  consent_text?: string;
}

/**
 * Build the record. `now` is supplied by the server; a timestamp sent by a
 * browser is never trusted and is never read anywhere in this codebase.
 *
 * No consent is recorded as explicit `false` rather than as an absence, so a
 * lead that declined is distinguishable from a lead that predates the
 * checkbox existing at all.
 */
export const buildSmsConsentRecord = (granted: boolean, now: Date): SmsConsentRecord => ({
  sms_consent: granted,
  consent_version: SMS_CONSENT_VERSION,
  consent_source: SMS_CONSENT_SOURCE,
  ...(granted ? { consent_timestamp: now.toISOString(), consent_text: SMS_CONSENT_TEXT } : {}),
});
