import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensureUniqueSlug } from '@/lib/caisse/slug'
import CaisseDashboardClient from './CaisseDashboardClient'

export const dynamic = 'force-dynamic'

export default async function CaisseDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, business_name, caisse_slug, caisse_pin_hash')
    .eq('user_id', user.id)
    .single()
  if (!merchant) redirect('/dashboard/settings')

  // Génère le slug s'il n'existe pas encore (merchants antérieurs au mode caisse).
  let slug = merchant.caisse_slug
  if (!slug) {
    slug = await ensureUniqueSlug(merchant.business_name, merchant.id, supabase)
    await supabase.from('merchants').update({ caisse_slug: slug }).eq('id', merchant.id)
  }

  // Scans du jour, groupés par serveur.
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { data: stamps } = await supabase
    .from('stamps')
    .select('serveur_name, given_at')
    .eq('merchant_id', merchant.id)
    .gte('given_at', todayStart.toISOString())
    .not('serveur_name', 'is', null)

  const counts = new Map<string, number>()
  for (const s of stamps ?? []) {
    const name = (s as { serveur_name?: string | null }).serveur_name?.trim()
    if (!name) continue
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  const todayScans = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  return (
    <CaisseDashboardClient
      slug={slug}
      hasPin={!!merchant.caisse_pin_hash}
      todayScans={todayScans}
    />
  )
}
