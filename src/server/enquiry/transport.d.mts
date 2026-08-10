export interface EnquiryTransportResult {
  accepted: boolean;
  transportReference?: string | null;
  timestamp: string;
  transportKind: string;
  reason?: string;
}

export interface EnquiryTransport {
  readonly kind: string;
  submit(workpacketStub: unknown): Promise<EnquiryTransportResult>;
}

export class DevelopmentTestTransport implements EnquiryTransport {
  readonly kind: string;
  readonly submissions: unknown[];
  submit(workpacketStub: unknown): Promise<EnquiryTransportResult>;
}

export class RejectedTestTransport implements EnquiryTransport {
  readonly kind: string;
  submit(workpacketStub: unknown): Promise<EnquiryTransportResult>;
}

export class UnconfiguredProductionTransport implements EnquiryTransport {
  readonly kind: string;
  submit(workpacketStub: unknown): Promise<EnquiryTransportResult>;
}

export function getConfiguredTransport(env?: Record<string, string | undefined>): EnquiryTransport;
