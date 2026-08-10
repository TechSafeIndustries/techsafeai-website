# TechSafeAI Website — WEB-01F Core Front-End

This branch rebuilds the TechSafeAI public website as a pain-point-first consultancy front door using Astro + TypeScript.

## Governed domain target

`CANONICAL DOMAIN TARGET = techsafe.ai`

- Primary intended public domain: `https://techsafe.ai`
- Future canonical hostname: `techsafe.ai`
- Future `www.techsafe.ai` → `techsafe.ai` redirect: deployment gate only
- `techsafe.industries`: retained secondary/corporate domain; no DNS or redirect change in WEB-01F
- historical 10Web/Squarespace infrastructure: not an implementation target

No production DNS, nameserver, SSL/TLS, redirect, email-domain or hosting changes are made in WEB-01F.

## Stack

- Astro 7
- TypeScript
- Static output
- Minimal client JavaScript limited to homepage pain selection
- No framework UI runtime

Astro's `site` configuration is set to `https://techsafe.ai` so canonical URL and future sitemap generation share the governed base URL.

## Core routes

- `/`
- `/solutions` and five capability routes
- `/industries` with Mining & Resources, Construction & Infrastructure, and broader regulated-operations route
- `/how-we-work`
- `/security-trust`
- `/insights`
- `/about`
- `/start-with-your-challenge`
- utility pre-production routes for privacy, terms, accessibility and contact

## WEB-01F boundaries

This branch does **not** implement:

- live enquiry transport
- CRM
- analytics
- production deployment
- public document upload
- SAI runtime
- unrestricted chatbot
- public assessment findings or recommendations
- production DNS/redirects

The `Start with your challenge` page is a non-submitting front-end preview. No browser-generated success, reference number, CRM claim or acknowledgement claim exists.

## SAI

Use only SAI-VIS-10 released assets. If those binaries are not present in the implementation workspace, the site must use the approved character-absent text fallback rather than redraw, approximate or regenerate SAI.

Public Stage-1 states remain limited to ORIENT, COLLECT, ORGANISE, FLAG and HANDOFF. No public ANALYSE or ADVISE.

## Local commands

```bash
npm install
npm run check
npm test
npm run build
npm run dev
```

## Production blockers carried forward

- production-cleared TechSafeAI logo/lockup
- production-cleared operational photography
- live form transport and downstream receipt
- CRM mapping/integration
- analytics and consent/privacy controls
- deployment architecture and security headers
- full WEB-01H accessibility/security/SEO validation

WEB-01F is a feature-branch implementation gate. Do not merge or deploy without a later Control Tower release.
