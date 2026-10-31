/**
 * test-sms-consent.mjs — the consent record and the quote submission around it.
 *
 * WHY A SCRIPT AND NOT A TEST FRAMEWORK. The repo has no runner and no dev
 * dependencies, and A2P compliance is not a good reason to introduce either.
 * `node:test` ships with Node, and Vite already comes with Astro, so this runs
 * the real TypeScript modules with the project's own resolution rules and adds
 * nothing to package.json.
 *
 * WHAT IS BEING PROTECTED. The claims the Privacy Policy and the carrier
 * registration make: that a quote works without consent, that consent is only
 * recorded when it was actually given, that the timestamp comes from the
 * server, and that the version and source travel with it. The existing
 * submission behaviour is asserted alongside it, because the compliance work
 * must not be what breaks a lead.
 *
 *   node --test scripts/test-sms-consent.mjs
 */
import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

let vite;
let submission;
let consent;

before(async () => {
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  });
  submission = await vite.ssrLoadModule('/src/lib/quote-submission.ts');
  consent = await vite.ssrLoadModule('/src/data/sms-consent.ts');
});

after(async () => {
  await vite?.close();
});

/** A form body that passes every required check, so only consent varies. */
const validForm = (extra = {}) => {
  const form = new FormData();
  form.set('name', 'Pat Tester');
  form.set('phone', '(480) 555-0101');
  form.set('zip', '85205');
  form.set('service', 'junk-removal');
  for (const [key, value] of Object.entries(extra)) form.set(key, value);
  return form;
};

describe('a quote without SMS consent', () => {
  test('submits, and is recorded as an explicit no', () => {
    const parsed = submission.parseSubmission(validForm());

    assert.deepEqual(parsed.fieldErrors, {}, 'no consent must never be a field error');
    assert.equal(parsed.smsConsent, false);

    const record = consent.buildSmsConsentRecord(parsed.smsConsent, new Date());
    assert.equal(record.sms_consent, false, 'declining is false, not missing');
    assert.equal(record.consent_version, 'sms_quote_transactional_v1');
    assert.equal(record.consent_source, 'website_quote_form');
    assert.equal(record.consent_timestamp, undefined, 'no timestamp without consent');
    assert.equal(record.consent_text, undefined, 'no disclosure stored without consent');
  });

  test('an unticked box sends nothing at all', () => {
    // A browser omits an unchecked checkbox entirely. An absent field is a no.
    const form = validForm();
    assert.equal(form.get('smsConsent'), null);
    assert.equal(submission.parseSubmission(form).smsConsent, false);
  });
});

describe('a quote with SMS consent', () => {
  test('preserves the answer, version, source and disclosure', () => {
    const form = validForm({ [consent.SMS_CONSENT_FIELD]: consent.SMS_CONSENT_VALUE });
    const parsed = submission.parseSubmission(form);
    assert.equal(parsed.smsConsent, true);
    assert.deepEqual(parsed.fieldErrors, {});

    const record = consent.buildSmsConsentRecord(parsed.smsConsent, new Date());
    assert.equal(record.sms_consent, true);
    assert.equal(record.consent_version, consent.SMS_CONSENT_VERSION);
    assert.equal(record.consent_source, consent.SMS_CONSENT_SOURCE);
    assert.equal(
      record.consent_text,
      consent.SMS_CONSENT_TEXT,
      'the stored wording must be the wording shown',
    );
  });

  test('the stored disclosure is the sentence the form renders', () => {
    const rendered = consent.SMS_CONSENT_SEGMENTS.map((s) => s.text).join('');
    assert.equal(rendered, consent.SMS_CONSENT_TEXT);
    for (const phrase of [
      'I agree to receive text messages from Load Logic',
      'Message frequency varies',
      'Message and data rates may apply',
      'Reply STOP to opt out or HELP for help',
      'Consent is not a condition of purchase',
    ]) {
      assert.ok(consent.SMS_CONSENT_TEXT.includes(phrase), `disclosure must state: ${phrase}`);
    }
    const links = consent.SMS_CONSENT_SEGMENTS.filter((s) => s.href).map((s) => s.href);
    assert.deepEqual(links, ['/privacy', '/terms']);
  });

  test('only the exact opt-in value counts as consent', () => {
    for (const value of ['on', 'true', '1', 'YES', '', 'no']) {
      const parsed = submission.parseSubmission(
        validForm({ [consent.SMS_CONSENT_FIELD]: value }),
      );
      assert.equal(parsed.smsConsent, false, `"${value}" must not be read as consent`);
    }
  });
});

describe('the consent timestamp', () => {
  test('comes from the server clock, never the browser', () => {
    const serverNow = new Date('2026-10-30T18:00:00.000Z');
    const record = consent.buildSmsConsentRecord(true, serverNow);
    assert.equal(record.consent_timestamp, '2026-10-30T18:00:00.000Z');
  });

  test('a client-supplied timestamp is ignored entirely', () => {
    const lie = '1999-01-01T00:00:00.000Z';
    const form = validForm({
      [consent.SMS_CONSENT_FIELD]: consent.SMS_CONSENT_VALUE,
      consent_timestamp: lie,
      consentTimestamp: lie,
      sms_consent_at: lie,
    });
    const parsed = submission.parseSubmission(form);
    const serverNow = new Date('2026-10-30T18:00:00.000Z');
    const record = consent.buildSmsConsentRecord(parsed.smsConsent, serverNow);

    assert.equal(record.consent_timestamp, serverNow.toISOString());
    assert.ok(
      !JSON.stringify(record).includes('1999'),
      'nothing a browser sent may reach the record',
    );
    // And it must not have leaked into the quote values either.
    assert.equal(parsed.values.consent_timestamp, undefined);
  });
});

describe('the notification carries the evidence', () => {
  const context = (record, extra = {}) => ({
    submissionId: 'test0123456789ab',
    isTest: true,
    photoCount: 0,
    photoUrls: [],
    photoNotes: [],
    submittedAt: new Date('2026-10-30T18:00:00.000Z'),
    consent: record,
    attribution: { utm: {} },
    ...extra,
  });

  test('BA1 appends consent tokens and keeps the existing ones', () => {
    const values = { name: 'Pat Tester', phone: '(480) 555-0101', zip: '85205', service: 'junk-removal' };
    const granted = consent.buildSmsConsentRecord(true, new Date('2026-10-30T18:00:00.000Z'));
    const text = submission.buildText(values, context(granted));
    const reference = text.split('\n')[0];

    assert.ok(reference.startsWith('BA1|'), 'the reference still leads the email');
    // Existing tokens, unchanged and still in order.
    const order = ['i=', 'p=', 'z=', 's=', 'pc=', 't='];
    let cursor = -1;
    for (const token of order) {
      const at = reference.indexOf(`|${token}`);
      assert.ok(at > cursor, `${token} must keep its place in the reference`);
      cursor = at;
    }
    // New tokens, appended after them.
    assert.ok(reference.includes('|sc=1'), 'consent flag');
    assert.ok(reference.includes('|scv=sms_quote_transactional_v1'), 'consent version');
    assert.ok(reference.includes('|scs=website_quote_form'), 'consent source');
    assert.ok(reference.includes('|sct=2026-10-30T18%3A00%3A00.000Z'), 'consent timestamp');
    assert.ok(reference.indexOf('|sc=') > reference.indexOf('|t='), 'consent is appended, not inserted');
  });

  test('a declined lead says so, with no timestamp', () => {
    const values = { name: 'Pat Tester', phone: '(480) 555-0101', zip: '85205', service: 'junk-removal' };
    const declined = consent.buildSmsConsentRecord(false, new Date());
    const reference = submission.buildText(values, context(declined)).split('\n')[0];

    assert.ok(reference.includes('|sc=0'), 'an explicit no');
    assert.ok(reference.includes('|scv=sms_quote_transactional_v1'), 'version is recorded either way');
    assert.ok(!reference.includes('|sct='), 'no timestamp when there was no consent');
  });

  test('the email body shows the disclosure that was accepted', () => {
    const values = { name: 'Pat Tester', phone: '(480) 555-0101', zip: '85205', service: 'junk-removal' };
    const granted = consent.buildSmsConsentRecord(true, new Date('2026-10-30T18:00:00.000Z'));

    const text = submission.buildText(values, context(granted));
    assert.ok(text.includes('SMS CONSENT'));
    assert.ok(text.includes('Consent given: YES'));
    assert.ok(text.includes('sms_quote_transactional_v1'));
    assert.ok(text.includes('website_quote_form'));
    assert.ok(text.includes('2026-10-30T18:00:00.000Z'));
    assert.ok(text.includes(consent.SMS_CONSENT_TEXT), 'the exact wording is in the record');

    const html = submission.buildHtml(values, context(granted));
    assert.ok(html.includes('SMS consent: YES'));
    assert.ok(html.includes('sms_quote_transactional_v1'));

    const declinedText = submission.buildText(values, context(consent.buildSmsConsentRecord(false, new Date())));
    assert.ok(declinedText.includes('Consent given: NO'));
    assert.ok(
      !declinedText.includes(consent.SMS_CONSENT_TEXT),
      'a disclosure nobody accepted is not recorded as accepted',
    );
  });
});

describe('existing quote behaviour is unchanged', () => {
  test('the required fields still reject a bad submission', () => {
    const empty = submission.parseSubmission(new FormData());
    assert.deepEqual(Object.keys(empty.fieldErrors).sort(), ['name', 'phone', 'service', 'zip']);

    // Consent on its own is not a quote: the required fields still decide.
    const consentOnly = new FormData();
    consentOnly.set(consent.SMS_CONSENT_FIELD, consent.SMS_CONSENT_VALUE);
    const parsed = submission.parseSubmission(consentOnly);
    assert.equal(parsed.smsConsent, true);
    assert.deepEqual(Object.keys(parsed.fieldErrors).sort(), ['name', 'phone', 'service', 'zip']);
  });

  test('consent does not disturb values, attribution or spam checks', () => {
    const form = validForm({
      [consent.SMS_CONSENT_FIELD]: consent.SMS_CONSENT_VALUE,
      notes: 'Side gate is unlocked.',
      utm_source: 'direct_mail',
      utm_campaign: 'mesa25',
      campaign: 'direct-mail-mesa25',
    });
    const parsed = submission.parseSubmission(form);

    assert.equal(parsed.values.name, 'Pat Tester');
    assert.equal(parsed.values.zip, '85205');
    assert.equal(parsed.values.service, 'junk-removal');
    assert.equal(parsed.values.notes, 'Side gate is unlocked.');
    assert.equal(parsed.values.smsConsent, undefined, 'consent is a record, not a quote value');
    assert.equal(parsed.attribution.utm.utm_source, 'direct_mail');
    assert.equal(parsed.attribution.campaign?.id, 'direct-mail-mesa25');
    assert.equal(parsed.looksAutomated, false);
    assert.deepEqual(parsed.fieldErrors, {});
  });

  test('the honeypot still catches a bot that ticks everything', () => {
    const form = validForm({
      [consent.SMS_CONSENT_FIELD]: consent.SMS_CONSENT_VALUE,
      [submission.HONEYPOT_FIELD]: 'Acme Corp',
    });
    assert.equal(submission.parseSubmission(form).looksAutomated, true);
  });

  test('the time trap still catches a submission that was too fast', () => {
    const form = validForm({
      [consent.SMS_CONSENT_FIELD]: consent.SMS_CONSENT_VALUE,
      [submission.TIMESTAMP_FIELD]: String(Date.now()),
    });
    assert.equal(submission.parseSubmission(form).looksAutomated, true);
  });
});
