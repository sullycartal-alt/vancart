# Diagnostic : couleur LogoDominantColors non sauvegardée en base

## Symptôme

Dans la page d'édition (`/dashboard/ma-carte/edit`), sélectionner une couleur via
les pastilles `LogoDominantColors` met à jour le preview mais `primary_color` reste à
`'#000000'` en base Supabase. Avec un preset standard la sauvegarde fonctionne.

---

## Analyse des deux contextes

### Contexte A — Onboarding (`CardDesignClient.tsx`)

À l'étape 4, **les deux chemins de code sont identiques** :

```jsx
// LogoDominantColors
<LogoDominantColors logoUrl={logoUrl} selectedColor={color} onSelect={setColor} />

// Preset
<button onClick={() => setColor(hex)} ... />
```

Dans les deux cas seul `setColor(hex)` est appelé ; la sauvegarde est différée au
clic de « Étape suivante » via `handleNextStep` :

```ts
} else if (currentStep === 4) {
  fields = { primary_color: color }   // lit color depuis la closure
}
```

Puisque `handleNextStep` est recrée à chaque render, elle capte toujours la valeur
courante de `color`. **Aucune divergence possible entre LogoDominantColors et preset
dans ce contexte** — le symptôme ne peut pas provenir de l'onboarding.

### Contexte B — Page d'édition (`EditCardClient.tsx`)

Là aussi le code des deux boutons est **identique** :

```jsx
// LogoDominantColors (ligne 155)
onSelect={(hex) => { setColor(hex); triggerSave({ primary_color: hex }) }}

// Preset (ligne 163)
onClick={() => { setColor(hex); triggerSave({ primary_color: hex }) }}
```

Pourtant, un mécanisme crée une asymétrie *en pratique* : le **debounce de 800 ms**.

---

## Cause racine identifiée — Debounce preemption (EditCardClient)

### Mécanisme de `triggerSave` / `performSave`

```ts
// Fonctions recrées à chaque render → capturent le state du render courant
function triggerSave(overrides?: Record<string, unknown>) {
  if (saveTimeout.current) clearTimeout(saveTimeout.current)  // ← annule le timer en cours
  saveTimeout.current = setTimeout(() => performSave(overrides), 800)
}

async function performSave(overrides?: Record<string, unknown>) {
  ...
  body: JSON.stringify({
    ...,
    primary_color: color,    // ← closure du render N
    ...,
    ...overrides,            // ← spread final, écrase primary_color si présent
  }),
}
```

`triggerSave` annule **tout timer en cours** avant d'en créer un nouveau.

### Séquence défaillante (dans EditCardClient)

```
T=0 ms  : Clic swatch LogoDominantColors
            → setColor('#hex')            (React programme un re-render)
            → triggerSave({ primary_color: '#hex' })  → Timer T1 = 800 ms

T<800 ms: L'utilisateur interagit avec un autre champ (loyalty_rule, business_name…)
            → setXxx(val)
            → triggerSave({ autreChamp: val })    ← PAS de primary_color dans overrides
              clearTimeout(T1)   ← LE SAVE DE COULEUR EST ANNULÉ
              Timer T2 = 800 ms

T2+800ms: performSave({ autreChamp: val }) fires
          body inclut primary_color: color depuis la closure de render N

          Si render N a été créé AVANT que setColor('#hex') commite → color = '#000000'
          → DB sauvegardée avec primary_color='#000000'
```

### Pourquoi `...overrides` ne sauve pas ici

Le `...overrides` protège uniquement le champ **explicitement passé** dans l'override :

- Clic LogoDominantColors : `triggerSave({ primary_color: '#hex' })` → T1 override = `{ primary_color: '#hex' }` ✓
- Clic sur loyalty_rule  : `triggerSave({ loyalty_rule: '...' })` → T2 override = `{ loyalty_rule: '...' }` — pas de `primary_color` → pris dans la closure (stale = '#000000')

### Pourquoi les presets semblent fonctionner

En pratique, après avoir cliqué un preset couleur, l'utilisateur marque une pause
visuelle (il regarde le preview changer). Le timer T1 se déclenche sans être
interrompu. Avec les pastilles LogoDominantColors les couleurs extraites du logo
apparaissent plus tôt dans le flow d'édition, là où l'utilisateur est encore en
train de remplir d'autres champs — ce qui annule fréquemment T1.

---

## Preuve supplémentaire — Logs existants dans l'API

Le handler PATCH a déjà des logs (ajoutés lors du développement) :

```ts
console.log('[PATCH /api/merchants] body:', JSON.stringify(body))
console.log('[PATCH /api/merchants] sanitized primary_color:', sanitized.primary_color)
console.log('[PATCH /api/merchants] saved primary_color:', data?.primary_color)
```

Pour confirmer : reproduire le symptôme et lire les logs Vercel/serveur. On devrait
voir `primary_color` absent ou à `'#000000'` dans le body du PATCH déclenché par T2.

---

## Validation du format hex de colorthief

La méthode `Color.hex()` dans `colorthief@3.x` :

```js
hex() {
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(this._r)}${toHex(this._g)}${toHex(this._b)}`;
}
```

Retourne toujours un `#rrggbb` lowercase en 7 caractères. Le regex Zod
`/^#[0-9a-fA-F]{6}$/` l'accepte. **Ce n'est pas la cause du bug.**

---

## Résumé

| | Onboarding (CardDesignClient) | Page édition (EditCardClient) |
|---|---|---|
| LogoDominantColors | `setColor(hex)` seulement | `setColor(hex)` + `triggerSave({ primary_color: hex })` |
| Preset | `setColor(hex)` seulement | `setColor(hex)` + `triggerSave({ primary_color: hex })` |
| Sauvegarde réelle | `handleNextStep` → `{ primary_color: color }` | Debounce 800 ms |
| **Bug possible** | Non | **Oui** — preemption du debounce efface le save |

**Cause exacte** : dans `EditCardClient.tsx`, le timer de debounce 800 ms lancé par
un clic LogoDominantColors est annulé si l'utilisateur interagit avec un autre champ
avant l'expiration. Le `performSave` du timer suivant ne contient pas `primary_color`
dans ses `overrides` et utilise la valeur stale `'#000000'` depuis sa closure.

---

## Correction recommandée

Stocker la valeur de couleur en cours dans un `useRef` mis à jour synchroniquement
avec chaque `setColor`. `performSave` lit depuis le ref plutôt que la closure :

```ts
const colorRef = useRef(color)
// dans onSelect, presets, input color :
colorRef.current = hex
setColor(hex)

// dans performSave, remplacer `primary_color: color` par :
primary_color: colorRef.current,
```

Cela garantit que quel que soit le timer qui déclenche `performSave`, il envoie
toujours la dernière couleur sélectionnée par l'utilisateur.
