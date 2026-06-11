# AUDIT VANCART — Rapport complet

> **Date** : 11 juin 2026 · **Branche auditée** : `claude/loyalty-card-saas-mvp-1N1p6` (commit `b980dca`)
> **Périmètre** : intégralité du repo (src/, supabase/, config). Remplace l'audit visuel du 28 mai.
> **Contexte connu et intentionnel** (non compté comme faille mais mentionné quand il a des effets de bord) : `RESTRICTIONS_ENABLED = false` dans `src/lib/plan-config.ts` et `normalizePlan()` retourne toujours `'pro'` (phase de validation marché).
>
> Légende : 🔴 critique · 🟡 moyen · 🟢 mineur

---

## 1. Sécurité

### 1.1 Routes API sans authentification

| Criticité | Fichier | Problème |
|---|---|---|
| 🔴 | `src/app/api/public/card/route.ts:4-17` | `GET /api/public/card?id=` expose les données complètes d'une carte (tampons, infos merchant) à quiconque connaît l'UUID, sans auth ni rate limit. UUID = seule protection. |
| 🔴 | `src/app/api/public/hero-merchant/route.ts:14-31` | Expose les données merchant sans auth, et appelle `auth.admin.listUsers()` côté service role avec un email admin hardcodé — surface d'énumération inutile. |
| 🟡 | `src/app/api/customers/route.ts:12-68` | POST public (service role) qui accepte **n'importe quel `merchant_id`** dans le body : un attaquant peut créer des clients/cartes rattachés à n'importe quel commerçant. Atténué par rate limit IP (20/min) mais aucune vérification d'ownership applicative. |
| 🟡 | `src/app/api/push/subscribe/route.ts:14-29` | POST public sans auth acceptant un `merchant_id` arbitraire — injection de subscriptions push pour d'autres merchants. Impact faible mais logique défaillante. |
| 🟡 | `src/app/api/demo-contact/route.ts:30-166` | POST public créant des leads + envoi d'email aux admins. Rate limité mais permet du spam de faux leads. |
| 🟡 | `src/app/api/loyalty-cards/route.ts:89-150` | POST sans auth (par design pour le flow QR), utilise le service role pour contourner la RLS. La limite `maxClients` par plan est neutralisée par `normalizePlan() → 'pro'` (effet de bord du flag temporaire, à réactiver avec lui). |

### 1.2 RLS Supabase

| Criticité | Fichier | Problème |
|---|---|---|
| 🔴 | `supabase/migrations/20260601_prospection_leads.sql` | Table `prospection_leads` **sans RLS** : noms, commerces, emails, téléphones, adresses des leads lisibles par tout utilisateur authentifié via l'API Supabase (clé anon publique). |
| 🔴 | `supabase/migrations/20260531_prospection_campaigns.sql` | Table `prospection_campaigns` **sans RLS** : campagnes marketing visibles par tout utilisateur authentifié. |
| 🟡 | `supabase/migrations/20260526_anti_fraud_and_admin.sql:44-46` | Policy `"Service role all on stamp_alerts"` en `USING (true) WITH CHECK (true)` — bypass complet, acceptable seulement si la clé service role ne fuit jamais. |
| 🟡 | `supabase/schema.sql:87` | Policy `FOR INSERT WITH CHECK (true)` sur les inserts du flow QR : nécessaire au flow public mais signifie que la sécurité repose entièrement sur les routes API, pas sur la base. |

### 1.3 Injection / sanitization

| Criticité | Fichier | Problème |
|---|---|---|
| 🟡 | `src/app/api/demo-contact/route.ts:85,108` | `prenom`, `commerce`, `adresse_commerce`, `message` et `email` interpolés directement dans le HTML de l'email (y compris `href="mailto:${email}"`) sans échappement HTML — injection HTML possible dans les emails reçus par les admins. |
| 🟡 | `src/lib/sanitize.ts:1-4` | `sanitizeText()` se limite à une regex `/<[^>]*>/g` : ne neutralise ni les entités HTML ni les attributs événements (`onerror=`…). Insuffisant comme unique défense. |
| 🟡 | `src/app/api/welcome-email/route.ts:26` | `firstName`/`businessName` validés par Zod mais interpolés dans le template HTML sans échappement. |
| 🟡 | `src/app/api/upload/*` (logo, banner, hero-image) | Extension de fichier dérivée de `file.name.split('.').pop()` sans whitelist — un `fichier.php.jpg` ou une extension arbitraire passe. Supabase Storage n'exécute rien, mais pratique à corriger. |
| 🟢 | `src/lib/banner-patterns.ts:65` | `primaryColor` interpolé dans le SVG mais validé en amont par regex `/^#[0-9a-fA-F]{6}$/` — pas de vecteur pratique, à surveiller si la validation s'assouplit. |

### 1.4 Headers / CSP

| Criticité | Fichier | Problème |
|---|---|---|
| 🟡 | `next.config.ts:10-18` | CSP avec `'unsafe-inline' 'unsafe-eval'` sur les scripts : annule l'essentiel de la protection XSS de la CSP. `X-Frame-Options: DENY`, `nosniff` et Referrer-Policy sont bien présents. 🟢 |

### 1.5 Rate limiting

| Criticité | Fichier | Problème |
|---|---|---|
| 🟡 | `src/app/api/caisse/stamp/route.ts` | Pas de rate limit sur l'ajout de tampon (route sensible, session caisse requise mais spammable). |
| 🟡 | `src/app/api/caisse/redeem/route.ts` | Pas de rate limit sur la remise de récompense. |
| 🟡 | `src/app/api/push/send/route.ts` | Pas de rate limit sur l'envoi de notifications (envoi en masse possible). |
| 🟢 | `src/app/api/stripe/checkout/route.ts`, `api/caisse/logout` | Pas de rate limit — impact faible. |
| 🟢 | — | `caisse/login` (10/15min) et `ai/conseil` (30/jour) sont correctement limités. ✓ |

### 1.6 Secrets

| Criticité | Fichier | Problème |
|---|---|---|
| 🟡 | `.env.local` | Contient de vraies clés (service role Supabase, VAPID, etc.). Il est bien **gitignoré et non commité** (vérifié via `git ls-files`), mais présent dans l'environnement de dev partagé — à traiter comme sensible. |
| 🟡 | `src/app/api/merchant/generate-banner/route.ts:20` | Auth interne par header `x-internal-key` comparé à `SUPABASE_SERVICE_ROLE_KEY` : réutiliser la clé service role comme secret d'API interne élargit son rayon d'impact en cas de fuite. |
| 🟢 | — | Tokens GitHub (`ghp_…`) partagés en clair dans les conversations de dev : à révoquer/faire tourner. |

### 1.7 Points sains ✓

- Webhook Stripe : signature vérifiée via `stripe.webhooks.constructEvent()` (`src/app/api/stripe/webhook/route.ts:13-29`). 🟢
- Sessions caisse : HMAC-SHA256 + `timingSafeEqual`, expiration en token **et** en base (`src/lib/caisse/session.ts`). 🟢
- PIN caisse hashé en bcrypt (`api/caisse/login`). 🟢

---

## 2. Authentification & autorisation

### 2.1 Vérification admin — duplication et incohérence

| Criticité | Fichier | Problème |
|---|---|---|
| 🔴 | 9 fichiers (liste ci-dessous) | La constante admin est définie **en 9 endroits**, sous deux formes incompatibles : `ADMIN_EMAIL` (string, sullycartal seul) vs `ADMIN_EMAILS` (array incluant `audrey@vancart.fr`). Conséquence concrète : **Audrey a accès aux API `/api/admin/prospection*` et `/api/demo-contact/[id]` mais PAS à la page `/admin` (admin/page.tsx) ni à `/api/admin/merchants`**, et le middleware `src/proxy.ts` ne connaît que sullycartal. Définitions : `src/lib/plan-features.ts:3` (seule exportée), `src/proxy.ts:4`, `src/app/(dashboard)/layout.tsx:17`, `src/app/admin/page.tsx:7`, `src/app/admin/layout.tsx:8` (array), `src/app/api/admin/merchants/route.ts:5`, `src/app/api/admin/prospection/route.ts:5` (array), `src/app/api/admin/prospection/leads/route.ts:5` (array), `src/app/api/demo-contact/[id]/route.ts:5` (array). |
| 🟡 | tous les fichiers ci-dessus | Le rôle admin repose sur une comparaison d'email hardcodée plutôt que sur un rôle/claim Supabase (`app_metadata`) — fragile et non révocable sans redéploiement. |

### 2.2 Ownership / escalade de privilèges

| Criticité | Fichier | Problème |
|---|---|---|
| 🟡 | `src/app/api/customers/route.ts` | (Repris de § 1.1) `merchant_id` arbitraire accepté — écriture cross-merchant possible. |
| 🟡 | `src/app/api/push/subscribe/route.ts` | (Repris de § 1.1) idem. |
| 🟢 | — | **Bonne nouvelle** : toutes les autres routes vérifient l'ownership correctement — `api/merchants` (GET/POST/PATCH via `eq('user_id', user.id)`), `api/stamps`, `api/loyalty-cards` GET, `api/rewards/redeem`, `api/stamp-alerts`, `api/caisse/stamp` + `redeem` (vérification `merchant_id` de la session caisse). ✓ |

### 2.3 Middleware et couverture des routes

| Criticité | Fichier | Problème |
|---|---|---|
| 🟡 | `src/proxy.ts` (matcher: `['/', '/dashboard/:path*', '/admin/:path*']`) | `/dashboard/onboarding` (groupe `(onboarding)`) n'a **pas de layout-guard** et repose uniquement sur le check page-level (`page.tsx:11`). Fonctionnel aujourd'hui, mais sans filet : tout nouvel ajout dans `(onboarding)` devra penser à vérifier l'auth lui-même. |
| 🟢 | `src/app/(dashboard)/layout.tsx:25` | `isAdmin` calculé côté layout sert uniquement à afficher le lien "Admin" — purement cosmétique, le serveur protège réellement `/admin`. |

### 2.4 Cookies / sessions

| Criticité | Fichier | Problème |
|---|---|---|
| 🟡 | cookie `vancart_customer_id` (lu dans `src/app/wallet/page.tsx:14`) | Aucune création server-side trouvée dans le repo → probablement posé côté JavaScript client, donc **non httpOnly** : un XSS permettrait de voler l'accès wallet d'un client. À vérifier/migrer vers un Set-Cookie httpOnly. |
| 🟢 | `src/lib/caisse/session.ts:69-74` | Cookie caisse exemplaire : `httpOnly`, `secure` en prod, `sameSite: 'lax'`, expiration. ✓ |
| 🟢 | Auth Supabase | Cookies gérés par `@supabase/ssr` — paramètres par défaut corrects, pas de configuration custom risquée détectée. ✓ |

### 2.5 Anti-fraude tamponnage

| Criticité | Fichier | Problème |
|---|---|---|
| 🟡 | `src/app/api/caisse/stamp/route.ts` / `api/stamps` | Pas de rate limit par carte : une session caisse valide peut tamponner la même carte N fois en rafale. La détection « rapid stamping » (`api/stamps:64-101`, ≥5 tampons/5min) **alerte** mais ne bloque pas. L'IP loggée est spoofable. |

---

## 3. Performance

### 3.1 Base de données

| Criticité | Fichier | Problème |
|---|---|---|
| 🔴 | `supabase/schema.sql` + migrations | **Aucun index explicite** sur les colonnes les plus filtrées : `loyalty_cards.merchant_id`, `stamps.merchant_id`, `stamps.loyalty_card_id`, `customers.phone`, `merchants.stripe_subscription_id`. Postgres n'indexe pas automatiquement les FK → full scans dès que les tables grossissent (seuls index implicites : UNIQUE `(merchant_id, customer_id)` sur loyalty_cards, UNIQUE sur `merchants.slug`/`user_id`). |
| 🟡 | `src/app/api/stamps/route.ts:169` | `GET /api/stamps` sans `.limit()` — peut retourner tout l'historique de tampons d'un merchant. |
| 🟡 | `src/app/(dashboard)/dashboard/clients/page.tsx:37-62` | Fetch de **toutes** les cartes + **tous** les tampons du merchant sans pagination, puis croisement O(n×m) en mémoire pour `lastStampMap`. OK à 100 clients, problématique à 500+. |
| 🟡 | `src/app/admin/page.tsx` | Fetch `cards`, `stamps`, `customers` sans limit pour calculer les KPI — à agréger côté SQL (count/sum) plutôt qu'en JS. |
| 🟡 | 7 occurrences de `select('*')` | `settings/page.tsx:12`, `dashboard/page.tsx:22`, `stamp/page.tsx:12`, `onboarding/page.tsx:15`, `api/merchants/route.ts:63`, `api/stamps/route.ts:169`, `api/admin/prospection/route.ts:22` — over-fetching, sélectionner les colonnes utiles. |

### 3.2 Rendu / bundle

| Criticité | Fichier | Problème |
|---|---|---|
| 🟡 | `src/app/admin/AdminClient.tsx:4-9` | `recharts` (~300 KB) importé statiquement côté client — candidat évident au dynamic import. |
| 🟡 | 6+ usages de `<img>` brut (avec eslint-disable) | `CardDesignClient.tsx:575,653`, `EditCardClient.tsx:389,426`, `QRLandingClient.tsx:124,274`, `LoyaltyCardMockup.tsx:100,205` — logos/bannières utilisateur sans optimisation, lazy loading ni srcset. |
| 🟡 | `src/components/demo/DemoPage.tsx` | 632 lignes importées statiquement sur une page publique — candidat au code-splitting. |

### 3.3 Caching

| Criticité | Fichier | Problème |
|---|---|---|
| 🟡 | 5 pages dashboard | `dashboard/page.tsx`, `stats/page.tsx`, `upgrade/page.tsx`, `settings/page.tsx`, `stamp/page.tsx` lisent l'auth/cookies **sans** `export const dynamic = 'force-dynamic'`, alors que `ma-carte/*` et `clients/` l'ont. Incohérent ; un crash de prerender a déjà été corrigé sur `clients/` pour cette raison exacte (commit `30612be`). |

---

## 4. Dette technique

### 4.1 Migration manquante (recoupe le diagnostic « Ma carte → Infos commerce »)

| Criticité | Fichier | Problème |
|---|---|---|
| 🔴 | colonnes `merchants.stamp_color` et `merchants.stamp_icon` | Sélectionnées dans **5 fichiers** (`ma-carte/page.tsx:14`, `ma-carte/edit/page.tsx:11`, `api/caisse/stamp/route.ts:22`, `api/stamps/route.ts:30`, `api/merchant/generate-banner/route.ts:52`) mais **aucune migration ne les crée** (seule `banner_pattern` a sa migration `20260609_add_banner_pattern.sql`). Si la base n'a pas ces colonnes, le `.single()` échoue silencieusement → cause directe de la redirection « Ma carte » → « Infos commerce » (`if (!merchant) redirect('/dashboard/settings')`, `ma-carte/page.tsx:18`). |

### 4.2 Duplication

| Criticité | Fichier | Problème |
|---|---|---|
| 🔴 | (cf. § 2.1) | `ADMIN_EMAIL`/`ADMIN_EMAILS` définis 9 fois sous deux formes incompatibles. |
| 🟡 | `PricingCards.tsx:18-87`, `DemoPage.tsx:91-140`, `UpgradePageClient.tsx:13-43`, `UpgradeGate.tsx:8-93` | Le pricing et les listes de features de plans sont définis en **4 endroits indépendants** — déjà désynchronisés (cf. § 6.2). |
| 🟡 | `src/app/admin/page.tsx:89-93` | Tarifs MRR hardcodés (29/49€) une 5ᵉ fois pour le calcul admin. |

### 4.3 Composants surdimensionnés (> 300 lignes)

🟡 `admin/AdminClient.tsx` (765) · `ma-carte/CardDesignClient.tsx` (721) · `components/demo/DemoPage.tsx` (632) · `dashboard/stamp/StampClient.tsx` (570) · `stats/page.tsx` (545) · `ma-carte/edit/EditCardClient.tsx` (509) · `admin/prospection/page.tsx` (503) · `[merchantSlug]/QRLandingClient.tsx` (476) · `caisse/[slug]/CaisseClient.tsx` (433) · `admin/page.tsx` (404) · `stats/StatsAdvancedClient.tsx` (398) · `settings/MerchantForm.tsx` (374).

### 4.4 TypeScript / hygiène

| Criticité | Fichier | Problème |
|---|---|---|
| 🟡 | `dashboard/stamp/page.tsx:65,79` | Double cast `(x as any)?.customers as {...}` — perte de type safety sur les jointures Supabase. |
| 🟡 | `api/stripe/checkout/route.ts:8`, `api/stripe/webhook/route.ts:7` | `apiVersion: '2026-05-27.dahlia' as any` — contournement du typage Stripe. |
| 🟡 | `dashboard/clients/page.tsx:78` | Cast `as Parameters<typeof ClientsTable>[0]['clients']` — fragile au refactor. |
| 🟡 | 30+ `console.log`/`console.error` | Principalement `lib/google-wallet.ts` (11×), `api/merchants/route.ts` (9×), `api/wallet/google/route.ts` (8×), `api/demo-contact/route.ts` (4×), et un `console.log('logo_url:', …)` de debug dans `[merchantSlug]/page.tsx:22`. |
| 🟢 | `ma-carte/CardDesignClient.tsx:12,91` | `PRESET_COLORS` inutilisé ; `setShowOnboarding` jamais appelé et `<WelcomeModal onDismiss={() => {}}>` — modale potentiellement infermable selon son implémentation. |
| 🟢 | `src/lib/plan-features.ts:45-51` | Ancien `normalizePlan` commenté — intentionnel (réversibilité du mode validation marché), à nettoyer à la fin de la phase. |
| 🟢 | Nommage mixte FR/EN | Routes `ma-carte`/`caisse`/`accompagnement` vs `upgrade`/`settings`/`stats` ; API `stamps`/`merchants` vs `loyalty-cards`. Cohérence à arbitrer. |

---

## 5. Expérience utilisateur

### 5.1 Flows cassés ou incomplets

| Criticité | Fichier | Problème |
|---|---|---|
| 🔴 | `src/app/(dashboard)/dashboard/ma-carte/page.tsx:12-18` | (Recoupe § 4.1) Échec silencieux du select (`{ data }` destructuré sans `{ error }`) → redirection muette vers « Infos commerce » sans aucun message. Même pattern fragile dans `edit/page.tsx` et `confirmation/page.tsx`. |
| 🔴 | `src/app/api/stripe/checkout/route.ts:16-19` | `STRIPE_PRICE_ESSENTIEL`/`STRIPE_PRICE_PRO` (et les clés Stripe) absents de `.env.local` → tout checkout répond `Price not configured`. La page `/dashboard/upgrade` reste routable en URL directe alors que ses CTA échouent. (Partiellement voulu : l'upgrade est masqué pendant la validation marché, mais la page devrait être neutralisée ou les env configurées avant réactivation.) |
| 🟡 | `src/app/(auth)/register/page.tsx:62-72` | Création du merchant post-inscription en `fetch(...).catch(() => {})` — si elle échoue, l'utilisateur arrive sur un dashboard sans merchant, sans aucun feedback. |
| 🟡 | `dashboard/stamp/StampClient.tsx:149-162` | Le flow de validation de récompense (QR `REWARD:`) appelle `/api/public/card` sans gestion d'erreur — échec silencieux. |

### 5.2 États de chargement / erreurs

| Criticité | Fichier | Problème |
|---|---|---|
| 🟡 | `dashboard/accompagnement/`, `dashboard/caisse/`, `dashboard/guide/` | Pas de `loading.tsx` alors que ces pages fetchent côté serveur (d'autres routes en ont un) — écran figé sur réseau lent. |
| 🟡 | Plusieurs server components | Pattern récurrent `const { data } = await supabase…` sans destructurer `error` : les erreurs Supabase sont invisibles (ni log, ni UI). À généraliser : logger `error` au minimum. |

### 5.3 Validation côté client

| Criticité | Fichier | Problème |
|---|---|---|
| 🟡 | `settings/MerchantForm.tsx:13-25` | `phone` et `address` sans validation de format ; `instagram_handle` sans contrainte. |
| 🟢 | `src/lib/validations/auth.ts:13-16` | `password` du login en `.min(1)` seulement — acceptable (Supabase tranche), mais incohérent avec le register (min 8). Le register est bien validé. ✓ |

### 5.4 Accessibilité / mobile

| Criticité | Fichier | Problème |
|---|---|---|
| 🟡 | `components/loyalty/BannerPicker.tsx` | Tabs photo/interactive sans `aria-label`/`aria-selected`. |
| 🟡 | `components/UpgradeGate.tsx:105-110` | `body.overflow = 'hidden'` + overlay `fixed` : si la modale dépasse le viewport mobile, le bas peut devenir inatteignable (l'overlay a `overflow-y-auto`, à tester réellement). Inactif tant que `RESTRICTIONS_ENABLED=false`. |

---

## 6. Cohérence produit

### 6.1 Features vendues mais non implémentées

| Criticité | Feature | Constat |
|---|---|---|
| 🔴 | **Notifications SMS** (plan Pro) | Revendiquées dans `plan-features.ts:34` (`smsNotifications: true`), `UpgradeGate.tsx:57-64`, `cgu/page.tsx:56`, `(dashboard)/layout.tsx:145` (« SMS, multi-boutique »). **Aucune** route `/api/sms/*`, aucune intégration Twilio/Vonage, aucun envoi SMS dans le code. Feature fantôme. |
| 🔴 | **Multi-boutique** (plan Pro) | `plan-features.ts:36` (`multiStore: true`) + `UpgradeGate.tsx:66-73`. La base impose **1 merchant = 1 user** (contrainte UNIQUE `merchants.user_id`, migration `20260601`) : l'architecture ne le permet pas du tout. |
| 🟡 | **Export données** | `PLAN_FEATURES.exportData` le réserve au plan **Pro**, mais l'implémentation réelle (`stats/StatsAnalyseClient.tsx:106,225`) le gate à **Essentiel+** (badge ligne 235 : « Export CSV — Plan Essentiel+ ») — le config et le produit se contredisent. |
| 🟢 | Conseiller IA (Mistral) | Réellement implémenté (`api/ai/conseil/route.ts`) et correctement gaté Pro (`accompagnement/page.tsx`). ✓ |
| 🟢 | Apple / Google Wallet | Implémentations complètes (`api/wallet/apple`, `lib/google-wallet.ts` — 347 lignes). ✓ |
| 🟢 | Push notifications | Implémentées (`api/push/send`, `PushNotifySection`) **et** gatées (`dashboard/page.tsx:145` : `{plan === 'pro' && <PushNotifySection/>}`) — gate actuellement ouvert à tous par le flag temporaire, ce qui est voulu. ✓ |

### 6.2 Incohérences entre les définitions de plans

| Criticité | Fichiers | Contradiction |
|---|---|---|
| 🔴 | `cgu/page.tsx:55` vs `plan-features.ts:19` | La CGU promet « conseiller IA » au plan **Essentiel** alors que `PLAN_FEATURES.essential.aiAdvisor = false` (IA = Pro partout ailleurs). Document contractuel ≠ produit. |
| 🟡 | `UpgradeGate.tsx:13-16` vs landing/demo/upgrade | `PLAN_PRICES` affiche encore `29€/49€` alors que toutes les autres surfaces affichent « À définir » — incohérent si le gate est réactivé sans mise à jour (composant actuellement inerte, `RESTRICTIONS_ENABLED=false`). |
| 🟡 | `PricingCards.tsx` vs `DemoPage.tsx` vs `UpgradePageClient.tsx` | Listes de features divergentes pour le même plan (ex. Essentiel : « 1 programme de fidélité » vs « 1 carte de fidélité » ; Pro : « Assistant IA marketing » vs « Conseiller IA Mistral » vs « SMS/multi-boutique » selon la surface). |
| 🟢 | Tarif 59€ | Aucune trace de 59€ dans le code — le pricing était cohérent à 29/49€ (avant remplacement par « À définir »). ✓ |

### 6.3 Dead code / routes orphelines

| Criticité | Fichier | Problème |
|---|---|---|
| 🟡 | `src/components/LoyaltyDisplay.tsx` | Composant jamais importé nulle part — code mort. |
| 🟢 | `/dashboard/upgrade` | Plus aucun lien d'accès dans l'UI (boutons masqués par `RESTRICTIONS_ENABLED=false`) mais toujours routable en URL directe — voulu pendant la phase de validation, à réévaluer (la page appelle un checkout Stripe non configuré, cf. § 5.1). |
| 🟢 | `/demo`, `/demo/[campaign]`, `/carte/[id]`, `/cgu` | Non linkées depuis la navigation mais légitimes (campagnes marketing / vues publiques). ✓ |

---

## Synthèse

| Catégorie | 🔴 | 🟡 | 🟢 |
|---|---|---|---|
| Sécurité | 4 | 12 | 5 |
| Auth & autorisation | 1 | 6 | 4 |
| Performance | 1 | 8 | — |
| Dette technique | 2 | 9 | 3 |
| UX | 2 | 8 | 1 |
| Cohérence produit | 3 | 4 | 6 |
| **Total** | **13** | **47** | **19** |

### Top 8 à traiter en priorité

1. 🔴 **Migration manquante `stamp_color`/`stamp_icon`** — casse activement le flow « Ma carte » en prod (§ 4.1, § 5.1).
2. 🔴 **RLS absente sur `prospection_leads` et `prospection_campaigns`** — fuite de données personnelles de leads (§ 1.2).
3. 🔴 **Unifier `ADMIN_EMAIL`/`ADMIN_EMAILS`** (9 définitions, droits incohérents pour audrey@vancart.fr) en une constante exportée unique (§ 2.1).
4. 🔴 **CGU : retirer « conseiller IA » du plan Essentiel** (ou l'ajouter au produit) — engagement contractuel faux (§ 6.2).
5. 🔴 **SMS & multi-boutique : retirer des CGU/plans ou implémenter** — features fantômes vendues (§ 6.1).
6. 🔴 **Index DB sur `merchant_id`, `loyalty_card_id`, `phone`** — full scans garantis à l'échelle (§ 3.1).
7. 🟡 **Ownership check sur `/api/customers` et `/api/push/subscribe`** — écriture cross-merchant (§ 1.1, § 2.2).
8. 🟡 **Gérer `{ error }` Supabase dans `ma-carte/*` et afficher un message** au lieu de la redirection silencieuse (§ 5.1).
