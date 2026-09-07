BEGIN;

CREATE TABLE email_setting (
  email_setting_id UUID PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE CHECK (setting_key = 'transactional'),
  reply_to_email TEXT NOT NULL CHECK (char_length(reply_to_email) BETWEEN 3 AND 254),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO email_setting (email_setting_id, setting_key, reply_to_email)
VALUES ('4f6a3196-7ba8-55f2-a8d2-4e4b756980d8', 'transactional', 'orders@lovelybakestore.com');

COMMIT;
