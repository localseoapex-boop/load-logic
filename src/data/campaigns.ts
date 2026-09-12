/**
 * campaigns.ts — paid and offline campaigns, and the landing pages they point at.
 *
 * A campaign page is NOT part of the site. It is `noindex, nofollow`, excluded
 * from the sitemap, and linked from nothing in the navigation, the footer, or
 * any content page. It exists to receive traffic that was sent to it on purpose
 * (a postcard QR code, an ad) and to turn that traffic into a quote request.
 *
 * WHY THIS IS DATA. The offer, the code, and the terms appear on the page, in the
 * lead email, and in the attribution the form carries. Declaring them once means
 * the postcard's promise, the page, and what the operator sees in the inbox
 * cannot say three different things.
 *
 * THE `id` IS A CONTRACT. It is sent with the quote form as `campaign`, and the
 * server only accepts ids that exist here, so a lead can never arrive claiming a
 * promo code nobody issued. Changing an id after the postcards go out would
 * break attribution for every lead still to come from that mailing.
 */

export interface Campaign {
  /** Sent with the lead as `campaign`. Stable for the life of the campaign. */
  id: string;
  /** The landing page path. Must also be excluded from the sitemap. */
  path: string;
  /** What the customer quotes when booking. */
  promoCode: string;
  /** The offer, as printed. */
  offer: string;
  /** The offer in its shortest form, for tight spaces. */
  offerShort: string;
  /** Printed with the offer. Keep in step with the postcard. */
  terms: string;
  /** Mail routes this campaign targets. Descriptive only: any ZIP can respond. */
  zips: string[];
}

export const campaigns: Campaign[] = [
  {
    id: 'direct-mail-mesa25',
    path: '/mesa25',
    promoCode: 'MESA25',
    offer: '$25 off your first junk removal pickup',
    offerShort: '$25 off',
    terms: 'One offer per household. Valid on qualifying junk-removal services. Mention code MESA25 when booking.',
    zips: ['85205', '85206', '85207', '85208', '85209'],
  },
];

export const getCampaign = (id: string): Campaign | undefined => campaigns.find((c) => c.id === id);
