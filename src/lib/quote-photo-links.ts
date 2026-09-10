/**
 * quote-photo-links.ts — signed links to private quote photos.
 *
 * WHY THIS EXISTS. The Blob store is private, so a raw blob URL answers 403 to
 * anyone without the store's token — including the person reading the lead in
 * Gmail. The notification email therefore links to /api/quote-photo instead,
 * with a signature that says "the server issued this link for exactly this
 * photo, until exactly this time". The route checks the signature, reads the
 * photo with the server-side token, and streams it back. The token itself never
 * leaves the server and nothing in the store is ever made public.
 *
 * WHAT A LINK CAN DO. Open one photo, for a limited time. It cannot be edited to
 * point at a different photo (the pathname is signed), extended (the expiry is
 * signed), or used to reach anything outside `quote-photos/` (checked before the
 * signature, and again by the prefix on every upload). A link is a bearer
 * credential, like any emailed download link: whoever holds it can view that one
 * photo until it expires. That is the right trade for a photo of a garage, and
 * the inbox is the security boundary.
 *
 * THE KEY. Derived from BLOB_READ_WRITE_TOKEN with HMAC, so there is no second
 * secret to provision or rotate. The derivation is one-way: a link reveals
 * nothing about the token. Rotating the Blob token invalidates every outstanding
 * photo link, which is the correct behavior if the token was ever exposed.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

/** Every quote photo lives under this prefix. The view route serves nothing else. */
export const PHOTO_PREFIX = 'quote-photos/';

/** How long an emailed photo link works. Leads are worked in days, not months. */
export const PHOTO_LINK_TTL_DAYS = 30;

export const PHOTO_ROUTE = '/api/quote-photo';

const KEY_LABEL = 'load-logic/quote-photo-link/v1';

const signingKey = (secret: string): Buffer => createHmac('sha256', secret).update(KEY_LABEL).digest();

const signature = (secret: string, pathname: string, expires: number): string =>
  createHmac('sha256', signingKey(secret)).update(`${pathname}\n${expires}`).digest('base64url');

/** Pathnames the route will consider at all, before any cryptography. */
export const isPhotoPathname = (pathname: string): boolean =>
  pathname.startsWith(PHOTO_PREFIX) &&
  pathname.length <= 300 &&
  !pathname.includes('..') &&
  !pathname.includes('//') &&
  /^[\w./\- ]+$/.test(pathname);

/** An absolute, signed link to one photo. */
export const signPhotoLink = (
  secret: string,
  origin: string,
  pathname: string,
  now = Date.now(),
): { url: string; expiresAt: Date } => {
  const expires = Math.floor(now / 1000) + PHOTO_LINK_TTL_DAYS * 24 * 60 * 60;
  const url = new URL(PHOTO_ROUTE, origin);
  url.searchParams.set('p', pathname);
  url.searchParams.set('e', String(expires));
  url.searchParams.set('s', signature(secret, pathname, expires));
  return { url: url.toString(), expiresAt: new Date(expires * 1000) };
};

export type PhotoLinkCheck =
  | { ok: true; pathname: string }
  | { ok: false; reason: 'invalid' | 'expired' };

/**
 * Checks a link's query string. Expiry is only reported for a link whose
 * signature is valid, so a guess learns nothing beyond "invalid".
 */
export const verifyPhotoLink = (secret: string, params: URLSearchParams, now = Date.now()): PhotoLinkCheck => {
  const pathname = params.get('p') ?? '';
  const expiresRaw = params.get('e') ?? '';
  const given = params.get('s') ?? '';

  if (!isPhotoPathname(pathname) || !/^\d{1,12}$/.test(expiresRaw) || !/^[\w-]{43}$/.test(given)) {
    return { ok: false, reason: 'invalid' };
  }

  const expires = Number(expiresRaw);
  const expected = Buffer.from(signature(secret, pathname, expires));
  const actual = Buffer.from(given);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { ok: false, reason: 'invalid' };
  }

  if (Math.floor(now / 1000) > expires) return { ok: false, reason: 'expired' };

  return { ok: true, pathname };
};
