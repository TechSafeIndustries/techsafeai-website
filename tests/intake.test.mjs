import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { CHALLENGES } from '../src/lib/intake/options.mjs';
import { buildWorkpacketStub, validateEnquiryPayload } from '../src/server/enquiry/core.mjs';
import { DevelopmentTestTransport, RejectedTestTransport, getConfiguredTransport } from '../src/server/enquiry/transport.mjs';
import { handleEnquiryRequest } from '../src/server/enquiry/service.mjs';
import { resetAbuseStateForTests } from '../src/server/enquiry/abuse.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const validPayload = (now = Date.now()) => ({
  startedAt: now - 5000,
  companyWebsite: '',
  turnstileToken: '',
  challenge: { key: 'CONTROL_VERIFICATION', problemSummary: 'We need a clearer view of control verification across operating sites.' },
  organisation: { name: 'Example Operations', sizeBand: '250_999', footprint: 'Three operating sites' },
  industry: { key: 'MINING_RESOURCES', other: '', multiSector: false },
  activity: { key: 'SITE_FIELD', other: '' },
  operatingEnvironment: ['SITE_FIELD', 'PLANT_PROCESSING'],
  jurisdiction: { scope: 'SINGLE_JURISDICTION', countries: 'Australia', regions: 'Western Australia' },
  outcome: { desiredOutcome: 'Create a clearer, evidence-backed basis for human review and prioritisation.', trigger: 'AUDIT_REVIEW', timing: 'ONE_TO_THREE_MONTHS' },
  internalCapability: { safetyCompliance: 'YES', aiTechnology: 'UNSURE', accountableSponsor: 'YES', aitlAvailable: 'NO', externalAdviser: 'UNSURE' },
  security: { level: 'STANDARD', note: '', acknowledged: true },
  contact: { name: 'Test User', email: 'test@example.com', telephone: '' }
});

function requestFor(payload, origin = 'https://techsafe.ai') {
  return new Request('https://techsafe.ai/api/enquiry', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin },
    body: JSON.stringify(payload)
  });
}

test('server validation accepts governed context and enforces character limits', () => {
  const payload = validPayload();
  assert.equal(validateEnquiryPayload(payload).ok, true);
  payload.challenge.problemSummary = 'x'.repeat(301);
  payload.industry.other = 'x'.repeat(101);
  payload.activity.other = 'x'.repeat(121);
  payload.outcome.desiredOutcome = 'x'.repeat(301);
  payload.security.note = 'x'.repeat(201);
  const result = validateEnquiryPayload(payload);
  assert.equal(result.ok, false);
  for (const field of ['challenge.problemSummary', 'industry.other', 'activity.other', 'outcome.desiredOutcome', 'security.note']) assert.ok(result.errors[field]);
});

test('security acknowledgement is mandatory and no public upload or dangerous data fields exist', () => {
  const payload = validPayload();
  payload.security.acknowledged = false;
  const result = validateEnquiryPayload(payload);
  assert.equal(result.ok, false);
  assert.ok(result.errors['security.acknowledged']);
  const page = read('src/pages/start-with-your-challenge/index.astro');
  assert.doesNotMatch(page, /type=["']file["']/i);
  for (const dangerousName of ['password', 'apiKey', 'networkDiagram', 'evidencePack', 'medicalRecord']) assert.doesNotMatch(page, new RegExp(`name=[\\"']${dangerousName}[\\"']`, 'i'));
  assert.match(page, /Do not provide:/);
});

test('Workpacket Stub contains declared context only and requires human validation', () => {
  const validated = validateEnquiryPayload(validPayload());
  assert.equal(validated.ok, true);
  const stub = buildWorkpacketStub(validated.data, new Date('2026-08-11T00:00:00Z'));
  assert.equal(stub.humanValidationRequired, true);
  assert.equal(stub.contextStatuses.applicability, 'NOT_ASSESSED');
  assert.equal(stub.challenge.key, 'CONTROL_VERIFICATION');
  assert.equal(stub.contact.email, 'test@example.com');
  const keys = JSON.stringify(stub).toLowerCase();
  for (const prohibited of ['findingid', 'riskrating', 'compliancedetermination', 'legalconclusion', 'recommendation']) assert.equal(keys.includes(prohibited), false);
});

test('unconfigured production transport fails closed', async () => {
  resetAbuseStateForTests();
  const now = Date.now();
  const response = await handleEnquiryRequest(requestFor(validPayload(now)), {
    clientAddress: '198.51.100.1', nowMs: now, env: { ENQUIRY_TRANSPORT_MODE: 'unconfigured' }
  });
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.accepted, false);
  assert.equal(body.code, 'TRANSPORT_NOT_CONFIGURED');
});

test('rejected transport fails and accepted transport is the only success path', async () => {
  const now = Date.now();
  resetAbuseStateForTests();
  const rejected = await handleEnquiryRequest(requestFor(validPayload(now)), {
    clientAddress: '198.51.100.2', nowMs: now, transport: new RejectedTestTransport(), env: {}
  });
  assert.equal(rejected.status, 503);
  assert.equal((await rejected.json()).accepted, false);

  resetAbuseStateForTests();
  const acceptedTransport = new DevelopmentTestTransport();
  const accepted = await handleEnquiryRequest(requestFor(validPayload(now)), {
    clientAddress: '198.51.100.3', nowMs: now, transport: acceptedTransport, env: {}
  });
  assert.equal(accepted.status, 202);
  const body = await accepted.json();
  assert.equal(body.accepted, true);
  assert.equal(body.humanReview, true);
  assert.equal(acceptedTransport.submissions.length, 1);
  assert.equal(acceptedTransport.submissions[0].humanValidationRequired, true);
});

test('production environment cannot enable the development test transport', async () => {
  const transport = getConfiguredTransport({
    DEPLOYMENT_ENVIRONMENT: 'production',
    ENQUIRY_TRANSPORT_MODE: 'test',
    ALLOW_TEST_ENQUIRY_TRANSPORT: '1'
  });
  const result = await transport.submit({ test: true });
  assert.equal(result.accepted, false);
  assert.equal(result.transportKind, 'unconfigured-production');
  assert.equal(result.reason, 'TEST_TRANSPORT_FORBIDDEN');
});

test('client cannot display success without an accepted server response', () => {
  const script = read('src/scripts/intake.ts');
  assert.match(script, /fetch\(['"]\/api\/enquiry['"]/);
  assert.match(script, /if \(!response\.ok \|\| result\?\.accepted !== true\)/);
  assert.ok(script.indexOf("fetch('/api/enquiry'") < script.indexOf('form.hidden = true'));
  assert.doesNotMatch(script, /Reference Number|automated acknowledgement|logged in CRM|Enquiry Submitted Successfully/i);
  assert.doesNotMatch(script, /localStorage|sessionStorage/);
});

test('review challenge labels exclude decorative choice-card numbering for all governed challenges', () => {
  const script = read('src/scripts/intake.ts');
  assert.equal(CHALLENGES.length, 11);
  assert.match(script, /span:not\(\.choice-index\)/);
  assert.doesNotMatch(script, /closest\('label'\)\?\.textContent/);
  for (const [, label] of CHALLENGES) {
    assert.ok(label.length > 0);
    assert.doesNotMatch(label, /^\s*\d{1,2}/);
  }
  assert.equal(CHALLENGES.find(([key]) => key === 'CONTROL_VERIFICATION')?.[1], 'Prove critical controls actually work');
});

test('Phase 9 challenge flow exposes the approved 4-step public progress over the unchanged 9-screen structure', () => {
  // Superseded by Mission 10 / Phase 9 (2026-08-28): the public-facing
  // progress nav was re-skinned from 7 stage labels to the approved 4
  // (Problem / Context / Desired outcome / Advisory result) as a
  // presentation-layer change only. The underlying 9 screens, their own
  // per-screen eyebrow micro-labels, field names, validation, Turnstile and
  // HubSpot mapping are unchanged and still asserted below.
  const page = read('src/pages/start-with-your-challenge/index.astro');
  const publicSteps = ['Problem', 'Context', 'Desired outcome', 'Advisory result'];
  for (const step of publicSteps) assert.match(page, new RegExp(step));
  const screenEyebrows = ['Challenge', 'Organisation', 'Operating Context', 'Outcome', 'Capability', 'Security', 'Contact', 'Review'];
  for (const eyebrow of screenEyebrows) assert.match(page, new RegExp(eyebrow));
  assert.match(page, /Based on the context you provided, this enquiry may be relevant to:/);
  assert.match(page, /A person from TechSafeAI will review your enquiry/);
  // The advisory-result copy is explicitly required to DISCLAIM these framings
  // (see the copy above: "not an assessment ... or compliance determination"),
  // not to omit the words entirely, so check the disclaiming sentence exists
  // rather than banning the phrases outright.
  assert.match(page, /not an assessment, Operational Intelligence result, compliance determination or automated recommendation/);
  assert.doesNotMatch(page, /SAI assessment/i);
  assert.match(page, /\['Problem', 'Context', 'Desired outcome', 'Advisory result'\]/);
  assert.equal((page.match(/data-screen="/g) || []).length, 9);
  const states = [...page.matchAll(/data-sai-state="([A-Z]+)"/g)].map((match) => match[1]);
  assert.ok(states.length >= 5);
  assert.ok(states.every((state) => ['ORIENT', 'COLLECT', 'ORGANISE', 'FLAG', 'HANDOFF'].includes(state)));
  assert.doesNotMatch(page, /data-sai-state="(?:ANALYSE|ADVISE)"/);
  assert.doesNotMatch(page, /chatbot|floating assistant|open conversational/i);
});

test('challenge query-param carry-forward remains supported by the intake script', () => {
  // Superseded by Mission 10 / Phase 9 (2026-08-28): the homepage's clickable
  // pain-point selector grid was retired as part of the approved governed
  // Operational Intelligence narrative (see site.test.mjs), so the homepage
  // itself no longer emits a `?challenge=` link. The intake script's ability
  // to read a `challenge` query param and pre-fill Step 1 is still a valid,
  // reusable mechanism for any other page that wants to deep-link into the
  // challenge flow, so that half of the contract stays under test here.
  const intake = read('src/scripts/intake.ts');
  assert.match(intake, /new URLSearchParams\(window\.location\.search\)\.get\('challenge'\)/);
});

test('server-only transport configuration is absent from client source', () => {
  const client = read('src/scripts/intake.ts');
  assert.doesNotMatch(client, /ENQUIRY_TRANSPORT_MODE|ALLOW_TEST_ENQUIRY_TRANSPORT|TURNSTILE_SECRET_KEY|DEPLOYMENT_ENVIRONMENT/);
  assert.match(read('.env.example'), /ENQUIRY_TRANSPORT_MODE/);
  assert.match(read('.env.example'), /DEPLOYMENT_ENVIRONMENT/);
});
