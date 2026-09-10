# Quote form backend

How `/quote` actually delivers a lead, and what has to exist in Vercel for it to
work. Everything here is operational: the design rationale for the form itself
lives in `src/components/QuoteForm.astro` and `src/data/quote-actions.ts`.

## The path a submission takes

```
/quote  QuoteForm.astro
  -> POST multipart/form-data
  -> /api/quote            src/pages/api/quote.ts   (the only non-static route)
       validate            src/lib/quote-submission.ts
       store photos        Vercel Blob
       send notification   Resend  ->  loadlogicjr@gmail.com
  -> 303 /quote/thanks     (or JSON, when the form is submitted by fetch)
```

With JavaScript the form is sent by `fetch`, so a failure leaves every value on
screen behind an inline error. Without JavaScript the browser posts natively and
the server answers with a 303 to `/quote/thanks`, or an unstyled failure page
carrying the phone number. There is no path where a submission disappears
silently.

## The site is still static

`output` is Astro's default `'static'`. `src/pages/api/quote.ts` is the only file
in the project that sets `export const prerender = false`, so it is the only
thing that becomes a function. All 34 pages are prerendered exactly as they were
before the adapter was added, with the same URLs, canonicals, and sitemap.

If a build ever reports a number other than 34 prerendered pages, something has
opted out of the static build by accident.

## Environment variables

Set these in **Vercel → Project Settings → Environment Variables**, for
Production, Preview, and Development.

| Variable | Required | Used in | What it is |
|---|---|---|---|
| `RESEND_API_KEY` | **Yes** | `src/pages/api/quote.ts` | Resend API key. Without it the endpoint returns an error to the visitor and logs the full lead, rather than showing a thank-you page for a lead that went nowhere. |
| `BLOB_READ_WRITE_TOKEN` | **Yes, if photos matter** | `src/pages/api/quote.ts` | Vercel Blob read/write token. Created automatically when a Blob store is connected to the project. Without it the lead email still sends, with a note that the photos could not be stored. |
| `QUOTE_FROM_EMAIL` | No | `src/pages/api/quote.ts` | The From address. Defaults to `Load Logic Quotes <onboarding@resend.dev>`, Resend's sandbox sender, which only delivers to the Resend account owner's own address. Set this to an address on a **verified** domain before production. |
| `QUOTE_TO_EMAIL` | No | `src/pages/api/quote.ts` | Where leads go. Defaults to `loadlogicjr@gmail.com`. Only set this to move the destination inbox. |

None of these are read by any page, so none can reach the browser bundle. There
is no `PUBLIC_` variable in this feature and no API key on the client.

### Resend sender domain

Resend only sends from a domain verified in the Resend account. Until
`loadlogicjr.com` is added and its DNS records are published there, leave
`QUOTE_FROM_EMAIL` unset and the sandbox sender is used — useful for a smoke
test, not for production, because it will not deliver to an arbitrary inbox.

Once the domain is verified, set:

```
QUOTE_FROM_EMAIL="Load Logic Quotes <quotes@loadlogicjr.com>"
```

The customer's own address is **never** used as the From address. It is set as
`Reply-To` when they supply one, so replying in the inbox reaches them without
failing SPF or DMARC.

## Photos

Uploads go to Vercel Blob and the notification email carries links, not
attachments — eight phone photos are far past what a mail provider will accept.
Limits, enforced server-side in `src/lib/quote-submission.ts`:

- **8 files**, from `maxFiles` in `quote-actions.ts`
- **10 MB per file**, from `maxFileSizeMb` in the same place
- **25 MB in total**, which also caps what the function has to hold in memory
- **JPEG, PNG, WebP, GIF, HEIC, HEIF, AVIF.** SVG is excluded deliberately: it
  is an image to a file picker and a script container to a browser, and these
  files are served from a public URL

Anything skipped is reported in the email, so the operator knows to ask for it.

Blobs are stored under `quote-photos/<yyyy-mm-dd>/` with a random suffix, and are
public — the URL is unguessable but not access-controlled, which is the right
trade for a photo of a pile of junk in a driveway.

## Spam and abuse

Lightweight and dependency-free, sized for a local lead form:

- **Honeypot** (`company`) — a field no visitor can see or tab into
- **Time trap** (`loadedAt`) — a submission faster than 2.5 seconds was not typed
- **Rate limit** — 5 submissions per client address per 10 minutes, in memory.
  Not distributed, and not pretending to be: it stops one script hammering the
  inbox, which is the realistic threat
- **Origin check** — Astro's `security.checkOrigin`, on by default, rejects
  cross-site POSTs
- **Server-side validation** of every required field and every option value

A submission caught by the honeypot or the time trap gets the ordinary
thank-you answer and is silently dropped. Telling a bot it was caught only tells
whoever wrote it what to change.

No CAPTCHA. If spam ever gets past this, the next step is Vercel BotID, which is
a project setting rather than a change to this code.

## Testing it locally

Both providers honour a base-URL override, so the whole path can be exercised
without sending mail or storing files:

```sh
RESEND_API_KEY=test RESEND_BASE_URL=http://127.0.0.1:4399 \
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_TESTSTORE_test VERCEL_BLOB_API_URL=http://127.0.0.1:4399 \
npm run dev
```

Point those at a local server that answers `POST /emails` and `PUT /` with JSON
and every field, limit, and failure mode is observable.
