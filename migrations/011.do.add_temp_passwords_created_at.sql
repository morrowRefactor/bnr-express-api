ALTER TABLE temp_passwords
    ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
