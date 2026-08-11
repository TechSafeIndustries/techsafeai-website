# WEB-01G-P2 — Closure Record

Status: **WEB-01G-P2 — PASS / CLOSED**

Date: 2026-08-11

Branch: `web/WEB-01G-P2-nonprod-integration`

Closure HEAD: `5becea1a6bc16bd9bbf3f278b1e11227545b4ad7`

This is a governed closure/documentation record for WEB-01G-P2 following successful
provider, hosted-staging and protected-browser integration proof. It authorises no
production action. No secret or token values appear in this document.

---

## A. HubSpot provider proof

Authorised developer test account only:

```text
portalId
247013551

accountType
DEVELOPER_TEST

REAL ACCOUNT
247013136

REAL-ACCOUNT CRM WRITE STATUS
PROHIBITED / NONE PERFORMED
```

- Test app: `TechSafeAI Website Enquiry P2`
- Authentication: Static private app

Required scope groups:

- `oauth`
- `crm.objects.contacts.read`
- `crm.objects.contacts.write`
- `crm.objects.deals.read`
- `crm.objects.deals.write`
- `crm.schemas.deals.read`
- `crm.schemas.deals.write`

Pipeline/stage authority:

- Pipeline authority: HubSpot CRM Pipelines API
- Governed test pipeline: `default` / Sales Pipeline
- Governed test stage: `appointmentscheduled` / Appointment Scheduled

Isolated GitHub proof:

- Workflow run: `31460952119`
- Rerun attempt: `2`
- Conclusion: **SUCCESS**
- Contact creation: PASS
- Deal creation / read-back: PASS
- `duplicateRetrySameDeal`: `true`
- `contactReadBack`: `true`
- `contactAssociationCount`: `1`
- `associationRepairRequired`: `false`
- `syntheticRecordsRetainedForEvidence`: `true`

---

## B. Railway hosted staging

```text
ENVIRONMENT
staging

SERVICE
techsafeai-website

PUBLIC STAGING URL
https://techsafeai-website-staging.up.railway.app

REGION
Southeast Asia / Singapore

SOURCE BRANCH
web/WEB-01G-P2-nonprod-integration
```

- Health endpoint: `/api/health`
- Health result: `200` / `{"status":"ok"}`
- Build: `npm run build`
- Start: `node ./dist/server/entry.mjs`
- No `techsafe.ai` production domain connected.

---

## C. Browser → HubSpot proof

Browser structured intake submission completed successfully through the Railway staging
deployment.

Observed path:

```text
Browser
  -> /api/enquiry
  -> origin / abuse controls
  -> HubSpot developer-test transport
  -> Contact
  -> Deal
  -> Contact<->Deal association
  -> truthful human-review confirmation
```

Provider evidence included:

Existing-contact proof:

- Contact: `John Storm`
- Deal: `Website enquiry — JD MINING`
- Pipeline: Sales Pipeline
- Stage: Appointment Scheduled
- Association count: `1`

Fresh-contact protected proof:

- Contact: `P2 Turnstile User`
- Email: `p2.turnstile.browser.20260811@example.com`
- Deal: `Website enquiry — P2 Turnstile Mining Test`
- Pipeline: Sales Pipeline
- Stage: Appointment Scheduled
- Association count: `1`
- Source: `TechSafeAI Website Enquiry P2`

---

## D. Origin control proof

Initial Railway browser submission failed closed with **HTTP 403** because the Railway
staging origin was not authorised.

Staging was then explicitly allow-listed using:

```text
ALLOWED_ENQUIRY_ORIGINS=
https://techsafeai-website-staging.up.railway.app
```

Result: origin guard **PASS**.

Wildcard origin permission was **NOT** used.

---

## E. Cloudflare Turnstile

```text
WIDGET
TechSafeAI P2 Staging

HOSTNAME RESTRICTION
techsafeai-website-staging.up.railway.app

MODE
Managed
```

- Browser implementation commit: `5becea1a6bc16bd9bbf3f278b1e11227545b4ad7`
- Client configuration: `PUBLIC_TURNSTILE_SITEKEY`
- Server-only configuration: `TURNSTILE_SECRET_KEY`
- Staging enforcement: `TURNSTILE_REQUIRED=1`
- Expected hostname: `techsafeai-website-staging.up.railway.app`
- Expected action: `website_enquiry`

Observed protected flow:

```text
Browser
  -> real Cloudflare Turnstile widget
  -> token
  -> Railway /api/enquiry
  -> server-side Siteverify
  -> hostname/action validation
  -> HubSpot developer-test account
  -> Contact
  -> Deal
  -> association
  -> accepted human-review confirmation
```

Result:

- REAL TURNSTILE WIDGET — PASS
- SERVER-SIDE SITEVERIFY — PASS
- HOSTNAME VALIDATION — PASS
- ACTION VALIDATION — PASS
- PROTECTED BROWSER SUBMISSION — PASS

No Turnstile secret key or HubSpot token is recorded or reproduced in this document.

---

## F. Application validation

At Turnstile implementation closure:

- `npm test`: 54 passed / 0 failed
- Astro check: 49 files — 0 errors, 0 warnings, 0 hints
- Build: PASS

Client-bundle credential inspection:

- `TURNSTILE_SECRET_KEY` — absent
- `HUBSPOT_ACCESS_TOKEN` — absent
- `HUBSPOT_P2_TEST_ACCESS_TOKEN` — absent
- No `Bearer` credential exposed

---

## G. Governed closure decision

**WEB-01G-P2 — PASS / CLOSED**

Pass dimensions:

- HubSpot isolated provider proof — PASS
- developer-test isolation — PASS
- Contact creation — PASS
- Deal creation / read-back — PASS
- duplicate / idempotency protection — PASS
- Contact<->Deal association — PASS
- Railway Singapore staging — PASS
- Astro hosted runtime — PASS
- `/api/health` — PASS
- browser end-to-end submission — PASS
- truthful fail-closed / success behaviour — PASS
- origin restriction — PASS
- Cloudflare Turnstile browser widget — PASS
- server-side Siteverify — PASS
- hostname validation — PASS
- action validation — PASS
- protected enquiry → HubSpot proof — PASS

---

## H. Remaining holds

This closure DOES NOT authorise:

- merge to main;
- WEB-01H commencement;
- `techsafe.ai` DNS changes;
- production deployment;
- production Cloudflare configuration;
- real HubSpot CRM writes;
- real client data;
- production enquiry activation.

Current remaining governance holds:

```text
PRIVACY                       BLOCKED
LEGAL WEBSITE OPERATOR        BLOCKED
PRODUCTION                    HOLD
MAIN MERGE                    HOLD
DNS                           HOLD
REAL HUBSPOT CRM WRITES       HOLD
WEB-01H                       HOLD pending Control Tower release
```

Synthetic P2 evidence records are retained temporarily for closure evidence and must not
be treated as production data.

---

## I. Security / secret statement

- No HubSpot access token stored in repository.
- No Turnstile secret stored in repository.
- Railway provider secrets remain external configuration.
- GitHub Actions HubSpot test token remains a GitHub encrypted secret.
- No secret values appear in this closure document.

---

Control returns to Founder / Control Tower. WEB-01H remains on hold pending Control Tower
release.
