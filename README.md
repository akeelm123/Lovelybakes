# Lovelybakes by Nash — Release 2

The Lovelybakes storefront and owner studio for celebration cakes, cupcakes, vintage piping, and handmade toppers in Singapore.

## Live site

[lovelybakes.vercel.app](https://lovelybakes.vercel.app)

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Copy `.env.example` to `.env.local`, use private values, and apply the migrations in numerical order to PostgreSQL. Never commit `.env.local` or authenticator enrollment material.

## Release 2 scope

- Google administrator sign-in with authenticator step-up
- Product creation, editing, publication and image replacement
- Editable storefront content and ordering rules
- Order and fulfilment management
- PostgreSQL persistence and audit records
- Stripe test-checkout and signed-webhook boundary
- Versioned customer email outbox, delivery history and admin retry controls
- Database-backed MFA replay prevention and distributed lockout for Vercel

## Validation

```bash
npm run build
```

The production build uses Vercel's native Next.js output. Product and page content come from the approved public snapshot in `src/generated/public-snapshot.json`. The snapshot contains no administrator credentials, customer records, database configuration, payment credentials, or email-provider credentials.

## Hosting

Vercel hosts the public application from this GitHub source. The current public release uses Instagram enquiries; online payments and customer data collection remain disabled until production service credentials are configured.

The Release 2 hosting spike and rollback plan are documented in [`docs/release-2-vercel-spike.md`](docs/release-2-vercel-spike.md).
