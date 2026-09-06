BEGIN;
CREATE TABLE site_content (
  site_content_id UUID PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE CHECK (page_key = 'storefront'),
  draft_content JSONB NOT NULL,
  published_content JSONB,
  version INTEGER NOT NULL DEFAULT 1,
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at_utc TIMESTAMPTZ
);
COMMIT;
