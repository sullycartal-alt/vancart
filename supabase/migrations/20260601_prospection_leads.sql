CREATE TABLE IF NOT EXISTS prospection_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  nom TEXT NOT NULL,
  commerce TEXT NOT NULL,
  adresse_commerce TEXT,
  email TEXT,
  telephone TEXT,
  campaign_slug TEXT,
  lu BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS prospection_leads_created_idx
  ON prospection_leads(created_at DESC);

CREATE INDEX IF NOT EXISTS prospection_leads_lu_idx
  ON prospection_leads(lu)
  WHERE lu = false;
