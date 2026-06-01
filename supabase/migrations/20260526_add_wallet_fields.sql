DO $$
BEGIN
  IF to_regclass('public.merchants') IS NULL THEN
    RAISE NOTICE 'Skipping wallet fields migration: public.merchants table does not exist in this database.';
    RETURN;
  END IF;

  ALTER TABLE public.merchants
    ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
    ADD COLUMN IF NOT EXISTS wallet_message TEXT,
    ADD COLUMN IF NOT EXISTS card_expiry_months INTEGER DEFAULT 12,
    ADD COLUMN IF NOT EXISTS show_instagram_on_card BOOLEAN DEFAULT false;
END $$;

-- Make storage buckets publicly readable so logo_url and hero_image_url work on public pages
UPDATE storage.buckets SET public = true WHERE id IN ('logos', 'hero-images');

-- Allow public reads on logos bucket
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES
  ('Public logos read', 'logos', 'SELECT', 'true'),
  ('Public hero-images read', 'hero-images', 'SELECT', 'true')
ON CONFLICT DO NOTHING;
