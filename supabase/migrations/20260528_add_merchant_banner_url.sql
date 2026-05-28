ALTER TABLE merchants ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Create merchant-assets storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('merchant-assets', 'merchant-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "merchant-assets public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'merchant-assets');

CREATE POLICY IF NOT EXISTS "merchant-assets auth upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'merchant-assets');
