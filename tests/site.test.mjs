import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('canonical domain is techsafe.ai', () => {
  const config = read('astro.config.mjs');
  assert.match(config, /site:\s*['"]https:\/\/techsafe\.ai['"]/);
  assert.doesNotMatch(config, /techsafe\.industries/);
});

test('legacy false-success handler is removed from the WEB-01F tree', () => {
  assert.equal(fs.existsSync(path.join(root, 'script.js')), false);
  assert.equal(fs.existsSync(path.join(root, 'contact.html')), false);
  const start = read('src/pages/start-with-your-challenge/index.astro');
  assert.match(start, /NO ENQUIRY IS TRANSMITTED/);
  assert.doesNotMatch(start, /Enquiry Submitted Successfully|You will receive an automated acknowledgement|Your Reference Number|communications are logged in the customer relationship management system/i);
});

test('homepage preserves pain-first and security language', () => {
  const home = read('src/pages/index.astro');
  assert.ok(home.indexOf('What are you trying to solve?') < home.indexOf('TechSafeAI approach'));
  assert.match(home, /Start with context, not confidential files\./);
  assert.match(home, /Mining & Resources/);
  assert.match(home, /Construction & Infrastructure/);
  assert.match(home, /Other Risk-Intensive & Regulated Operations/);
});

test('SAI runtime and prohibited public states are not implemented', () => {
  const all = fs.readdirSync(path.join(root, 'src/pages'), { recursive: true, withFileTypes: true });
  const pageFiles = all.filter((entry) => entry.isFile() && entry.name.endsWith('.astro'));
  assert.ok(pageFiles.length > 0);
  const source = fs.readFileSync(path.join(root, 'src/pages/index.astro'), 'utf8');
  assert.doesNotMatch(source, /chatbot|floating assistant/i);
  assert.doesNotMatch(source, /data-sai-state=["'](?:ANALYSE|ADVISE)/);
});

test('homepage selector supports the eleven governed pain-point keys', () => {
  const data = read('src/data/site.ts');
  const keys = [
    'AUDIT_ASSURANCE', 'CONTROL_VERIFICATION', 'SYSTEM_EVIDENCE_FRAGMENTATION',
    'CONTRACTOR_COMPETENCY', 'RECURRING_FINDINGS_INCIDENTS', 'AI_READINESS_GOVERNANCE',
    'AI_INFORMATION_SECURITY', 'WORKFLOW_ADMIN_DECISIONS', 'TRANSFORMATION_VALUE',
    'INTERNAL_AI_CAPABILITY', 'OTHER_UNSURE'
  ];
  for (const key of keys) assert.match(data, new RegExp(key));
});
