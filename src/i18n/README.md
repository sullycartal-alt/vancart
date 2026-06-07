# i18n — structure de traduction

Préparation de l'internationalisation de VanCart (FR par défaut, EN en miroir).

> ⚠️ Cette structure n'est **pas encore intégrée** dans les composants existants.
> Les pages continuent d'utiliser leurs chaînes en dur. `t()` est prêt à être
> branché progressivement quand l'intégration sera décidée.

## Fichiers

- `fr.ts` — dictionnaire français (référence), groupé par section (`nav`, `dashboard`, `onboarding`, `wallet`, `caisse`, `landing`, `errors`, …)
- `en.ts` — miroir anglais, même structure que `fr.ts`
- `index.ts` — exporte la fonction `t(key, lang)` et les dictionnaires bruts

## Utilisation

```ts
import { t } from '@/i18n'

t('dashboard.welcome')        // 'Bienvenue sur VanCart !' (fr par défaut)
t('dashboard.welcome', 'en')  // 'Welcome to VanCart!'
t('wallet.title', 'en')       // 'My Wallet'
```

La clé est un chemin pointé qui correspond à l'imbrication de l'objet de
traduction (`'wallet.title'` → `dictionaries[lang].wallet.title`).

## Comportement de repli (fallback)

Si la clé ne résout pas vers une chaîne (section manquante, faute de frappe,
traduction pas encore ajoutée…), `t()` retourne **la clé elle-même** plutôt que
de planter ou d'afficher `undefined`. Cela rend les traductions manquantes
visibles directement dans l'interface, plutôt que de masquer le problème :

```ts
t('section.inconnue') // → 'section.inconnue'
```

## Ajouter une traduction

1. Ajouter la clé et la valeur française dans `fr.ts`, dans la section
   appropriée (ou en créer une nouvelle si besoin).
2. Ajouter la même clé avec la traduction anglaise dans `en.ts`, en respectant
   exactement la même structure/imbrication.
3. Utiliser `t('section.cle')` dans le composant le jour où l'intégration i18n
   sera lancée.

## Intégration future (pas encore faite)

Quand l'intégration sera décidée, le pattern attendu dans un composant sera :

```ts
import { t } from '@/i18n'

export function MyComponent({ lang }: { lang: 'fr' | 'en' }) {
  return <h1>{t('dashboard.title', lang)}</h1>
}
```

D'ici là, ne pas modifier les composants existants pour appeler `t()`.
