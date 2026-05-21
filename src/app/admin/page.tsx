import { createServiceClient } from '@/lib/supabase/service'
import AdminClient from './AdminClient'

function getWeekLabel(date: Date): string {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay() + 1) // Monday
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function getDayLabel(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export default async function AdminPage() {
  const supabase = createServiceClient()

  // Run queries in parallel
  const [
    { count: totalMerchants },
    { count: totalCards },
    { count: totalStamps },
    { data: rewardsData },
    { data: allMerchants },
    { data: allStamps },
    { data: cardsData },
  ] = await Promise.all([
    supabase.from('merchants').select('*', { count: 'exact', head: true }),
    supabase.from('loyalty_cards').select('*', { count: 'exact', head: true }),
    supabase.from('stamps').select('*', { count: 'exact', head: true }),
    supabase.from('loyalty_cards').select('rewards_unlocked'),
    supabase.from('merchants').select('id, user_id, business_name, created_at, loyalty_type').order('created_at', { ascending: false }),
    supabase.from('stamps').select('merchant_id, given_at'),
    supabase.from('loyalty_cards').select('merchant_id'),
  ])

  const totalRewards = rewardsData?.reduce((s, c) => s + (c.rewards_unlocked ?? 0), 0) ?? 0

  // Active merchants this month
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const stampsThisMonth = (allStamps ?? []).filter(s => new Date(s.given_at) >= monthStart)
  const activeMerchantIds = new Set(stampsThisMonth.map(s => s.merchant_id))
  const activeMerchantsThisMonth = activeMerchantIds.size

  // Stamps per merchant this month
  const stampsCountByMerchant: Record<string, number> = {}
  for (const s of stampsThisMonth) {
    stampsCountByMerchant[s.merchant_id] = (stampsCountByMerchant[s.merchant_id] ?? 0) + 1
  }

  // Cards per merchant
  const cardsCountByMerchant: Record<string, number> = {}
  for (const c of cardsData ?? []) {
    cardsCountByMerchant[c.merchant_id] = (cardsCountByMerchant[c.merchant_id] ?? 0) + 1
  }

  // Get user emails
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const emailByUserId: Record<string, string> = {}
  for (const u of users ?? []) {
    emailByUserId[u.id] = u.email ?? ''
  }

  // Build merchant rows
  const merchants = (allMerchants ?? []).map(m => ({
    id: m.id,
    business_name: m.business_name,
    email: emailByUserId[m.user_id] ?? '—',
    created_at: m.created_at,
    stamps_this_month: stampsCountByMerchant[m.id] ?? 0,
    active_cards: cardsCountByMerchant[m.id] ?? 0,
    loyalty_type: m.loyalty_type ?? 'stamps',
  }))

  // Weekly merchants chart (8 weeks)
  const weeklyMap: Record<string, number> = {}
  const eightWeeksAgo = new Date()
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)

  // Pre-fill 8 weeks
  for (let i = 7; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    weeklyMap[getWeekLabel(d)] = 0
  }
  for (const m of allMerchants ?? []) {
    const d = new Date(m.created_at)
    if (d >= eightWeeksAgo) {
      const key = getWeekLabel(d)
      weeklyMap[key] = (weeklyMap[key] ?? 0) + 1
    }
  }
  const weeklyMerchants = Object.entries(weeklyMap).map(([label, count]) => ({ label, count }))

  // Daily stamps chart (30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const dailyMap: Record<string, number> = {}

  // Pre-fill 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dailyMap[getDayLabel(d)] = 0
  }
  for (const s of allStamps ?? []) {
    const d = new Date(s.given_at)
    if (d >= thirtyDaysAgo) {
      const key = getDayLabel(d)
      if (key in dailyMap) dailyMap[key] = (dailyMap[key] ?? 0) + 1
    }
  }
  const dailyStamps = Object.entries(dailyMap).map(([label, count]) => ({ label, count }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard global</h1>
        <p className="mt-1 text-sm text-gray-500">Vue d'ensemble de tous les commerçants VanCart.</p>
      </div>
      <AdminClient
        kpis={{ totalMerchants: totalMerchants ?? 0, activeMerchantsThisMonth, totalCards: totalCards ?? 0, totalStamps: totalStamps ?? 0, totalRewards }}
        merchants={merchants}
        weeklyMerchants={weeklyMerchants}
        dailyStamps={dailyStamps}
      />
    </div>
  )
}
