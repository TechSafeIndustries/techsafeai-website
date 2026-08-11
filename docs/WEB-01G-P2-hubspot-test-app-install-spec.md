# WEB-01G-P2 — HubSpot isolated test app installation specification

Status: installation specification only. No HubSpot app has been installed by this repository change.

## Approved target

- Test account: `TechSafeAI WEB-01G-P2 Test`
- Test account ID: `247013551`
- Required provider classification: `DEVELOPER_TEST`
- Real TechSafeAI portal: `247013136` — prohibited installation/write target for P2

## App configuration

- Name: `TechSafeAI Website Enquiry P2`
- Suggested UID: `techsafeai_website_enquiry_p2`
- Distribution: `private`
- Authentication: `static`
- OAuth: no
- Marketplace distribution: no
- App cards: none
- Webhooks: none
- Settings pages: none
- Workflow actions: none

Static authentication is selected because P2 requires one isolated-account proof and does not require multi-account OAuth infrastructure.

## Exact required scopes

Configure only these six required scopes:

1. `crm.objects.contacts.read`
2. `crm.objects.contacts.write`
3. `crm.objects.deals.read`
4. `crm.objects.deals.write`
5. `crm.schemas.deals.read`
6. `crm.schemas.deals.write`

Static-auth apps use required scopes only. Add no optional or conditionally required scopes.

### Scope purpose

- `crm.objects.contacts.write` — upsert the synthetic submitting person by email.
- `crm.objects.contacts.read` — read the synthetic Contact back and verify provider state.
- `crm.objects.deals.write` — create/upsert the synthetic enquiry Deal, update repair state and create the default Deal↔Contact association.
- `crm.objects.deals.read` — lookup/read back the Deal and inspect its Contact association.
- `crm.schemas.deals.write` — create the minimum synthetic Deal properties in the isolated account only.
- `crm.schemas.deals.read` — detect existing test properties and inspect `pipeline` / `dealstage` options.

No separate association scope is required for the default association call used by this proof.

## Prohibited scopes

Do not add scopes for Companies, Tickets, Email/marketing email, Forms, CMS/site pages/landing pages/blog, Quotes/products/line items/invoices/subscriptions, Owners/users, Workflows, Files, sensitive/highly-sensitive CRM data, or custom objects.

If HubSpot's consent screen requests anything beyond the six required scopes above, stop before installation.

## Intended top-level app schema

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

Do not configure OAuth redirect URLs for this static-auth proof app.

## Installation boundary

1. Create/upload the app project in the HubSpot developer area.
2. Open the app's **Distribution** tab.
3. Under **Test installs**, choose **Add test install(s)**.
4. Select only `TechSafeAI WEB-01G-P2 Test` / `247013551`.
5. Review the consent page and confirm only the six scopes above are requested.
6. Do not install into real portal `247013136`.
7. After isolated installation, copy the static access token directly into approved non-production GitHub secret storage as `HUBSPOT_P2_TEST_ACCESS_TOKEN`.
8. Never paste the token into chat, source files, PR text, issues or screenshots.

The proof runner is pinned to Account `247013551` and independently requires HubSpot to report `DEVELOPER_TEST` before any property or record write.

## Test-only Deal properties

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

## Pipeline/stage

Do not clone the real Sales Pipeline merely because it exists.

The isolated proof may use an existing test-account pipeline/stage or a separately approved dedicated test pipeline/stage. HubSpot CRM Pipelines API is authoritative for available Deal pipeline and stage IDs. The proof runner fails closed if the configured IDs do not exist or the configured stage does not belong to the configured pipeline.

## Stop conditions

Stop before installation if the target account is not `247013551`, HubSpot does not classify the account as `DEVELOPER_TEST`, consent requests any scope outside the six listed above, the installation page targets real portal `247013136`, or a production credential/CRM permission would be required.
