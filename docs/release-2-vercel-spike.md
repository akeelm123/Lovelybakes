# Release 2 Vercel hosting spike

## Goal

Move the public Lovelybakes catalogue to Vercel while retaining `akeelm123/Lovelybakes` as the source of truth.

## Result

- Vercel project: `akeelm-projects/lovelybakes`
- Production URL: `https://lovelybakes.vercel.app`
- Source branch: `main`
- Framework: Next.js 16 static export
- Previous Sites deployment retained as a rollback route during validation

## Validation

- Locked dependency install completed with zero reported vulnerabilities.
- Next.js production compilation and TypeScript validation passed.
- All public routes were statically generated.
- Vercel serves the generated `out/` directory through the committed `vercel.json` configuration.
- Canonical metadata, robots and sitemap target the Vercel production URL.
- No runtime secrets or customer data are required by the public catalogue.

## Deployment model

Vercel builds a checked-out GitHub commit. The Vercel GitHub app still needs repository permission before pushes to `main` can trigger deployments automatically. Until that permission is granted, deployment is performed from a clean checkout of the same GitHub branch.

## Rollback

Use the previous successful Vercel deployment or temporarily direct customers to the retained Sites URL. Source rollback is performed with a new reverting commit on `main`; history must not be rewritten.
