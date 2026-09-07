BEGIN;
CREATE TABLE api_rate_limit_bucket (
  api_rate_limit_bucket_id UUID PRIMARY KEY,
  bucket_key_hash TEXT NOT NULL UNIQUE,
  request_count INTEGER NOT NULL CHECK (request_count > 0),
  reset_at_utc TIMESTAMPTZ NOT NULL,
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX api_rate_limit_bucket_reset ON api_rate_limit_bucket(reset_at_utc);
COMMIT;
