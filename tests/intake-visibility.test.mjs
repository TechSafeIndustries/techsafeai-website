import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('handoff confirmation remains hidden until accepted server response', () => {
  const page = fs.readFileSync('src/pages/start-with-your-challenge/index.astro', 'utf8');
  const css = fs.readFileSync('src/styles/intake.css', 'utf8');
  const client = fs.readFileSync('src/scripts/intake.ts', 'utf8');
  assert.match(page, /id="intake-confirmation"[^>]*hidden/);
  assert.match(css, /\.intake-confirmation\[hidden\]\{display:none!important\}/);
  assert.ok(client.indexOf("result?.accepted !== true") < client.indexOf('confirmation.hidden = false'));
});
