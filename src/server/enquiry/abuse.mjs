const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 8;
const MIN_FORM_AGE_MS = 800;
const MAX_FORM_AGE_MS = 4 * 60 * 60 * 1000;

const buckets = new Map();

export function resetAbuseStateForTests() {
  buckets.clear();
}

export function validateOrigin(request, env = process.env) {
  const origin = request.headers.get('origin');
  if (!origin) return { ok: false, code: 'ORIGIN_REQUIRED' };

  const allowed = new Set(['https://techsafe.ai']);
  try {
    allowed.add(new URL(request.url).origin);
  } catch {
    return { ok: false, code: 'ORIGIN_INVALID' };
  }

  for (const item of (env.ALLOWED_ENQUIRY_ORIGINS ?? '').split(',').map((v) => v.trim()).filter(Boolean)) {
    allowed.add(item);
  }

  return allowed.has(origin)
    ? { ok: true }
    : { ok: false, code: 'ORIGIN_REJECTED' };
}

export function validateHoneypotAndAge(payload, nowMs = Date.now()) {
  const website = typeof payload?.companyWebsite === 'string' ? payload.companyWebsite.trim() : '';
  if (website) return { ok: false, code: 'ABUSE_REJECTED' };

  const startedAt = Number(payload?.startedAt);
  if (!Number.isFinite(startedAt)) return { ok: false, code: 'FORM_AGE_INVALID' };

  const age = nowMs - startedAt;
  if (age < MIN_FORM_AGE_MS) return { ok: false, code: 'FORM_TOO_FAST' };
  if (age > MAX_FORM_AGE_MS) return { ok: false, code: 'FORM_EXPIRED' };

  return { ok: true };
}

export function checkRateLimit(clientKey = 'unknown', nowMs = Date.now()) {
  const key = clientKey || 'unknown';
  const existing = buckets.get(key) ?? [];
  const current = existing.filter((timestamp) => nowMs - timestamp < RATE_WINDOW_MS);
  if (current.length >= RATE_LIMIT) {
    buckets.set(key, current);
    return { ok: false, code: 'RATE_LIMITED' };
  }
  current.push(nowMs);
  buckets.set(key, current);
  return { ok: true };
}

export async function validateOptionalTurnstile(payload, clientAddress, env = process.env, fetchImpl = fetch) {
  const token = typeof payload?.turnstileToken === 'string' ? payload.turnstileToken.trim() : '';
  const secret = (env.TURNSTILE_SECRET_KEY ?? '').trim();
  const required = env.TURNSTILE_REQUIRED === '1';
  const expectedHostname = (env.TURNSTILE_EXPECTED_HOSTNAME ?? '').trim();
  const expectedAction = (env.TURNSTILE_EXPECTED_ACTION ?? '').trim();

  if (!secret && !token && !required) return { ok: true, configured: false };
  if (!secret && (token || required)) return { ok: false, code: 'BOT_VALIDATION_NOT_CONFIGURED' };
  if (secret && !token) return { ok: false, code: 'BOT_VALIDATION_REQUIRED' };
  if (token.length > 2048) return { ok: false, code: 'BOT_TOKEN_INVALID' };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: clientAddress || undefined,
        idempotency_key: typeof payload?.enquiryId === 'string' ? payload.enquiryId : undefined
      }),
      signal: controller.signal
    });
    const result = await response.json();
    if (!result?.success) return { ok: false, code: 'BOT_VALIDATION_FAILED' };
    if (expectedHostname && result.hostname && result.hostname !== expectedHostname) return { ok: false, code: 'BOT_HOSTNAME_MISMATCH' };
    if (expectedAction && result.action && result.action !== expectedAction) return { ok: false, code: 'BOT_ACTION_MISMATCH' };
    return { ok: true, configured: true, hostname: result.hostname || '', action: result.action || '' };
  } catch {
    return { ok: false, code: 'BOT_VALIDATION_UNAVAILABLE' };
  } finally {
    clearTimeout(timeout);
  }
}
