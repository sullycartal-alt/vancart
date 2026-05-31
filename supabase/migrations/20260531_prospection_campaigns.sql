CREATE TABLE IF NOT EXISTS prospection_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_name TEXT NOT NULL,
  nom TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  leads_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS prospection_campaigns_admin_idx
  ON prospection_campaigns(admin_user_id);

CREATE INDEX IF NOT EXISTS prospection_campaigns_created_idx
  ON prospection_campaigns(created_at DESC);

CREATE OR REPLACE FUNCTION increment_leads_count(campaign_slug TEXT)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE prospection_campaigns SET leads_count = leads_count + 1 WHERE slug = campaign_slug;
$$;
