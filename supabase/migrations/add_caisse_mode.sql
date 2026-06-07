-- ════════════════════════════════════════════════════════════════════════════
-- Caisse mode — PIN, slug, serveur attribution, sessions
-- À exécuter manuellement dans le SQL Editor Supabase.
-- Après exécution, lancer une fois : npx tsx scripts/backfill-caisse-slugs.ts
-- ════════════════════════════════════════════════════════════════════════════

-- PIN caisse sur merchants
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS caisse_pin_hash TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS caisse_slug TEXT UNIQUE;

-- Prénom serveur sur chaque tampon
ALTER TABLE stamps ADD COLUMN IF NOT EXISTS serveur_name TEXT;

-- Sessions caisse actives
CREATE TABLE IF NOT EXISTS caisse_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  serveur_name TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les slugs
CREATE INDEX IF NOT EXISTS merchants_caisse_slug_idx ON merchants(caisse_slug);

-- RLS sur caisse_sessions
ALTER TABLE caisse_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchants can manage own sessions" ON caisse_sessions
  USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));
