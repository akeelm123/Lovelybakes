# Lovelybakes final business-content checklist

Use this checklist against the Release 2 UAT site before production promotion. A checked item means the wording, value, and customer outcome are approved for real orders. Record corrections in the admin studio first, then repeat the affected checkout or fulfilment test.

## Catalogue and pricing

| Approve | Product | Current UAT price | Decision required |
| --- | --- | ---: | --- |
| [ ] | Little Celebrations | S$32.00 | Confirm quantity per box, flavours, size, decoration limits and final price. |
| [ ] | Chocolate & Butterflies | S$72.00 | Confirm cake size/servings, flavours, decoration limits and final price. |
| [ ] | A Little Character | S$76.00 | Confirm cake size/servings, topper scope, lead time and final price. |
| [ ] | Written in the Stars | S$76.00 | Confirm cake size/servings, topper scope and final price. |
| [ ] | Floral Marble | S$72.00 | Confirm cake size/servings, flower treatment and final price. |
| [ ] | Vintage Pink | S$150.00 | Confirm cake size/servings, piping scope and final price. |

- [ ] Every photograph is owned or approved for commercial publication.
- [ ] Every product description matches what a customer will receive.
- [ ] Ingredient and allergen information is accurate and visible before payment.
- [ ] Customisation limits and any extra charges are stated clearly.
- [ ] Product availability and publication status are correct.
- [ ] Remove the “sample price” and UAT labels only after all catalogue items above are approved.

## Ordering and fulfilment

- [ ] Minimum order: **S$30.00**.
- [ ] Minimum notice: **5 calendar days**.
- [ ] Maximum booking window is approved in the Ordering screen.
- [ ] Collection is available and the final collection location/instructions are approved.
- [ ] Decide whether delivery is offered; if enabled, approve its area, fee and timing.
- [ ] Add all known unavailable dates and confirm the owner process for maintaining them.
- [ ] Confirm when an order becomes binding: after Stripe payment and Lovelybakes fulfilment confirmation.
- [ ] Confirm how customers request urgent corrections to contact or fulfilment details.

## Cancellation, refunds and customer support

- [ ] Define the cancellation deadline and the refund amount at each stage of preparation.
- [ ] Define the treatment of non-refundable personalised work and purchased materials.
- [ ] Define the response for a Lovelybakes cancellation or inability to fulfil.
- [ ] Confirm the owner can use the admin refund workflow and reconcile it with Stripe.
- [ ] Choose the published support route: email, telephone, Instagram, or a combination.
- [ ] Add the final support response-time expectation.

## Customer communications

- [ ] Approve the confirmation, preparing, ready, fulfilled and cancelled email wording.
- [x] Confirm `Lovelybakes by Nash <orders@lovelybakestore.com>` as the sender identity.
- [x] Confirm automatic messages after order events; failed messages remain visible for owner retry.
- [ ] Confirm collection/delivery instructions in email match the Ordering screen.
- [x] Route replies through `orders@lovelybakestore.com`; the admin can change the reply address for future messages.

## Legal and privacy

- [ ] Approve the Privacy page and identify the business/contact responsible for requests.
- [ ] Approve the Terms page, including handmade variation, acceptance, cancellation and refund wording.
- [ ] Confirm the customer-data retention period; UAT currently uses **180 days** after fulfilment or cancellation.
- [ ] Confirm any financial-record retention required by the business or adviser.
- [ ] Confirm Stripe, Vercel, Neon, Google and Resend disclosures are acceptable.
- [ ] Confirm no unsupported halal, allergen-free, delivery-time or customer-review claims appear.

## Brand, search and domain

- [ ] Approve the brand name, byline, announcement, homepage headline and calls to action.
- [ ] Approve the Instagram link and every footer/navigation link.
- [ ] Approve the page title and search description.
- [ ] Confirm `lovelybakestore.com` as the canonical domain and `www.lovelybakestore.com` as its redirect alias.
- [x] Verify the apex domain, `www`, HTTPS certificate, robots file and sitemap after DNS propagation (completed 7 September 2026).
- [ ] Add `https://lovelybakestore.com/api/auth/callback` to the Google OAuth client before production admin access uses the custom domain.

## Final acceptance record

- [ ] Desktop storefront and checkout accepted.
- [ ] Mobile storefront and checkout accepted.
- [ ] Desktop and mobile admin workflows accepted.
- [ ] One low-value live payment, email and refund rehearsal approved for launch day.
- [ ] Backup, recovery, monitoring and administrator-recovery procedures accepted.
- [ ] Production database and live Stripe configuration are approved.
- [ ] CPO authorises merge, production deployment, custom-domain cutover and acceptance of real customer orders.

Owner: ____________________  Date: ____________________

Notes or required corrections:

______________________________________________________________________________

## Technical acceptance evidence

Automated browser review completed on 7 September 2026 against the Release 2 UAT deployment:

- Storefront, privacy, terms and admin-login routes returned successfully on desktop and mobile viewports.
- Each audited page had one visible `h1`, a `main` landmark, valid heading order, no unnamed interactive controls, no missing image alternatives and no horizontal overflow.
- The real cart and checkout drawer passed keyboard checks: focus entered and remained in the modal, Escape closed it, and focus returned to the bag control.
- Checkout fields were labelled, required fields were exposed to the browser, and the mobile drawer had no horizontal overflow.
- Security headers, HTTPS, `robots.txt` and `sitemap.xml` were present. The custom apex domain returned 200 and `www` redirected permanently to the apex.

This evidence covers technical behavior. The owner acceptance and business decisions above remain open until explicitly approved.
