# WEB-01G-P1 — Production Transport, Privacy & Hosting Preflight

Status: architecture / selection preflight only

Last researched: 2026-08-11

Governing source SHA: `cc479547d18377df7dc60f8dad7e08cf092b5477`

P1 branch: `web/WEB-01G-P1-production-preflight`

Canonical public-domain target: `https://techsafe.ai`

## Hard holds

This document does not authorise:

- production hosting creation;
- production deployment;
- DNS, MX, SPF, DKIM or DMARC changes;
- live CRM configuration;
- live email integration;
- live Turnstile configuration;
- production secrets;
- merge to `main`;
- WEB-01H.

Structured Hybrid, Stage-1 SAI states and the context-only Workpacket Stub remain locked.

---

## 1. Production-intent architecture

```text
VISITOR
  -> techsafe.ai
  -> HOST / ASTRO NODE SERVER
  -> /api/enquiry
  -> ORIGIN + ABUSE + TURNSTILE + SCHEMA VALIDATION
  -> ENQUIRY TRANSPORT
  -> CRM SYSTEM OF RECORD
  -> PROVIDER RECORD ID
  -> MINIMAL HUMAN NOTIFICATION
  -> HUMAN FOLLOW-UP
```

The current Astro Node standalone architecture is retained. The application is not redesigned to fit a hosting vendor.

Astro official Node documentation confirms the Node adapter supports on-demand routes and standalone deployment, including the generated `dist/server/entry.mjs` server.

Source: https://docs.astro.build/en/guides/integrations-guide/node/

---

## 2. Hosting shortlist

### RECOMMENDED — Railway Pro, Singapore

Reason:

- directly fits the existing Astro standalone Node runtime;
- supports GitHub-linked deploys;
- supports persistent staging and temporary PR environments;
- supports server-side variables and sealed variables;
- supports custom domains and automatic TLS;
- supports health checks, runtime logs and rollback/redeploy;
- Pro is explicitly positioned by Railway for production apps and teams;
- Pro currently costs US$20/month base subscription, with the subscription counting toward resource usage;
- Pro log retention is 30 days;
- Singapore is Railway's current Southeast Asia region.

Hard limitation:

- Railway currently has no Australian runtime region. Current regions are California, Virginia, Amsterdam and Singapore.
- Railway provides network-layer DDoS mitigation but explicitly does not provide application-layer WAF protection. Railway recommends Cloudflare when WAF functionality is required.

Production condition:

Railway is recommended only if legal/privacy review accepts Singapore hosting for the preliminary website-enquiry processing path. If Australian runtime becomes a hard requirement, do not force Railway into the architecture.

Official sources:

- https://docs.railway.com/pricing
- https://docs.railway.com/pricing/plans
- https://docs.railway.com/deployments/regions
- https://docs.railway.com/environments
- https://docs.railway.com/variables
- https://docs.railway.com/networking/public-networking
- https://docs.railway.com/networking/public-networking/specs-and-limits
- https://docs.railway.com/observability/logs
- https://docs.railway.com/deployments/deployment-actions

### ACCEPTABLE ALTERNATIVE — Render paid Web Service, Singapore

Strengths:

- native Node web-service model;
- GitHub linkage and controlled auto-deploy options;
- service previews and environment separation;
- custom domains and managed TLS;
- environment variables / secret files;
- health checks;
- zero-downtime deploys;
- rollback;
- DDoS protection.

Limitations:

- no Australian runtime region; current regions are Oregon, Ohio, Virginia, Frankfurt and Singapore;
- an existing service cannot be moved between regions in place; a new service must be created and migrated;
- exact production compute and workspace price must be confirmed at approval time in Render's current pricing interface rather than assumed here.

Official sources:

- https://render.com/docs/web-services
- https://render.com/docs/regions
- https://render.com/docs/service-previews
- https://render.com/docs/deploys
- https://render.com/docs/rollbacks
- https://render.com/docs/configure-environment-variables
- https://render.com/docs/custom-domains
- https://render.com/docs/ddos-protection
- https://render.com/pricing

### REJECT AS DEFAULT — Fly.io

Fly.io remains a technically valid conditional option, not the default recommendation.

Strength:

- Fly.io currently offers Sydney (`syd`), which is materially useful if Australian runtime becomes mandatory.

Reason rejected as the default:

- requires more infrastructure ownership and deployment plumbing than the current consultancy website needs;
- GitHub deployment is configured through workflow/token infrastructure rather than the simpler managed Git-link model;
- current website does not need the additional platform control enough to justify the operating burden.

Reconsider Fly.io if Australian runtime/data-location becomes a hard requirement before production.

Official sources:

- https://fly.io/docs/reference/regions/
- https://fly.io/docs/about/pricing/
- https://fly.io/docs/app-guides/continuous-deployment-with-github-actions/
- https://fly.io/docs/apps/secrets/

---

## 3. Hosting acceptance criteria

A production host must pass every hard requirement:

- run the current Astro Node standalone application without architecture rewrite;
- serve prerendered routes and `/api/enquiry` from the same controlled application boundary;
- support Node 22 or later compatible runtime;
- support server-side environment variables and secrets;
- support `techsafe.ai` custom domain;
- managed HTTPS/TLS;
- GitHub-driven controlled deployment;
- persistent staging;
- preview/PR validation capability;
- rollback/redeploy capability;
- health checks;
- structured runtime logs;
- request correlation metadata or equivalent;
- production secret isolation from previews;
- APAC runtime; Australian runtime if later made mandatory;
- compatibility with selected edge/abuse controls;
- production can run with auto-deploy disabled or gated by CI/approval;
- missing real transport configuration fails closed;
- test transport cannot run in production.

A provider that fails a hard requirement is rejected.

---

## 4. Transport patterns

### Pattern A — Website -> CRM system of record -> human notification

Decision: **RECOMMENDED**

Benefits:

- one structured authoritative record;
- provider-generated record ID proves downstream acceptance;
- minimal duplicated personal data;
- clear ownership and follow-up state;
- clean audit trail;
- later sales/engagement conversion does not require re-keying a mailbox submission.

### Pattern B — Website -> controlled mailbox -> later CRM ingestion

Decision: **ACCEPTABLE FALLBACK, NOT RECOMMENDED**

Benefits:

- simple;
- already familiar operational model.

Weaknesses:

- email becomes the de facto system of record;
- poor structured deduplication;
- later CRM ingestion duplicates data;
- notification and authoritative record become conflated;
- harder to prove consistent downstream state.

### Pattern C — Website -> transactional email service -> controlled destination

Decision: **REJECT AS PRIMARY RECORD ARCHITECTURE**

Reason:

- adds another processor and another personal-data copy;
- provider message acceptance is not equivalent to a structured commercial enquiry record;
- does not improve ownership, deduplication or CRM conversion enough to justify the extra layer.

A transactional service may be reconsidered later only as a notification mechanism if Microsoft 365 / CRM-native notification cannot meet the requirement.

---

## 5. Recommended transport and system of record

### System of record: HubSpot Deal

Recommended authoritative object:

**one HubSpot Deal per accepted website enquiry**, associated to a HubSpot Contact.

Rationale:

- a Contact represents a person; it should not be overloaded to represent multiple enquiries;
- a Deal gives each enquiry its own lifecycle, owner and record ID;
- repeated enquiries from the same email can associate to the same Contact without overwriting prior enquiry context;
- HubSpot's current Deals API supports creating a Deal, setting properties and associations, and returns a provider-generated record `id` on successful creation;
- HubSpot supports custom unique identifier properties and deal upsert/read by a custom unique identifier;
- current HubSpot API limits explicitly include Free and Starter accounts for private/distributed app patterns.

Official sources:

- https://developers.hubspot.com/docs/api-reference/latest/crm/objects/deals/guide
- https://developers.hubspot.com/docs/api-reference/latest/crm/objects/deals/create-deal
- https://developers.hubspot.com/docs/api-reference/latest/crm/objects/deals/batch/upsert-deals
- https://developers.hubspot.com/docs/api-reference/latest/crm/properties/guide
- https://developers.hubspot.com/docs/developer-tooling/platform/usage-guidelines

### Important account blocker

The actual TechSafeAI HubSpot portal has **not been live-verified in this gate** for:

- current subscription tier;
- active portal ID;
- current data-hosting region;
- private/distributed app availability and scopes;
- existing pipeline IDs and stage IDs;
- available custom-property quota;
- permissions to create a unique Deal property;
- owner/user IDs;
- notification capability.

General HubSpot product documentation is evidence of product capability, not evidence that the current TechSafeAI account is configured or entitled correctly.

**PRODUCTION BLOCKER — VERIFY ACTUAL HUBSPOT PORTAL BEFORE IMPLEMENTATION.**

HubSpot documents custom properties as available across product plans, while the allowed number depends on subscription. HubSpot also documents Free/Starter API limits of 100 requests per 10 seconds per app and 250,000 requests per day per account. These facts do not remove the need to inspect the actual portal.

---

## 6. Proposed CRM mapping

### Contact

Use default fields where possible:

- email — identity/upsert key;
- first/last name or name mapping;
- telephone where supplied.

Contact update must not overwrite unrelated CRM data with empty website fields.

### Deal

Required standard fields:

- `dealname`;
- `pipeline`;
- `dealstage`.

Proposed minimum custom fields:

- `website_enquiry_id` — server-generated UUID, unique;
- `website_received_at`;
- `website_primary_challenge_key`;
- `website_industry_key`;
- `website_timing_window`;
- `website_security_level`;
- `website_workpacket_stub` — compact JSON text containing the context-only Workpacket Stub.

The full Stub should be stored once in the system of record, not reproduced across email, logs and analytics.

HubSpot documents text properties with capacity well above the current bounded Stub size, but final field type and property quota must be confirmed in the actual portal.

### Ownership and stage

Do not invent production pipeline/stage IDs in code.

Required staging/production secrets/configuration later:

- HubSpot access credential;
- pipeline ID;
- enquiry stage ID;
- owner ID if fixed assignment is selected.

Pipeline and owner selection require Founder approval/account inspection.

---

## 7. Success truth model

The production browser must not infer success from local function completion.

Required state model:

```text
SERVER_RECEIVED
  -> INPUT_VALIDATED
  -> PROVIDER_REQUEST_SENT
  -> PROVIDER_ACCEPTED
  -> SYSTEM_OF_RECORD_CREATED
  -> HUMAN_NOTIFICATION_ATTEMPTED
  -> HUMAN_NOTIFIED | NOTIFICATION_FAILED
```

### Browser success gate

Browser success is allowed only when:

1. HubSpot returns a successful Deal record-creation/upsert result; and
2. the result contains a non-empty provider-generated Deal ID, or an idempotent lookup confirms the same `website_enquiry_id` already owns an existing Deal.

The Deal ID is internal receipt evidence. It does not need to be exposed publicly.

### Separate truth states

- `SERVER_RECEIVED` — the Astro endpoint received the request.
- `PROVIDER_ACCEPTED` — HubSpot accepted an API write request.
- `SYSTEM_OF_RECORD_CREATED` — a Deal exists with the exact server enquiry ID.
- `HUMAN_NOTIFIED` — notification convenience succeeded.

A notification failure after `SYSTEM_OF_RECORD_CREATED` does not invalidate the accepted enquiry.

---

## 8. Idempotency and failure model

### Idempotency key

Generate one server-side UUID `website_enquiry_id` for the transport attempt.

Preferred HubSpot control:

- configure `website_enquiry_id` as a custom unique Deal property;
- use that property for idempotent read/upsert operations.

HubSpot currently documents up to ten unique ID properties per object and supports reads/updates/upserts using a custom unique identifier.

### Failure semantics

| Condition | Required behaviour |
|---|---|
| Missing transport configuration | 503; fail closed; no success |
| Production test transport flags | reject by code invariant; no success |
| Provider authentication failure | fail closed; operational security alert; no blind retry |
| Provider 4xx validation/config error | fail closed; classify; no blind retry |
| Provider 429 | fail closed; honour provider retry guidance; do not create duplicate |
| Provider 5xx | unknown/not accepted; retry only after idempotency lookup/backoff |
| Provider timeout | treat as uncertain; lookup by `website_enquiry_id` before retry |
| Duplicate client request | return existing authoritative record internally; do not create second Deal |
| Contact created but Deal fails | no browser success; retry Contact as upsert then Deal with same enquiry ID |
| Deal created but Contact association fails | authoritative enquiry exists; flag partial failure for human repair; browser success policy requires Founder decision before implementation |
| Deal created but notification fails | browser may still truthfully succeed; record notification failure and retry/alert separately |

The production adapter must never blindly repeat a create operation after a timeout.

---

## 9. Human notification

Notification is a convenience layer, not the record.

Recommended sequence:

```text
HubSpot Deal created
  -> minimal notification
  -> accountable TechSafeAI human
```

Notification should contain only:

- provider Deal ID or internal enquiry reference;
- received timestamp;
- primary challenge label/key;
- organisation name only if approved;
- link/instruction to open the CRM record.

Do not copy the full Workpacket Stub or security note into notification email by default.

### Preferred notification implementation

First preference: HubSpot-native notification only if the actual portal supports the required event on the current plan and can be proven reliable.

Important: HubSpot automated Workflows are currently Professional/Enterprise functionality. Do not assume a Free/Starter portal can use workflow-based notification.

Fallback: controlled Microsoft 365 notification using Microsoft Graph `Mail.Send`, from a dedicated authorised business mailbox to the accountable human.

Microsoft Graph documents `Mail.Send` for application permissions, but application permission is broad unless constrained administratively. If Graph is selected later, restrict the application to the dedicated sender mailbox using the available Microsoft tenant controls and grant the least access possible.

A Graph `202 Accepted` confirms Microsoft accepted the send request; it is not proof of final inbox delivery. Notification status must therefore remain separate from system-of-record creation.

Official sources:

- https://knowledge.hubspot.com/workflows/create-workflows
- https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0
- https://learn.microsoft.com/en-us/graph/permissions-reference
- https://learn.microsoft.com/en-us/office365/servicedescriptions/exchange-online-service-description/exchange-online-limits

### Email-authentication dependency

If TechSafeAI sends notification or external acknowledgement mail from its own Microsoft 365 custom domain, SPF, DKIM and DMARC must remain aligned with the authorised sending source.

No DNS change is authorised in P1.

Official sources:

- https://learn.microsoft.com/en-us/defender-office-365/email-authentication-about
- https://learn.microsoft.com/en-us/defender-office-365/email-authentication-spf-configure
- https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dkim-configure

---

## 10. Privacy data-flow map

Proposed path:

```text
VISITOR
  -> techsafe.ai browser
  -> Railway Singapore application host [recommended host]
  -> Cloudflare Turnstile [recommended bot control; if enabled]
  -> HubSpot CRM [recommended system of record]
  -> authorised TechSafeAI human
  -> optional minimal Microsoft 365 notification
```

### Collected data categories

- contact identity: name, email, optional telephone;
- organisation context;
- client-declared problem context;
- industry/activity/environment/jurisdiction selections;
- desired outcome and broad timing;
- internal capability declarations;
- high-level security requirement and optional bounded note;
- security-boundary acknowledgement;
- operational request metadata required for abuse/security/service health.

No public file upload or assessment evidence is collected.

### Purpose

- receive a prospective consulting enquiry;
- prepare preliminary context for human review;
- route the enquiry;
- manage follow-up;
- protect the public endpoint from abuse;
- prove operational receipt and diagnose failures.

### Proposed processors / sub-processors

#### Railway — proposed application host

Processing location for selected Railway region: Singapore.

Final contract/DPA and processor terms require review before production.

#### Cloudflare — proposed Turnstile and potentially edge/WAF rate limiting

Turnstile processes browser/device signals to assess automated abuse. If Cloudflare WAF is later selected, Cloudflare also becomes part of the request traffic path.

Turnstile can operate independently from Cloudflare DNS/CDN. WAF/rate limiting requires the site traffic to be proxied through Cloudflare.

#### HubSpot — proposed CRM processor/system of record

HubSpot currently offers product hosting regions including Australia (Sydney), but the actual TechSafeAI portal region has not been verified.

HubSpot's current published infrastructure sub-processors include:

- Amazon Web Services — Australia for Australia-hosted account infrastructure;
- Cloudflare — local/global CDN/security routing;
- Google — United States for the Australia data-centre column for regional data processing;
- Snowflake — Australia for Australia-hosted account infrastructure;
- HubSpot affiliates for services/support, including HubSpot Australia and HubSpot Asia.

HubSpot also states analytics/usage data may be processed in the United States and that sub-processors may process customer data outside the primary hosting location.

Official sources:

- https://knowledge.hubspot.com/account-security/hubspot-cloud-infrastructure-and-data-hosting-frequently-asked-questions
- https://legal.hubspot.com/sub-processors-page
- https://legal.hubspot.com/dpa

#### Microsoft 365 — optional notification processor

Not yet confirmed as the production notification transport for this website. Actual TechSafeAI mailbox/tenant configuration and authority must be verified before implementation.

### Legal website operator/controller

The final legal website operator/controller is unresolved under existing governance holds.

Do not insert a guessed company/entity name into the production privacy notice.

**PRODUCTION BLOCKER / REQUIRES FOUNDER OR PROFESSIONAL CONFIRMATION.**

No Founder personal-tax material is part of this workstream.

---

## 11. Australian privacy architecture — requirements, not legal conclusions

The following requirements apply **if and to the extent the eventual website operator is an APP entity or otherwise subject to the relevant obligations**. P1 does not make that legal conclusion.

OAIC current guidance states:

- APP 3 requires solicited personal information to be reasonably necessary for an entity's functions/activities and now expressly emphasises proportionality/data minimisation;
- APP 5 includes notification/awareness matters around identity, purposes, disclosures and likely overseas recipients/countries where practicable;
- APP 8 addresses cross-border disclosure and reasonable steps concerning overseas recipients;
- APP 11 requires reasonable security and active destruction/de-identification once personal information is no longer needed, subject to legal retention exceptions.

Official sources:

- https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-3-app-3-collection-of-solicited-personal-information
- https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-5-app-5-notification-of-the-collection-of-personal-information
- https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-8-app-8-cross-border-disclosure-of-personal-information
- https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-11-app-11-security-of-personal-information

A legal/privacy professional must confirm applicability and final notice wording.

---

## 12. Retention proposal

These are governance proposals, not statutory retention conclusions.

| Record | Proposed retention | Rule |
|---|---:|---|
| Incomplete browser entry | current page/session only | no server record; no cross-session persistence |
| Honeypot / clearly rejected abuse body | do not retain body | retain only minimal operational event metadata where needed |
| In-memory form-age / rate counter | minutes, not durable | expire with control window |
| Rejected abuse/security event metadata | up to 7 days | no submitted free text; review only for active abuse/security need |
| Accepted commercial enquiry | 12 months after last meaningful commercial activity if not converted | then delete or de-identify subject to confirmed legal/business requirement |
| Workpacket Stub for unconverted enquiry | same as commercial enquiry | remains preliminary context, not permanent evidence |
| Converted enquiry | move/link into governed engagement record under separate engagement-retention policy | public intake does not automatically become permanent evidence |
| Application/runtime logs | platform operational window, recommended maximum 30 days | structured metadata only; no full Stub/PII bodies |
| Turnstile token | do not retain after validation | provider handles its own service telemetry under its terms |
| Notification email | proposed 90 days after successful CRM recording/follow-up | minimal content only; CRM remains authority |

Before production, Founder/legal review must approve the actual commercial-enquiry retention period and any record-keeping obligation that overrides deletion.

---

## 13. Logging and redaction policy

### Permitted log fields

- event name;
- UTC timestamp;
- request correlation ID;
- route;
- HTTP status;
- duration;
- deployment environment;
- release/commit identifier;
- abuse-result code;
- validation error field names, not field values;
- provider response class/status;
- provider Deal ID after acceptance;
- idempotency/enquiry ID;
- notification status;
- error classification.

### Prohibited in normal application logs

- full Workpacket Stub;
- problem-summary text;
- desired-outcome text;
- security-note text;
- name, email or telephone;
- authorisation headers;
- HubSpot token;
- Turnstile secret/token;
- Microsoft Graph credentials/tokens;
- provider request/response bodies containing personal data.

### Client IP

Do not copy raw IP into business records or routine application logs merely because the host exposes it.

Use IP only where required for transient abuse/rate-limit operation. Prefer edge/provider counters rather than durable application logging of raw addresses.

Railway currently exposes `X-Railway-Request-Id`, which is suitable for infrastructure/request correlation without logging submitted content.

---

## 14. Secrets model

Secrets remain server-side and outside Git/browser/logs/screenshots.

Potential future production variables:

- `DEPLOYMENT_ENVIRONMENT=production`;
- `ENQUIRY_TRANSPORT_MODE=hubspot`;
- `HUBSPOT_ACCESS_TOKEN`;
- `HUBSPOT_PIPELINE_ID`;
- `HUBSPOT_ENQUIRY_STAGE_ID`;
- `HUBSPOT_OWNER_ID` if required;
- `TURNSTILE_SECRET_KEY`;
- public Turnstile site key through a separately approved client config;
- `ALLOWED_ENQUIRY_ORIGINS=https://techsafe.ai` or stricter application configuration;
- Microsoft identity/mail credential only if Microsoft Graph notification is approved.

Railway's sealed variables are preferred for production credentials because Railway documents that sealed values are not visible in the UI/API and are not copied to PR environments.

### Production invariant now implemented

`DEPLOYMENT_ENVIRONMENT=production` rejects the development test transport even if `ENQUIRY_TRANSPORT_MODE=test` or `ALLOW_TEST_ENQUIRY_TRANSPORT=1` is mistakenly supplied.

This invariant is provider-neutral and does not connect a live provider.

---

## 15. Environment configuration matrix

| Control | Development | Test / CI | Staging | Production |
|---|---|---|---|---|
| Deployment environment | `development` | `test` | `staging` | `production` |
| Transport | unconfigured or explicit test | explicit test | unconfigured or dedicated sandbox only | authorised HubSpot adapter |
| Test adapter allowed | yes, explicit | yes, explicit | preferably no; sandbox only if separately approved | **FORBIDDEN BY CODE** |
| Origin | localhost/dev origin | CI test origin | staging hostname only | `https://techsafe.ai` only |
| Rate limiting | in-process dev guard | in-process test guard | production-shape edge/shared test | distributed edge/shared control |
| Anti-bot | off or Cloudflare test keys | Cloudflare test keys if exercised | separate staging Turnstile widget/key | production Turnstile widget/key |
| Secrets | local ignored environment | ephemeral CI secret store | host staging secrets | host sealed production secrets |
| Logging | development diagnostics, no secret logging | test output | structured/redacted | structured/redacted, bounded retention |
| System of record | none | memory/test fixture | sandbox CRM or none | HubSpot Deal |
| Notification | none | none | controlled test recipient only | accountable human, minimal alert |
| Domain | localhost | CI/local test | platform/staging hostname | `techsafe.ai` |

Production fails closed when required transport/secret/origin/bot configuration is absent.

---

## 16. Anti-abuse decision

### Keep

- honeypot;
- minimum/maximum form age;
- origin validation;
- request-size/content-type controls;
- server schema validation.

### RECOMMEND — Cloudflare Turnstile

Recommended production control:

- Managed Turnstile widget;
- separate development/staging/production widgets/keys;
- production hostname restricted to `techsafe.ai`;
- token sent to `/api/enquiry`;
- mandatory server-side Siteverify;
- fail closed if the production Turnstile secret/token/verification is unavailable or invalid;
- never expose the secret to client code;
- do not retain token after validation;
- validate hostname/action when configured;
- use Cloudflare's Siteverify idempotency key when retrying the verification request.

Cloudflare documents that Turnstile:

- can run independently of Cloudflare CDN/DNS;
- requires server-side Siteverify;
- issues single-use tokens valid for 5 minutes;
- has a free plan intended for many production applications;
- supports environment-separated widgets;
- publishes WCAG 2.2 accessibility support.

Official sources:

- https://developers.cloudflare.com/turnstile/get-started/
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- https://developers.cloudflare.com/turnstile/plans/
- https://developers.cloudflare.com/turnstile/

Privacy notice must disclose the external anti-bot service and relevant browser/device processing once final legal wording is prepared.

---

## 17. Distributed rate limiting

### CURRENT CONTROL

In-process Node `Map` counter: 8 attempts per 15 minutes per client key.

Useful as a development/foundation guard only.

### PRODUCTION GAP

It is not authoritative across:

- multiple replicas;
- deploy restarts;
- horizontal scaling;
- independent Node processes.

Do not assume a single Node process in production.

### RECOMMENDED CONTROL

**Cloudflare edge rate limiting on `/api/enquiry`, plus the application guard as defence in depth**, if Founder approves Cloudflare proxy/DNS in a later gate.

Cloudflare currently provides a Free-plan rate limiting rule with path matching, IP counting and a 10-second counting period. Higher plans expand fields/time windows.

Important architecture consequence:

- Turnstile does not require Cloudflare proxying;
- Cloudflare WAF/rate limiting does require site traffic to pass through Cloudflare;
- using edge rate limiting would therefore require a later DNS/provider decision and adds Cloudflare to the traffic-processing chain.

Official sources:

- https://developers.cloudflare.com/waf/rate-limiting-rules/
- https://developers.cloudflare.com/turnstile/tutorials/integrating-turnstile-waf-and-bot-management/

### Alternative if Cloudflare proxy is rejected

Use a bounded shared rate-counter service supplied by the selected host or a minimal external key-value service. This state is abuse-control state only and must not become the enquiry system of record.

Do not create a new general application database simply to solve rate limiting.

---

## 18. Privacy notice requirements matrix

Final legal text is not authorised in P1.

| Requirement | Production requirement | State |
|---|---|---|
| Website operator identity | exact legal operator/controller name | **BLOCKED — Founder/professional confirmation** |
| Operator contact point | controlled privacy/contact channel | BLOCKED until operator confirmed |
| Personal-data categories | identify contact + declared business context + security/abuse metadata | READY AS REQUIREMENT |
| Collection purpose | consulting enquiry, human review, follow-up, security/abuse operation | READY AS REQUIREMENT |
| Public-form limitation | preliminary context only; no protected/confidential evidence | READY AS REQUIREMENT |
| Processors | hosting, CRM, anti-bot, notification providers actually selected | PARTIAL — selections proposed, not authorised |
| Overseas/international processing | identify likely countries/regions where practicable | BLOCKED until host/account region selected and operator law confirmed |
| Retention | publish approved enquiry-retention rule | BLOCKED — proposal requires approval |
| Access/correction request route | controlled process/contact where applicable | BLOCKED until operator/privacy process confirmed |
| Deletion request route | controlled process where applicable and subject to retention obligations | BLOCKED until operator/privacy process confirmed |
| Security statement | reasonable controls plus public intake limitations; no guarantee language | READY AS REQUIREMENT |
| Turnstile | disclose external anti-bot processing if enabled | BLOCKED until Turnstile authorised |
| Cookies/storage | state actual cookies/storage only; do not claim what is not implemented | VERIFY AT PRODUCTION QA |
| Marketing | service enquiry remains separate from optional marketing consent | READY AS REQUIREMENT |
| Complaints/contact | identify privacy complaint path if applicable | BLOCKED until operator confirmed |

**PRIVACY PUBLICATION IS NOT READY.**

---

## 19. Workpacket and SAI boundaries

Production transport must preserve:

**Workpacket Stub = preliminary client-declared context for human review.**

It must not mutate into:

- legal applicability;
- requirement determination;
- assessment;
- evidence;
- finding;
- risk rating;
- corrective recommendation;
- legal conclusion.

Public SAI remains limited to:

`ORIENT · COLLECT · ORGANISE · FLAG · HANDOFF`

No `ANALYSE`, no `ADVISE`, no unrestricted chat and no public LLM runtime are introduced by this architecture.

---

## 20. Production acceptance criteria

Before a later production-authorisation gate can pass, prove all of the following against the selected real services:

1. exact production host and region approved;
2. `techsafe.ai` domain/TLS design approved;
3. actual HubSpot portal ID, plan, hosting region and API capability verified;
4. private/distributed app credential created under least scopes only after approval;
5. Deal pipeline/stage/owner mapping approved;
6. unique enquiry-ID property proven;
7. Contact upsert + Deal creation/association proven without data loss;
8. provider Deal ID is required before browser success;
9. timeout/duplicate/idempotency behaviour proven;
10. notification failure cannot delete or invalidate an accepted Deal;
11. production test-transport invariant passes;
12. production Turnstile widget/server validation proven if selected;
13. distributed/edge rate limiting proven;
14. structured logs contain no prohibited fields;
15. production secrets do not appear in browser, Git, CI output or screenshots;
16. staging uses non-production credentials;
17. production privacy notice has approved operator identity, processors, international processing and retention;
18. retention/deletion process exists for unconverted enquiries;
19. security/privacy incident escalation dependency is documented;
20. rollback and health-check procedure are tested;
21. WEB-01H security/accessibility/SEO/QA passes;
22. Founder explicitly authorises production deployment.

---

## 21. Outstanding blockers / Founder decisions

### Founder decisions

- approve Railway Pro Singapore as preferred host, or require Australian runtime;
- approve HubSpot Deal as authoritative website-enquiry record;
- approve proposed 12-month unconverted-enquiry retention period or direct a different period for legal review;
- approve Turnstile as the external bot control;
- approve Cloudflare proxy/WAF later for distributed rate limiting, or require a non-Cloudflare shared counter;
- approve notification preference after actual HubSpot/Microsoft account verification.

### Production blockers

- legal website operator/controller identity unresolved;
- actual HubSpot portal/account capability and hosting region unverified;
- actual Microsoft 365 sender/recipient/Graph authority unverified if email notification is selected;
- final processor/DPA review not completed;
- international-processing/privacy-law assessment not professionally confirmed;
- retention policy not formally approved;
- no hosting provider selected/authorised;
- no real transport selected/authorised;
- no production secrets created;
- no DNS or Cloudflare proxy decision;
- no live Turnstile configuration;
- WEB-01H not commenced.

---

## 22. Recommendation record

`HOSTING = RECOMMEND Railway Pro / ALTERNATIVE Render paid Web Service / REJECT Fly.io as default; reconsider Fly.io if Sydney runtime becomes mandatory`

`TRANSPORT = RECOMMEND Pattern A: website -> HubSpot Deal system of record -> minimal human notification / ALTERNATIVE controlled mailbox / REJECT transactional email as system of record`

`SYSTEM OF RECORD = RECOMMEND HubSpot Deal associated to Contact, conditional on actual portal verification`

`ANTI-ABUSE = RECOMMEND existing server controls + Cloudflare Turnstile`

`RATE LIMIT = RECOMMEND Cloudflare edge rate limiting for /api/enquiry + application defence-in-depth, subject to later DNS/processor approval`

`PRIVACY = BLOCKED pending legal operator identity, final provider regions/processors and retention approval`

`PRODUCTION = NOT AUTHORISED`
