import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWorkpacketStub, validateEnquiryPayload } from '../src/server/enquiry/core.mjs';
import { HubSpotEnquiryTransport, HubSpotTransportError } from '../src/server/enquiry/hubspot.mjs';
import { RecordingNotificationAdapter } from '../src/server/enquiry/notification.mjs';
import { contextFingerprint, deriveEnquiryId, serialiseWorkpacketStub } from '../src/server/enquiry/submission.mjs';
import { getConfiguredTransport } from '../src/server/enquiry/transport.mjs';

const now = Date.parse('2026-08-11T00:00:00Z');

const raw = () => ({
  challenge: { key: 'CONTROL_VERIFICATION', problemSummary: 'We need a clearer view of control verification across operating sites.' },
  organisation: { name: 'Synthetic Operations Pty Ltd', sizeBand: '250_999', footprint: 'Three synthetic operating sites' },
  industry: { key: 'MINING_RESOURCES', other: '', multiSector: false },
  activity: { key: 'SITE_FIELD', other: '' },
  operatingEnvironment: ['SITE_FIELD', 'PLANT_PROCESSING'],
  jurisdiction: { scope: 'SINGLE_JURISDICTION', countries: 'Australia', regions: 'Western Australia' },
  outcome: { desiredOutcome: 'Create a clearer evidence-backed basis for human review and prioritisation.', trigger: 'AUDIT_REVIEW', timing: 'ONE_TO_THREE_MONTHS' },
  internalCapability: { safetyCompliance: 'YES', aiTechnology: 'UNSURE', accountableSponsor: 'YES', aitlAvailable: 'NO', externalAdviser: 'UNSURE' },
  security: { level: 'STANDARD', note: '', acknowledged: true },
  contact: { name: 'Synthetic Test User', email: 'synthetic@example.test', telephone: '+61 400 000 000' }
});

function submission(startedAt = now - 5000) {
  const validated = validateEnquiryPayload(raw());
  assert.equal(validated.ok, true);
  return {
    data: validated.data,
    workpacket: buildWorkpacketStub(validated.data, new Date(now)),
    context: {
      enquiryId: deriveEnquiryId(validated.data, startedAt),
      fingerprint: contextFingerprint(validated.data)
    }
  };
}

function jsonResponse(status, body = {}, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
}

function createHubSpotMock({ associationFails = false, dealRejects = false, timeoutAfterCreate = false, rateLimited = false, notificationFails = false } = {}) {
  const state = {
    contactUpserts: 0,
    dealReads: 0,
    dealUpserts: 0,
    associations: 0,
    repairPatches: 0,
    deals: new Map()
  };

  const fetchImpl = async (url, options = {}) => {
    const path = new URL(url).pathname;
    const body = options.body ? JSON.parse(options.body) : {};

    if (path.endsWith('/contacts/batch/upsert')) {
      state.contactUpserts++;
      return jsonResponse(200, { results: [{ id: 'C100', new: state.contactUpserts === 1 }] });
    }

    if (path.endsWith('/deals/batch/read')) {
      state.dealReads++;
      const enquiryId = body.inputs?.[0]?.id;
      const deal = state.deals.get(enquiryId);
      return jsonResponse(200, { results: deal ? [deal] : [] });
    }

    if (path.endsWith('/deals/batch/upsert')) {
      state.dealUpserts++;
      if (rateLimited) return jsonResponse(429, { message: 'rate limit' }, { 'retry-after': '2' });
      if (dealRejects) return jsonResponse(400, { message: 'rejected' });
      const input = body.inputs?.[0];
      const deal = { id: 'D200', new: true, properties: { ...input.properties } };
      state.deals.set(input.id, deal);
      if (timeoutAfterCreate) throw new TypeError('simulated connection loss after provider commit');
      return jsonResponse(200, { results: [deal], status: 'COMPLETE' });
    }

    if (path.includes('/associations/default/contacts/')) {
      state.associations++;
      if (associationFails) return jsonResponse(500, { message: 'association unavailable' });
      return jsonResponse(200, { results: [{ from: { id: 'D200' }, to: { id: 'C100' } }] });
    }

    if (/\/deals\/D200$/.test(path) && options.method === 'PATCH') {
      state.repairPatches++;
      return jsonResponse(200, { id: 'D200' });
    }

    throw new Error(`Unexpected HubSpot mock request: ${options.method || 'GET'} ${path}`);
  };

  const notificationAdapter = new RecordingNotificationAdapter({ fail: notificationFails });
  const transport = new HubSpotEnquiryTransport({
    accessToken: 'test-token-not-a-secret',
    pipelineId: 'default',
    stageId: 'appointmentscheduled',
    fetchImpl,
    notificationAdapter
  });

  return { state, transport, notificationAdapter };
}

test('server-derived website enquiry ID is stable for the same logical retry and changes with form session', () => {
  const validated = validateEnquiryPayload(raw()).data;
  const first = deriveEnquiryId(validated, 1234567890);
  const retry = deriveEnquiryId(validated, 1234567890);
  const newSession = deriveEnquiryId(validated, 1234567891);
  assert.equal(first, retry);
  assert.notEqual(first, newSession);
  assert.match(first, /^web_[0-9a-f]{40}$/);
});

test('Workpacket Stub fits a HubSpot string/textarea property with large safety margin', () => {
  const { workpacket } = submission();
  const serialised = serialiseWorkpacketStub(workpacket);
  assert.ok(serialised.length > 500);
  assert.ok(serialised.length < 65536, `serialised Workpacket length ${serialised.length}`);
  assert.doesNotMatch(serialised, /finding|riskRating|complianceDetermination|correctiveRecommendation/i);
});

test('HubSpot adapter proves Deal by unique enquiry ID, associates Contact and notifies separately', async () => {
  const { workpacket, context } = submission();
  const { state, transport, notificationAdapter } = createHubSpotMock();
  const result = await transport.submit(workpacket, context);
  assert.equal(result.accepted, true);
  assert.equal(result.transportReference, 'D200');
  assert.equal(result.systemOfRecord, 'HUBSPOT_DEAL');
  assert.equal(result.associationRepairRequired, false);
  assert.equal(state.dealUpserts, 1);
  assert.ok(state.dealReads >= 2, 'must look up/read back Deal');
  assert.equal(state.associations, 1);
  assert.equal(notificationAdapter.notifications.length, 1);
  assert.equal(notificationAdapter.notifications[0].dealId, 'D200');
  assert.equal('workpacketStub' in notificationAdapter.notifications[0], false);
});

test('duplicate retry with stable enquiry ID creates one authoritative Deal', async () => {
  const { workpacket, context } = submission();
  const { state, transport } = createHubSpotMock();
  const first = await transport.submit(workpacket, context);
  const second = await transport.submit(workpacket, context);
  assert.equal(first.transportReference, 'D200');
  assert.equal(second.transportReference, 'D200');
  assert.equal(state.dealUpserts, 1);
  assert.equal(state.deals.size, 1);
});

test('provider timeout after Deal creation performs lookup before any retry and recovers one Deal', async () => {
  const { workpacket, context } = submission();
  const { state, transport } = createHubSpotMock({ timeoutAfterCreate: true });
  const result = await transport.submit(workpacket, context);
  assert.equal(result.accepted, true);
  assert.equal(result.transportReference, 'D200');
  assert.equal(state.dealUpserts, 1);
  assert.equal(state.deals.size, 1);
  assert.ok(state.dealReads >= 2);
});

test('Contact success followed by Deal rejection is not accepted', async () => {
  const { workpacket, context } = submission();
  const { state, transport } = createHubSpotMock({ dealRejects: true });
  await assert.rejects(() => transport.submit(workpacket, context), (error) => error instanceof HubSpotTransportError && error.code === 'PROVIDER_REJECTED');
  assert.equal(state.contactUpserts, 1);
  assert.equal(state.dealUpserts, 1);
  assert.equal(state.deals.size, 0);
});

test('Deal remains authoritative when Contact association fails and repair state is recorded', async () => {
  const { workpacket, context } = submission();
  const { state, transport } = createHubSpotMock({ associationFails: true });
  const result = await transport.submit(workpacket, context);
  assert.equal(result.accepted, true);
  assert.equal(result.transportReference, 'D200');
  assert.equal(result.associationRepairRequired, true);
  assert.equal(state.dealUpserts, 1);
  assert.equal(state.repairPatches, 1);
});

test('notification failure is separate from authoritative Deal acceptance', async () => {
  const { workpacket, context } = submission();
  const { transport } = createHubSpotMock({ notificationFails: true });
  const result = await transport.submit(workpacket, context);
  assert.equal(result.accepted, true);
  assert.equal(result.notificationStatus, 'FAILED');
});

test('HubSpot 429 exposes backoff requirement and does not blindly retry create', async () => {
  const { workpacket, context } = submission();
  const { state, transport } = createHubSpotMock({ rateLimited: true });
  await assert.rejects(() => transport.submit(workpacket, context), (error) => error instanceof HubSpotTransportError && error.code === 'RATE_LIMITED' && error.retryAfterMs === 2000);
  assert.equal(state.dealUpserts, 1);
});

test('staging HubSpot mode requires isolated developer-test account classification', () => {
  const blocked = getConfiguredTransport({
    DEPLOYMENT_ENVIRONMENT: 'staging', ENQUIRY_TRANSPORT_MODE: 'hubspot', HUBSPOT_ACCOUNT_CLASS: 'standard'
  });
  assert.equal(blocked.kind, 'unconfigured-production');
  assert.equal(blocked.reason, 'NONPROD_ACCOUNT_REQUIRED');

  const isolated = getConfiguredTransport({
    DEPLOYMENT_ENVIRONMENT: 'staging', ENQUIRY_TRANSPORT_MODE: 'hubspot', HUBSPOT_ACCOUNT_CLASS: 'developer-test',
    HUBSPOT_ACCESS_TOKEN: 'test-token', HUBSPOT_PIPELINE_ID: 'default', HUBSPOT_ENQUIRY_STAGE_ID: 'appointmentscheduled'
  }, { fetchImpl: async () => jsonResponse(500) });
  assert.equal(isolated.kind, 'hubspot');
});

test('production rejects developer-test HubSpot account classification', () => {
  const transport = getConfiguredTransport({
    DEPLOYMENT_ENVIRONMENT: 'production', ENQUIRY_TRANSPORT_MODE: 'hubspot', HUBSPOT_ACCOUNT_CLASS: 'developer-test'
  });
  assert.equal(transport.kind, 'unconfigured-production');
  assert.equal(transport.reason, 'TEST_ACCOUNT_FORBIDDEN');
});
