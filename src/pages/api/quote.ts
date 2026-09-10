/**
 * /api/quote — the photo quote endpoint.
 *
 * THE ONLY NON-STATIC ROUTE ON THE SITE. `prerender = false` opts this one file
 * out of the static build; every page in src/pages is still prerendered exactly
 * as before. That is the whole reason the Vercel adapter is in astro.config.mjs.
 *
 * WHAT IT DOES
 *   1. rate-limits and screens obvious automation (honeypot + time trap)
 *   2. validates against the same field definitions the form is generated from
 *   3. stores photos in Vercel Blob and keeps the links
 *   4. emails the lead to the operations inbox through Resend
 *   5. answers JSON to the form's fetch, or a 303 to /quote/thanks without JS
 *
 * A LEAD IS NEVER LOST QUIETLY. If Blob is unconfigured or an upload fails, the
 * email still goes out with a note saying what happened. Only a failure to send
 * the email itself is reported back as an error, and the form then shows the
 * call and text fallbacks rather than pretending it worked.
 */
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { put } from '@vercel/blob';
import {
  parseSubmission,
  buildSubject,
  buildText,
  buildHtml,
  PHOTO_LIMITS,
  type EmailContext,
} from '../../lib/quote-submission';

export const prerender = false;

/* ────────────────────────────── Configuration ──────────────────────────────
 *
 * Read at request time from process.env, which is where Vercel puts project
 * environment variables for a running function. Nothing here is ever imported
 * by a page, so no value can reach the browser bundle. */
const env = (name: string): string | undefined => {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
};

/** Where leads go. Deliberately the operations inbox, not the website address. */
const TO_EMAIL = env('QUOTE_TO_EMAIL') ?? 'loadlogicjr@gmail.com';

/**
 * The From address. Resend will only send from a domain verified in the Resend
 * account; `onboarding@resend.dev` is their shared sandbox sender, which works
 * without a domain but can only deliver to the Resend account owner's own
 * address. Set QUOTE_FROM_EMAIL to a verified address before production.
 */
const FROM_EMAIL = env('QUOTE_FROM_EMAIL') ?? 'Load Logic Quotes <onboarding@resend.dev>';

/* ─────────────────────────────── Rate limiting ───────────────────────────────
 *
 * Deliberately small: an in-memory counter per client address, which on Fluid
 * Compute survives across the requests a single instance handles. It is not a
 * distributed limiter and does not pretend to be — it exists to stop one script
 * hammering the inbox, which is the realistic threat to a local lead form. A
 * real store would be a dependency and an operational surface for no gain here. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

const rateLimited = (key: string): boolean => {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 500) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return recent.length > MAX_PER_WINDOW;
};

/* ──────────────────────────────── Responses ──────────────────────────────── */

const wantsJson = (request: Request): boolean =>
  (request.headers.get('accept') ?? '').includes('application/json');

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const thanksUrl = (request: Request) => new URL('/quote/thanks', request.url).toString();

/**
 * The no-JavaScript failure page. Not a route and not in the sitemap — it is the
 * body of a failed POST, reachable only by submitting the form with scripting
 * off. It exists so that path fails visibly, with the phone number, instead of
 * showing a blank error.
 */
const htmlError = (messages: string[], status: number) =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Request not sent</title></head>
<body style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:38rem;margin:3rem auto;padding:0 1.25rem;color:#1c1c19;line-height:1.5">
<h1 style="font-size:1.5rem">Your request was not sent</h1>
<ul>${messages.map((m) => `<li>${m}</li>`).join('')}</ul>
<p><a href="/quote">Go back to the form</a> and try again, or call
<a href="tel:+14806500905">(480) 650-0905</a> and we will take the details over the phone.</p>
</body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } },
  );

/* ───────────────────────────────── Handler ───────────────────────────────── */

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const client = (() => {
    try {
      return clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
    } catch {
      return request.headers.get('x-forwarded-for') ?? 'unknown';
    }
  })();

  if (rateLimited(client)) {
    const message = 'Too many requests from this connection. Give it a few minutes, or call us and we will take the details directly.';
    return wantsJson(request) ? json({ ok: false, message }, 429) : htmlError([message], 429);
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded')) {
    return json({ ok: false, message: 'Send the form as form data.' }, 415);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    const message = `We could not read the upload. Photos need to be under ${PHOTO_LIMITS.maxFileSizeMb} MB each and ${PHOTO_LIMITS.maxTotalMb} MB in total.`;
    return wantsJson(request) ? json({ ok: false, message }, 400) : htmlError([message], 400);
  }

  const { values, fieldErrors, photos, photoErrors, looksAutomated } = parseSubmission(form);

  // Automated submissions get the ordinary success answer and nothing is sent.
  // Telling a bot it was caught only teaches whoever wrote it what to change.
  if (looksAutomated) {
    return wantsJson(request)
      ? json({ ok: true, redirect: '/quote/thanks' })
      : Response.redirect(thanksUrl(request), 303);
  }

  if (Object.keys(fieldErrors).length > 0) {
    return wantsJson(request)
      ? json({ ok: false, message: 'Check the highlighted fields and send it again.', fieldErrors }, 422)
      : htmlError(Object.values(fieldErrors), 422);
  }

  // ─── Photos to Blob ───
  //
  // Links, not attachments: eight phone photos are tens of megabytes, which is
  // past what any mail provider will accept, and links keep the notification
  // small and forwardable.
  const photoUrls: { name: string; url: string }[] = [];
  const photoNotes: string[] = [...photoErrors];
  const blobToken = env('BLOB_READ_WRITE_TOKEN');

  if (photos.length > 0 && !blobToken) {
    photoNotes.push(
      `${photos.length} photo(s) were sent but photo storage is not configured (BLOB_READ_WRITE_TOKEN is missing), so they could not be saved. Ask the customer to text them.`,
    );
  }

  if (photos.length > 0 && blobToken) {
    const stamp = new Date().toISOString().slice(0, 10);
    const folder = `quote-photos/${stamp}`;
    for (const file of photos) {
      const safeName = (file.name || 'photo.jpg').replace(/[^\w.\- ]+/g, '_').slice(-80);
      try {
        const blob = await put(`${folder}/${safeName}`, file, {
          access: 'public',
          addRandomSuffix: true,
          contentType: file.type,
          token: blobToken,
        });
        photoUrls.push({ name: file.name || safeName, url: blob.url });
      } catch (error) {
        console.error('[quote] blob upload failed', error);
        photoNotes.push(`"${file.name}" could not be stored. Ask the customer to text it.`);
      }
    }
  }

  // ─── Email ───
  const apiKey = env('RESEND_API_KEY');
  const ctx: EmailContext = {
    photoUrls,
    photoNotes,
    sourcePage: request.headers.get('referer') ?? undefined,
    submittedAt: new Date(),
  };

  if (!apiKey) {
    // Nothing can be delivered, so say so rather than showing a thank-you page
    // for a lead that went nowhere. The submitted values are logged so the lead
    // is recoverable from the function logs.
    console.error('[quote] RESEND_API_KEY is not set. Submission not delivered:', buildText(values, ctx));
    const message = 'We could not send your request just now. Please call or text us and we will take the details directly.';
    return wantsJson(request) ? json({ ok: false, message }, 500) : htmlError([message], 500);
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      // The customer's address is never the From address — that is spoofing and
      // it fails SPF and DMARC. Reply-To is the supported way to make "Reply"
      // in the inbox go to the customer.
      ...(values.email ? { replyTo: values.email } : {}),
      subject: buildSubject(values),
      text: buildText(values, ctx),
      html: buildHtml(values, ctx),
    });

    if (error) throw new Error(`${error.name}: ${error.message}`);
  } catch (error) {
    console.error('[quote] send failed', error);
    console.error('[quote] undelivered submission:', buildText(values, ctx));
    const message = 'We could not send your request just now. Please call or text us and we will take the details directly.';
    return wantsJson(request) ? json({ ok: false, message }, 502) : htmlError([message], 502);
  }

  return wantsJson(request)
    ? json({ ok: true, redirect: '/quote/thanks' })
    : Response.redirect(thanksUrl(request), 303);
};

/** A browser that lands here directly belongs on the form, not on an error. */
export const GET: APIRoute = ({ request }) => Response.redirect(new URL('/quote', request.url).toString(), 303);
