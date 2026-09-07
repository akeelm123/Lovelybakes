# Release 2 UAT evidence

Date: 6 September 2026  
Environment: `https://lovelybakes-release-2.vercel.app`  
Data classification: synthetic test data only

## Payment and order lifecycle

1. Submitted a valid collection checkout for one published product at S$72.00.
2. Repeated the request with the same UUID checkout key.
3. Confirmed both responses referenced the same Stripe Checkout URL and that the
   database contained one customer order.
4. Completed Stripe Checkout using Stripe sandbox card data.
5. Confirmed the browser returned to Lovelybakes with the correct amount,
   requested date, and fulfilment method, without displaying customer PII.
6. Confirmed the signed `checkout.session.completed` webhook was recorded with a
   `processed` outcome and the order became `paid`.
7. Advanced the synthetic order through `preparing`, `ready`, and `fulfilled` in
   the authenticated owner studio. The status history increased from two to five
   entries.
8. Created a second synthetic checkout and expired its Stripe sandbox session.
9. Confirmed the signed `checkout.session.expired` webhook was recorded with a
   `processed` outcome and the unpaid order became `cancelled`.

## Safety observations

- Stripe reported `livemode=false` for the exercised sessions.
- UAT accepts Stripe test keys and rejects live keys.
- Lovelybakes handled no card number, expiry, or security code.
- Customer identities, contact details, addresses, and notes were synthetic.
- Production Release 1 was not changed.

## Open acceptance work

The payment boundary and order lifecycle are ready for CPO acceptance. Overall
Release 2 is not ready for production promotion until business content and
policies, customer email, privacy/retention, operational monitoring, recovery,
security, accessibility, and desktop/mobile UAT gates are complete.
