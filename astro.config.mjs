import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://techsafe.ai',
  output: 'static',
  adapter: node({
    mode: 'standalone'
  }),
  trailingSlash: 'never',
  build: {
    format: 'directory'
  },
  // Phase 9 (Mission 10, 2026-08-28) IA cutover, extended by Mission 10A
  // (2026-08-29) legacy /solutions/* sub-page reconciliation. Redirect
  // targets are the closest currently-implemented canonical route per the
  // Founder-approved mapping in claude/14 — no new child routes were created
  // just to preserve old page names, per that mission's instruction.
  redirects: {
    '/solutions': { status: 301, destination: '/product' },
    '/how-we-work': { status: 301, destination: '/consulting' },
    '/security-trust': { status: 301, destination: '/why-techsafeai' },
    '/solutions/systems-evidence-assurance': { status: 301, destination: '/product' },
    '/solutions/safety-compliance-readiness': { status: 301, destination: '/consulting' },
    '/solutions/ai-readiness-governance': { status: 301, destination: '/consulting' },
    '/solutions/operational-ai-transformation': { status: 301, destination: '/consulting' },
    '/solutions/ai-capability-enablement': { status: 301, destination: '/consulting' }
  }
});
