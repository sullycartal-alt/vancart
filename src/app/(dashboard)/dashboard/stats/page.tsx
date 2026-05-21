import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StatsClient from './StatsClient'

export default async function StatsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, primary_color, stamps_required')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/dashboard/settings')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const eightWeeksAgo = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: allCards },
    { data: stampsThisMonth },
    { data: stampsLast30 },
    { data: stampsLast8w },
    { data: topCards },
  ] = await Promise.all([
    // All loyalty cards (for total clients + return rate)
    supabase
      .from('loyalty_cards')
      .select('id, customer_id, total_stamps_earned, rewards_unlocked, updated_at, customers(first_name)')
      .eq('merchant_id', merchant.id),

    // Stamps this month (for KPIs)
    supabase
      .from('stamps')
      .select('id, loyalty_card_id, given_at')
      .eq('merchant_id', merchant.id)
      .gte('given_at', startOfMonth),

    // Stamps last 30 days (day chart + heatmap)
    supabase
      .from('stamps')
      .select('given_at')
      .eq('merchant_id', merchant.id)
      .gte('given_at', thirtyDaysAgo)
      .order('given_at', { ascending: true }),

    // New loyalty cards last 8 weeks (weekly bar chart)
    supabase
      .from('loyalty_cards')
      .select('created_at')
      .eq('merchant_id', merchant.id)
      .gte('created_at', eightWeeksAgo)
      .order('created_at', { ascending: true }),

    // Top 5 most loyal customers
    supabase
      .from('loyalty_cards')
      .select('total_stamps_earned, updated_at, customers(first_name)')
      .eq('merchant_id', merchant.id)
      .order('total_stamps_earned', { ascending: false })
      .limit(5),
  ])

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalClients = allCards?.length ?? 0

  const stampsMonthCount = stampsThisMonth?.length ?? 0

  const rewardsThisMonth = (() => {
    const cardStampMap = new Map<string, number>()
    for (const s of stampsThisMonth ?? []) {
      cardStampMap.set(s.loyalty_card_id, (cardStampMap.get(s.loyalty_card_id) ?? 0) + 1)
    }
    let rewards = 0
    for (const count of cardStampMap.values()) {
      rewards += Math.floor(count / merchant.stamps_required)
    }
    return rewards
  })()

  const activeClientsThisMonth = new Set(stampsThisMonth?.map(s => s.loyalty_card_id) ?? []).size
  const returnRate = totalClients > 0 ? Math.round((activeClientsThisMonth / totalClients) * 100) : 0

  // ── Weekly new clients (8 weeks) ─────────────────────────────────────────
  const weeklyNewClients = (() => {
    const weeks: { week: string; clients: number }[] = []
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const label = `S${8 - i}`
      const count = (stampsLast8w ?? []).filter(c => {
        const d = new Date(c.created_at)
        return d >= weekStart && d < weekEnd
      }).length
      weeks.push({ week: label, clients: count })
    }
    return weeks
  })()

  // ── Daily stamps (30 days) ────────────────────────────────────────────────
  const dailyStamps = (() => {
    const map = new Map<string, number>()
    for (const s of stampsLast30 ?? []) {
      const day = s.given_at.slice(0, 10) // YYYY-MM-DD
      map.set(day, (map.get(day) ?? 0) + 1)
    }
    const days: { date: string; tampons: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().slice(0, 10)
      const label = `${d.getDate()}/${d.getMonth() + 1}`
      days.push({ date: label, tampons: map.get(key) ?? 0 })
    }
    return days
  })()

  // ── Heatmap: stamps by day-of-week (30 days) ─────────────────────────────
  const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  const byDayOfWeek = (() => {
    const counts = [0, 0, 0, 0, 0, 0, 0]
    for (const s of stampsLast30 ?? []) {
      const dow = new Date(s.given_at).getDay()
      counts[dow]++
    }
    return DAY_LABELS.map((day, i) => ({ day, tampons: counts[i] }))
  })()

  // ── Top 5 clients ─────────────────────────────────────────────────────────
  const top5 = (topCards ?? []).map(card => ({
    firstName: Array.isArray(card.customers)
      ? (card.customers[0] as { first_name: string })?.first_name ?? '—'
      : (card.customers as { first_name: string } | null)?.first_name ?? '—',
    totalStamps: card.total_stamps_earned,
    lastVisit: card.updated_at,
  }))

  return (
    <StatsClient
      primaryColor={merchant.primary_color}
      kpis={{ totalClients, stampsMonthCount, rewardsThisMonth, returnRate }}
      weeklyNewClients={weeklyNewClients}
      dailyStamps={dailyStamps}
      byDayOfWeek={byDayOfWeek}
      top5={top5}
    />
  )
}
