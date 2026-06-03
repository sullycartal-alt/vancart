-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Merchants table (linked to Supabase auth.users)
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#000000',
  loyalty_rule TEXT NOT NULL DEFAULT 'Achetez 10, le suivant est offert',
  stamps_required INTEGER NOT NULL DEFAULT 10,
  loyalty_type TEXT NOT NULL DEFAULT 'stamps',
  points_per_euro INTEGER DEFAULT 1,
  points_required INTEGER DEFAULT 100,
  description TEXT,
  instagram_handle TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration for existing installations:
-- ALTER TABLE merchants ADD COLUMN IF NOT EXISTS description TEXT;
-- ALTER TABLE merchants ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
-- ALTER TABLE merchants ADD COLUMN IF NOT EXISTS loyalty_type TEXT NOT NULL DEFAULT 'stamps';
-- ALTER TABLE merchants ADD COLUMN IF NOT EXISTS points_per_euro INTEGER DEFAULT 1;
-- ALTER TABLE merchants ADD COLUMN IF NOT EXISTS points_required INTEGER DEFAULT 100;
-- ALTER TABLE merchants ADD COLUMN IF NOT EXISTS average_ticket INTEGER;
-- ALTER TABLE merchants ADD COLUMN IF NOT EXISTS merchant_color_2 TEXT; -- secondary gradient color for Cover card

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  first_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Loyalty cards table (one per customer per merchant)
CREATE TABLE loyalty_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  stamps_count INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  total_stamps_earned INTEGER NOT NULL DEFAULT 0,
  rewards_unlocked INTEGER NOT NULL DEFAULT 0,
  apple_pass_serial TEXT UNIQUE,
  google_pass_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(merchant_id, customer_id)
);

-- Stamps table (audit log of every stamp given)
CREATE TABLE stamps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loyalty_card_id UUID NOT NULL REFERENCES loyalty_cards(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  given_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamps ENABLE ROW LEVEL SECURITY;

-- Merchants: only the owner can read/write their merchant profile
CREATE POLICY "Merchants: owner access" ON merchants
  FOR ALL USING (auth.uid() = user_id);

-- Customers: merchants can read customers linked to their cards
CREATE POLICY "Customers: merchants can read" ON customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM loyalty_cards lc
      JOIN merchants m ON m.id = lc.merchant_id
      WHERE lc.customer_id = customers.id
      AND m.user_id = auth.uid()
    )
  );

-- Customers: public insert for new customers (QR scan flow)
CREATE POLICY "Customers: public insert" ON customers
  FOR INSERT WITH CHECK (true);

-- Loyalty cards: merchant can read/update their cards
CREATE POLICY "Loyalty cards: merchant access" ON loyalty_cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM merchants m
      WHERE m.id = loyalty_cards.merchant_id
      AND m.user_id = auth.uid()
    )
  );

-- Loyalty cards: public insert for new cards (QR scan flow)
CREATE POLICY "Loyalty cards: public insert" ON loyalty_cards
  FOR INSERT WITH CHECK (true);

-- Stamps: merchant can insert stamps for their cards
CREATE POLICY "Stamps: merchant insert" ON stamps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM merchants m
      WHERE m.id = stamps.merchant_id
      AND m.user_id = auth.uid()
    )
  );

-- Stamps: merchant can read their stamps
CREATE POLICY "Stamps: merchant read" ON stamps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM merchants m
      WHERE m.id = stamps.merchant_id
      AND m.user_id = auth.uid()
    )
  );

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER merchants_updated_at
  BEFORE UPDATE ON merchants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER loyalty_cards_updated_at
  BEFORE UPDATE ON loyalty_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
