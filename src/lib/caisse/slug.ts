import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Transforme un nom de commerce en slug URL-safe.
 * "Café Dupont" → "cafe-dupont"
 * Normalisation Unicode NFD pour retirer les diacritiques, lowercase, tirets.
 */
export function generateSlug(name: string): string {
  const slug = (name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents/diacritiques
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // tout caractère non alphanumérique → tiret
    .replace(/-{2,}/g, '-') // collapse les tirets multiples
    .replace(/^-+|-+$/g, '') // trim les tirets en début/fin
  return slug || 'commerce'
}

/**
 * Génère un slug unique pour un merchant donné.
 * Vérifie en base qu'aucun AUTRE merchant n'utilise déjà ce slug.
 * En cas de collision, ajoute un suffixe numérique : -2, -3, etc.
 */
export async function ensureUniqueSlug(
  name: string,
  merchantId: string,
  supabase: SupabaseClient,
): Promise<string> {
  const base = generateSlug(name)

  const { data } = await supabase
    .from('merchants')
    .select('id, caisse_slug')
    .like('caisse_slug', `${base}%`)

  const taken = new Set(
    (data ?? [])
      .filter((m) => m.id !== merchantId && m.caisse_slug)
      .map((m) => m.caisse_slug as string),
  )

  if (!taken.has(base)) return base

  let i = 2
  while (taken.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}
