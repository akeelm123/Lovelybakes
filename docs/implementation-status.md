# Lovelybakes Release 2 implementation status

Last verified: 6 September 2026 against the stable UAT deployment at
`https://lovelybakes-release-2.vercel.app`.

## Current environment

Release 2 is deployed as a Vercel preview from the GitHub `release-2` branch.
The stable UAT alias points to the latest preview deployment. Production remains
on Release 1 and has not been promoted.

The UAT application uses managed Neon PostgreSQL, Vercel-managed environment
configuration, Google OAuth plus authenticator MFA, and a Stripe sandbox. All
seven migrations are applied. `UAT_MODE=true` prevents live Stripe keys from
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

## Controlled payment rehearsal

The following synthetic-only checks passed on 6 September 2026:

| Scenario | Evidence | Result |
| --- | --- | --- |
| Successful payment | S$72.00 Stripe test-card checkout returned to the non-indexed confirmation page | Order changed from `pending_payment` to `paid` |
| Checkout retry | The same checkout request key was submitted twice | One order and one hosted checkout session were created |
| Fulfilment lifecycle | The paid order was advanced through preparing, ready, and fulfilled | Five ordered status-history records were retained |
| Session expiry | A second unpaid Stripe sandbox session was explicitly expired | Signed webhook changed the order to `cancelled` |
| Provider isolation | Both sessions reported Stripe test mode | No live charge occurred |

Automated tests cover invalid signatures, duplicate events, payment/session
identity mismatch, incorrect totals and currency, unpaid completion events,
invalid status transitions, authorization, content editing, and checkout input
validation. The latest recorded verification is 37 passing tests, with the two
provider-dependent integration tests gated by environment configuration; lint
and the production build pass.

## Remaining release gates

- Approve the real catalogue, prices, product descriptions, collection details,
  delivery rules, blackout dates, and cancellation/refund policy. Current prices
  are still labelled as UAT samples.
- Complete and record storefront/admin desktop and mobile acceptance checks.
- Select and implement outbound email, including delivery state, retries, and
  owner-visible failures. The durable outbox and admin retry view are complete;
  provider delivery is paused until Lovelybakes owns a sending domain.
- Approve privacy wording, final retention duration, and customer support contact.
  A versioned 180-day UAT default, terminal-order deletion workflow, and immutable
  erasure audit are implemented for review.
- Add production monitoring, shared rate limits/WAF controls, backup/restore
  evidence, and an administrator access-recovery procedure.
- Complete the security and accessibility release reviews.
- Obtain explicit CPO approval before merging, promoting Release 2 to production,
  accepting real customer data, or installing live Stripe credentials.

PayNow remains deferred until a provider and operating model are approved.
