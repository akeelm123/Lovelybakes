# Release 2 browser UAT

Date: 6 September 2026  
Environment: `https://lovelybakes-release-2.vercel.app`

Desktop (1440×900) and mobile (390×844) checks passed: HTTP 200, meaningful page content, all nine images loaded, twelve headings exposed, no horizontal overflow, cart opened from the catalogue, close control received focus, Escape closed the modal, and focus returned to the cart button. Privacy and Terms returned HTTP 200. Screenshots were reviewed for layout breaks and content overlap.

The browser reported one blocked script from `vercel.live`. This is Vercel's preview feedback toolbar, not application code. The application CSP correctly blocked the unapproved third-party script; no customer feature depends on it.

The review identified and corrected stale legal copy that described the earlier enquiry-only release. The checkout now requires acknowledgement of the privacy notice before submission. The notice describes order contact and fulfilment data, Stripe card processing, operational uses, core service providers, the current 180-day policy, and an Instagram contact route for access, correction, or deletion requests.

Authenticated admin mobile review remains to be repeated after the owner signs in. Final business approval is still required for the catalogue, operating terms, retention period, refund/cancellation policy, and customer-contact route.
