# WEB-01G-P2 — Non-Production Integration Proof State

Status: independent implementation proof complete; isolated HubSpot account exists; provider installation/write proof and Railway staging remain pending.

Date: 2026-08-11

Source P1 SHA: `b5e2842b239f347622d946d213b75c9121429e7a`

P2 branch: `web/WEB-01G-P2-nonprod-integration`

## Actual TechSafeAI HubSpot portal — read-only verification

Confirmed through the connected read-only HubSpot capability and Control Tower provider-fact update:

- Account ID: `247013136`
- Account type returned: `STANDARD`
- UI domain: `app-na2.hubspot.com`
- Data hosting: `United States (West)` — CONFIRMED
- Currency: USD
- Timezone: US/Eastern
- Active owner: `Michael Solomon`
- Owner ID: `96985799`
- COMPANY read: available
- CONTACT read: available
- DEAL read: available
- TICKET read: available
- CONTACT/DEAL write: requires reauthorisation and remains unauthorised

Current Deal pipeline exposed by the real account:

- `Sales Pipeline` — internal ID `default`

Current stages:

- `appointmentscheduled` — Appointment Scheduled
- `qualifiedtobuy` — Qualified To Buy
- `presentationscheduled` — Presentation Scheduled
- `decisionmakerboughtin` — Decision Maker Bought-In
- `contractsent` — Contract Sent
- `closedwon` — Closed Won
- `closedlost` — Closed Lost

The following proposed P2 custom Deal properties were checked read-only and do not currently exist in the real portal:

- `website_enquiry_id`
- `website_received_at`
- `website_primary_challenge`
- `website_industry_context`
- `website_timing_window`
- `website_security_level`
- `website_workpacket_stub`
- `website_enquiry_fingerprint`
- `website_contact_association_repair`

No properties or records were created in the real portal.

The actual HubSpot portal data-hosting location is governed as `United States (West) — CONFIRMED`.

The returned `STANDARD` account type remains insufficient evidence of the exact paid/free subscription tier. Do not infer a paid tier from `STANDARD`.

The active owner is governed as Michael Solomon, owner ID `96985799`. This is provider configuration evidence only; the production owner ID must remain environment/configuration driven rather than hard-coded into the provider-neutral adapter.

## Operating-base architecture input

Founder intends TechSafeAI operations to be based from Thailand.

Treat only as operational architecture input:

```text
TECHSAFEAI OPERATIONS — THAILAND
  -> WEBSITE HOST — PROPOSED SINGAPORE
  -> HUBSPOT — UNITED STATES (WEST)
  -> AUTHORISED HUMAN
```

This does not establish legal website operator identity, company domicile, tax position, privacy-controller identity or a data-residency requirement. Cross-border privacy/legal analysis remains blocked for later professional/Founder confirmation.

No HubSpot data-hosting migration is authorised in P2.

## HubSpot isolated developer-test account — CREATED / ACTIVE

Control Tower confirmed:

- Account: `TechSafeAI WEB-01G-P2 Test`
- Test Account ID: `247013551`
- Status: Active
- Trial expiry: 8 Nov 2026, 9:28 PM
- Intended proof classification: `DEVELOPER_TEST`

Do not renew or delete the test account during P2 without separate authority.

Do not install the P2 integration into real portal `247013136`.

Exact least-privilege installation specification:

`docs/WEB-01G-P2-hubspot-test-app-install-spec.md`

## Least-privilege isolated app configuration

Required app:

- name: `TechSafeAI Website Enquiry P2`
- distribution: `private`
- authentication: `static`
- target: developer-test Account `247013551` only
- OAuth: not required
- no app cards, webhooks, settings pages, workflow actions or CMS/marketing features

Exact required scopes:

- `crm.objects.contacts.read`
- `crm.objects.contacts.write`
- `crm.objects.deals.read`
- `crm.objects.deals.write`
- `crm.schemas.deals.read`
- `crm.schemas.deals.write`

No optional scopes.

No conditionally required scopes.

The scope set maps directly to the isolated proof operations: Contact upsert/read-back, Deal lookup/upsert/read-back, Deal↔Contact association, and creation/read of only the bounded Deal property definitions required for the proof.

Token values must be configured directly in approved non-production secret storage and must never enter chat, Git, browser bundles or logs.

## Manual isolated HubSpot proof — PREPARED / PINNED

Prepared:

- `.github/scripts/web01g-p2-hubspot-isolated-proof.mjs`
- `.github/workflows/web-01g-p2-hubspot-isolated-proof.yml`

The runner now contains the non-secret approved test portal ID `247013551` and refuses to proceed unless HubSpot itself reports:

- `portalId = 247013551`; and
- `accountType = DEVELOPER_TEST`.

Both checks occur before any property or CRM record mutation.

Required secret:

- `HUBSPOT_P2_TEST_ACCESS_TOKEN`

Optional non-secret variables:

- `HUBSPOT_P2_TEST_PIPELINE_ID`
- `HUBSPOT_P2_TEST_STAGE_ID`

The unnecessary `HUBSPOT_P2_TEST_PORTAL_ID` secret has been removed.

The live proof will:

1. verify the connected token belongs to test Account `247013551`;
2. verify `DEVELOPER_TEST`;
3. create only the minimum test Deal properties if absent;
4. verify configured test pipeline/stage options exist;
5. write one synthetic Contact;
6. write/upsert one synthetic Deal;
7. retry the exact same logical submission;
8. require the same Deal ID on duplicate retry;
9. read the Deal back by provider ID;
10. inspect exactly one Contact association;
11. read the associated Contact back and verify the synthetic email;
12. retain synthetic records for evidence.

Actual provider write proof remains pending until the app is installed into the isolated account and the test token is available in approved non-production secret storage.

## CRM property model

Minimum Deal fields retained for the proof:

- `website_enquiry_id` — string/text, unique
- `website_received_at` — datetime/date preferred when test-account property proof is performed
- `website_primary_challenge` — string/text
- `website_industry_context` — string/text
- `website_timing_window` — string/text
- `website_security_level` — string/text
- `website_workpacket_stub` — string/textarea
- `website_enquiry_fingerprint` — string/text
- `website_contact_association_repair` — bounded repair-status field

The authoritative system-of-record object remains one Deal per website enquiry, associated to a Contact.

## Workpacket storage decision

Automated P2 validation generated a representative maximum-boundary Workpacket Stub using all current bounded public-input lengths and all operating-environment selections.

Measured serialised length:

`3,803 characters`

The current bounded Stub has a large margin inside the governed one-property serialisation strategy.

Decision:

- retain structured Deal helper fields for routing/searching;
- store the bounded context-only Workpacket Stub once in a textarea property;
- do not explode the Stub into dozens of speculative CRM fields;
- fail closed if a future Stub ever reaches the configured storage limit.

## Stable idempotency

`website_enquiry_id` is derived server-side from:

- the stable current-form `startedAt` value; and
- canonicalised validated context.

The identifier is opaque and not shown to the visitor.

The same logical retry from the same form state produces the same ID. A new form session produces a different ID.

HubSpot adapter sequence:

1. upsert Contact by email;
2. look up Deal by unique `website_enquiry_id`;
3. if absent, upsert Deal using that unique property;
4. read the Deal back by `website_enquiry_id`;
5. require authoritative Deal ID;
6. associate Contact;
7. report association repair state separately if association fails;
8. invoke notification separately.

On timeout/unknown provider state after a write attempt, the adapter looks up the stable enquiry ID before any further create attempt.

## Mock provider proof — COMPLETE

Automated tests prove:

- authoritative Deal ID required;
- Contact association;
- duplicate retry creates one Deal;
- timeout after provider commit recovers the existing Deal by stable enquiry ID;
- Contact success / Deal rejection is failure;
- Deal existence / Contact association failure remains accepted with repair state;
- notification failure does not invalidate the Deal;
- HubSpot 429 exposes provider backoff and does not blindly retry create;
- staging HubSpot mode rejects any account not explicitly classified as `developer-test`;
- production rejects a `developer-test` HubSpot account classification.

These are provider-contract tests. They are not a substitute for the required write proof in the actual isolated HubSpot developer-test account.

## Turnstile proof — PASS

Cloudflare's official dummy/test credentials were used in CI against the real Turnstile Siteverify endpoint.

Proven:

- official always-pass test secret + dummy token -> server validation accepted;
- official always-fail test secret + dummy token -> rejected;
- required configuration + missing token -> rejected;
- server-side Siteverify remains mandatory;
- test secret never becomes production authority.

Cloudflare proxy, WAF and edge rate limiting remain deferred.

## Health control

P2 adds:

`GET /api/health`

Response:

```json
{"status":"ok"}
```

It exposes no environment values, provider IDs, secrets or submitted data.

## Railway staging

Railway Singapore remains the approved non-production staging direction, but no TechSafeAI Railway account exists and no billing commitment is authorised.

Current state:

- Railway staging environment: not created
- Railway staging URL: none
- billing/plan state: unknown
- new paid commitment: not authorised

If a new paid subscription or billing commitment is required, stop before purchase and return:

`RAILWAY BILLING APPROVAL REQUIRED`

No TechSafeAI domain may be attached during P2.

## Repository hygiene

`tmp-do-not-use` was reconfirmed:

- identical to `50358c2f6ad93e09312d7014d2a9cb97a9f1e826`;
- zero unique commits;
- zero changed files;
- no open PR dependency.

It is confirmed disposable. The current GitHub connector does not expose normal remote branch deletion, so deletion remains a tooling action rather than a safety investigation.

## Remaining P2 external proof blockers

1. Create/configure the HubSpot app exactly as specified in `WEB-01G-P2-hubspot-test-app-install-spec.md`.
2. Install it only into `TechSafeAI WEB-01G-P2 Test` / `247013551`.
3. Place the resulting static test access token directly into approved non-production secret storage.
4. Execute actual synthetic Contact + Deal write/read-back/duplicate proof.
5. Inspect the resulting synthetic Deal and Contact association provider-side.
6. Establish Railway account/billing state.
7. If no new billing commitment is required, create Singapore staging from the P2 branch.
8. Configure only test-account HubSpot credentials and Turnstile test credentials in staging.
9. Execute actual Railway URL E2E and failure-state proof.
10. Inspect Railway logs for redaction requirements.
11. Capture staging Review, HANDOFF and representative mobile evidence.

Resolved and removed from the blocker list:

- HubSpot data hosting — `United States (West) — CONFIRMED`;
- active HubSpot owner — Michael Solomon / `96985799`;
- isolated HubSpot test-account creation — `247013551` ACTIVE;
- Turnstile official non-production test proof — PASS.

Until the remaining external dependencies are cleared, P2 must not be classified as full provider-proof PASS.
