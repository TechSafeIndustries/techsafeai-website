# WEB-01G-P2 — Non-Production Integration Proof State

Status: independent implementation proof complete; external isolated-provider proof pending.

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

The actual HubSpot portal data-hosting location is now governed as `United States (West) — CONFIRMED`. The earlier P2 assumption that `app-na2.hubspot.com` was only an architectural indication is retired.

The returned `STANDARD` account type remains insufficient evidence of the exact paid/free subscription tier. Do not infer a paid tier from `STANDARD`.

The active owner is now governed as Michael Solomon, owner ID `96985799`. This is provider configuration evidence only; the production owner ID must remain environment/configuration driven rather than hard-coded into the provider-neutral adapter.

## HubSpot isolated developer-test account

HubSpot's current official account-type documentation states that a Standard HubSpot account can create up to 10 developer test accounts and that those test accounts do not synchronise data with other accounts.

Official references:

- https://developers.hubspot.com/docs/getting-started/account-types
- https://developers.hubspot.com/docs/developer-tooling/local-development/configurable-test-accounts

No isolated TechSafeAI P2 developer-test account has yet been created or authenticated through the current Control Tower connection.

Required manual action:

`HubSpot → Development → Testing → Test Accounts → Create developer test account`

Suggested name:

`TechSafeAI WEB-01G-P2 Test`

The real TechSafeAI portal must remain read-only for P2 integration proof.

## Least-privilege isolated app scopes

For the developer-test account only, the planned integration requires the minimum functional scope set needed to:

- read/write Contacts;
- read/write Deals;
- read/write Deal property definitions during test-account setup.

Current HubSpot scope names:

- `crm.objects.contacts.read`
- `crm.objects.contacts.write`
- `crm.objects.deals.read`
- `crm.objects.deals.write`
- `crm.schemas.deals.read`
- `crm.schemas.deals.write`

A single-account static-auth app is appropriate for this isolated proof. No multi-tenant OAuth architecture is required for the website's current single-account use case.

Official references:

- https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/overview
- https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/scopes

Token values must be configured directly in approved non-production secret storage and must never enter chat, Git, browser bundles or logs.

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

HubSpot's current string property limit is 65,536 characters. Therefore the current bounded Stub has a large margin inside one `string` / `textarea` property.

Decision:

- retain structured Deal helper fields for routing/searching;
- store the bounded context-only Workpacket Stub once in a textarea property;
- do not explode the Stub into dozens of speculative CRM fields;
- fail closed if a future Stub ever reaches the configured storage limit.

Official property reference:

https://developers.hubspot.com/docs/api-reference/latest/crm/properties/guide

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

## Mock provider proof

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

These are provider-contract tests. They are not a substitute for the required write proof in an actual isolated HubSpot developer-test account.

## Turnstile proof

Cloudflare's official dummy/test credentials were used in CI against the real Turnstile Siteverify endpoint.

Proven:

- official always-pass test secret + dummy token → server validation accepted;
- official always-fail test secret + dummy token → rejected;
- required configuration + missing token → rejected;
- server-side Siteverify remains mandatory;
- test secret never becomes production authority.

Official reference:

https://developers.cloudflare.com/turnstile/troubleshooting/testing/

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

Railway Singapore is authorised for non-production proof but no Railway account/environment is connected to Control Tower.

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

1. Exact HubSpot paid/free subscription tier remains unresolved; `STANDARD` does not answer this.
2. Create/authenticate an isolated HubSpot developer-test account.
3. Configure the minimum test-account Deal properties.
4. Configure a least-privilege static-auth token in non-production secret storage without exposing it to chat.
5. Execute actual synthetic Contact + Deal write/read-back/duplicate proof.
6. Inspect the resulting synthetic Deal and Contact association provider-side.
7. Establish Railway account/billing state.
8. If no new billing commitment is required, create Singapore staging from the P2 branch.
9. Configure only test-account HubSpot credentials and Turnstile test credentials in staging.
10. Execute actual Railway URL E2E and failure-state proof.
11. Inspect Railway logs for redaction requirements.
12. Capture staging Review, HANDOFF and representative mobile evidence.

Resolved and removed from the blocker list:

- HubSpot data hosting — `United States (West) — CONFIRMED`;
- active HubSpot owner — Michael Solomon / `96985799`.

Until the remaining external dependencies are cleared, P2 must not be classified as full provider-proof PASS.
