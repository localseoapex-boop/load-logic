import type { Attribution } from './quote-submission';

const env = (name: string): string | undefined => {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
};

export type BusinessAgentWebsiteLead = {
  submissionId: string;
  values: Record<string, string>;
  attribution: Attribution;
  sourcePage?: string;
  submittedAt: Date;
  photoCount: number;
};

const clean = (value: string | undefined, max: number) =>
  value?.trim() ? value.trim().slice(0, max) : undefined;

export async function recordBusinessAgentWebsiteLead(input: BusinessAgentWebsiteLead) {
  const endpoint = env('BUSINESS_AGENT_INTAKE_URL');
  const secret = env('BUSINESS_AGENT_INTAKE_SECRET');
  if (!endpoint || !secret) {
    return { configured: false, recorded: false };
  }

  const values = input.values;
  const snippet = [
    'Website quote form submission.',
    values.service ? `Service: ${values.service}.` : null,
    values.zip ? `ZIP: ${values.zip}.` : null,
    values.notes ? `Notes: ${values.notes}` : null,
    values.address ? `Address: ${values.address}.` : null,
    values.timing ? `Timing: ${values.timing}.` : null,
    values.access ? `Access: ${values.access}.` : null,
    input.photoCount > 0 ? `Photos submitted: ${input.photoCount}.` : null,
  ].filter(Boolean).join('\n');

  const sourceMetadata = {
    submissionId: input.submissionId,
    sourcePage: clean(input.sourcePage, 500) ?? null,
    service: clean(values.service, 120) ?? null,
    zip: clean(values.zip, 10) ?? null,
    campaign: input.attribution.campaign?.id ?? null,
    promoCode: input.attribution.campaign?.promoCode ?? null,
    utm_source: input.attribution.utm.utm_source ?? null,
    utm_medium: input.attribution.utm.utm_medium ?? null,
    utm_campaign: input.attribution.utm.utm_campaign ?? null,
    utm_content: input.attribution.utm.utm_content ?? null,
    utm_term: input.attribution.utm.utm_term ?? null,
    photoCount: input.photoCount,
    environment: process.env.VERCEL_ENV ?? null,
    isTest: process.env.VERCEL_ENV !== 'production',
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secret}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      source: 'website_form',
      messageId: input.submissionId,
      name: clean(values.name, 120) ?? null,
      phone: clean(values.phone, 40) ?? null,
      email: clean(values.email, 200) ?? null,
      subject: `Website quote request — ${clean(values.name, 120) ?? clean(values.phone, 40) ?? 'customer'}`,
      snippet,
      receivedAt: input.submittedAt.toISOString(),
      attachmentCount: Math.max(0, Math.min(10, input.photoCount)),
      sourceMetadata,
    }),
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Business Agent intake returned ${response.status}: ${text.slice(0, 300)}`);
  }

  return { configured: true, recorded: true };
}
