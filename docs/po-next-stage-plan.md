# Lovelybakes next-stage delivery plan

Derived from Virtual Product Squad run `bc146820-c491-4f3e-9f40-1902b2d64b3d` and reviewed against the implemented application on 5 September 2026.

## Current position

The local UAT includes storefront and cart, Google plus authenticator admin access, editable products and site content, ordering rules, synthetic order management, PostgreSQL persistence, and a Stripe-ready checkout/webhook boundary. Live payments and customer-data submission remain disabled. Stripe credentials, an email provider, production hosting, privacy policy, retention rules, and final catalog and delivery policies remain unresolved.

## Recommended sequence

### Phase 1 — CPO content and operating-policy acceptance

**Outcome:** Establish reliable business inputs before integrating providers.

**Work:**
- Replace all sample prices and approve which products are published.
- Confirm collection instructions, delivery availability and fee, minimum order, lead time, maximum booking window, blackout dates, and cancellation/refund policy.
- Confirm whether stock/inventory is required. The current product model is made-to-order and has no inventory system.
- Run the existing admin and storefront UAT checklist on desktop and mobile.

**Dependencies:** Lovelybakes owner decisions only; can proceed immediately.

**Acceptance criteria:** Every published product has an approved name, image, price and description; ordering rules match real operations; no sample-price labels remain for launch; admin edits persist; mobile catalog, cart and checkout preview are usable.

**CPO gate:** Approve the catalog and operational policy baseline. Do not start live-payment testing until this gate passes.

### Phase 2 — Controlled Stripe test checkout

**Outcome:** Prove one complete order and payment lifecycle without a live charge.

**Work:**
- Supply a Stripe test secret and webhook signing secret through private environment configuration.
- Configure test webhooks for `checkout.session.completed` and `checkout.session.expired`.
- Execute successful, cancelled, expired, duplicate-webhook, incorrect-amount, and retry scenarios.
- Verify that one checkout request creates one order, Stripe hosts card entry, exact SGD totals reconcile, and status history is durable.
- Document the refund and failed-payment operating procedure before considering live mode.

**Dependencies:** Stripe account and test credentials; approved Phase 1 prices and policies.

**Acceptance criteria:** No card data enters Lovelybakes; duplicate requests and events are idempotent; mismatched order, session, currency or amount is rejected; successful test payment becomes `paid`; expiry becomes `cancelled`; the confirmation page discloses no personal data.

**CPO gate:** Accept the payment rehearsal evidence. Live keys remain prohibited.

### Phase 3 — Customer communications and privacy controls

**Outcome:** Ensure customers receive reliable confirmations and know how their data is handled.

**Work:**
- Select an outbound email provider after comparing cost, Singapore deliverability, domain authentication, retries and operational visibility. The generated architecture recommends SendGrid, but this is not an approved decision.
- Build versioned order confirmation and status templates with synthetic fixtures.
- Add delivery tracking, retry handling and an admin-visible notification state.
- Approve a privacy notice, retention period, deletion process and customer support contact.
- Add a data-deletion/admin workflow and verify non-production masking.

**Dependencies:** CPO choice of email provider; sending domain access; approved privacy and retention policy.

**Acceptance criteria:** Synthetic confirmation and status emails pass content and delivery tests; failures are visible and retryable; privacy and deletion information is linked from the storefront; customer PII is excluded from application logs and masked outside production.

**CPO gate:** Approve customer communications, privacy wording and retention policy.

### Phase 4 — Production platform and security readiness

**Outcome:** Move from a single-Mac UAT to a recoverable, observable production service.

**Work:**
- Select hosting and managed PostgreSQL based on operating cost and owner simplicity.
- Retain the existing Next.js application unless evidence justifies a service split. The generated NestJS plus ECS architecture is not recommended for this MVP because it duplicates the existing backend and raises delivery and operating complexity.
- Replace local authenticator state and process-local rate limiting with production-capable controls.
- Configure secrets, TLS, security headers, WAF/shared rate limits, database backups and restore tests, audit retention, monitoring and alerts.
- Establish owner access recovery without weakening MFA.
- Run dependency, authorization, webhook, privacy, accessibility, mobile and backup-restore reviews.

**Dependencies:** Hosting/database decision and budget; production Google OAuth configuration; domain/DNS access; accepted security and privacy controls.

**Acceptance criteria:** Production uses HTTPS and managed secrets; restore is demonstrated; alerts reach the owner; MFA recovery is tested; application and database migrations deploy repeatably; security review has no unresolved critical or high findings.

**CPO gate:** Explicit production deployment approval. Deployment remains prohibited before this gate.

### Phase 5 — Limited launch and operational acceptance

**Outcome:** Validate real operations with controlled exposure before general availability.

**Work:**
- Enable a small ordering window with limited published products and dates.
- Monitor checkout conversion, payment failures, webhook retries, email delivery and fulfilment workload.
- Rehearse cancellation, refund, customer correction and service outage procedures.
- Review results after the first agreed order cohort before expanding availability or adding PayNow.

**Dependencies:** All previous gates; explicit approval to activate live Stripe credentials and accept customer PII.

**Acceptance criteria:** Orders reconcile from payment through fulfilment; customer communications are delivered; support and refund procedures work; no high-severity incident or unexplained financial mismatch occurs during the limited cohort.

**CPO gate:** Approve general availability, revise operating limits, or pause ordering.

## Immediate top three actions

1. Complete the catalog and ordering-policy acceptance checklist.
2. Run a documented desktop and mobile UAT pass against the current admin and storefront.
3. Provision Stripe **test** credentials and execute the controlled payment rehearsal after actions 1 and 2 pass.

## Deferred decisions

- Email provider: open; SendGrid is a squad suggestion, not an approved selection.
- Production hosting: open; the squad’s AWS ECS/NestJS design is disproportionate to the existing single-service MVP.
- PayNow: defer until Stripe card operations are stable and a provider/settlement model is approved.
- Inventory: exclude unless the owner confirms finite stock is part of the business model.
- Live payment, deployment, release, push or merge: requires separate explicit CPO approval.
