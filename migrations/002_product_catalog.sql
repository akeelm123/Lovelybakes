BEGIN;
CREATE TABLE product_image (
  product_image_id UUID PRIMARY KEY,
  content BYTEA NOT NULL CHECK (octet_length(content) <= 2097152),
  content_type TEXT NOT NULL CHECK (content_type = 'image/webp'),
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE product (
  product_id UUID PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  description TEXT NOT NULL CHECK (length(description) BETWEEN 1 AND 1000),
  category TEXT NOT NULL CHECK (length(category) BETWEEN 1 AND 60),
  price_cents INTEGER NOT NULL CHECK (price_cents BETWEEN 100 AND 1000000),
  image_path TEXT NOT NULL,
  product_image_id UUID REFERENCES product_image(product_image_id),
  image_alternative_text TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN NOT NULL DEFAULT false,
  version INTEGER NOT NULL DEFAULT 1,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX product_published ON product(status, featured, created_at_utc);
CREATE TABLE administrator_event (
  administrator_event_id UUID PRIMARY KEY,
  actor_subject TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_id UUID NOT NULL,
  occurred_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMIT;
