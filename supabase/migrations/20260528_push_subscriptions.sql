CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- One subscription per browser per merchant (upsert key)
CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_endpoint_merchant
  ON push_subscriptions ((subscription->>'endpoint'), merchant_id);
