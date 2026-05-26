ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
  ADD COLUMN IF NOT EXISTS wallet_message TEXT,
  ADD COLUMN IF NOT EXISTS card_expiry_months INTEGER DEFAULT 12,
  ADD COLUMN IF NOT EXISTS show_instagram_on_card BOOLEAN DEFAULT false;
