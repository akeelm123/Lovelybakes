# Lovelybakes Release 2 implementation status

## Production update — 8 September 2026

Release 2 is live at https://lovelybakestore.com on Vercel, with source in
`akeelm123/Lovelybakes`. PR #3 merged as `fbe313c`; production deployment
`dpl_7UWoou7eeeG1cvsUD4jtwTY3votc` reached Ready with the custom domain attached.
Storefront returned HTTP 200 and `/api/health` returned `{"status":"ok"}`.

The CPO confirmed a real S$32 card payment. The authenticated admin subsequently
showed the rehearsal order as Cancelled, Refunded S$32.00, and Workflow complete.
Resend reported its cancellation email delivered on 8 September 2026.
This verifies the application refund ledger and email delivery; credit posting
on the cardholder's bank statement was not independently inspected.

Business content was accepted by the CPO for launch with later editing through
admin. Live credentials and production release actions were explicitly approved
in the conversation. This document records observed evidence, not a formal
squad sign-off artifact. The squad planning run remains completed through
`discovery` and `design_and_architecture`; no squad gates have been evaluated.

## Current implementation increment (not deployed)

Refund eligibility now requires the checkout session mode to match the active
Stripe refund mode. The admin hides ineligible actions; the server rejects them
before creating a pending refund ledger row. Disabled refunds reject all modes.
Historical test orders remain intact.

## Remaining operational work

- Establish owner alert delivery and verify checkout/webhook/email failure alerts.
- Confirm the production backup restore window and schedule a masked restore drill;
  the September 6 rehearsal below covered UAT only.
- Implement cleanup of expired rate-limit buckets with bounded retention.
- Record administrator access recovery, security and accessibility reviews.
- Review the first real customer cohort before expanding payment methods or inventory.

These are tracked follow-ups, not claims of completed production verification.
PayNow and inventory remain deferred pending business decisions.

## Historical UAT baseline — 6 September 2026

The following record predates the production update above. Its remaining gates
and environment descriptions describe the state at that time.


Last verified: 6 September 2026 against the stable UAT deployment at
`https://lovelybakes-release-2.vercel.app`.

## Current environment

Release 2 is deployed as a Vercel preview from the GitHub `release-2` branch.
The stable UAT alias points to the latest preview deployment. Production remains
on Release 1 and has not been promoted.

The UAT application uses managed Neon PostgreSQL, Vercel-managed environment
configuration, Google OAuth plus authenticator MFA, and a Stripe sandbox. All
eleven migrations are applied. `UAT_MODE=true` prevents live Stripe keys from
being used.

## Verified capabilities

- Existing products, photographs, prices, descriptions, and publication states
  can be edited in the owner studio.
- Storefront content, navigation, hero content, FAQs, footer, social links, and
  search metadata support draft, authenticated preview, and atomic publishing.
- Collection and delivery availability, fees, minimum order, lead time, booking
  window, and blackout dates are editable.
- Google sign-in, the approved administrator allowlist, authenticator MFA,
  replay prevention, and database-backed lockout operate on Vercel.
- Stripe-hosted card checkout derives the catalogue, price, delivery charge,
  currency, and total on the server. Card details do not enter Lovelybakes.
- Signed Stripe webhooks reconcile the order, session, SGD currency, and exact
  amount before changing order state. External event IDs are recorded once.
- Administrators can move paid orders through preparing, ready, and fulfilled,
  with optimistic concurrency and durable status history.
- Administrators can cancel and fully refund unfulfilled Stripe test orders.
  Refund requests reserve the balance, use provider idempotency, and retain a
  durable ledger before the order is marked cancelled.
- Resend is connected to the verified `lovelybakestore.com` sending domain.
  DKIM and SPF verification pass, and a provider-level synthetic message from
  `orders@lovelybakestore.com` reached the delivered state.

## Controlled payment rehearsal

The following synthetic-only checks passed on 6 September 2026:

| Scenario | Evidence | Result |
| --- | --- | --- |
| Successful payment | S$72.00 Stripe test-card checkout returned to the non-indexed confirmation page | Order changed from `pending_payment` to `paid` |
| Checkout retry | The same checkout request key was submitted twice | One order and one hosted checkout session were created |
| Fulfilment lifecycle | The paid order was advanced through preparing, ready, and fulfilled | Five ordered status-history records were retained |
| Session expiry | A second unpaid Stripe sandbox session was explicitly expired | Signed webhook changed the order to `cancelled` |
| Provider isolation | Both sessions reported Stripe test mode | No live charge occurred |
| Refund | A new S$64.00 sandbox payment was cancelled from the authenticated admin workflow | Stripe and the refund ledger both reported `succeeded`; the order became `cancelled` |

Automated tests cover invalid signatures, duplicate events, payment/session
identity mismatch, incorrect totals and currency, unpaid completion events,
invalid status transitions, authorization, content editing, and checkout input
validation. The latest recorded verification is 41 passing tests, with the two
provider-dependent integration tests gated by environment configuration; lint
and the production build pass.

## Remaining release gates

- Approve the real catalogue, prices, product descriptions, collection details,
  delivery rules, blackout dates, and cancellation/refund policy. Current prices
  are still labelled as UAT samples.
- Complete and record storefront/admin desktop and mobile acceptance checks.
- Automatic order-event messaging is enabled. A new synthetic Stripe payment
  moved to `paid`; its confirmation reached `sent` after one automatic attempt,
  and Resend reported `delivered`. Provider failure remains visible and retryable
  without reversing order state.
- Approve privacy wording, final retention duration, and customer support contact.
  A versioned 180-day UAT default, terminal-order deletion workflow, and immutable
  erasure audit are implemented for review.
- Add production monitoring, shared rate limits/WAF controls, backup/restore
  evidence, and an administrator access-recovery procedure.
- Complete the security and accessibility release reviews.
- Obtain explicit CPO approval before merging, promoting Release 2 to production,
  accepting real customer data, or installing live Stripe credentials.

PayNow remains deferred until a provider and operating model are approved.
