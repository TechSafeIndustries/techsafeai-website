import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

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
  assert.match(start, /Online enquiry submission is not yet available/i);
  assert.doesNotMatch(start, /Enquiry Submitted Successfully|You will receive an automated acknowledgement|Your Reference Number|communications are logged in the customer relationship management system/i);
});

test('public UI does not expose internal build or control-tower language', () => {
  const publicFiles = [
    'src/pages/index.astro',
    'src/pages/start-with-your-challenge/index.astro',
    'src/pages/contact/index.astro',
    'src/pages/privacy/index.astro',
    'src/pages/accessibility/index.astro',
    'src/pages/terms/index.astro',
    'src/components/Footer.astro'
  ];
  const publicSource = publicFiles.map(read).join('\n');
  assert.doesNotMatch(publicSource, /WEB-01F|WEB-01G|CANONICAL DOMAIN TARGET|SAI-VIS-10|production DNS|deployment status|CRM claim|front-end build/i);
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
  assert.doesNotMatch(source, /\b(?:ANALYSE|ADVISE)\b/);
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

test('approved SAI website assets match the governed SHA-256 hashes', () => {
  const assets = [
    ['public/assets/sai/sai-mark-na-na-website-xs64-dark-fc-v1.0.0.png', '5ba0a021414c40e9ae65796a83138f1f8f1cd4f622a85cdabd35e1209bdb9d48'],
    ['public/assets/sai/sai-comp-handoff-upper-website-l-light-fc-v1.0.0.webp', '4938b9e3026ed6c2658ce4c62c007376a568e19811d5dbcd156ae8b16d372105'],
    ['public/assets/sai/sai-state-orient-upper-website-m-light-fc-v1.0.0.webp', '3d0ec2a20b642405d3e536201f85fbf2c5aa56e04c6b680989e538bd169864cb']
  ];
  for (const [file, expected] of assets) {
    const absolute = path.join(root, file);
    assert.ok(fs.existsSync(absolute), `${file} missing`);
    const actual = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
    assert.equal(actual, expected, `${file} hash mismatch`);
  }
});

test('SAI website assets are limited to the three governed homepage placements', () => {
  const css = read('src/styles/web-sai-01.css');
  const exactPaths = [
    '/assets/sai/sai-mark-na-na-website-xs64-dark-fc-v1.0.0.png',
    '/assets/sai/sai-comp-handoff-upper-website-l-light-fc-v1.0.0.webp',
    '/assets/sai/sai-state-orient-upper-website-m-light-fc-v1.0.0.webp'
  ];
  for (const asset of exactPaths) assert.equal(css.split(asset).length - 1, 1, `${asset} must appear once`);
  assert.match(css, /#approach \.section-title::after[\s\S]*sai-mark-na-na-website-xs64-dark-fc-v1\.0\.0\.png/);
  assert.match(css, /#security \.security-detail::after[\s\S]*sai-comp-handoff-upper-website-l-light-fc-v1\.0\.0\.webp/);
  assert.match(css, /\.cta-band \.cta-band-grid > div:last-child::after[\s\S]*sai-state-orient-upper-website-m-light-fc-v1\.0\.0\.webp/);
  assert.doesNotMatch(css, /\.hero[^\n{]*::(?:before|after)[\s\S]*\/assets\/sai\//);
  assert.doesNotMatch(css, /\.site-header[^\n{]*::(?:before|after)[\s\S]*\/assets\/sai\//);
  assert.doesNotMatch(css, /\.pain-selector[^\n{]*::(?:before|after)[\s\S]*\/assets\/sai\//);
  assert.doesNotMatch(css, /#solutions[^\n{]*::(?:before|after)[\s\S]*\/assets\/sai\//);
  assert.doesNotMatch(css, /#industries[^\n{]*::(?:before|after)[\s\S]*\/assets\/sai\//);
  assert.doesNotMatch(css, /\.proof[^\n{]*::(?:before|after)[\s\S]*\/assets\/sai\//);
});

test('SAI CSS prevents upscaling beyond governed dimensions', () => {
  const css = read('src/styles/web-sai-01.css');
  assert.match(css, /#approach \.section-title::after[\s\S]*width:\s*42px;[\s\S]*height:\s*42px;[\s\S]*max-width:\s*42px;/);
  assert.match(css, /#security \.security-detail::after[\s\S]*max-width:\s*420px;[\s\S]*aspect-ratio:\s*420 \/ 213;/);
  assert.match(css, /\.cta-band \.cta-band-grid > div:last-child::after[\s\S]*max-width:\s*285px;[\s\S]*max-height:\s*213px;[\s\S]*aspect-ratio:\s*285 \/ 213;/);
});
