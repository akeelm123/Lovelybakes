# Release 2 Vercel hosting spike

## Goal

Move the public Lovelybakes catalogue to Vercel while retaining `akeelm123/Lovelybakes` as the source of truth.

## Result

- Vercel project: `akeelm-projects/lovelybakes`
- Production URL: `https://lovelybakes.vercel.app`
- Source branch: `main`
- Framework: Next.js 16 using Vercel's native build output
- Previous Sites deployment retained as a rollback route during validation

## Validation

- Locked dependency install completed with zero reported vulnerabilities.
- Next.js production compilation and TypeScript validation passed.
- All public routes are prerendered as static content within Vercel's native Next.js deployment output.
- Canonical metadata, robots and sitemap target the Vercel production URL.
- No runtime secrets or customer data are required by the public catalogue.

## Deployment model

Vercel builds a checked-out GitHub commit. The Vercel GitHub app still needs repository permission before pushes to `main` can trigger deployments automatically. Until that permission is granted, deployment is performed from a clean checkout of the same GitHub branch.

## Rollback

Use the previous successful Vercel deployment or temporarily direct customers to the retained Sites URL. Source rollback is performed with a new reverting commit on `main`; history must not be rewritten.

## Registered domain

`lovelybakestore.com` and `www.lovelybakestore.com` are assigned to the Vercel project. GoDaddy remains the authoritative DNS provider so the Resend mail records can be retained there. The apex uses Vercel's preferred `216.198.79.1` and `64.29.17.1` A records; `www` uses the project-specific Vercel CNAME and permanently redirects to the apex with HTTP 308. Vercel reports both domains correctly configured, HTTPS succeeds, and the authoritative Resend MX, SPF and DKIM records remain intact.

The custom domain currently follows the project's production deployment. Release 2 remains on its separate UAT alias until final business acceptance and explicit production-promotion approval.
