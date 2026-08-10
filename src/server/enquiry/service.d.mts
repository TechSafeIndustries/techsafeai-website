export interface EnquiryRequestOptions {
  clientAddress?: string;
  transport?: { submit(workpacketStub: unknown): Promise<unknown> };
  env?: Record<string, string | undefined>;
  nowMs?: number;
  fetchImpl?: typeof fetch;
}
export function handleEnquiryRequest(request: Request, options?: EnquiryRequestOptions): Promise<Response>;
