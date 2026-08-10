import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildWorkpacketStub, validateEnquiryPayload } from '../src/server/enquiry/core.mjs';
import { DevelopmentTestTransport, RejectedTestTransport } from '../src/server/enquiry/transport.mjs';
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

test('client cannot display success without an accepted server response', () => {
  const script = read('src/scripts/intake.ts');
  assert.match(script, /fetch\(['"]\/api\/enquiry['"]/);
  assert.match(script, /if \(!response\.ok \|\| result\?\.accepted !== true\)/);
  assert.ok(script.indexOf("fetch('/api/enquiry'") < script.indexOf('form.hidden = true'));
  assert.doesNotMatch(script, /Reference Number|automated acknowledgement|logged in CRM|Enquiry Submitted Successfully/i);
  assert.doesNotMatch(script, /localStorage|sessionStorage/);
});

test('Structured Hybrid exposes seven visible stages and only Stage-1 SAI states', () => {
  const page = read('src/pages/start-with-your-challenge/index.astro');
  const stages = ['Challenge', 'Organisation', 'Operating Context', 'Outcome', 'Capability', 'Security', 'Contact & Review'];
  for (const stage of stages) assert.match(page, new RegExp(stage));
  assert.equal((page.match(/data-screen="/g) || []).length, 9);
  const states = [...page.matchAll(/data-sai-state="([A-Z]+)"/g)].map((match) => match[1]);
  assert.ok(states.length >= 5);
  assert.ok(states.every((state) => ['ORIENT', 'COLLECT', 'ORGANISE', 'FLAG', 'HANDOFF'].includes(state)));
  assert.doesNotMatch(page, /data-sai-state="(?:ANALYSE|ADVISE)"/);
  assert.doesNotMatch(page, /chatbot|floating assistant|open conversational/i);
});

test('homepage pain selection remains carry-forward compatible', () => {
  const home = read('src/pages/index.astro');
  const intake = read('src/scripts/intake.ts');
  assert.match(home, /start-with-your-challenge\?challenge=/);
  assert.match(intake, /new URLSearchParams\(window\.location\.search\)\.get\('challenge'\)/);
});

test('server-only transport configuration is absent from client source', () => {
  const client = read('src/scripts/intake.ts');
  assert.doesNotMatch(client, /ENQUIRY_TRANSPORT_MODE|ALLOW_TEST_ENQUIRY_TRANSPORT|TURNSTILE_SECRET_KEY/);
  assert.match(read('.env.example'), /ENQUIRY_TRANSPORT_MODE/);
});
