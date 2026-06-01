-- Add wallet_color column for Google Wallet card background (separate from primary_color which drives app UI)
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS wallet_color TEXT;
