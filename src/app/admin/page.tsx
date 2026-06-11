import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'
import { isAdminEmail } from '@/lib/admin-config'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // Auth check (layout also does it, belt-and-suspenders)
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) redirect('/login')
  if (!isAdminEmail(user.email)) redirect('/dashboard')

  const service = createServiceClient()

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    { data: merchantsRaw },
    { data: loyaltyCardsRaw },
    { data: stampsRaw },
    { data: customersRaw },
  ] = await Promise.all([
    service
      .from('merchants')
      .select('id, business_name, created_at, loyalty_type, plan, city, stamps_required, user_id, owner_name, phone, address')
      .order('created_at', { ascending: false }),
    service
      .from('loyalty_cards')
      .select('id, merchant_id, customer_id, stamps_count, points, total_stamps_earned, rewards_unlocked, created_at, updated_at'),
    service
      .from('stamps')
      .select('id, merchant_id, loyalty_card_id, given_at')
      .gte('given_at', ninetyDaysAgo.toISOString())
      .order('given_at', { ascending: false }),
    service.from('customers').select('id, first_name, phone'),
  ])

  const { data: usersData } = await service.auth.admin.listUsers({ perPage: 1000 })
  const users = usersData?.users ?? []

  const merchants = merchantsRaw ?? []
  const loyaltyCards = loyaltyCardsRaw ?? []
  const stamps = stampsRaw ?? []

  // Email map
  const emailByUserId: Record<string, string> = {}
  for (const u of users) emailByUserId[u.id] = u.email ?? ''

  // ── KPIs ──
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString()
  const monthStartStr = monthStart.toISOString()

  const activeMerchantsSet = new Set(
    loyaltyCards
      .filter(c => c.updated_at >= thirtyDaysAgoStr)
      .map(c => c.merchant_id)
  )
  const activeMerchants = activeMerchantsSet.size

  const newThisMonth = merchants.filter(m => m.created_at >= monthStartStr).length

  const totalCards = loyaltyCards.length

  // Cards by merchant for join lookups
  const cardsByMerchant: Record<string, typeof loyaltyCards> = {}
  for (const c of loyaltyCards) {
    if (!cardsByMerchant[c.merchant_id]) cardsByMerchant[c.merchant_id] = []
    cardsByMerchant[c.merchant_id].push(c)
  }

  let totalActivity = 0
  for (const m of merchants) {
    const cards = cardsByMerchant[m.id] ?? []
    if (m.loyalty_type === 'points') {
      totalActivity += cards.reduce((s, c) => s + (c.points ?? 0), 0)
    } else {
      totalActivity += cards.reduce((s, c) => s + (c.stamps_count ?? 0), 0)
    }
  }

  const totalRewards = loyaltyCards.reduce((s, c) => s + (c.rewards_unlocked ?? 0), 0)

  const mrr = merchants.reduce((s, m) => {
    if (m.plan === 'essentiel') return s + 29
    if (m.plan === 'pro') return s + 49
    return s
  }, 0)

  // ── weeklyNewMerchants (6 weeks) ──
  const weeklyNewMerchants: { week: string; count: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
    const end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
    const label = start.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    const count = merchants.filter(m => {
      const d = new Date(m.created_at)
      return d >= start && d < end
    }).length
    weeklyNewMerchants.push({ week: label, count })
  }

  // ── dailyActivity (30 days from stamps) ──
  const dailyActivity: { date: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const dayStart = new Date(now)
    dayStart.setDate(dayStart.getDate() - i)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)
    const label = dayStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' })
    const count = stamps.filter(s => {
      const d = new Date(s.given_at)
      return d >= dayStart && d < dayEnd
    }).length
    dailyActivity.push({ date: label, count })
  }

  // ── merchantRows ──
  const merchantRows = merchants.map(m => {
    const cards = cardsByMerchant[m.id] ?? []
    const clientCount = cards.length

    let totalAct = 0
    if (m.loyalty_type === 'points') {
      totalAct = cards.reduce((s, c) => s + (c.points ?? 0), 0)
    } else {
      totalAct = cards.reduce((s, c) => s + (c.stamps_count ?? 0), 0)
    }

    const totalRew = cards.reduce((s, c) => s + (c.rewards_unlocked ?? 0), 0)

    const lastActivityStr = cards.reduce<string | null>((max, c) => {
      if (!max) return c.updated_at
      return c.updated_at > max ? c.updated_at : max
    }, null)

    let status: 'active' | 'at_risk' | 'inactive' = 'inactive'
    if (lastActivityStr) {
      const daysSince = (now.getTime() - new Date(lastActivityStr).getTime()) / 86400000
      if (daysSince <= 7) status = 'active'
      else if (daysSince <= 30) status = 'at_risk'
      else status = 'inactive'
    } else if (cards.length === 0) {
      status = 'inactive'
    }

    return {
      id: m.id,
      business_name: m.business_name,
      email: emailByUserId[m.user_id] ?? '—',
      plan: m.plan ?? null,
      loyalty_type: m.loyalty_type ?? 'stamps',
      city: m.city ?? null,
      owner_name: m.owner_name ?? null,
      phone: m.phone ?? null,
      address: m.address ?? null,
      created_at: m.created_at,
      client_count: clientCount,
      total_activity: totalAct,
      total_rewards: totalRew,
      last_activity: lastActivityStr,
      status,
    }
  })

  // ── merchantClients ──
  const merchantClients: Record<string, { firstName: string; totalStamps: number; lastVisit: string }[]> = {}
  const customersById: Record<string, { first_name: string; phone: string }> = {}
  for (const c of customersRaw ?? []) {
    customersById[c.id] = { first_name: c.first_name, phone: c.phone }
  }

  for (const m of merchants) {
    const cards = cardsByMerchant[m.id] ?? []
    const sorted = [...cards].sort((a, b) => (b.total_stamps_earned ?? 0) - (a.total_stamps_earned ?? 0)).slice(0, 5)
    merchantClients[m.id] = sorted.map(c => ({
      firstName: customersById[c.customer_id]?.first_name ?? '—',
      totalStamps: c.total_stamps_earned ?? 0,
      lastVisit: c.updated_at,
    }))
  }

  // ── alerts ──
  interface Alert {
    id: string
    level: 'urgent' | 'attention'
    merchant_name: string
    merchant_id: string
    message: string
    created_at: string
    type: 'inactive_14d' | 'no_clients' | 'ready_to_reward' | 'slow_start'
  }

  const alerts: Alert[] = []

  for (const m of merchants) {
    const cards = cardsByMerchant[m.id] ?? []
    const daysSinceCreated = (now.getTime() - new Date(m.created_at).getTime()) / 86400000

    const lastActivityStr = cards.reduce<string | null>((max, c) => {
      if (!max) return c.updated_at
      return c.updated_at > max ? c.updated_at : max
    }, null)

    // inactive_14d
    if (lastActivityStr && cards.length > 0) {
      const daysSinceLast = (now.getTime() - new Date(lastActivityStr).getTime()) / 86400000
      if (daysSinceLast > 14) {
        const level: 'urgent' | 'attention' = daysSinceLast > 30 ? 'urgent' : 'attention'
        alerts.push({
          id: `inactive_14d_${m.id}`,
          level,
          merchant_name: m.business_name,
          merchant_id: m.id,
          message: `Aucune activité depuis ${Math.floor(daysSinceLast)} jours`,
          created_at: lastActivityStr,
          type: 'inactive_14d',
        })
      }
    }

    // no_clients
    if (cards.length === 0 && daysSinceCreated > 3) {
      alerts.push({
        id: `no_clients_${m.id}`,
        level: 'attention',
        merchant_name: m.business_name,
        merchant_id: m.id,
        message: 'Aucun client encore — inscrit depuis plus de 3 jours',
        created_at: m.created_at,
        type: 'no_clients',
      })
    }

    // ready_to_reward
    const stampsRequired = m.stamps_required ?? 0
    if (stampsRequired > 0) {
      const hasReady = cards.some(c => {
        const ratio = (c.stamps_count ?? 0) / stampsRequired
        return ratio > 0.8 && (c.rewards_unlocked ?? 0) === 0
      })
      if (hasReady) {
        alerts.push({
          id: `ready_to_reward_${m.id}`,
          level: 'attention',
          merchant_name: m.business_name,
          merchant_id: m.id,
          message: 'Des clients sont proches d\'une récompense',
          created_at: m.created_at,
          type: 'ready_to_reward',
        })
      }
    }

    // slow_start
    if (daysSinceCreated > 7 && cards.length > 0 && cards.length < 3) {
      alerts.push({
        id: `slow_start_${m.id}`,
        level: 'attention',
        merchant_name: m.business_name,
        merchant_id: m.id,
        message: `Seulement ${cards.length} client(s) après plus d\'une semaine`,
        created_at: m.created_at,
        type: 'slow_start',
      })
    }
  }

  // Sort: urgent first
  alerts.sort((a, b) => {
    if (a.level === b.level) return 0
    return a.level === 'urgent' ? -1 : 1
  })

  // ── activityEvents ──
  interface ActivityEvent {
    id: string
    type: 'new_merchant' | 'new_client' | 'stamp'
    description: string
    merchant_name: string
    timestamp: string
  }

  const merchantNameById: Record<string, string> = {}
  for (const m of merchants) merchantNameById[m.id] = m.business_name

  const activityEvents: ActivityEvent[] = []

  // New merchants in 30d
  for (const m of merchants) {
    if (new Date(m.created_at) >= thirtyDaysAgo) {
      activityEvents.push({
        id: `merchant_${m.id}`,
        type: 'new_merchant',
        description: 'Nouveau commerçant inscrit',
        merchant_name: m.business_name,
        timestamp: m.created_at,
      })
    }
  }

  // New cards in 30d
  for (const c of loyaltyCards) {
    if (new Date(c.created_at) >= thirtyDaysAgo) {
      activityEvents.push({
        id: `card_${c.id}`,
        type: 'new_client',
        description: 'Nouveau client fidélité',
        merchant_name: merchantNameById[c.merchant_id] ?? '—',
        timestamp: c.created_at,
      })
    }
  }

  // Stamps — first 30 from the 90d fetch (already sorted desc)
  for (const s of stamps.slice(0, 30)) {
    activityEvents.push({
      id: `stamp_${s.id}`,
      type: 'stamp',
      description: 'Tampon distribué',
      merchant_name: merchantNameById[s.merchant_id] ?? '—',
      timestamp: s.given_at,
    })
  }

  activityEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  const activityEventsFinal = activityEvents.slice(0, 50)

  // ── retentionData ──
  const retentionData = merchants
    .map(m => {
      const cards = cardsByMerchant[m.id] ?? []
      return {
        name: m.business_name.length > 14 ? m.business_name.slice(0, 12) + '…' : m.business_name,
        cards,
        cardCount: cards.length,
      }
    })
    .filter(m => m.cardCount >= 3)
    .sort((a, b) => b.cardCount - a.cardCount)
    .slice(0, 8)
    .map(m => ({
      name: m.name,
      returning: m.cards.filter(c => (c.total_stamps_earned ?? 0) >= 2).length,
      oneTime: m.cards.filter(c => (c.total_stamps_earned ?? 0) < 2).length,
    }))

  // ── topRewardsData ──
  const topRewardsData = merchants
    .map(m => {
      const cards = cardsByMerchant[m.id] ?? []
      const rewards = cards.reduce((s, c) => s + (c.rewards_unlocked ?? 0), 0)
      return { name: m.business_name.length > 14 ? m.business_name.slice(0, 12) + '…' : m.business_name, rewards }
    })
    .filter(m => m.rewards > 0)
    .sort((a, b) => b.rewards - a.rewards)
    .slice(0, 8)

  // ── loyaltyTypeData ──
  const stampsCount = merchants.filter(m => (m.loyalty_type ?? 'stamps') !== 'points').length
  const pointsCount = merchants.filter(m => m.loyalty_type === 'points').length
  const loyaltyTypeData = [
    { name: 'Tampons', value: stampsCount },
    { name: 'Points', value: pointsCount },
  ].filter(d => d.value > 0)

  // ── weeklyGrowthData (13 weeks) ──
  const weeklyGrowthData: { week: string; total: number }[] = []
  let cumulative = loyaltyCards.filter(c => new Date(c.created_at) < ninetyDaysAgo).length

  for (let i = 12; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
    const label = weekStart.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    const newInWeek = loyaltyCards.filter(c => {
      const d = new Date(c.created_at)
      return d >= weekStart && d < weekEnd
    }).length
    cumulative += newInWeek
    weeklyGrowthData.push({ week: label, total: cumulative })
  }

  return (
    <AdminClient
      kpis={{ activeMerchants, newThisMonth, totalCards, totalActivity, totalRewards, mrr }}
      weeklyNewMerchants={weeklyNewMerchants}
      dailyActivity={dailyActivity}
      merchantRows={merchantRows}
      merchantClients={merchantClients}
      alerts={alerts}
      activityEvents={activityEventsFinal}
      retentionData={retentionData}
      topRewardsData={topRewardsData}
      loyaltyTypeData={loyaltyTypeData}
      weeklyGrowthData={weeklyGrowthData}
    />
  )
}
