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
  assert.doesNotMatch(workflow, /HUBSPOT_P2_TEST_PORTAL_ID/);
  assert.doesNotMatch(workflow, /247013136/);
});

test('isolated provider runner is pinned to approved DEVELOPER_TEST account before writes', () => {
  const script = read('.github/scripts/web01g-p2-hubspot-isolated-proof.mjs');
  assert.match(script, /APPROVED_P2_TEST_PORTAL_ID = '247013551'/);
  assert.doesNotMatch(script, /247013136/);
  assert.ok(script.indexOf("assert.equal(String(account.portalId), APPROVED_P2_TEST_PORTAL_ID") < script.indexOf('propertyDefinitions'));
  assert.ok(script.indexOf("assert.equal(account.accountType, 'DEVELOPER_TEST'") < script.indexOf('propertyDefinitions'));
  assert.match(script, /contactReadBack: true/);
  assert.match(script, /P2 SYNTHETIC/);
});

test('isolated app install spec contains exactly the governed six HubSpot scopes', () => {
  const spec = read('docs/WEB-01G-P2-hubspot-test-app-install-spec.md');
  const scopes = [
    'crm.objects.contacts.read',
    'crm.objects.contacts.write',
    'crm.objects.deals.read',
    'crm.objects.deals.write',
    'crm.schemas.deals.read',
    'crm.schemas.deals.write'
  ];
  for (const scope of scopes) assert.match(spec, new RegExp(scope.replaceAll('.', '\\.')));
  assert.match(spec, /"distribution": "private"/);
  assert.match(spec, /"type": "static"/);
  assert.match(spec, /247013551/);
  assert.match(spec, /247013136.*prohibited|prohibited.*247013136/is);
  assert.doesNotMatch(spec, /crm\.objects\.(companies|tickets|owners|products|quotes|line_items|invoices|subscriptions)\.(read|write)/);
  assert.doesNotMatch(spec, /crm\.schemas\.(contacts|companies|custom)\.(read|write)/);
});

test('health endpoint exposes status only', () => {
  const health = read('src/pages/api/health.ts');
  assert.match(health, /status:\s*'ok'/);
  assert.doesNotMatch(health, /process\.env|HUBSPOT|TURNSTILE|Workpacket|contact|email|secret/i);
});
