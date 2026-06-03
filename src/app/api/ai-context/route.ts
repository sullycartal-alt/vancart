import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, business_name, loyalty_rule, stamps_required, loyalty_type, average_ticket')
    .eq('user_id', user.id)
    .single()

  if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })

  const { count: totalClients } = await supabase
    .from('loyalty_cards')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', merchant.id)

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const { data: activeStamps } = await supabase
    .from('stamps')
    .select('loyalty_card_id, given_at')
    .eq('merchant_id', merchant.id)
    .gte('given_at', ninetyDaysAgo)

  const activeCardIds = new Set(activeStamps?.map(s => s.loyalty_card_id) ?? [])
  const clientsActifs = activeCardIds.size

  const dayCounts = [0, 0, 0, 0, 0, 0, 0]
  for (const s of activeStamps ?? []) {
    dayCounts[new Date(s.given_at).getDay()]++
  }
  const maxDay = Math.max(...dayCounts)
  const meilleurJour = maxDay > 0 ? DAY_NAMES[dayCounts.indexOf(maxDay)] : null

  const { count: completedCards } = await supabase
    .from('loyalty_cards')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', merchant.id)
    .gt('rewards_unlocked', 0)

  const tauxCompletion = totalClients
    ? Math.round(((completedCards ?? 0) / totalClients) * 100)
    : 0

  const clientsChurnRisk = Math.max(0, (totalClients ?? 0) - clientsActifs)

  const caEstime =
    merchant.average_ticket && clientsActifs
      ? Math.round(clientsActifs * merchant.average_ticket * 4)
      : null

  return NextResponse.json({
    merchant: {
      business_name: merchant.business_name,
      loyalty_rule: merchant.loyalty_rule,
      stamps_required: merchant.stamps_required,
      loyalty_type: merchant.loyalty_type,
    },
    stats: {
      total_clients: totalClients ?? 0,
      clients_actifs: clientsActifs,
      clients_churn_risk: clientsChurnRisk,
      taux_completion: tauxCompletion,
      meilleur_jour: meilleurJour,
      ca_estime: caEstime,
    },
  })
}
