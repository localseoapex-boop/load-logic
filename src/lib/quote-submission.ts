/**
 * quote-submission.ts — parsing, validation, and formatting for the photo quote.
 *
 * The route (src/pages/api/quote.ts) owns transport: Blob uploads, Resend, HTTP
 * responses. Everything that is really about *the request itself* lives here so
 * it stays readable and can be reasoned about without the plumbing.
 *
 * SINGLE SOURCE OF TRUTH. Field names, labels, and the photo limits are read
 * from `quote-actions.ts`, the same module the form is generated from. Option
 * values are checked against `services.ts`, `pricing.ts`, and the option sets in
 * `quote-actions.ts`. If a field is added, removed, or renamed there, the server
 * validation and the notification email follow it automatically — they cannot
 * drift from the form the way a hand-written backend would.
 */
import { primaryQuoteAction, timingOptions, contactPreferenceOptions } from '../data/quote-actions';
import { services } from '../data/services';
import { loadScale } from '../data/pricing';
import { getCampaign, type Campaign } from '../data/campaigns';

/* ─────────────────────────── Anti-spam field names ───────────────────────────
 *
 * Neither is a real question and neither is shown to a person. The honeypot is
 * a field a human never sees and therefore never fills in; the timestamp is
 * written by the form's own script on load, so a submission that arrives in
 * well under two seconds did not come from someone typing. Both are cheap,
 * invisible to real visitors, and need no third-party service or CAPTCHA. */
/* ──────────────────────────── Attribution fields ────────────────────────────
 *
 * Hidden, filled by the form's own script from the landing URL and carried in
 * sessionStorage, so a visitor who arrives from a postcard QR code and browses
 * before asking for a quote is still attributed to it. None of them is a
 * question, none is required, and a lead is never rejected over one: a value
 * that fails the checks below is dropped and the lead goes through without it.
 *
 * `campaign` is set by the page that embeds the form (see campaigns.ts) and is
 * only accepted when it names a real campaign. The UTM fields are free text from
 * a URL, so they are trimmed, capped, and reduced to printable ASCII. */
export const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
export const CAMPAIGN_FIELD = 'campaign';
const MAX_UTM_LENGTH = 120;

export const HONEYPOT_FIELD = 'company';
export const TIMESTAMP_FIELD = 'loadedAt';
/**
 * A real person cannot fill this form in faster than this.
 *
 * Kept deliberately low. Anything under it is discarded SILENTLY, with a
 * thank-you page, so a false positive is a lost lead nobody ever hears about.
 * Browser autofill and the ZIP/service prefill can take a genuine visitor from
 * page load to submit in two or three seconds; 1.5 still stops a script that
 * posts on load, which is what this is for. Do not raise it without a reason.
 */
export const MIN_FILL_MS = 1500;

const action = primaryQuoteAction();
const photoInput = action.inputs.find((i) => i.name === 'photos');

/** Photo limits, read from the same definition the form renders from. */
export const PHOTO_LIMITS = {
  maxFiles: photoInput?.maxFiles ?? 8,
  maxFileSizeMb: photoInput?.maxFileSizeMb ?? 10,
  /** Total across all files. Guards the function's memory, not just the inbox. */
  maxTotalMb: 25,
};

/**
 * Accepted image types. `image/*` in the markup is the browser-side filter; the
 * server needs an explicit list. SVG is deliberately excluded: it is an image to
 * a file picker but a script container to a browser, and these files end up on a
 * public URL.
 */
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/avif',
]);

/** Length caps. Generous for a person, ungenerous for a script. */
const MAX_LENGTHS: Record<string, number> = {
  name: 120,
  phone: 40,
  zip: 5,
  notes: 4000,
  // Retired inputs, still accepted (see `retired` in quote-actions.ts).
  email: 200,
  address: 250,
  access: 4000,
};

export interface ParsedSubmission {
  /** Trimmed text values, keyed by form field name. Empty fields are dropped. */
  values: Record<string, string>;
  /** Field name -> message, in the same shape the client renders inline. */
  fieldErrors: Record<string, string>;
  /** Files that passed type, count, and size checks. */
  photos: File[];
  /** Problems with the upload that are worth telling the visitor about. */
  photoErrors: string[];
  /** True when the honeypot or the time trap fired. */
  looksAutomated: boolean;
  /** Where the lead came from, when that is known. Never affects acceptance. */
  attribution: Attribution;
}

export interface Attribution {
  campaign?: Campaign;
  utm: Partial<Record<(typeof UTM_FIELDS)[number], string>>;
}

/** Reads the hidden attribution fields. Anything malformed is simply left out. */
const parseAttribution = (form: FormData): Attribution => {
  const utm: Attribution['utm'] = {};
  for (const name of UTM_FIELDS) {
    const raw = form.get(name);
    if (typeof raw !== 'string') continue;
    const clean = raw.replace(/[^\x20-\x7E]/g, '').trim().slice(0, MAX_UTM_LENGTH);
    if (clean) utm[name] = clean;
  }
  const id = form.get(CAMPAIGN_FIELD);
  return { campaign: typeof id === 'string' ? getCampaign(id.trim()) : undefined, utm };
};

const str = (form: FormData, name: string): string => {
  const raw = form.get(name);
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  const cap = MAX_LENGTHS[name];
  return cap ? trimmed.slice(0, cap) : trimmed.slice(0, 1000);
};

const optionValues = (from?: string): string[] => {
  if (from === 'services') return services.map((s) => s.slug);
  if (from === 'loadSizes') return loadScale().map((l) => l.slug);
  if (from === 'timing') return timingOptions.map((o) => o.value);
  if (from === 'contactPreference') return contactPreferenceOptions.map((o) => o.value);
  return [];
};

/** The human label for a stored option value, for the email. */
export const optionLabel = (from: string | undefined, value: string): string => {
  if (!value) return '';
  if (from === 'services') return services.find((s) => s.slug === value)?.name ?? value;
  if (from === 'loadSizes') return loadScale().find((l) => l.slug === value)?.name ?? value;
  if (from === 'timing') return timingOptions.find((o) => o.value === value)?.label ?? value;
  if (from === 'contactPreference')
    return contactPreferenceOptions.find((o) => o.value === value)?.label ?? value;
  return value;
};

/**
 * Validate the request. The rules mirror the inline checks in QuoteForm.astro
 * exactly — the client copy is for speed, this one is the one that counts.
 */
export const parseSubmission = (form: FormData): ParsedSubmission => {
  const values: Record<string, string> = {};
  const fieldErrors: Record<string, string> = {};

  for (const input of action.inputs) {
    if (input.kind === 'file') continue;
    const value = str(form, input.name);
    if (value) values[input.name] = value;
  }

  // ─── Required fields ───
  if (!values.name) {
    fieldErrors.name = 'Enter your name.';
  }
  if (!/\d{7,}/.test((values.phone ?? '').replace(/\D/g, ''))) {
    fieldErrors.phone = 'Enter a phone number we can reach you at.';
  }
  if (!/^\d{5}$/.test(values.zip ?? '')) {
    fieldErrors.zip = 'Enter a 5-digit ZIP code.';
  }
  if (!values.service) {
    fieldErrors.service = 'Choose the closest match.';
  }

  // ─── Known-value fields ───
  for (const input of action.inputs) {
    if (!input.optionsFrom) continue;
    const value = values[input.name];
    if (!value) continue;
    if (!optionValues(input.optionsFrom).includes(value)) {
      // Not a choice the form offers, so it was not made in the form.
      delete values[input.name];
      if (input.required) fieldErrors[input.name] = 'Pick one of the listed options.';
    }
  }

  // Email is retired, so it can only arrive from an older copy of the form. A
  // malformed one is dropped rather than rejected: the lead is worth more than
  // the field, and it must never become a bad Reply-To.
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) {
    delete values.email;
  }

  // ─── Photos ───
  const photos: File[] = [];
  const photoErrors: string[] = [];
  const uploaded = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);

  let total = 0;
  for (const file of uploaded) {
    if (photos.length >= PHOTO_LIMITS.maxFiles) {
      photoErrors.push(`Only the first ${PHOTO_LIMITS.maxFiles} photos were kept.`);
      break;
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase())) {
      photoErrors.push(`"${file.name}" was skipped: photos need to be JPEG, PNG, WebP, GIF, or HEIC.`);
      continue;
    }
    if (file.size > PHOTO_LIMITS.maxFileSizeMb * 1024 * 1024) {
      photoErrors.push(`"${file.name}" was skipped: each photo has to be under ${PHOTO_LIMITS.maxFileSizeMb} MB.`);
      continue;
    }
    if (total + file.size > PHOTO_LIMITS.maxTotalMb * 1024 * 1024) {
      photoErrors.push(`Photos over ${PHOTO_LIMITS.maxTotalMb} MB in total were skipped.`);
      break;
    }
    total += file.size;
    photos.push(file);
  }

  // ─── Automation checks ───
  const honeypot = (form.get(HONEYPOT_FIELD) ?? '').toString().trim();
  const loadedAt = Number(form.get(TIMESTAMP_FIELD) ?? 0);
  const tooFast = Number.isFinite(loadedAt) && loadedAt > 0 && Date.now() - loadedAt < MIN_FILL_MS;

  return {
    values,
    fieldErrors,
    photos,
    photoErrors,
    looksAutomated: Boolean(honeypot) || tooFast,
    attribution: parseAttribution(form),
  };
};

export interface EmailContext {
  /** Signed view links to the stored photos, in upload order. */
  photoUrls: { name: string; url: string }[];
  /** When those links stop working. The photos themselves stay in the store. */
  photoLinksExpire?: Date;
  /** Anything that stopped a photo being stored, for the operator to see. */
  photoNotes: string[];
  /** The page the form was submitted from, from the Referer header. */
  sourcePage?: string;
  submittedAt: Date;
  attribution?: Attribution;
}

/** The promo line an operator needs first: which code, and what it is worth. */
const promoLine = (ctx: EmailContext): string =>
  ctx.attribution?.campaign
    ? `PROMO ${ctx.attribution.campaign.promoCode}: ${ctx.attribution.campaign.offer}`
    : '';

/** Campaign id and UTM values, in a fixed order, for the footer of the email. */
const attributionRows = (ctx: EmailContext): { label: string; value: string }[] => {
  const a = ctx.attribution;
  if (!a) return [];
  return [
    ...(a.campaign ? [{ label: 'campaign', value: a.campaign.id }] : []),
    ...UTM_FIELDS.filter((name) => a.utm[name]).map((name) => ({ label: name, value: a.utm[name] as string })),
  ];
};

/** Ordered label/value pairs, following the order the form asks in. */
const rows = (values: Record<string, string>): { label: string; value: string }[] =>
  action.inputs
    .filter((input) => input.kind !== 'file')
    .map((input) => ({
      label: input.label,
      value: input.optionsFrom ? optionLabel(input.optionsFrom, values[input.name] ?? '') : values[input.name] ?? '',
    }))
    .filter((row) => row.value);

export const buildSubject = (values: Record<string, string>): string =>
  `New Load Logic Quote Request — ${values.name || values.phone || 'no name given'}`;

export const buildText = (values: Record<string, string>, ctx: EmailContext): string => {
  const lines: string[] = ['NEW QUOTE REQUEST', ''];
  if (promoLine(ctx)) lines.push(promoLine(ctx), '');

  for (const row of rows(values)) lines.push(`${row.label}: ${row.value}`);

  lines.push('', `Photos: ${ctx.photoUrls.length}`);
  for (const photo of ctx.photoUrls) lines.push(`  ${photo.name} — ${photo.url}`);
  for (const note of ctx.photoNotes) lines.push(`  NOTE: ${note}`);
  if (expiryNote(ctx)) lines.push(`  ${expiryNote(ctx)}`);

  lines.push('', '---');
  lines.push(
    `Submitted: ${ctx.submittedAt.toLocaleString('en-US', { timeZone: 'America/Phoenix' })} (Phoenix)`,
  );
  if (ctx.sourcePage) lines.push(`Submitted from: ${ctx.sourcePage}`);
  if (values.email) lines.push(`Reply to this email to reach ${values.email}.`);

  const tracking = attributionRows(ctx);
  if (tracking.length) {
    lines.push('', 'Attribution:');
    for (const row of tracking) lines.push(`  ${row.label}: ${row.value}`);
  }

  return lines.join('\n');
};

const expiryNote = (ctx: EmailContext): string =>
  ctx.photoLinksExpire && ctx.photoUrls.length
    ? `Photo links work until ${ctx.photoLinksExpire.toLocaleDateString('en-US', {
        timeZone: 'America/Phoenix',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}. After that the photos are still in the Vercel Blob store.`
    : '';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const buildHtml = (values: Record<string, string>, ctx: EmailContext): string => {
  const cellLabel =
    'padding:6px 12px 6px 0;vertical-align:top;color:#5b5b57;white-space:nowrap;font-size:13px';
  const cellValue = 'padding:6px 0;vertical-align:top;font-weight:600;font-size:15px';

  const body = rows(values)
    .map(
      (row) =>
        `<tr><td style="${cellLabel}">${escapeHtml(row.label)}</td><td style="${cellValue}">${escapeHtml(
          row.value,
        ).replace(/\n/g, '<br>')}</td></tr>`,
    )
    .join('');

  const photos = ctx.photoUrls.length
    ? `<ul style="padding-left:18px;margin:8px 0">${ctx.photoUrls
        .map(
          (p) =>
            `<li style="margin-bottom:4px"><a href="${escapeHtml(p.url)}">${escapeHtml(p.name)}</a></li>`,
        )
        .join('')}</ul>`
    : '<p style="margin:8px 0;color:#5b5b57">None attached.</p>';

  const notes = ctx.photoNotes.length
    ? `<p style="margin:8px 0;color:#a4442c">${ctx.photoNotes.map(escapeHtml).join('<br>')}</p>`
    : '';

  const expiry = expiryNote(ctx)
    ? `<p style="margin:8px 0;color:#5b5b57;font-size:12px">${escapeHtml(expiryNote(ctx))}</p>`
    : '';

  const tel = (values.phone ?? '').replace(/[^\d+]/g, '');

  const promo = promoLine(ctx)
    ? `<p style="margin:0 0 20px;padding:10px 14px;background:#fff4e5;border-left:4px solid #ff6500;font-weight:700;font-size:15px">${escapeHtml(promoLine(ctx))}</p>`
    : '';

  const tracking = attributionRows(ctx);
  const attribution = tracking.length
    ? `<p style="font-size:12px;color:#5b5b57;margin:12px 0 0">Attribution: ${tracking
        .map((row) => `${escapeHtml(row.label)}=<strong>${escapeHtml(row.value)}</strong>`)
        .join(' · ')}</p>`
    : '';

  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1c1c19;max-width:640px">
  <h1 style="font-size:20px;margin:0 0 4px">New quote request</h1>
  <p style="margin:0 0 20px;color:#5b5b57;font-size:13px">${escapeHtml(
    ctx.submittedAt.toLocaleString('en-US', { timeZone: 'America/Phoenix' }),
  )} (Phoenix)</p>
  ${promo}
  ${tel ? `<p style="margin:0 0 20px"><a href="tel:${escapeHtml(tel)}" style="display:inline-block;padding:10px 18px;background:#1c1c19;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">Call ${escapeHtml(values.phone ?? '')}</a></p>` : ''}
  <table style="border-collapse:collapse;width:100%">${body}</table>
  <h2 style="font-size:15px;margin:24px 0 0">Photos (${ctx.photoUrls.length})</h2>
  ${photos}
  ${notes}
  ${expiry}
  <hr style="border:0;border-top:1px solid #e2e0da;margin:24px 0">
  <p style="font-size:12px;color:#5b5b57;margin:0">
    ${ctx.sourcePage ? `Submitted from ${escapeHtml(ctx.sourcePage)}<br>` : ''}
    ${values.email ? `Reply to this email to reach ${escapeHtml(values.email)}.` : 'Replying to this email does not reach the customer. Call or text the number above.'}
  </p>
  ${attribution}
</div>`;
};
