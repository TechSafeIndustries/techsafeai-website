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

test('legacy false-success handler remains absent', () => {
  assert.equal(fs.existsSync(path.join(root, 'script.js')), false);
  assert.equal(fs.existsSync(path.join(root, 'contact.html')), false);
  const publicSource = [
    read('src/pages/start-with-your-challenge/index.astro'),
    read('src/scripts/intake.ts')
  ].join('\n');
  assert.doesNotMatch(publicSource, /Enquiry Submitted Successfully|You will receive an automated acknowledgement|Your Reference Number|communications are logged in the customer relationship management system/i);
  assert.match(publicSource, /accepted !== true/);
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

test('homepage carries the Phase 9 governed Operational Intelligence narrative', () => {
  // Superseded by Mission 10 / Phase 9 (2026-08-28): the homepage moved from a
  // consultancy-first, pain-selector-led narrative to the approved governed
  // Operational Intelligence narrative (hero -> problem/differentiation ->
  // product story -> 3Ps -> SAI -> ways to engage -> trust/CTA). The old
  // pain-first ordering and upfront "Start with context, not confidential
  // files." security line no longer live on the homepage; the security
  // boundary statement remains live on /security-trust and inside the
  // Start with your challenge intake itself.
  //
  // Superseded again by claude/109 (Homepage Downstream Mission, 2026-09-01):
  // downstream sections consolidated to the site's compact baseline density
  // (Consulting/Industries/Why TechSafeAI/Insights/About pattern). The
  // standalone "Product story" capability-card section and the standalone
  // SAI explainer section were folded into "How TechSafeAI works" and the
  // compact Product/Consultancy split respectively — their assertion lines
  // below are updated to the surviving headline copy. Hero, trust strip,
  // 3Ps headline, SAI hero callout, CTA and industry names are unchanged.
  const home = read('src/pages/index.astro');
  assert.match(home, /Operational information is everywhere\./);
  assert.match(home, /Operational understanding isn't\./);
  assert.match(home, /Your existing systems.*remain authoritative/s);
  assert.match(home, /Evidence and provenance.*stay visible/s);
  assert.match(home, /Human decisions.*remain human/s);
  assert.match(home, /From existing systems to better-informed decisions\./);
  assert.match(home, /One operation\. Three connected perspectives\./);
  assert.match(home, /SAI assists the human\./);
  assert.match(home, /Works with your existing IMS &amp; systems\./);
  assert.match(home, /Evidence &amp; Provenance.*Audit Ready.*Human Review.*Secure &amp; Private/s);
  assert.match(home, /Operational Intelligence backed by operational expertise\./);
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

test('legacy SAI-WEB-001/002/003 assets are held and not wired into Website runtime (SAI-WEB-RUNTIME-DISENGAGE-01)', () => {
  // SAI-WEB-001/002/003 remain HELD / NOT AUTHORISED FOR PRODUCTION USE
  // (Founder disposition, SAI-WEB-PROV-DISP-01, 30 Aug 2026): provenance
  // remains Classification C (possible match, incomplete), and SAI-WEB-002/003
  // are additionally flagged for replacement from a governed source. The
  // binaries stay in place unmodified as held, non-runtime legacy artefacts
  // (see the hash test above); this test confirms none of the three is wired
  // into any Website CSS or page output.
  const css = read('src/styles/web-sai-01.css');
  const legacyPaths = [
    '/assets/sai/sai-mark-na-na-website-xs64-dark-fc-v1.0.0.png',
    '/assets/sai/sai-comp-handoff-upper-website-l-light-fc-v1.0.0.webp',
    '/assets/sai/sai-state-orient-upper-website-m-light-fc-v1.0.0.webp'
  ];
  for (const asset of legacyPaths) {
    assert.equal(css.includes(asset), false, `${asset} must not be referenced in web-sai-01.css — asset is HELD, not authorised for production use`);
  }
  assert.doesNotMatch(css, /#approach \.section-title::after/);
  assert.doesNotMatch(css, /#security \.security-detail::after/);
  assert.doesNotMatch(css, /\.cta-band \.cta-band-grid > div:last-child::after/);

  const challenge = read('src/pages/start-with-your-challenge/index.astro');
  assert.doesNotMatch(challenge, /sai-comp-handoff-upper-website-l-light-fc-v1\.0\.0\.webp/);
});
