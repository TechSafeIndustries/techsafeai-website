# WEB-01G-P2 — Provider Fact Update

Date: 2026-08-11

Status: **GOVERNED CURRENT-STATE ADDENDUM**

Branch: `web/WEB-01G-P2-nonprod-integration`

Source state before this addendum: `a9accda152decf9576a7af899f6f22bbb5adcaf4`

## Governing precedence

For the fields below, this addendum supersedes earlier WEB-01G-P2 wording that treated HubSpot data hosting or CRM owner identity as unresolved.

It does not supersede the existing P2 controls for read-only production access, isolated test-account write proof, Railway staging, Turnstile testing, privacy/legal review, no merge and no production deployment.

---

## 1. Actual TechSafeAI HubSpot portal — confirmed current facts

```text
HUBSPOT ACCOUNT ID
247013136

HUBSPOT UI DOMAIN
app-na2.hubspot.com

HUBSPOT DATA HOSTING
United States (West) — CONFIRMED

HUBSPOT ACCOUNT TYPE RETURNED BY CONNECTOR
STANDARD

IMPORTANT
STANDARD is not sufficient evidence of the exact paid/free commercial subscription tier.

DEAL PIPELINE
Sales Pipeline

PIPELINE INTERNAL VALUE
default

ACTIVE CRM OWNER
Michael Solomon

OWNER ID
96985799
```

Current Deal stages:

- Appointment Scheduled
- Qualified To Buy
- Presentation Scheduled
- Decision Maker Bought-In
- Contract Sent
- Closed Won
- Closed Lost

Current connector authority remains:

- Contacts — read available;
- Companies — read available;
- Deals — read available;
- Tickets — read available;
- Contact write — **NOT AUTHORISED**;
- Deal write — **NOT AUTHORISED**.

The real portal remains **READ ONLY for WEB-01G-P2**.

Do not request broader ChatGPT/HubSpot connector permissions for P2.

Do not create synthetic P2 records in Account `247013136`.

---

## 2. Subscription/tier state

`STANDARD` is retained only as the account type returned by the connected HubSpot capability.

It must **not** be interpreted as proof of:

- Free;
- Starter;
- Professional;
- Enterprise;
- any other commercial subscription level.

Exact commercial subscription/tier remains unresolved until independently verified through authorised account information.

---

## 3. Operating-location architecture input

Founder intends TechSafeAI operations to be based from:

**Thailand**

This is an operational architecture input only.

It is **not** evidence of:

- legal website operator identity;
- company domicile;
- privacy-controller identity;
- tax residence or tax position;
- mandatory data-residency location.

No Founder personal-tax or residency evidence is part of this website workstream.

---

## 4. Current cross-border architecture to recognise

Production privacy architecture must recognise the possible processing path:

```text
TECHSAFEAI OPERATIONS — THAILAND
        ↓
WEBSITE HOST — PROPOSED SINGAPORE
        ↓
HUBSPOT — UNITED STATES (WEST)
        ↓
AUTHORISED HUMAN
```

This is an architecture/data-flow statement only.

It requires later privacy/legal confirmation concerning the final website operator, applicable law, processor terms, international transfers, notices and retention.

WEB-01G-P2 makes **no legal conclusion** from this chain.

---

## 5. HubSpot migration — prohibited in P2

No HubSpot data-hosting migration is authorised.

Do not:

- select or automate `Change data hosting`;
- schedule a migration;
- create a migration project;
- treat a different HubSpot region as part of P2 completion.

P2 works with the real portal as it exists:

**United States (West) — CONFIRMED.**

Future CRM-region architecture is a separate production decision.

---

## 6. Existing HubSpot adapter / idempotency work

Existing P2 implementation remains current and does not need to be restarted.

Already completed under P2:

- provider-neutral HubSpot transport implementation;
- stable server-derived `website_enquiry_id`;
- HubSpot adapter mocks;
- provider read-back logic;
- duplicate-retry controls;
- timeout/unknown-state recovery logic;
- 429 handling;
- 4xx/5xx failure semantics;
- Contact-success / Deal-failure test;
- Deal-success / Contact-association-failure test;
- notification-separation test;
- production/test-account separation invariant;
- Workpacket Stub size proof;
- official Turnstile test/dummy credential proof.

These controls remain provider-contract/non-production proof until the isolated HubSpot write test executes.

---

## 7. Isolated HubSpot write proof — still blocked

Actual provider write/read-back proof must occur only in an:

**ISOLATED HUBSPOT DEVELOPER / TEST ACCOUNT**

and never in Account `247013136`.

Current state:

```text
HUBSPOT ADAPTER IMPLEMENTATION
COMPLETE

MOCK / CONTRACT TESTING
COMPLETE

ACTUAL ISOLATED HUBSPOT WRITE PROOF
PENDING / EXTERNAL DEPENDENCY

REAL PORTAL WRITE
PROHIBITED IN P2
```

The isolated proof must use dedicated test pipeline/stage/property configuration appropriate to the proof. It must not clone the live Sales Pipeline merely because that pipeline exists.

---

## 8. Railway staging

Railway Singapore remains the approved **non-production WEB-01G-P2 staging direction**.

Current controls remain:

- staging only;
- do not attach `techsafe.ai`;
- no production environment;
- no DNS change;
- no production secrets;
- no production deployment.

If staging requires a new paid subscription or financial commitment:

**STOP BEFORE PURCHASE**

and return:

`RAILWAY BILLING APPROVAL REQUIRED`

---

## 9. Turnstile

The existing official Cloudflare Turnstile dummy/test-key proof remains valid for P2:

- valid test token — proven;
- invalid test token — proven rejected;
- required token missing — proven rejected;
- server-side Siteverify — proven;
- browser cannot bypass server acceptance — proven.

No production Cloudflare configuration, proxy or DNS mutation is authorised.

---

## 10. Repository hygiene

`tmp-do-not-use` remains confirmed disposable from prior P2 verification:

- SHA `50358c2f6ad93e09312d7014d2a9cb97a9f1e826`;
- zero unique commits;
- zero changed files;
- no open PR dependency;
- no governed work.

The available GitHub connector still exposes no normal remote-ref delete action.

Deletion therefore remains a tooling residual only; do not use force-push or ref-rewrite as a substitute.

---

## 11. Current P2 blockers

The provider fact update clears the HubSpot hosting-location and owner-identity uncertainties only.

Remaining external blockers:

1. isolated HubSpot developer/test account creation or authorised access;
2. isolated HubSpot write/read-back/duplicate proof;
3. exact HubSpot commercial subscription tier if needed for final provider capability decisions;
4. Railway account/billing confirmation;
5. Railway Singapore staging creation if no unapproved financial commitment is required;
6. staging E2E, logs/redaction and staging visual evidence;
7. final privacy/legal confirmation of the cross-border architecture.

---

## 12. Current classification

```text
WEB-01G-P2
ACTIVE / EXTERNAL PROVIDER PROOF PENDING

REAL HUBSPOT PORTAL
READ-ONLY VERIFIED

HUBSPOT HOSTING
UNITED STATES (WEST) — CONFIRMED

HUBSPOT OWNER
MICHAEL SOLOMON / 96985799 — CONFIRMED GOVERNED FACT

THAILAND OPERATING BASE
ARCHITECTURAL INPUT ONLY

HUBSPOT MIGRATION
NOT AUTHORISED

ISOLATED HUBSPOT WRITE PROOF
PENDING

RAILWAY SINGAPORE STAGING
PENDING

PRODUCTION
HOLD

WEB-01H
HOLD
```
