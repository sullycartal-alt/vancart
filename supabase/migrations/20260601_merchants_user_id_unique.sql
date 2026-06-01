-- Ajouter une contrainte UNIQUE sur user_id dans merchants
-- Requise pour que le upsert { onConflict: 'user_id' } fonctionne dans /api/merchants (POST)
-- À exécuter dans le SQL Editor Supabase (Settings → SQL Editor)
ALTER TABLE merchants ADD CONSTRAINT merchants_user_id_unique UNIQUE (user_id);
