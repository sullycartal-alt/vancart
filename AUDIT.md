# VanCart — Audit visuel & technique

> Date : 2026-05-28 · Branche : `claude/loyalty-card-saas-mvp-1N1p6`  
> **Lecture seule** — aucune modification de code.

---

## 1. Incohérences visuelles

### 1.1 Couleur principale incorrecte

| Fichier | Ligne | Problème |
|---------|-------|---------|
| `src/app/(dashboard)/dashboard/guide/page.tsx` | 59 | Bouton primaire : `bg-indigo-600 hover:bg-indigo-700` au lieu de `bg-[#6C47FF] hover:bg-[#5835e0]` |
| `src/app/(dashboard)/dashboard/guide/page.tsx` | 79 | Bouton secondaire : `text-indigo-600 border-indigo-200` au lieu du système de couleurs VanCart |
| `src/app/(dashboard)/dashboard/guide/page.tsx` | 88 | Lien action : `text-indigo-600` au lieu de `text-[#6C47FF]` |
| `src/app/(dashboard)/dashboard/guide/page.tsx` | 105 | Badge de numérotation : `bg-indigo-50 text-indigo-600` pour les étapes non faites — devrait utiliser `#6C47FF` |
| `src/app/(dashboard)/dashboard/guide/page.tsx` | 110 | `bg-green-100 text-green-700` pour étapes faites — incohérent avec le badge vert utilisé ailleurs (`bg-green-50 text-green-700`) |

### 1.2 Textes couleur Tailwind au lieu de tokens VanCart

| Fichier | Lignes | Problème |
|---------|--------|---------|
| `src/app/(dashboard)/dashboard/guide/page.tsx` | 46–47 | `text-gray-900` / `text-gray-500` au lieu de `text-[#1A1A1A]` / `text-[#6B6B6B]` |
| `src/app/carte/[loyaltyCardId]/CardClient.tsx` | 126, 128, 144 | `text-gray-500`, `text-gray-900`, `bg-gray-100`, `border-gray-200` au lieu des tokens VanCart |
| `src/app/carte/[loyaltyCardId]/CardClient.tsx` | 194, 320, 335, 356 | Mélange de `text-gray-300`, `text-gray-400`, `bg-gray-100`, `border-gray-100` — tokens Tailwind bruts |

### 1.3 Fond de page incohérent

| Fichier | Ligne | Problème |
|---------|-------|---------|
| `src/app/page.tsx` | ~198 | `min-h-screen bg-white` au lieu de `bg-[#F7F6F3]` standard VanCart. Plusieurs sections internes passent à `#F7F6F3` ce qui crée un flash de couleur |

### 1.4 Styles de boutons incohérents

| Fichier | Lignes | Problème |
|---------|--------|---------|
| `src/app/(dashboard)/dashboard/guide/page.tsx` | 59–61 | `rounded-lg` au lieu de `rounded-xl` (standard des boutons VanCart) |
| `src/app/(dashboard)/dashboard/guide/page.tsx` | 79, 88 | Padding `py-2 px-4` au lieu du standard `py-2.5 px-5` |

### 1.5 Border-radius et espacement incohérents entre pages

| Pattern | Valeurs trouvées | Valeur recommandée |
|---------|-----------------|-------------------|
| Cartes / conteneurs | `rounded-xl`, `rounded-2xl`, `rounded-3xl` selon les pages | `rounded-2xl` |
| Padding interne des cartes | `p-5`, `p-6`, `p-8` | `p-6` (desktop), `p-5` (mobile) |
| Boutons | `rounded-lg`, `rounded-xl` | `rounded-xl` |
| Inputs | `rounded-xl` (✓ cohérent) | — |

---

## 2. Incohérences fonctionnelles

### 2.1 Lecture de cookie sans `force-dynamic`

| Fichier | Ligne | Problème |
|---------|-------|---------|
| `src/app/wallet/page.tsx` | 1–10 | `export const dynamic = 'force-dynamic'` ✓ présent (OK) |
| `src/app/carte/[loyaltyCardId]/page.tsx` | 1–5 | `export const dynamic = 'force-dynamic'` ✓ présent (OK) |

> Aucun problème identifié sur ce point — les pages qui lisent des cookies ont correctement `force-dynamic`.

### 2.2 Requêtes Supabase dupliquées (merchant fetch)

Chaque page dashboard effectue indépendamment la même requête `merchants` :

| Fichier | Ligne |
|---------|-------|
| `src/app/(dashboard)/dashboard/page.tsx` | 13–16 |
| `src/app/(dashboard)/dashboard/clients/page.tsx` | 13–16 |
| `src/app/(dashboard)/dashboard/stamp/page.tsx` | 10–14 |
| `src/app/(dashboard)/dashboard/settings/page.tsx` | 10–14 |
| `src/app/(dashboard)/dashboard/stats/page.tsx` | 120–124 |
| `src/app/(dashboard)/dashboard/ma-carte/page.tsx` | 10–14 |

Ces 6 pages pourraient mutualiser le fetch dans `src/app/(dashboard)/layout.tsx`.

### 2.3 Feature gating `UpgradeGate` asymétrique

| Fichier | Ligne | Problème |
|---------|-------|---------|
| `src/app/(dashboard)/dashboard/stats/page.tsx` | ~255 | `advancedStats` est derrière `UpgradeGate` mais les stats de base sont libres sans explication UI de la différence |

Rechercher d'autres features comparables (notifications push, export CSV, etc.) pour vérifier si elles sont également gatées.

### 2.4 Textes en anglais dans une UI française

| Fichier | Ligne | Texte problématique |
|---------|-------|-------------------|
| `src/app/api/merchants/route.ts` | 9 | `'Slug must be lowercase alphanumeric with hyphens'` — message d'erreur Zod exposé en anglais (visible si le form envoie un payload invalide) |
| `src/app/api/upload/logo/route.ts` | ~12–20 | Commentaires et variable names en anglais (non visible utilisateur — OK) |
| `src/app/(dashboard)/dashboard/clients/ClientsTable.tsx` | 104 | `'Erreur — réessayez'` ✓ français (OK) |

### 2.5 Client Supabase anon vs service

| Fichier | Ligne | Problème |
|---------|-------|---------|
| `src/app/wallet/page.tsx` | 3, 45–50 | Utilise `createServiceClient` ✓ correct (bypass RLS pour lecture publique des cartes) |
| `src/app/carte/[loyaltyCardId]/page.tsx` | 2, 10–20 | `createServiceClient` ✓ correct |
| `src/app/(dashboard)/dashboard/clients/page.tsx` | 2, 34–48 | `createServiceClient` uniquement pour `push_subscriptions` ✓ correct |

> Aucun problème identifié — les clients sont bien utilisés selon le contexte.

---

## 3. Incohérences UX

### 3.1 Absence d'état de chargement

| Fichier | Ligne | Problème |
|---------|-------|---------|
| `src/app/(dashboard)/dashboard/clients/ClientsTable.tsx` | 127–129 | Auto-refresh toutes les 30 s via `router.refresh()` sans indicateur visuel (spinner, timestamp "mis à jour à…") |
| `src/app/(dashboard)/dashboard/guide/page.tsx` | — | Page entièrement statique, pas d'état de chargement pour les actions externes (liens) — mineur |

### 3.2 Absence de gestion d'erreur affichée

| Fichier | Ligne | Problème |
|---------|-------|---------|
| `src/app/wallet/page.tsx` | 14–37 | Si `customerId` est null → état vide "scannez un QR". Aucune distinction entre premier accès et erreur de cookie. Pas de bouton retry |
| `src/app/[merchantSlug]/QRLandingClient.tsx` | — | Erreurs API affichées mais pas de bouton "Réessayer" — l'utilisateur doit recharger la page |
| `src/app/(dashboard)/dashboard/stamp/StampClient.tsx` | — | Si le réseau coupe pendant un tampon, l'erreur est affichée mais il n'y a pas de bouton retry clair |

### 3.3 Formulaires sans feedback après soumission

| Fichier | Ligne | Problème |
|---------|-------|---------|
| `src/app/(dashboard)/dashboard/settings/MerchantForm.tsx` | ~305–308 | Message de succès affiché 3 s mais sans animation ni mise en évidence — facilement manqué dans un formulaire long |
| `src/app/(dashboard)/dashboard/ma-carte/CardDesignClient.tsx` | ~542–545 | Idem — succès disparaît après 3 s sans persistance ni toast |

### 3.4 Boutons sans `disabled` pendant un appel API

| Fichier | Ligne | Problème |
|---------|-------|---------|
| `src/app/(dashboard)/dashboard/clients/ClientsTable.tsx` | 108–115 | Bouton "Envoyer" dans `NotifyModal` : `disabled={status === 'sending'}` ✓ présent, mais pas de changement d'opacité visible pendant l'envoi (pas de `disabled:opacity-50` dans la classe) |
| `src/app/(dashboard)/dashboard/stamp/StampClient.tsx` | ~559–563 | Bouton de confirmation de tampon après recherche : vérifier que `stamping` désactive bien le bouton (peu clair dans le code) |

---

## Récapitulatif par priorité

| Priorité | Catégorie | Nombre |
|----------|-----------|--------|
| 🔴 Haute | Couleurs indigo vs violet VanCart (guide page) | 5 occurrences |
| 🔴 Haute | Fond `bg-white` sur la landing page | 1 |
| 🟡 Moyenne | Tokens Tailwind `gray-*` au lieu de tokens VanCart | ~10 occurrences |
| 🟡 Moyenne | Absence d'état loading / retry | 3 pages |
| 🟡 Moyenne | Feedback formulaire insuffisant | 2 formulaires |
| 🟡 Moyenne | Texte anglais dans message d'erreur Zod | 1 |
| 🟢 Basse | Requêtes merchant dupliquées (6 pages) | Optimisation |
| 🟢 Basse | Border-radius / padding inconsistants | ~5 endroits |
