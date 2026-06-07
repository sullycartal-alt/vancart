import fr from './fr'
import en from './en'

export type Lang = 'fr' | 'en'

const dictionaries: Record<Lang, Record<string, unknown>> = { fr, en }

/**
 * Looks up a dotted translation key (e.g. "dashboard.welcome") in the given
 * language's dictionary. Falls back to the key itself when the path doesn't
 * resolve to a string, so missing translations are visible rather than crashing.
 */
export function t(key: string, lang: Lang = 'fr'): string {
  const segments = key.split('.')
  let value: unknown = dictionaries[lang]

  for (const segment of segments) {
    if (typeof value !== 'object' || value === null || !(segment in value)) {
      return key
    }
    value = (value as Record<string, unknown>)[segment]
  }

  return typeof value === 'string' ? value : key
}

export { fr, en }
