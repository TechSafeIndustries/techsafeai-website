import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const read = (file) => fs.readFileSync(file, 'utf8');

test('manual isolated HubSpot proof runner is syntactically valid', () => {
  execFileSync(process.execPath, ['--check', '.github/scripts/web01g-p2-hubspot-isolated-proof.mjs'], { stdio: 'pipe' });
});

test('isolated HubSpot proof workflow is manual-only and secret-backed', () => {
  const workflow = read('.github/workflows/web-01g-p2-hubspot-isolated-proof.yml');
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /pull_request:/);
  assert.match(workflow, /secrets\.HUBSPOT_P2_TEST_ACCESS_TOKEN/);
  assert.match(workflow, /secrets\.HUBSPOT_P2_TEST_PORTAL_ID/);
  assert.doesNotMatch(workflow, /247013136/);
});

test('isolated provider runner refuses non-DEVELOPER_TEST account before proof writes', () => {
  const script = read('.github/scripts/web01g-p2-hubspot-isolated-proof.mjs');
  assert.ok(script.indexOf("assert.equal(account.accountType, 'DEVELOPER_TEST'") < script.indexOf('propertyDefinitions'));
  assert.match(script, /P2 SYNTHETIC/);
});

test('health endpoint exposes status only', () => {
  const health = read('src/pages/api/health.ts');
  assert.match(health, /status:\s*'ok'/);
  assert.doesNotMatch(health, /process\.env|HUBSPOT|TURNSTILE|Workpacket|contact|email|secret/i);
});
