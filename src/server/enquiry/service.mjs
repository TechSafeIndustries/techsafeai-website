import { validateEnquiryPayload, buildWorkpacketStub } from './core.mjs';
import { getConfiguredTransport } from './transport.mjs';
import { contextFingerprint, deriveEnquiryId } from './submission.mjs';
import {
  checkRateLimit,
  validateHoneypotAndAge,
  validateOptionalTurnstile,
  validateOrigin
} from './abuse.mjs';

const headers = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store'
};

const json = (status, body, extraHeaders = {}) => new Response(JSON.stringify(body), { status, headers: { ...headers, ...extraHeaders } });

export async function handleEnquiryRequest(request, {
  clientAddress = 'unknown',
  transport,
  env = process.env,
  nowMs = Date.now(),
  fetchImpl = fetch
} = {}) {
  if (request.method !== 'POST') return json(405, { accepted: false, code: 'METHOD_NOT_ALLOWED' });

  const length = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(length) && length > 32_000) return json(413, { accepted: false, code: 'REQUEST_TOO_LARGE' });

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return json(415, { accepted: false, code: 'UNSUPPORTED_CONTENT_TYPE' });

  const origin = validateOrigin(request, env);
  if (!origin.ok) return json(403, { accepted: false, code: 'REQUEST_REJECTED', message: 'We could not accept this request.' });

  const rate = checkRateLimit(clientAddress, nowMs);
  if (!rate.ok) return json(429, { accepted: false, code: 'TOO_MANY_REQUESTS', message: 'Please wait before trying again.' });

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json(400, { accepted: false, code: 'INVALID_JSON', message: 'Please review the form and try again.' });
  }

  const abuse = validateHoneypotAndAge(payload, nowMs);
  if (!abuse.ok) return json(400, { accepted: false, code: 'REQUEST_REJECTED', message: 'We could not accept this request.' });

  const bot = await validateOptionalTurnstile(payload, clientAddress, env, fetchImpl);
  if (!bot.ok) return json(400, { accepted: false, code: 'REQUEST_REJECTED', message: 'We could not verify this request. Please try again.' });

  const validated = validateEnquiryPayload(payload);
  if (!validated.ok) {
    return json(400, {
      accepted: false,
      code: 'VALIDATION_FAILED',
      message: 'Please review the highlighted information.',
      fieldErrors: validated.errors
    });
  }

  const selectedTransport = transport ?? getConfiguredTransport(env, { fetchImpl });
  const enquiryId = deriveEnquiryId(validated.data, payload.startedAt);
  const fingerprint = contextFingerprint(validated.data);
  const workpacketStub = buildWorkpacketStub(validated.data, new Date(nowMs));

  let result;
  try {
    result = await selectedTransport.submit(workpacketStub, { enquiryId, fingerprint });
  } catch (error) {
    const retryAfterMs = Number(error?.retryAfterMs || 0);
    const extraHeaders = retryAfterMs > 0 ? { 'retry-after': String(Math.max(1, Math.ceil(retryAfterMs / 1000))) } : {};
    return json(503, {
      accepted: false,
      code: error?.code === 'RATE_LIMITED' ? 'TRANSPORT_RATE_LIMITED' : 'TRANSPORT_UNAVAILABLE',
      message: 'Online enquiry submission is temporarily unavailable. Your information has not been confirmed as received.'
    }, extraHeaders);
  }

  if (!result?.accepted) {
    const code = result?.reason === 'NOT_CONFIGURED' ? 'TRANSPORT_NOT_CONFIGURED' : 'TRANSPORT_REJECTED';
    return json(503, {
      accepted: false,
      code,
      message: 'Online enquiry submission is not available right now. Your information has not been confirmed as received.'
    });
  }

  return json(202, {
    accepted: true,
    status: 'ACCEPTED_FOR_HUMAN_REVIEW',
    humanReview: true,
    message: 'Your context has been accepted for human review.'
  });
}
