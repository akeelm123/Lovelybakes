# Lovelybakes by Nash

The public Lovelybakes product catalogue for celebration cakes, cupcakes, vintage piping, and handmade toppers in Singapore.

## Live site

[lovelybakes.vercel.app](https://lovelybakes.vercel.app)

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run build
```

The production build uses Vercel's native Next.js output. Product and page content come from the approved public snapshot in `src/generated/public-snapshot.json`. The snapshot contains no administrator credentials, customer records, database configuration, or payment credentials.

## Hosting

Vercel hosts the public application from this GitHub source. The current public release uses Instagram enquiries; online payments and customer data collection remain disabled until production service credentials are configured.

The Release 2 hosting spike and rollback plan are documented in [`docs/release-2-vercel-spike.md`](docs/release-2-vercel-spike.md).
