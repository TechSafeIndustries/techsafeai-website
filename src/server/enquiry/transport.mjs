import { HubSpotEnquiryTransport } from './hubspot.mjs';

export class DevelopmentTestTransport {
  constructor() {
    this.kind = 'development-test';
    this.submissions = [];
  }

  async submit(workpacketStub) {
    this.submissions.push(workpacketStub);
    return { accepted: true, transportReference: null, timestamp: new Date().toISOString(), transportKind: this.kind };
  }
}

export class RejectedTestTransport {
  constructor() { this.kind = 'rejected-test'; }
  async submit() {
    return { accepted: false, transportReference: null, timestamp: new Date().toISOString(), transportKind: this.kind };
  }
}

export class UnconfiguredProductionTransport {
  constructor(reason = 'NOT_CONFIGURED') {
    this.kind = 'unconfigured-production';
    this.reason = reason;
  }
  async submit() {
    return { accepted: false, transportReference: null, timestamp: new Date().toISOString(), transportKind: this.kind, reason: this.reason };
  }
}

export function getConfiguredTransport(env = process.env, { fetchImpl = fetch } = {}) {
  const mode = env.ENQUIRY_TRANSPORT_MODE ?? 'unconfigured';
  const allowTest = env.ALLOW_TEST_ENQUIRY_TRANSPORT === '1';
  const deploymentEnvironment = (env.DEPLOYMENT_ENVIRONMENT ?? 'development').toLowerCase();
  const hubspotAccountClass = (env.HUBSPOT_ACCOUNT_CLASS ?? '').toLowerCase();

  if (deploymentEnvironment === 'production' && (mode === 'test' || allowTest)) {
    return new UnconfiguredProductionTransport('TEST_TRANSPORT_FORBIDDEN');
  }
  if (deploymentEnvironment === 'production' && hubspotAccountClass === 'developer-test') {
    return new UnconfiguredProductionTransport('TEST_ACCOUNT_FORBIDDEN');
  }
  if (deploymentEnvironment === 'staging' && mode === 'hubspot' && hubspotAccountClass !== 'developer-test') {
    return new UnconfiguredProductionTransport('NONPROD_ACCOUNT_REQUIRED');
  }
  if (mode === 'test' && allowTest) return new DevelopmentTestTransport();
  if (mode === 'hubspot') {
    return new HubSpotEnquiryTransport({
      accessToken: env.HUBSPOT_ACCESS_TOKEN,
      pipelineId: env.HUBSPOT_PIPELINE_ID,
      stageId: env.HUBSPOT_ENQUIRY_STAGE_ID,
      baseUrl: env.HUBSPOT_API_BASE_URL,
      fetchImpl
    });
  }
  return new UnconfiguredProductionTransport();
}
