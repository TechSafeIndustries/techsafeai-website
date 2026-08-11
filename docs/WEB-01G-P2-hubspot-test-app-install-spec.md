# WEB-01G-P2 — HubSpot isolated test app installation specification

Status: installation specification only — no HubSpot app has been created or installed by this repository change.

## Approved target

- Test account: `TechSafeAI WEB-01G-P2 Test`
- Test account ID: `247013551`
- Account class required by proof runner: `DEVELOPER_TEST`
- Real TechSafeAI portal: `247013136` — prohibited installation/write target for P2

## App identity

- App name: `TechSafeAI Website Enquiry P2`
- Suggested UID: `techsafeai_website_enquiry_p2`
- Distribution: `private`
- Authentication: `static`
- Marketplace distribution: no
- OAuth: no
- App cards: none
- Webhooks: none
- Settings pages: none
- Workflow actions: none
- CMS/marketing/email/ticket features: none

Static authentication is selected because P2 requires a single isolated account proof and does not require multi-account OAuth infrastructure.

## Exact required scopes

Configure only these required scopes:

1. `crm.objects.contacts.read`
2. `crm.objects.contacts.write`
3. `crm.objects.deals.read`
4. `crm.objects.deals.write`
5. `crm.schemas.deals.read`
6. `crm.schemas.deals.write`

Static-auth apps support required scopes only. Do not add optional or conditionally required scopes.

### Why each scope exists

- `crm.objects.contacts.write` — upsert the synthetic submitting person by email.
- `crm.objects.contacts.read` — read the synthetic Contact back and prove the provider record/property state.
- `crm.objects.deals.write` — create/upsert the synthetic enquiry Deal, update repair state and create the default Deal↔Contact association.
- `crm.objects.deals.read` — lookup/read back the Deal by the stable unique enquiry property and verify the association.
- `crm.schemas.deals.write` — create the minimum synthetic Deal property set in the isolated test account only.
- `crm.schemas.deals.read` — detect existing test properties and inspect the `pipeline` / `dealstage` property options used by the proof.

No separate association scope is required for the default CRM association call used by the adapter; the proof already holds the relevant Contact/Deal object scopes.

## Explicitly prohibited scopes

Do not add:

- companies;
- tickets;
- email or marketing email;
- forms;
- CMS/site pages/landing pages/blog;
- quotes, products, line items, invoices, subscriptions;
- owners/users;
- workflows;
- files;
- sensitive/highly-sensitive CRM scopes;
- custom-object scopes;
- account migration or data-hosting controls.

If HubSpot's consent screen requests anything outside the six required scopes above, stop before installation and report the additional request.

## Top-level app configuration

The intended HubSpot developer-platform app configuration is:

```json
{
  "uid": "techsafeai_website_enquiry_p2",
  "type": "app",
  "config": {
    "description": "Isolated non-production proof for TechSafeAI website enquiry Contact and Deal transport.",
    "name": "TechSafeAI Website Enquiry P2",
    "distribution": "private",
    "auth": {
      "type": "static",
      "requiredScopes": [
        "crm.objects.contacts.read",
        "crm.objects.contacts.write",
        "crm.objects.deals.read",
        "crm.objects.deals.write",
        "crm.schemas.deals.read",
        "crm.schemas.deals.write"
      ]
    },
    "permittedUrls": {
      "fetch": ["https://api.hubapi.com"],
      "iframe": [],
      "img": []
    }
  }
}
```

For static auth, do not configure OAuth redirect URLs.

## Installation boundary

When the app project exists:

1. Open the app's Distribution tab.
2. Use **Test installs** / **Add test install(s)**.
3. Select only `TechSafeAI WEB-01G-P2 Test` / `247013551`.
4. Review the consent screen and confirm it contains only the six scopes above.
5. Do not select or install into real portal `247013136`.
6. Only after successful isolated installation, reveal/copy the static access token.
7. Put the token directly into approved non-production GitHub secret storage as `HUBSPOT_P2_TEST_ACCESS_TOKEN`; never paste it into chat, source, issue text or screenshots.

The proof runner is pinned to Account `247013551` and also requires HubSpot to report `DEVELOPER_TEST` before any CRM-property or record write occurs.

## Test-only CRM schema

The proof may create only these Deal properties in Account `247013551`:

- `website_enquiry_id` — unique string
- `website_received_at` — datetime
- `website_primary_challenge` — string
- `website_industry_context` — string
- `website_timing_window` — string
- `website_security_level` — string
- `website_workpacket_stub` — textarea string
- `website_enquiry_fingerprint` — string
- `website_contact_association_repair` — string

No production portal properties are authorised.

## Test pipeline/stage

Do not clone the real TechSafeAI Sales Pipeline merely because it exists.

The isolated proof can use an existing test-account pipeline/stage where available, or a separately approved dedicated test pipeline/stage. The current runner reads `pipeline` and `dealstage` options and fails if the configured IDs do not exist.

## Stop conditions

Stop before installation if:

- target account is not `247013551`;
- HubSpot does not classify it as `DEVELOPER_TEST`;
- consent requests a scope outside the six listed above;
- the installation UI targets real portal `247013136`;
- a production credential or production CRM permission would be required.
