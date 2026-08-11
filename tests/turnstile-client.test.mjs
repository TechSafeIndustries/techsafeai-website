import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const client = read('src/scripts/intake.ts');
const page = read('src/pages/start-with-your-challenge/index.astro');
const env = read('.env.example');
const abuse = read('src/server/enquiry/abuse.mjs');

test('client references only the public Turnstile sitekey credential', () => {
  assert.match(client, /import\.meta\.env\.PUBLIC_TURNSTILE_SITEKEY/);
  // The server secret must never appear in client source.
  assert.doesNotMatch(client, /TURNSTILE_SECRET_KEY/);
  // No other server-side Turnstile env is read client-side.
  assert.doesNotMatch(client, /import\.meta\.env\.TURNSTILE_/);
});

test('explicit rendering uses the official Cloudflare Turnstile API and governed action', () => {
  assert.match(client, /challenges\.cloudflare\.com\/turnstile\/v0\/api\.js\?render=explicit/);
  assert.match(client, /\.render\(/);
  assert.match(client, /action: 'website_enquiry'/);
});

test('Turnstile script loads only when a non-empty sitekey is configured', () => {
  assert.match(client, /turnstileConfigured/);
  // Script request is gated behind the configured flag.
  assert.match(client, /if \(!turnstileConfigured \|\| turnstileScriptRequested\) return;/);
});

test('Review-stage activation controls widget rendering', () => {
  // The widget is activated when the review screen (data-screen 9) becomes active.
  assert.match(client, /screens\[screenIndex\]\?\.dataset\.screen === '9'\) activateTurnstile\(\)/);
  assert.match(client, /function activateTurnstile\(\)/);
  // The container lives inside the review screen, before the submit control.
  assert.ok(page.indexOf('id="turnstile-widget"') < page.indexOf('id="submit-enquiry"'));
  assert.match(page, /data-screen="9"[\s\S]*id="turnstile-widget"[\s\S]*id="submit-enquiry"/);
});

test('successful Turnstile callback populates the governed turnstileToken field', () => {
  assert.match(client, /callback: \(token: string\) => \{\s*setTurnstileToken\(token\);/);
  assert.match(client, /function setTurnstileToken\(token: string\) \{\s*if \(turnstileTokenField\) turnstileTokenField\.value = token;/);
});

test('expired and error callbacks clear the token', () => {
  assert.match(client, /'expired-callback': \(\) => \{\s*clearTurnstileToken\(\);/);
  assert.match(client, /'error-callback': \(\) => \{\s*clearTurnstileToken\(\);/);
});

test('configured client verification prevents POST when no token exists', () => {
  const guard = client.indexOf("if (turnstileConfigured && !(turnstileTokenField?.value.trim()))");
  const fetchCall = client.indexOf("fetch('/api/enquiry'");
  assert.ok(guard !== -1, 'expected a no-token submission guard');
  assert.ok(guard < fetchCall, 'token guard must run before the POST');
  // The guard returns before contacting the server.
  assert.match(client, /if \(turnstileConfigured && !\(turnstileTokenField\?\.value\.trim\(\)\)\) \{[\s\S]*?return;\s*\}/);
});

test('failed submission resets the widget before any retry; success does not', () => {
  assert.match(client, /function resetTurnstile\(\)/);
  assert.match(client, /if \(api && turnstileWidgetId !== undefined\) api\.reset\(turnstileWidgetId\);/);
  // Reset is invoked on both the rejected-response and network-failure paths.
  const rejectBlock = client.indexOf('result?.accepted !== true');
  const firstReset = client.indexOf('resetTurnstile()', rejectBlock);
  const successMarker = client.indexOf('form.hidden = true');
  assert.ok(firstReset !== -1 && firstReset < successMarker, 'reset must occur on the rejected path before success');
  // The success path itself performs no reset (the form is closed/hidden after acceptance).
  const successBlock = client.slice(successMarker, client.indexOf('} catch {', successMarker));
  assert.doesNotMatch(successBlock, /resetTurnstile\(\)/);
});

test('successful submission preserves the existing human-review confirmation', () => {
  assert.ok(client.indexOf("result?.accepted !== true") < client.indexOf('confirmation.hidden = false'));
  assert.match(client, /form\.hidden = true;/);
  assert.match(client, /confirmation\.hidden = false;/);
});

test('environment template documents public vs server Turnstile credentials', () => {
  assert.match(env, /PUBLIC_TURNSTILE_SITEKEY=/);
  assert.match(env, /TURNSTILE_SECRET_KEY=/);
  assert.match(env, /browser-visible/i);
  assert.match(env, /server-only/i);
  assert.match(env, /production/i);
});

test('server-side origin controls remain intact', () => {
  assert.match(abuse, /export function validateOrigin/);
  assert.match(abuse, /'https:\/\/techsafe\.ai'/);
  assert.match(abuse, /ALLOWED_ENQUIRY_ORIGINS/);
  assert.match(abuse, /ORIGIN_REQUIRED/);
  assert.match(abuse, /ORIGIN_REJECTED/);
});
