/**
 * /api/quote-photo — opens one private quote photo from a signed email link.
 *
 * The Blob store is private, so the notification email cannot link to the blob
 * itself. It links here instead; see src/lib/quote-photo-links.ts for what a
 * link encodes and why it is safe to email.
 *
 * Deliberately minimal: GET only, no page, no HTML, nothing to crawl. It answers
 * with the image or with a one-line plain-text refusal, and every response
 * carries `X-Robots-Tag: noindex` and `Cache-Control: private, no-store`, so a
 * customer photo is never indexed and never held in a shared cache.
 */
import type { APIRoute } from 'astro';
import { get } from '@vercel/blob';
import { verifyPhotoLink } from '../../lib/quote-photo-links';

export const prerender = false;

const COMMON_HEADERS = {
  'cache-control': 'private, no-store',
  'x-robots-tag': 'noindex, nofollow, noarchive',
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
};

const refuse = (status: number, message: string) =>
  new Response(message, { status, headers: { ...COMMON_HEADERS, 'content-type': 'text/plain; charset=utf-8' } });

export const GET: APIRoute = async ({ url }) => {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) return refuse(503, 'Photo storage is not configured.');

  const check = verifyPhotoLink(token, url.searchParams);
  if (!check.ok) {
    return check.reason === 'expired'
      ? refuse(410, 'This photo link has expired. The photo is still in the Vercel Blob store.')
      : refuse(404, 'Not found.');
  }

  let result;
  try {
    result = await get(check.pathname, { access: 'private', token });
  } catch (error) {
    console.error('[quote-photo] blob read failed', error);
    return refuse(502, 'The photo could not be loaded. Try again shortly.');
  }

  if (!result || result.statusCode !== 200 || !result.stream) return refuse(404, 'Not found.');

  // Uploads are validated as images before they are stored, so anything else
  // here did not come from the quote form and is not served.
  const contentType = result.blob.contentType ?? '';
  if (!contentType.startsWith('image/') || contentType.includes('svg')) return refuse(404, 'Not found.');

  const filename = check.pathname.split('/').pop() ?? 'photo';

  return new Response(result.stream, {
    status: 200,
    headers: {
      ...COMMON_HEADERS,
      'content-type': contentType,
      ...(result.blob.size ? { 'content-length': String(result.blob.size) } : {}),
      'content-disposition': `inline; filename="${filename.replace(/"/g, '')}"`,
      // No Content-Security-Policy on purpose. The browser shows an image in
      // its own viewer document, which uses inline styles and script; a
      // `default-src 'none'; sandbox` policy breaks that viewer and floods the
      // console. The protection that matters is already here: only raster
      // image types are ever served (SVG is refused at upload and again above)
      // and `nosniff` stops the browser from reinterpreting one as a document.
    },
  });
};
