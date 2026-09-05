# Lovelybakes by Nash

The public Lovelybakes product catalogue for celebration cakes, cupcakes, vintage piping, and handmade toppers in Singapore.

## Live site

[lovelybakes-by-nash.akeelmunshi.chatgpt.site](https://lovelybakes-by-nash.akeelmunshi.chatgpt.site)

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

The production build is a static export written to `out/`. Product and page content come from the approved public snapshot in `src/generated/public-snapshot.json`. The snapshot contains no administrator credentials, customer records, database configuration, or payment credentials.

## Hosting

The project is configured for OpenAI Sites through `.openai/hosting.json`. The current public release uses Instagram enquiries; online payments and customer data collection remain disabled until production service credentials are configured.
