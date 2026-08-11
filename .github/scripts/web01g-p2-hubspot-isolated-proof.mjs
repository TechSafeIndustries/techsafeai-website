import assert from 'node:assert/strict';
import { HubSpotEnquiryTransport } from '../../src/server/enquiry/hubspot.mjs';
import { buildWorkpacketStub, validateEnquiryPayload } from '../../src/server/enquiry/core.mjs';
import { contextFingerprint, deriveEnquiryId } from '../../src/server/enquiry/submission.mjs';

const APPROVED_P2_TEST_PORTAL_ID = '247013551';
const token = process.env.HUBSPOT_P2_TEST_ACCESS_TOKEN?.trim();
const baseUrl = (process.env.HUBSPOT_API_BASE_URL || 'https://api.hubapi.com').replace(/\/$/, '');
if (!token) throw new Error('HUBSPOT_P2_TEST_ACCESS_TOKEN is required in non-production secret storage.');

async function request(path, { method = 'GET', body, allow404 = false } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/json',
      ...(body ? { 'content-type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (allow404 && response.status === 404) return null;
  let payload = {};
  try { payload = await response.json(); } catch { payload = {}; }
  if (!response.ok) throw new Error(`HubSpot API ${method} ${path} failed with HTTP ${response.status}.`);
  return payload;
}

const account = await request('/account-info/2026-03/details');
assert.equal(String(account.portalId), APPROVED_P2_TEST_PORTAL_ID, 'Connected token does not belong to approved P2 test Account 247013551.');
assert.equal(account.accountType, 'DEVELOPER_TEST', `P2 writes require DEVELOPER_TEST, received ${account.accountType}.`);

// Pipeline/stage authority is the HubSpot CRM Pipelines API (2026-03), NOT Deal property option metadata.
// This discovery/validation runs immediately after the account guard and before any property/contact/deal write.
const pipelinesResponse = await request('/crm/pipelines/2026-03/deals');
const availablePipelines = pipelinesResponse.results || [];

const requestedPipelineId = process.env.HUBSPOT_P2_TEST_PIPELINE_ID?.trim();
const requestedStageId = process.env.HUBSPOT_P2_TEST_STAGE_ID?.trim();

if (!requestedPipelineId || !requestedStageId) {
  // SAFE discovery output only. No token, headers, contact data or secret material is printed.
  const pipelineDiscovery = availablePipelines.map((pipeline) => ({
    pipelineId: pipeline.id,
    label: pipeline.label,
    stages: (pipeline.stages || [])
      .slice()
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((stage) => {
        const entry = { stageId: stage.id, label: stage.label, displayOrder: stage.displayOrder };
        if (stage.metadata && stage.metadata.isClosed !== undefined) entry.isClosed = stage.metadata.isClosed;
        if (stage.metadata && stage.metadata.probability !== undefined) entry.probability = stage.metadata.probability;
        return entry;
      })
  }));
  console.log(JSON.stringify({
    proof: 'WEB-01G-P2-HUBSPOT-ISOLATED',
    status: 'CONFIGURATION_REQUIRED',
    portalId: account.portalId,
    accountType: account.accountType,
    availablePipelines: pipelineDiscovery,
    syntheticRecordsRetainedForEvidence: false
  }, null, 2));
  throw new Error('CONFIGURATION_REQUIRED: set HUBSPOT_P2_TEST_PIPELINE_ID and HUBSPOT_P2_TEST_STAGE_ID to an existing pipeline/stage from the discovery output above. No pipeline or stage is auto-selected; zero writes were performed.');
}

const selectedPipeline = availablePipelines.find((pipeline) => pipeline.id === requestedPipelineId);
assert.ok(selectedPipeline, `Configured pipeline ${requestedPipelineId} does not exist in approved P2 test Account 247013551.`);
const selectedStage = (selectedPipeline.stages || []).find((stage) => stage.id === requestedStageId);
assert.ok(selectedStage, `Configured stage ${requestedStageId} does not belong to pipeline ${requestedPipelineId}.`);
const pipelineId = requestedPipelineId;
const stageId = requestedStageId;

const propertyDefinitions = [
  { name: 'website_enquiry_id', label: 'Website enquiry ID', type: 'string', fieldType: 'text', hasUniqueValue: true },
  { name: 'website_received_at', label: 'Website received at', type: 'datetime', fieldType: 'date' },
  { name: 'website_primary_challenge', label: 'Website primary challenge', type: 'string', fieldType: 'text' },
  { name: 'website_industry_context', label: 'Website industry context', type: 'string', fieldType: 'text' },
  { name: 'website_timing_window', label: 'Website timing window', type: 'string', fieldType: 'text' },
  { name: 'website_security_level', label: 'Website security level', type: 'string', fieldType: 'text' },
  { name: 'website_workpacket_stub', label: 'Website Workpacket Stub', type: 'string', fieldType: 'textarea' },
  { name: 'website_enquiry_fingerprint', label: 'Website enquiry fingerprint', type: 'string', fieldType: 'text' },
  { name: 'website_contact_association_repair', label: 'Website contact association repair', type: 'string', fieldType: 'text' }
];

for (const definition of propertyDefinitions) {
  const existing = await request(`/crm/properties/2026-03/deals/${encodeURIComponent(definition.name)}`, { allow404: true });
  if (existing) {
    if (definition.hasUniqueValue) assert.equal(existing.hasUniqueValue, true, `${definition.name} must be a unique property.`);
    continue;
  }
  await request('/crm/properties/2026-03/deals', {
    method: 'POST',
    body: {
      groupName: 'dealinformation',
      name: definition.name,
      label: definition.label,
      description: 'Synthetic WEB-01G-P2 website integration proof field.',
      type: definition.type,
      fieldType: definition.fieldType,
      hidden: false,
      formField: false,
      ...(definition.hasUniqueValue ? { hasUniqueValue: true } : {})
    }
  });
}

const suffix = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const syntheticEmail = `techsafeai.p2.synthetic.${suffix}@example.com`;
const raw = {
  challenge: { key: 'CONTROL_VERIFICATION', problemSummary: 'P2 SYNTHETIC — control verification context for isolated provider proof.' },
  organisation: { name: `[P2 SYNTHETIC ${suffix}] Operations`, sizeBand: '250_999', footprint: 'Synthetic test operating context only' },
  industry: { key: 'MINING_RESOURCES', other: '', multiSector: false },
  activity: { key: 'SITE_FIELD', other: '' },
  operatingEnvironment: ['SITE_FIELD'],
  jurisdiction: { scope: 'UNKNOWN', countries: '', regions: '' },
  outcome: { desiredOutcome: 'P2 SYNTHETIC — prove one authoritative Deal, Contact association and duplicate safety.', trigger: 'AI_INITIATIVE', timing: 'ONE_TO_THREE_MONTHS' },
  internalCapability: { safetyCompliance: 'UNSURE', aiTechnology: 'UNSURE', accountableSponsor: 'UNSURE', aitlAvailable: 'UNSURE', externalAdviser: 'UNSURE' },
  security: { level: 'STANDARD', note: '', acknowledged: true },
  contact: { name: 'P2 Synthetic User', email: syntheticEmail, telephone: '' }
};

const validated = validateEnquiryPayload(raw);
assert.equal(validated.ok, true, JSON.stringify(validated.errors));
const startedAt = Date.now() - 5000;
const context = {
  enquiryId: deriveEnquiryId(validated.data, startedAt),
  fingerprint: contextFingerprint(validated.data)
};
const workpacket = buildWorkpacketStub(validated.data, new Date());
const transport = new HubSpotEnquiryTransport({ accessToken: token, pipelineId, stageId, baseUrl });

const first = await transport.submit(workpacket, context);
assert.equal(first.accepted, true);
assert.ok(first.transportReference);
const second = await transport.submit(workpacket, context);
assert.equal(second.accepted, true);
assert.equal(second.transportReference, first.transportReference, 'Duplicate retry created or resolved to a different Deal.');

const deal = await request(`/crm/objects/2026-03/deals/${encodeURIComponent(first.transportReference)}?properties=website_enquiry_id,website_received_at,website_primary_challenge,website_industry_context,website_timing_window,website_security_level,website_enquiry_fingerprint,website_contact_association_repair&associations=contacts`);
assert.equal(deal.properties.website_enquiry_id, context.enquiryId);
assert.equal(deal.properties.website_enquiry_fingerprint, context.fingerprint);
const contacts = deal.associations?.contacts?.results || [];
assert.equal(contacts.length, 1, 'Expected exactly one Contact association on the synthetic Deal.');

const contactId = String(contacts[0].id);
const contact = await request(`/crm/objects/2026-03/contacts/${encodeURIComponent(contactId)}?properties=email,firstname,lastname,phone`);
assert.equal(contact.properties.email, syntheticEmail, 'Synthetic Contact read-back did not match the submitted email.');

console.log(JSON.stringify({
  proof: 'WEB-01G-P2-HUBSPOT-ISOLATED',
  accountType: account.accountType,
  portalId: account.portalId,
  dataHostingLocation: account.dataHostingLocation || 'UNRESOLVED',
  pipelineId,
  stageId,
  dealId: first.transportReference,
  contactId,
  contactReadBack: true,
  enquiryId: context.enquiryId,
  duplicateRetrySameDeal: true,
  contactAssociationCount: contacts.length,
  associationRepairRequired: first.associationRepairRequired,
  notificationStatus: first.notificationStatus,
  syntheticRecordsRetainedForEvidence: true
}, null, 2));
