/**
 * Backfill des caisse_slug pour les merchants existants.
 *
 * À lancer UNE SEULE FOIS après avoir appliqué la migration SQL
 * `supabase/migrations/add_caisse_mode.sql`.
 *
 * Prérequis : variables d'environnement NEXT_PUBLIC_SUPABASE_URL et
 * SUPABASE_SERVICE_ROLE_KEY disponibles (ex: charger .env.local).
 *
 * Exécution :
 *   npx tsx scripts/backfill-caisse-slugs.ts
 */
import { createClient } from '@supabase/supabase-js'
import { generateSlug } from '../src/lib/caisse/slug'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis.')
    process.exit(1)
  }

  const supabase = createClient(url, key)

  const { data: merchants, error } = await supabase
    .from('merchants')
    .select('id, business_name, caisse_slug')
  if (error) {
    console.error('❌ Lecture merchants:', error.message)
    process.exit(1)
  }

  const taken = new Set(
    (merchants ?? []).map((m) => m.caisse_slug).filter(Boolean) as string[],
  )

  let updated = 0
  for (const m of merchants ?? []) {
    if (m.caisse_slug) continue

    const base = generateSlug(m.business_name || 'commerce')
    let slug = base
    let i = 2
    while (taken.has(slug)) {
      slug = `${base}-${i}`
      i++
    }
    taken.add(slug)

    const { error: updErr } = await supabase
      .from('merchants')
      .update({ caisse_slug: slug })
      .eq('id', m.id)
    if (updErr) {
      console.log(`  ⚠️  ${m.business_name}: ${updErr.message}`)
    } else {
      console.log(`  ✓ ${m.business_name} → ${slug}`)
      updated++
    }
  }

  console.log(`\nTerminé. ${updated} merchant(s) mis à jour.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
