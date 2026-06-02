// ============================================================================
// ⚠️  MIGRATION SUPABASE À EXÉCUTER MANUELLEMENT (SQL Editor) :
//
//     ALTER TABLE merchants ADD COLUMN IF NOT EXISTS average_ticket INTEGER;
//
//  Ce champ stocke le ticket moyen (€) saisi par le commerçant dans l'onglet
//  « Stats avancées » et sert aux estimations de chiffre d'affaires.
// ============================================================================

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import StatsClient from './StatsClient'
import StatsAnalyseClient from './StatsAnalyseClient'
import StatsAdvancedClient, { type AdvancedMetrics } from './StatsAdvancedClient'
import UpgradeGate from '@/components/UpgradeGate'
import { effectivePlan, type Plan } from '@/lib/plan-features'

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const DAY_MS = 24 * 60 * 60 * 1000

export type Period = 'this_week' | 'this_month' | 'last_month' | '3_months' | '6_months' | 'this_year' | 'custom'

function getPeriodDates(period: Period, customFrom?: string, customTo?: string): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(customTo ?? now)

  switch (period) {
    case 'this_week': {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return { start, end: now }
    }
    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start, end: now }
    }
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
      return { start, end }
    }
    case '3_months': {
      const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      return { start, end: now }
    }
    case '6_months': {
      const start = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
      return { start, end: now }
    }
    case 'this_year': {
      const start = new Date(now.getFullYear(), 0, 1)
      return { start, end: now }
    }
    case 'custom': {
      const start = customFrom ? new Date(customFrom) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return { start, end }
    }
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start, end: now }
    }
  }
}

function buildDailyData(stamps: { given_at: string }[], start: Date, end: Date) {
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))

  if (diffDays <= 35) {
    // Daily granularity
    const map = new Map<string, number>()
    for (const s of stamps) {
      const day = s.given_at.slice(0, 10)
      map.set(day, (map.get(day) ?? 0) + 1)
    }
    const days: { date: string; tampons: number }[] = []
    for (let i = diffDays - 1; i >= 0; i--) {
      const d = new Date(end.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().slice(0, 10)
      const label = `${d.getDate()}/${d.getMonth() + 1}`
      days.push({ date: label, tampons: map.get(key) ?? 0 })
    }
    return days
  } else {
    // Weekly granularity
    const weeks: { date: string; tampons: number }[] = []
    const numWeeks = Math.ceil(diffDays / 7)
    for (let i = numWeeks - 1; i >= 0; i--) {
      const weekEnd = new Date(end.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000)
      const count = stamps.filter(s => {
        const d = new Date(s.given_at)
        return d >= weekStart && d < weekEnd
      }).length
      const label = `${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`
      weeks.push({ date: label, tampons: count })
    }
    return weeks
  }
}

function buildWeeklyNewClients(cards: { created_at: string }[], start: Date, end: Date) {
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
  const numWeeks = Math.min(Math.ceil(diffDays / 7), 12)
  const weeks: { week: string; clients: number }[] = []
  for (let i = numWeeks - 1; i >= 0; i--) {
    const weekEnd = new Date(end.getTime() - i * 7 * 24 * 60 * 60 * 1000)
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000)
    const count = cards.filter(c => {
      const d = new Date(c.created_at)
      return d >= weekStart && d < weekEnd
    }).length
    weeks.push({ week: `S${numWeeks - i}`, clients: count })
  }
  return weeks
}

interface SearchParams {
  period?: string
  from?: string
  to?: string
  tab?: string
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const tab = params.tab ?? 'overview'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, primary_color, stamps_required, loyalty_type, plan, average_ticket')
    .eq('user_id', user.id)
    .single()

  if (!merchant) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Tableau de bord</h1>
        <div className="bg-white border border-[#E8E8E3] rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm text-[#6B6B6B]">Configurez votre commerce pour voir vos statistiques.</p>
          <Link href="/dashboard/settings" className="inline-block px-5 py-2.5 bg-[#6C47FF] text-white text-sm font-semibold rounded-xl hover:bg-[#5835e0] transition-colors">
            Configurer mon commerce →
          </Link>
        </div>
      </div>
    )
  }

  const plan = effectivePlan((merchant.plan ?? 'free') as Plan, user.email)

  // Free plan: force this_week and ignore any period param from URL
  const period = plan === 'free'
    ? 'this_week'
    : ((params.period ?? 'this_month') as Period)

  const { start, end } = getPeriodDates(period, params.from, params.to)
  const startIso = start.toISOString()
  const endIso = end.toISOString()

  const [
    { data: allCards },
    { data: stampsInPeriod },
    { data: newCardsInPeriod },
    { data: topCards },
  ] = await Promise.all([
    supabase
      .from('loyalty_cards')
      .select('id, customer_id, total_stamps_earned, rewards_unlocked, updated_at, customers(first_name)')
      .eq('merchant_id', merchant.id),

    supabase
      .from('stamps')
      .select('given_at, loyalty_card_id')
      .eq('merchant_id', merchant.id)
      .gte('given_at', startIso)
      .lte('given_at', endIso)
      .order('given_at', { ascending: true }),

    supabase
      .from('loyalty_cards')
      .select('created_at')
      .eq('merchant_id', merchant.id)
      .gte('created_at', startIso)
      .lte('created_at', endIso)
      .order('created_at', { ascending: true }),

    supabase
      .from('loyalty_cards')
      .select('total_stamps_earned, updated_at, customers(first_name)')
      .eq('merchant_id', merchant.id)
      .order('total_stamps_earned', { ascending: false })
      .limit(5),
  ])

  // KPIs
  const totalClients = allCards?.length ?? 0
  const stampsCount = stampsInPeriod?.length ?? 0
  const activeClientsInPeriod = new Set(stampsInPeriod?.map(s => s.loyalty_card_id) ?? []).size
  const returnRate = totalClients > 0 ? Math.round((activeClientsInPeriod / totalClients) * 100) : 0

  const rewardsInPeriod = (() => {
    const cardMap = new Map<string, number>()
    for (const s of stampsInPeriod ?? []) {
      cardMap.set(s.loyalty_card_id, (cardMap.get(s.loyalty_card_id) ?? 0) + 1)
    }
    let rewards = 0
    for (const count of cardMap.values()) {
      rewards += Math.floor(count / merchant.stamps_required)
    }
    return rewards
  })()

  const dailyStamps = buildDailyData(stampsInPeriod ?? [], start, end)
  const weeklyNewClients = buildWeeklyNewClients(newCardsInPeriod ?? [], start, end)

  const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  const byDayOfWeek = (() => {
    const counts = [0, 0, 0, 0, 0, 0, 0]
    for (const s of stampsInPeriod ?? []) {
      const dow = new Date(s.given_at).getDay()
      counts[dow]++
    }
    return DAY_LABELS.map((day, i) => ({ day, tampons: counts[i] }))
  })()

  const top5 = (topCards ?? []).map(card => ({
    firstName: Array.isArray(card.customers)
      ? (card.customers[0] as { first_name: string })?.first_name ?? '—'
      : (card.customers as { first_name: string } | null)?.first_name ?? '—',
    totalStamps: card.total_stamps_earned,
    lastVisit: card.updated_at,
  }))

  // For analyse tab: fetch full client list
  let analyseClients: {
    id: string
    firstName: string
    phone: string
    totalStamps: number
    rewardsUnlocked: number
    firstVisit: string
    lastVisit: string
  }[] = []

  if (tab === 'analyse' && plan !== 'free') {
    const [{ data: fullCards }, { data: analyseStamps }] = await Promise.all([
      supabase
        .from('loyalty_cards')
        .select('id, total_stamps_earned, rewards_unlocked, created_at, updated_at, customers(first_name, phone)')
        .eq('merchant_id', merchant.id)
        .order('total_stamps_earned', { ascending: false }),
      // Real visit dates come from the stamps table (given_at), not loyalty_cards.updated_at
      // which can be touched by non-visit events (wallet sync, reward redemption).
      supabase
        .from('stamps')
        .select('given_at, loyalty_card_id')
        .eq('merchant_id', merchant.id)
        .order('given_at', { ascending: false }),
    ])

    // Most recent stamp (= real last visit) per card. Stamps are ordered desc,
    // so the first occurrence per card is its latest visit.
    const lastVisitByCard = new Map<string, string>()
    for (const s of analyseStamps ?? []) {
      if (!lastVisitByCard.has(s.loyalty_card_id)) lastVisitByCard.set(s.loyalty_card_id, s.given_at)
    }

    analyseClients = (fullCards ?? []).map(card => {
      const customer = Array.isArray(card.customers)
        ? (card.customers[0] as { first_name: string; phone: string })
        : (card.customers as { first_name: string; phone: string } | null)
      return {
        id: card.id,
        firstName: customer?.first_name ?? '—',
        phone: customer?.phone ?? '',
        totalStamps: card.total_stamps_earned ?? 0,
        rewardsUnlocked: card.rewards_unlocked ?? 0,
        firstVisit: card.created_at,
        // Fall back to card creation only if the client has no stamp yet.
        lastVisit: lastVisitByCard.get(card.id) ?? card.created_at,
      }
    })
  }

  // ── Advanced stats tab (Essentiel+) ──────────────────────────────────────
  let advancedMetrics: AdvancedMetrics | null = null

  if (tab === 'advanced' && plan !== 'free') {
    const now = new Date().getTime()
    const thirtyAgoIso = new Date(now - 30 * DAY_MS).toISOString()
    const sixtyAgoIso = new Date(now - 60 * DAY_MS).toISOString()
    // Window to detect reactivations among period stamps (need the stamp just before).
    const reactWindowStartIso = new Date(start.getTime() - 31 * DAY_MS).toISOString()

    const [
      { data: advCards },
      { data: advPeriodStamps },
      { data: advRecentStamps },
      { data: advReactStamps },
    ] = await Promise.all([
      // All cards: completion rate, churn base, growth (customer join), card age
      supabase
        .from('loyalty_cards')
        .select('id, rewards_unlocked, created_at, customers(created_at)')
        .eq('merchant_id', merchant.id),
      // Stamps within the selected period: frequency, best day/hour, period CA
      supabase
        .from('stamps')
        .select('given_at, loyalty_card_id')
        .eq('merchant_id', merchant.id)
        .gte('given_at', startIso)
        .lte('given_at', endIso)
        .order('given_at', { ascending: true }),
      // Last 60 days: active / inactive / churn (as of today, period-independent)
      supabase
        .from('stamps')
        .select('given_at, loyalty_card_id')
        .eq('merchant_id', merchant.id)
        .gte('given_at', sixtyAgoIso),
      // Reactivation detection window
      supabase
        .from('stamps')
        .select('given_at, loyalty_card_id')
        .eq('merchant_id', merchant.id)
        .gte('given_at', reactWindowStartIso)
        .lte('given_at', endIso)
        .order('given_at', { ascending: true }),
    ])

    const totalCards = advCards?.length ?? 0

    // 1. Average revisit frequency (mean gap in days between consecutive stamps per card, in period)
    const periodByCard = new Map<string, number[]>()
    for (const s of advPeriodStamps ?? []) {
      const arr = periodByCard.get(s.loyalty_card_id) ?? []
      arr.push(new Date(s.given_at).getTime())
      periodByCard.set(s.loyalty_card_id, arr)
    }
    let gapSum = 0
    let gapCount = 0
    for (const times of periodByCard.values()) {
      times.sort((a, b) => a - b)
      for (let i = 1; i < times.length; i++) {
        gapSum += (times[i] - times[i - 1]) / DAY_MS
        gapCount++
      }
    }
    const avgRevisitDays = gapCount > 0 ? Math.max(1, Math.round(gapSum / gapCount)) : null

    // 2. Active vs inactive (as of today)
    const activeCards = new Set<string>()
    const lastStamp60 = new Map<string, number>()
    for (const s of advRecentStamps ?? []) {
      const t = new Date(s.given_at).getTime()
      if (s.given_at >= thirtyAgoIso) activeCards.add(s.loyalty_card_id)
      const prev = lastStamp60.get(s.loyalty_card_id) ?? 0
      if (t > prev) lastStamp60.set(s.loyalty_card_id, t)
    }
    const activeCount = activeCards.size
    const inactiveCount = Math.max(0, totalCards - activeCount)

    // 4. Churn risk: last stamp between 30 and 60 days ago (and not active)
    let churnCount = 0
    const thirtyAgoMs = now - 30 * DAY_MS
    for (const [cardId, t] of lastStamp60.entries()) {
      if (!activeCards.has(cardId) && t < thirtyAgoMs) churnCount++
    }

    // 3. Completion rate
    const completedClients = (advCards ?? []).filter(c => (c.rewards_unlocked ?? 0) >= 1).length
    const completionRate = totalCards > 0 ? Math.round((completedClients / totalCards) * 100) : 0

    // 5. Best day & best hour (from period stamps)
    const dayCounts = new Array(7).fill(0)
    const hourCounts = new Array(24).fill(0)
    for (const s of advPeriodStamps ?? []) {
      const d = new Date(s.given_at)
      dayCounts[d.getDay()]++
      hourCounts[d.getHours()]++
    }
    const hasPeriodStamps = (advPeriodStamps?.length ?? 0) > 0
    const bestDayIdx = hasPeriodStamps ? dayCounts.indexOf(Math.max(...dayCounts)) : -1
    const bestHourIdx = hasPeriodStamps ? hourCounts.indexOf(Math.max(...hourCounts)) : -1
    const bestDayLabel = bestDayIdx >= 0 ? DAY_NAMES[bestDayIdx] : null
    const bestHourLabel = bestHourIdx >= 0 ? `${bestHourIdx}h et ${bestHourIdx + 1}h` : null

    // 6. Cumulative client growth (by customer created_at, joined via loyalty_cards)
    const monthCounts = new Map<string, number>()
    for (const c of advCards ?? []) {
      const cust = Array.isArray(c.customers)
        ? (c.customers[0] as { created_at: string } | undefined)
        : (c.customers as { created_at: string } | null)
      const createdAt = cust?.created_at ?? c.created_at
      if (!createdAt) continue
      const key = createdAt.slice(0, 7) // YYYY-MM
      monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1)
    }
    const sortedMonths = [...monthCounts.keys()].sort()
    let cumulative = 0
    const growth = sortedMonths.map(key => {
      cumulative += monthCounts.get(key) ?? 0
      const [y, m] = key.split('-')
      const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      return { date: label, clients: cumulative }
    })

    // Financial estimates (only meaningful when average_ticket is set)
    const periodStampsCount = advPeriodStamps?.length ?? 0
    const averageTicket = merchant.average_ticket ?? null

    let estRevenuePeriod: number | null = null
    let estRevenueReactivated: number | null = null
    if (averageTicket != null) {
      estRevenuePeriod = periodStampsCount * averageTicket

      // Reactivated = period stamps where the card had no visit in the prior 30 days
      // but already existed before (older card or earlier stamp present).
      const reactByCard = new Map<string, number[]>()
      for (const s of advReactStamps ?? []) {
        const arr = reactByCard.get(s.loyalty_card_id) ?? []
        arr.push(new Date(s.given_at).getTime())
        reactByCard.set(s.loyalty_card_id, arr)
      }
      const cardCreatedMs = new Map<string, number>()
      for (const c of advCards ?? []) cardCreatedMs.set(c.id, new Date(c.created_at).getTime())

      const startMs = start.getTime()
      const endMs = end.getTime()
      let reactivationStamps = 0
      for (const [cardId, times] of reactByCard.entries()) {
        times.sort((a, b) => a - b)
        for (let i = 0; i < times.length; i++) {
          const t = times[i]
          if (t < startMs || t > endMs) continue // only count reactivations landing in the period
          const prev = i > 0 ? times[i - 1] : null
          if (prev != null) {
            if (t - prev > 30 * DAY_MS) reactivationStamps++
          } else {
            // No stamp in the [start-31d, t) window → reactivation only if card is older than 30d
            const created = cardCreatedMs.get(cardId)
            if (created != null && t - created > 30 * DAY_MS) reactivationStamps++
          }
        }
      }
      estRevenueReactivated = reactivationStamps * averageTicket
    }

    advancedMetrics = {
      avgRevisitDays,
      activeCount,
      inactiveCount,
      completionRate,
      completedClients,
      totalCards,
      churnCount,
      bestDayLabel,
      bestHourLabel,
      growth,
      periodStampsCount,
      estRevenuePeriod,
      estRevenueReactivated,
    }
  }

  const emptyAdvancedMetrics: AdvancedMetrics = {
    avgRevisitDays: null, activeCount: 0, inactiveCount: 0, completionRate: 0,
    completedClients: 0, totalCards: 0, churnCount: 0, bestDayLabel: null,
    bestHourLabel: null, growth: [], periodStampsCount: 0,
    estRevenuePeriod: null, estRevenueReactivated: null,
  }

  return (
    <Suspense fallback={<div className="h-96 animate-pulse bg-[#F7F6F3] rounded-2xl" />}>
      {tab === 'advanced' ? (
        plan === 'free' ? (
          <UpgradeGate plan={plan} feature="advancedStats" requiredPlan="essential">
            <StatsAdvancedClient
              primaryColor={merchant.primary_color}
              period={period}
              plan={plan}
              averageTicket={merchant.average_ticket ?? null}
              metrics={emptyAdvancedMetrics}
            />
          </UpgradeGate>
        ) : (
          <StatsAdvancedClient
            primaryColor={merchant.primary_color}
            period={period}
            plan={plan}
            averageTicket={merchant.average_ticket ?? null}
            metrics={advancedMetrics ?? emptyAdvancedMetrics}
            customFrom={params.from}
            customTo={params.to}
          />
        )
      ) : tab === 'analyse' ? (
        plan === 'free' ? (
          <UpgradeGate plan={plan} feature="advancedStats" requiredPlan="essential">
            <StatsAnalyseClient
              primaryColor={merchant.primary_color}
              period={period}
              loyaltyType={merchant.loyalty_type ?? 'stamps'}
              clients={[]}
              plan={plan}
            />
          </UpgradeGate>
        ) : (
          <StatsAnalyseClient
            primaryColor={merchant.primary_color}
            period={period}
            loyaltyType={merchant.loyalty_type ?? 'stamps'}
            clients={analyseClients}
            plan={plan}
            customFrom={params.from}
            customTo={params.to}
          />
        )
      ) : (
        <StatsClient
          primaryColor={merchant.primary_color}
          period={period}
          loyaltyType={merchant.loyalty_type ?? 'stamps'}
          kpis={{ totalClients, stampsCount, rewardsInPeriod, returnRate }}
          weeklyNewClients={weeklyNewClients}
          dailyStamps={dailyStamps}
          byDayOfWeek={byDayOfWeek}
          top5={top5}
          plan={plan}
          customFrom={params.from}
          customTo={params.to}
        />
      )}
    </Suspense>
  )
}
