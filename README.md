# vancart
Provide fidelity cards on apple wallet and google wallet

## Mode Caisse

Le mode caisse permet aux serveurs d'un commerce de scanner les cartes clients
depuis leur propre téléphone, via une page publique protégée par un PIN.

### Mise en place (une seule fois)

1. **Migration SQL** — exécuter `supabase/migrations/add_caisse_mode.sql` dans
   le SQL Editor Supabase (ajoute `caisse_pin_hash`, `caisse_slug`,
   `stamps.serveur_name`, la table `caisse_sessions` et sa policy RLS).

2. **Backfill des slugs** — générer les `caisse_slug` des commerces existants :

   ```bash
   npx tsx scripts/backfill-caisse-slugs.ts
   ```

   Le script lit `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`.
   Les nouveaux commerces reçoivent automatiquement leur slug à la création.

### Variables d'environnement optionnelles

- `CAISSE_SESSION_SECRET` — secret de signature des cookies de session caisse.
  À défaut, `SUPABASE_SERVICE_ROLE_KEY` est utilisé (server-side uniquement).
