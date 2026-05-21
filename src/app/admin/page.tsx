import { createServiceClient } from '@/lib/supabase/service'
import AdminClient from './AdminClient'

function getWeekLabel(date: Date): string {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay() + 1)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function getDayLabel(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `il y a ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `il y a ${days}j`
}

export default async function AdminPage() {
  const supabase = createServiceClient()

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
    supabase.from('merchants').select('id, user_id, business_name, created_at, loyalty_type, city').order('created_at', { ascending: false }),
    supabase.from('stamps').select('merchant_id, given_at'),
    supabase.from('loyalty_cards').select('merchant_id, created_at'),
  ])

  const totalRewards = rewardsData?.reduce((s, c) => s + (c.rewards_unlocked ?? 0), 0) ?? 0

  // Month boundaries
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const stamps = allStamps ?? []
  const stampsThisMonth = stamps.filter(s => new Date(s.given_at) >= monthStart)
  const stampsLastMonth = stamps.filter(s => {
    const d = new Date(s.given_at)
    return d >= prevMonthStart && d < monthStart
  })

  const activeMerchantIds = new Set(stampsThisMonth.map(s => s.merchant_id))
  const activeLastMonthIds = new Set(stampsLastMonth.map(s => s.merchant_id))
  const activeMerchantsThisMonth = activeMerchantIds.size

  // Churn: was active last month, not active this month
  const churnedCount = [...activeLastMonthIds].filter(id => !activeMerchantIds.has(id)).length
  const churnRate = activeLastMonthIds.size > 0
    ? Math.round(churnedCount / activeLastMonthIds.size * 100)
    : 0

  // MRR potential
  const mrrPotential = activeMerchantsThisMonth * 29

  // Stamps per merchant (this month + all-time last stamp)
  const stampsCountByMerchant: Record<string, number> = {}
  const lastStampByMerchant: Record<string, string> = {}
  for (const s of stamps) {
    if (new Date(s.given_at) >= monthStart) {
      stampsCountByMerchant[s.merchant_id] = (stampsCountByMerchant[s.merchant_id] ?? 0) + 1
    }
    if (!lastStampByMerchant[s.merchant_id] || s.given_at > lastStampByMerchant[s.merchant_id]) {
      lastStampByMerchant[s.merchant_id] = s.given_at
    }
  }

  // Cards per merchant
  const cardsCountByMerchant: Record<string, number> = {}
  for (const c of cardsData ?? []) {
    cardsCountByMerchant[c.merchant_id] = (cardsCountByMerchant[c.merchant_id] ?? 0) + 1
  }

  // User emails
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const emailByUserId: Record<string, string> = {}
  for (const u of users ?? []) emailByUserId[u.id] = u.email ?? ''

  // Merchant rows
  const merchants = (allMerchants ?? []).map(m => ({
    id: m.id,
    business_name: m.business_name,
    email: emailByUserId[m.user_id] ?? '—',
    created_at: m.created_at,
    stamps_this_month: stampsCountByMerchant[m.id] ?? 0,
    active_cards: cardsCountByMerchant[m.id] ?? 0,
    loyalty_type: m.loyalty_type ?? 'stamps',
    city: m.city ?? null,
    last_stamp_at: lastStampByMerchant[m.id] ?? null,
  }))

  // Inactive merchants (have had stamps, none in 14+ days)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const inactiveMerchants = merchants
    .filter(m => {
      const last = m.last_stamp_at
      return last && new Date(last) < fourteenDaysAgo
    })
    .map(m => ({
      id: m.id,
      business_name: m.business_name,
      email: m.email,
      last_stamp_at: m.last_stamp_at!,
    }))

  // Activity feed: combine stamps + new cards + new merchants (last 20)
  type ActivityItem = { type: 'stamp' | 'new_card' | 'new_merchant'; business_name: string; timestamp: string }
  const merchantNameById: Record<string, string> = {}
  for (const m of allMerchants ?? []) merchantNameById[m.id] = m.business_name

  const activities: ActivityItem[] = []

  // Last 40 stamps
  const recentStamps = [...stamps]
    .sort((a, b) => b.given_at.localeCompare(a.given_at))
    .slice(0, 40)
  for (const s of recentStamps) {
    activities.push({ type: 'stamp', business_name: merchantNameById[s.merchant_id] ?? '—', timestamp: s.given_at })
  }

  // Last 20 new loyalty cards
  const recentCards = [...(cardsData ?? [])]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 20)
  for (const c of recentCards) {
    activities.push({ type: 'new_card', business_name: merchantNameById[c.merchant_id] ?? '—', timestamp: c.created_at })
  }

  // Last 10 new merchants
  for (const m of (allMerchants ?? []).slice(0, 10)) {
    activities.push({ type: 'new_merchant', business_name: m.business_name, timestamp: m.created_at })
  }

  // Sort combined + take 20
  activities.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  const recentActivity = activities.slice(0, 20).map(a => ({ ...a, timeAgo: timeAgo(a.timestamp) }))

  // Weekly merchants chart (8 weeks)
  const weeklyMap: Record<string, number> = {}
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    weeklyMap[getWeekLabel(d)] = 0
  }
  const eightWeeksAgo = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000)
  for (const m of allMerchants ?? []) {
    const d = new Date(m.created_at)
    if (d >= eightWeeksAgo) {
      const key = getWeekLabel(d)
      if (key in weeklyMap) weeklyMap[key] = (weeklyMap[key] ?? 0) + 1
    }
  }
  const weeklyMerchants = Object.entries(weeklyMap).map(([label, count]) => ({ label, count }))

  // Daily stamps chart (30 days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const dailyMap: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dailyMap[getDayLabel(d)] = 0
  }
  for (const s of stamps) {
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
        <p className="mt-1 text-sm text-gray-500">Vue d&apos;ensemble de tous les commerçants VanCart.</p>
      </div>
      <AdminClient
        kpis={{ totalMerchants: totalMerchants ?? 0, activeMerchantsThisMonth, totalCards: totalCards ?? 0, totalStamps: totalStamps ?? 0, totalRewards, mrrPotential, churnRate }}
        merchants={merchants}
        weeklyMerchants={weeklyMerchants}
        dailyStamps={dailyStamps}
        inactiveMerchants={inactiveMerchants}
        recentActivity={recentActivity}
      />
    </div>
  )
}
