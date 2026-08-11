import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOptionalTurnstile } from '../src/server/enquiry/abuse.mjs';

const passFetch = async () => new Response(JSON.stringify({ success: true, hostname: 'localhost', action: 'test' }), { status: 200, headers: { 'content-type': 'application/json' } });
const failFetch = async () => new Response(JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] }), { status: 200, headers: { 'content-type': 'application/json' } });

test('required Turnstile accepts only after server-side Siteverify success', async () => {
  const result = await validateOptionalTurnstile(
    { turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX', enquiryId: 'web_0123456789012345678901234567890123456789' },
    '127.0.0.1',
    { TURNSTILE_REQUIRED: '1', TURNSTILE_SECRET_KEY: 'dummy-secret', TURNSTILE_EXPECTED_HOSTNAME: 'localhost', TURNSTILE_EXPECTED_ACTION: 'test' },
    passFetch
  );
  assert.equal(result.ok, true);
  assert.equal(result.configured, true);
});

test('required Turnstile rejects provider validation failure', async () => {
  const result = await validateOptionalTurnstile(
    { turnstileToken: 'bad-token' },
    '127.0.0.1',
    { TURNSTILE_REQUIRED: '1', TURNSTILE_SECRET_KEY: 'dummy-secret' },
    failFetch
  );
  assert.equal(result.ok, false);
  assert.equal(result.code, 'BOT_VALIDATION_FAILED');
});

test('required Turnstile rejects missing token', async () => {
  const result = await validateOptionalTurnstile(
    { turnstileToken: '' },
    '127.0.0.1',
    { TURNSTILE_REQUIRED: '1', TURNSTILE_SECRET_KEY: 'dummy-secret' },
    passFetch
  );
  assert.equal(result.ok, false);
  assert.equal(result.code, 'BOT_VALIDATION_REQUIRED');
});

test('required Turnstile rejects missing server secret', async () => {
  const result = await validateOptionalTurnstile(
    { turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX' },
    '127.0.0.1',
    { TURNSTILE_REQUIRED: '1', TURNSTILE_SECRET_KEY: '' },
    passFetch
  );
  assert.equal(result.ok, false);
  assert.equal(result.code, 'BOT_VALIDATION_NOT_CONFIGURED');
});

test('Turnstile hostname/action mismatch fails closed when configured', async () => {
  const hostname = await validateOptionalTurnstile(
    { turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX' }, '127.0.0.1',
    { TURNSTILE_REQUIRED: '1', TURNSTILE_SECRET_KEY: 'dummy-secret', TURNSTILE_EXPECTED_HOSTNAME: 'staging.example' }, passFetch
  );
  assert.equal(hostname.ok, false);
  assert.equal(hostname.code, 'BOT_HOSTNAME_MISMATCH');

  const action = await validateOptionalTurnstile(
    { turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX' }, '127.0.0.1',
    { TURNSTILE_REQUIRED: '1', TURNSTILE_SECRET_KEY: 'dummy-secret', TURNSTILE_EXPECTED_ACTION: 'enquiry' }, passFetch
  );
  assert.equal(action.ok, false);
  assert.equal(action.code, 'BOT_ACTION_MISMATCH');
});
