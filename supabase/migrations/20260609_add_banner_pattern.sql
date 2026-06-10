-- Interactive banner support: stores the chosen motif for the generated banner.
-- NULL means the merchant uses an uploaded photo (no generated banner).
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS banner_pattern TEXT;

-- Public storage bucket holding generated banners at {merchantId}/banner.png.
-- The API also creates this bucket at runtime (idempotent), but declaring it here
-- keeps environments reproducible.
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Public reads so banner_url works on public card pages / wallet.
CREATE POLICY IF NOT EXISTS "banners public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');
