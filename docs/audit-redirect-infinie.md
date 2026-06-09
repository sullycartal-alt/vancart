# Audit — Redirection infinie vers « Ma carte » après onboarding terminé

**Date :** 2026-06-09  
**Branche :** `claude/loyalty-card-saas-mvp-1N1p6`

---

## Symptôme

Après avoir complété l'onboarding (CardDesignClient), le marchand est redirigé vers `/dashboard/ma-carte` en boucle infinie. Le tableau de bord n'est jamais accessible.

---

## Condition de déclenchement

`src/app/(dashboard)/dashboard/page.tsx`, ligne 42 :

```ts
if (!merchant.primary_color || merchant.primary_color === '#000000') {
  redirect('/dashboard/ma-carte')
}
```

Le redirect se déclenche si `primary_color` vaut exactement `'#000000'` en base. L'onboarding peut terminer sans avoir jamais changé cette valeur.

---

## Cause racine

### 1. Initialisation de `colorRef` et `color` à `'#000000'`

`src/app/(dashboard)/dashboard/ma-carte/CardDesignClient.tsx`, lignes 66–67 :

```ts
const [color, setColor] = useState(merchant.primary_color || '#6C47FF')
const colorRef = useRef(merchant.primary_color || '#6C47FF')
```

Pour un nouveau marchand, la valeur en base est `'#000000'` (défaut SQL).  
`'#000000'` est une chaîne non-vide → truthy → `'#000000' || '#6C47FF'` retourne `'#000000'`.  
**Les deux sont initialisés à `'#000000'`, pas à `'#6C47FF'`.**

### 2. `isStepValid()` retourne `true` immédiatement à l'étape 4

`CardDesignClient.tsx`, ligne 188 (environ) :

```ts
if (currentStep === 4) return !!color
```

`!!'#000000'` = `true`. L'utilisateur peut passer l'étape couleur sans jamais sélectionner de couleur.

### 3. PATCH envoyé avec `primary_color: '#000000'`

Si l'utilisateur avance sans choisir une couleur :

- `handleNextStep` (étape 4) envoie `{ primary_color: colorRef.current }` = `{ primary_color: '#000000' }`
- `handleFinalSave` envoie également `primary_color: colorRef.current` = `'#000000'`

La valeur `'#000000'` passe la validation Zod (`/^#[0-9a-fA-F]{6}$/`), est écrite en base, et la condition de redirect reste vraie.

---

## Causes écartées

| Source | Raison écartée |
|--------|---------------|
| `src/app/api/merchants/route.ts` | Aucun filtrage ni remplacement de `primary_color` ; `'#000000'` passe Zod sans erreur. Non coupable. |
| `src/app/(dashboard)/dashboard/ma-carte/confirmation/page.tsx` | Composant serveur read-only, aucun PATCH émis. Non coupable. |
| Trigger Supabase `merchants_updated_at` | Met uniquement à jour `updated_at`. Ne touche pas `primary_color`. Non coupable. |
| Défaut SQL `primary_color DEFAULT '#000000'` | S'applique uniquement à l'INSERT, pas à l'UPDATE. Non coupable. |

---

## Fichiers et lignes impliqués

| Fichier | Ligne | Problème |
|---------|-------|---------|
| `src/app/(dashboard)/dashboard/ma-carte/CardDesignClient.tsx` | 66–67 | `|| '#6C47FF'` ne s'applique pas car `'#000000'` est truthy |
| `src/app/(dashboard)/dashboard/ma-carte/CardDesignClient.tsx` | ~188 | `!!color` est `true` avec `'#000000'` → étape validable sans sélection |
| `src/app/(dashboard)/dashboard/page.tsx` | 42 | Condition de redirect : `=== '#000000'` |
| `supabase/schema.sql` | 11 | `primary_color TEXT NOT NULL DEFAULT '#000000'` → valeur initiale du nouveau marchand |

---

## Résumé

L'onboarding initialise `color` et `colorRef` à la valeur actuelle en base (`'#000000'`), considère l'étape couleur comme valide sans interaction, et sauvegarde `'#000000'` dans Supabase. Le dashboard détecte cette valeur et redirige vers `/dashboard/ma-carte` en boucle.

**Fix à appliquer :** Remplacer l'initialisation par une détection de la valeur sentinelle :

```ts
const initialColor = (!merchant.primary_color || merchant.primary_color === '#000000')
  ? '#6C47FF'
  : merchant.primary_color

const [color, setColor] = useState(initialColor)
const colorRef = useRef(initialColor)
```
