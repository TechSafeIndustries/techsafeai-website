import { NoopNotificationAdapter } from './notification.mjs';
import { serialiseWorkpacketStub } from './submission.mjs';

export class HubSpotTransportError extends Error {
  constructor(code, message, { status = 0, retryAfterMs = 0, uncertain = false } = {}) {
    super(message);
    this.name = 'HubSpotTransportError';
    this.code = code;
    this.status = status;
    this.retryAfterMs = retryAfterMs;
    this.uncertain = uncertain;
  }
}

function splitContactName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstname: parts[0] || '', lastname: '' };
  return { firstname: parts.slice(0, -1).join(' '), lastname: parts.at(-1) || '' };
}

export class HubSpotHttpClient {
  constructor({ accessToken, baseUrl = 'https://api.hubapi.com', fetchImpl = fetch, timeoutMs = 7000 } = {}) {
    this.accessToken = accessToken;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  async request(path, { method = 'GET', body } = {}) {
    if (!this.accessToken) throw new HubSpotTransportError('CONFIGURATION_ERROR', 'HubSpot credential is not configured.');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method,
        headers: {
          authorization: `Bearer ${this.accessToken}`,
          accept: 'application/json',
          ...(body ? { 'content-type': 'application/json' } : {})
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      let payload = {};
      try { payload = await response.json(); } catch { payload = {}; }
      if (response.ok) return payload;

      const retryAfterSeconds = Number(response.headers.get('retry-after') || '0');
      if (response.status === 429) throw new HubSpotTransportError('RATE_LIMITED', 'HubSpot rate limited the request.', { status: 429, retryAfterMs: Math.max(0, retryAfterSeconds * 1000) });
      if (response.status === 401 || response.status === 403) throw new HubSpotTransportError('AUTHENTICATION_ERROR', 'HubSpot authentication or scope rejected the request.', { status: response.status });
      if (response.status >= 500) throw new HubSpotTransportError('PROVIDER_TRANSIENT', 'HubSpot returned a transient provider error.', { status: response.status, uncertain: true });
      throw new HubSpotTransportError('PROVIDER_REJECTED', 'HubSpot rejected the request.', { status: response.status });
    } catch (error) {
      if (error instanceof HubSpotTransportError) throw error;
      if (error?.name === 'AbortError') throw new HubSpotTransportError('TIMEOUT', 'HubSpot request timed out.', { uncertain: true });
      throw new HubSpotTransportError('PROVIDER_UNAVAILABLE', 'HubSpot request failed before a confirmed response.', { uncertain: true });
    } finally {
      clearTimeout(timeout);
    }
  }
}

export class HubSpotEnquiryTransport {
  constructor({ accessToken, pipelineId, stageId, baseUrl, fetchImpl, timeoutMs, notificationAdapter = new NoopNotificationAdapter(), propertyNames = {} } = {}) {
    this.kind = 'hubspot';
    this.requiresStableEnquiryId = true;
    this.pipelineId = pipelineId;
    this.stageId = stageId;
    this.notificationAdapter = notificationAdapter;
    this.client = new HubSpotHttpClient({ accessToken, baseUrl, fetchImpl, timeoutMs });
    this.properties = {
      enquiryId: 'website_enquiry_id',
      receivedAt: 'website_received_at',
      challenge: 'website_primary_challenge',
      industry: 'website_industry_context',
      timing: 'website_timing_window',
      security: 'website_security_level',
      workpacket: 'website_workpacket_stub',
      fingerprint: 'website_enquiry_fingerprint',
      associationRepair: 'website_contact_association_repair',
      ...propertyNames
    };
  }

  configurationOk() {
    return Boolean(this.pipelineId && this.stageId && this.client.accessToken);
  }

  async findDeal(enquiryId) {
    const response = await this.client.request('/crm/objects/2026-03/deals/batch/read', {
      method: 'POST',
      body: {
        idProperty: this.properties.enquiryId,
        properties: [this.properties.enquiryId, this.properties.fingerprint],
        inputs: [{ id: enquiryId }]
      }
    });
    return Array.isArray(response?.results) && response.results.length ? response.results[0] : null;
  }

  async upsertContact(contact) {
    const { firstname, lastname } = splitContactName(contact.name);
    const properties = { email: contact.email };
    if (firstname) properties.firstname = firstname;
    if (lastname) properties.lastname = lastname;
    if (contact.telephone) properties.phone = contact.telephone;
    const response = await this.client.request('/crm/objects/2026-03/contacts/batch/upsert', {
      method: 'POST',
      body: { inputs: [{ id: contact.email, idProperty: 'email', properties }] }
    });
    const id = response?.results?.[0]?.id;
    if (!id) throw new HubSpotTransportError('CONTACT_NOT_CONFIRMED', 'HubSpot did not return an authoritative Contact ID.');
    return { id: String(id) };
  }

  buildDealProperties(workpacketStub, { enquiryId, fingerprint }) {
    const serialized = serialiseWorkpacketStub(workpacketStub);
    if (serialized.length > 65536) throw new HubSpotTransportError('WORKPACKET_TOO_LARGE', 'Workpacket Stub exceeds HubSpot string-property capacity.');
    return {
      dealname: `Website enquiry — ${workpacketStub.organisationContext.name}`,
      pipeline: this.pipelineId,
      dealstage: this.stageId,
      [this.properties.enquiryId]: enquiryId,
      [this.properties.receivedAt]: workpacketStub.createdAt,
      [this.properties.challenge]: workpacketStub.challenge.key,
      [this.properties.industry]: workpacketStub.industryContext.key,
      [this.properties.timing]: workpacketStub.timing.timing,
      [this.properties.security]: workpacketStub.securityDeclaration.level,
      [this.properties.workpacket]: serialized,
      [this.properties.fingerprint]: fingerprint,
      [this.properties.associationRepair]: 'false'
    };
  }

  async upsertDeal(workpacketStub, context) {
    const response = await this.client.request('/crm/objects/2026-03/deals/batch/upsert', {
      method: 'POST',
      body: {
        inputs: [{
          id: context.enquiryId,
          idProperty: this.properties.enquiryId,
          properties: this.buildDealProperties(workpacketStub, context)
        }]
      }
    });
    const id = response?.results?.[0]?.id;
    if (!id) throw new HubSpotTransportError('DEAL_NOT_CONFIRMED', 'HubSpot did not return an authoritative Deal ID.', { uncertain: true });
    return { id: String(id), new: Boolean(response.results[0].new) };
  }

  assertIdempotentMatch(deal, fingerprint) {
    const stored = deal?.properties?.[this.properties.fingerprint];
    if (stored && stored !== fingerprint) throw new HubSpotTransportError('IDEMPOTENCY_CONFLICT', 'Existing enquiry ID belongs to different submitted context.');
  }

  async associateContact(dealId, contactId) {
    await this.client.request(`/crm/objects/2026-03/deals/${encodeURIComponent(dealId)}/associations/default/contacts/${encodeURIComponent(contactId)}`, { method: 'PUT' });
  }

  async markAssociationRepair(dealId) {
    try {
      await this.client.request(`/crm/objects/2026-03/deals/${encodeURIComponent(dealId)}`, {
        method: 'PATCH',
        body: { properties: { [this.properties.associationRepair]: 'true' } }
      });
    } catch {
      // The Deal already exists and remains authoritative. Repair marking is best-effort only.
    }
  }

  async notify(workpacketStub, dealId, enquiryId) {
    try {
      return await this.notificationAdapter.notify({
        dealId,
        enquiryId,
        receivedAt: workpacketStub.createdAt,
        challenge: workpacketStub.challenge.key,
        organisation: workpacketStub.organisationContext.name
      });
    } catch {
      return { attempted: true, delivered: false, status: 'FAILED' };
    }
  }

  async submit(workpacketStub, context = {}) {
    if (!this.configurationOk()) return { accepted: false, reason: 'HUBSPOT_NOT_CONFIGURED', transportKind: this.kind, timestamp: new Date().toISOString() };
    const { enquiryId, fingerprint } = context;
    if (!enquiryId || !fingerprint) return { accepted: false, reason: 'STABLE_ENQUIRY_ID_REQUIRED', transportKind: this.kind, timestamp: new Date().toISOString() };

    const contact = await this.upsertContact(workpacketStub.contact);

    let deal = await this.findDeal(enquiryId);
    if (deal) this.assertIdempotentMatch(deal, fingerprint);

    if (!deal) {
      try {
        deal = await this.upsertDeal(workpacketStub, { enquiryId, fingerprint });
      } catch (error) {
        if (!(error instanceof HubSpotTransportError) || !error.uncertain) throw error;
        const recovered = await this.findDeal(enquiryId);
        if (!recovered) throw error;
        this.assertIdempotentMatch(recovered, fingerprint);
        deal = recovered;
      }

      const readBack = await this.findDeal(enquiryId);
      if (!readBack?.id) throw new HubSpotTransportError('DEAL_READBACK_FAILED', 'HubSpot Deal could not be proven by enquiry ID.', { uncertain: true });
      this.assertIdempotentMatch(readBack, fingerprint);
      deal = readBack;
    }

    let associationRepairRequired = false;
    try {
      await this.associateContact(String(deal.id), contact.id);
    } catch {
      associationRepairRequired = true;
      await this.markAssociationRepair(String(deal.id));
    }

    const notification = await this.notify(workpacketStub, String(deal.id), enquiryId);

    return {
      accepted: true,
      transportReference: String(deal.id),
      timestamp: new Date().toISOString(),
      transportKind: this.kind,
      systemOfRecord: 'HUBSPOT_DEAL',
      associationRepairRequired,
      notificationStatus: notification.status
    };
  }
}
