-- Anti-fraud rules + admin enrichment

-- 1. Merchant anti-fraud settings
ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS allow_multiple_stamps BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS min_minutes_between_stamps INTEGER DEFAULT 0;

-- 2. IP + timestamp on stamps (given_at already exists for timestamp, adding ip_address)
ALTER TABLE stamps
  ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- 3. Stamp alerts table
CREATE TABLE IF NOT EXISTS stamp_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  triggered_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  dismissed BOOLEAN DEFAULT false,
  auto_dismissed BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS stamp_alerts_merchant_id_idx ON stamp_alerts(merchant_id);
CREATE INDEX IF NOT EXISTS stamp_alerts_triggered_at_idx ON stamp_alerts(triggered_at DESC);

-- RLS for stamp_alerts: merchants can only see their own alerts
ALTER TABLE stamp_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants read own alerts" ON stamp_alerts
  FOR SELECT USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Merchants update own alerts" ON stamp_alerts
  FOR UPDATE USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE user_id = auth.uid()
    )
  );

-- Service role can do everything (for stamp API inserts)
CREATE POLICY "Service role all on stamp_alerts" ON stamp_alerts
  USING (true)
  WITH CHECK (true);
