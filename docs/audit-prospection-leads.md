# Audit — flux Prospection → Leads (admin)

Date : 2026-06-08
Périmètre : pourquoi le compteur "Campagne" s'incrémente mais les infos du
commerçant n'apparaissent jamais dans l'onglet "Lead" de l'admin.

Aucun fichier n'a été modifié — audit uniquement.

---

## 1. Formulaire public de prospection

**Fichier** : `src/components/demo/DemoPage.tsx`

Formulaire client qui collecte `prenom`, `commerce`, `adresse_commerce`, `email`,
`telephone`, `logiciel_caisse`, `message`, et le `campaign` (slug pris dans
l'URL), puis :

```ts
const res = await fetch('/api/demo-contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...form, campaign }),
})
```

→ Rien à signaler ici : le formulaire envoie bien tous les champs attendus.

---

## 2. Route API qui reçoit la soumission

**Fichier** : `src/app/api/demo-contact/route.ts`

Schéma Zod (lignes 6-15) — valide tous les champs, y compris
`logiciel_caisse: z.string().max(100).optional()`.

Après l'envoi de l'email via Resend, persistance en base (lignes 142-159) :

```ts
// lignes 142-159
try {
  const service = createServiceClient()
  await service.from('prospection_leads').insert({
    nom: prenom,
    commerce,
    adresse_commerce,
    email,
    telephone: telephone ?? null,
    logiciel_caisse: logiciel_caisse ?? null,   // ← colonne inexistante (voir §4)
    campaign_slug: campaign ?? null,
    lu: false,
  })
  if (campaign) {
    await service.rpc('increment_leads_count', { campaign_slug: campaign })
  }
} catch {
  // Silently ignore DB errors — email was already sent
}
```

**Champs écrits visés** : `nom, commerce, adresse_commerce, email, telephone,
logiciel_caisse, campaign_slug, lu`.

---

## 3. Composant admin qui affiche les leads

**Fichier (UI)** : `src/app/admin/prospection/page.tsx`
Définit `interface Lead { id, created_at, nom, commerce, adresse_commerce,
email, telephone, campaign_slug, lu }` et appelle l'API ci-dessous.

**Fichier (API)** : `src/app/api/admin/prospection/leads/route.ts`

```ts
const { data, error } = await service
  .from('prospection_leads')
  .select('*')
  .order('created_at', { ascending: false })
```

→ `select('*')`, aucun `WHERE`/`.eq()`/`.match()` qui exclurait des lignes.
Cette requête est correcte : si des lignes existaient dans `prospection_leads`,
elles seraient retournées telles quelles.

---

## 4. Schéma Supabase

**`prospection_leads`** — `supabase/migrations/20260601_prospection_leads.sql` :

```sql
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
```

**Il n'y a pas de colonne `logiciel_caisse`.** Aucune migration ultérieure ne
l'ajoute (recherche sur `supabase/migrations/*.sql` négative).

**`prospection_campaigns`** — `supabase/migrations/20260531_prospection_campaigns.sql` :

```sql
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

CREATE OR REPLACE FUNCTION increment_leads_count(campaign_slug TEXT)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE prospection_campaigns SET leads_count = leads_count + 1 WHERE slug = campaign_slug;
$$;
```

---

## 5. Cause racine — pourquoi le compteur monte mais aucun lead n'apparaît

C'est la combinaison de **deux bugs distincts** qui produit ce comportement
précis (et pas un simple "tout échoue") :

### Bug A — `logiciel_caisse` n'existe pas dans `prospection_leads`
La route insère `logiciel_caisse: logiciel_caisse ?? null` (ligne 150) alors
que la migration ne crée pas cette colonne. PostgreSQL renvoie une erreur
`column "logiciel_caisse" of relation "prospection_leads" does not exist`
et **l'INSERT échoue intégralement** — aucune ligne n'est créée, même pas avec
les autres champs valides.

### Bug B — l'erreur Supabase n'est jamais détectée (et le `catch` ne sert à rien ici)
Le client `@supabase/supabase-js` (v2, voir `src/lib/supabase/service.ts`,
sans `.throwOnError()`) **ne lève pas d'exception** sur une erreur de requête :
`await service.from(...).insert(...)` se résout en `{ data: null, error: {...} }`,
sans jamais `throw`. Le `try { ... } catch { ... }` des lignes 142-159
n'intercepte donc *rien* — l'erreur d'INSERT passe complètement inaperçue
et l'exécution continue normalement à la ligne suivante.

### Conséquence — l'enchaînement exact observé
1. `await service.from('prospection_leads').insert({...})` → échoue côté DB
   (colonne inexistante), retourne `{ error }`, **ne lève pas d'exception**.
2. Le code ignore `error` (il ne le déstructure même pas) et poursuit.
3. `if (campaign) { await service.rpc('increment_leads_count', ...) }`
   s'exécute **normalement** — c'est un appel RPC totalement indépendant qui
   réussit et incrémente `prospection_campaigns.leads_count`.
4. La fonction retourne `{ ok: true }` au formulaire, qui affiche un succès.
5. Résultat : le compteur "Campagne" augmente à chaque soumission, mais
   `prospection_leads` reste vide → l'onglet "Lead" de l'admin n'affiche rien
   (la requête `select('*')` du §3 est correcte mais ne lit aucune ligne,
   puisqu'aucune n'a jamais été écrite).

Le `select('*')` admin et l'`interface Lead` ne sont donc PAS en cause — ils
sont cohérents avec le schéma. Le problème est entièrement en amont, à
l'insertion.

---

## 6. Corrections proposées

### Fix 1 (obligatoire) — aligner colonne et insertion
Deux options, au choix :

- **Option A — ajouter la colonne manquante** (recommandé, car le champ est
  collecté dans le formulaire, validé par Zod, et déjà affiché dans l'email
  admin "Logiciel de caisse" — l'intention est visiblement de le conserver) :
  nouvelle migration `supabase/migrations/<date>_prospection_leads_logiciel_caisse.sql` :
  ```sql
  ALTER TABLE prospection_leads
    ADD COLUMN IF NOT EXISTS logiciel_caisse TEXT;
  ```
  et ajouter `logiciel_caisse: string | null` à `interface Lead` dans
  `src/app/admin/prospection/page.tsx` pour pouvoir l'afficher.

- **Option B — retirer le champ de l'INSERT** si on ne souhaite pas le
  persister : supprimer la ligne `logiciel_caisse: logiciel_caisse ?? null,`
  dans `src/app/api/demo-contact/route.ts`. (Moins satisfaisant : la donnée
  est perdue après l'email.)

### Fix 2 (obligatoire) — vérifier explicitement `error` après l'INSERT/RPC
Le `try/catch` actuel ne protège de rien puisque le client Supabase ne lève
pas d'exception sur erreur de requête. Il faut destructurer `{ error }` et le
traiter (logger a minima, voire renvoyer un statut différent côté API) :

```ts
const { error: insertError } = await service.from('prospection_leads').insert({...})
if (insertError) {
  console.error('[demo-contact] insert prospection_leads failed:', insertError)
} else if (campaign) {
  const { error: rpcError } = await service.rpc('increment_leads_count', { campaign_slug: campaign })
  if (rpcError) console.error('[demo-contact] increment_leads_count failed:', rpcError)
}
```

Ce changement a deux effets utiles :
- rend l'échec visible dans les logs serveur (au lieu d'un échec silencieux) ;
- **découple** le succès du compteur de campagne de la persistance du lead :
  avec la condition `else if (campaign)`, le compteur ne s'incrémente plus
  que si la ligne a réellement été insérée — ce qui élimine la situation
  actuelle où "le compteur monte mais le lead n'existe pas".

### Fix 3 (optionnel mais recommandé) — cohérence du `catch` restant
Conserver un `try/catch` autour de l'ensemble pour les erreurs *inattendues*
(ex. `createServiceClient()` qui jette si les env vars manquent), mais avec un
`console.error` au lieu d'un commentaire silencieux, pour ne pas reproduire le
même piège de diagnostic à l'avenir.

---

## Récapitulatif des fichiers concernés

| Fichier | Rôle | Statut |
|---|---|---|
| `src/components/demo/DemoPage.tsx` | Formulaire public | ✅ OK |
| `src/app/api/demo-contact/route.ts` | Réception + persistance + compteur | ❌ Bug A (colonne manquante) + Bug B (erreur non vérifiée) |
| `src/app/admin/prospection/page.tsx` | UI admin "Lead" | ✅ OK (à enrichir si Fix 1 option A) |
| `src/app/api/admin/prospection/leads/route.ts` | SELECT des leads | ✅ OK |
| `supabase/migrations/20260601_prospection_leads.sql` | Schéma `prospection_leads` | ❌ Colonne `logiciel_caisse` manquante |
| `supabase/migrations/20260531_prospection_campaigns.sql` | Schéma `prospection_campaigns` + RPC compteur | ✅ OK |
