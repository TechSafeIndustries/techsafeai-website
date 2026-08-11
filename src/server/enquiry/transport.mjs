export class DevelopmentTestTransport {
  constructor() {
    this.kind = 'development-test';
    this.submissions = [];
  }

  async submit(workpacketStub) {
    this.submissions.push(workpacketStub);
    return {
      accepted: true,
      transportReference: null,
      timestamp: new Date().toISOString(),
      transportKind: this.kind
    };
  }
}

export class RejectedTestTransport {
  constructor() {
    this.kind = 'rejected-test';
  }

  async submit() {
    return {
      accepted: false,
      transportReference: null,
      timestamp: new Date().toISOString(),
      transportKind: this.kind
    };
  }
}

export class UnconfiguredProductionTransport {
  constructor(reason = 'NOT_CONFIGURED') {
    this.kind = 'unconfigured-production';
    this.reason = reason;
  }

  async submit() {
    return {
      accepted: false,
      transportReference: null,
      timestamp: new Date().toISOString(),
      transportKind: this.kind,
      reason: this.reason
    };
  }
}

export function getConfiguredTransport(env = process.env) {
  const mode = env.ENQUIRY_TRANSPORT_MODE ?? 'unconfigured';
  const allowTest = env.ALLOW_TEST_ENQUIRY_TRANSPORT === '1';
  const deploymentEnvironment = (env.DEPLOYMENT_ENVIRONMENT ?? 'development').toLowerCase();

  if (deploymentEnvironment === 'production' && (mode === 'test' || allowTest)) {
    return new UnconfiguredProductionTransport('TEST_TRANSPORT_FORBIDDEN');
  }

  if (mode === 'test' && allowTest) return new DevelopmentTestTransport();

  return new UnconfiguredProductionTransport();
}
