-- Corrige le bug des leads de prospection non persistés.
--
-- L'API /api/demo-contact insère un champ `logiciel_caisse` dans la table
-- `prospection_leads`, mais cette colonne n'existe pas encore en base. Cela
-- fait échouer l'INSERT (et donc la sauvegarde du lead), alors que le compteur
-- de la campagne s'incrémente quand même via un appel RPC indépendant.
--
-- Voir docs/audit-prospection-leads.md pour le détail de l'audit.
--
-- À exécuter manuellement dans le Supabase SQL Editor.

ALTER TABLE prospection_leads
  ADD COLUMN IF NOT EXISTS logiciel_caisse TEXT;
