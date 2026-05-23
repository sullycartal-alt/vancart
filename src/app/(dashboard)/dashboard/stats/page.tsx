import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import StatsClient from './StatsClient'
import StatsAnalyseClient from './StatsAnalyseClient'
import UpgradeGate from '@/components/UpgradeGate'
import { effectivePlan, type Plan } from '@/lib/plan-features'

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
  const period = (params.period ?? 'this_month') as Period
  const tab = params.tab ?? 'overview'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, primary_color, stamps_required, plan')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/dashboard/settings')

  const plan = effectivePlan((merchant.plan ?? 'free') as Plan, user.email)

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

  if (tab === 'analyse') {
    const { data: fullCards } = await supabase
      .from('loyalty_cards')
      .select('id, total_stamps_earned, rewards_unlocked, created_at, updated_at, customers(first_name, phone)')
      .eq('merchant_id', merchant.id)
      .order('total_stamps_earned', { ascending: false })

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
        lastVisit: card.updated_at,
      }
    })
  }

  return (
    <UpgradeGate plan={plan} feature="advancedStats" requiredPlan="essential">
      <Suspense fallback={<div className="h-96 animate-pulse bg-[#F7F6F3] rounded-2xl" />}>
        {tab === 'analyse' ? (
          <StatsAnalyseClient
            primaryColor={merchant.primary_color}
            period={period}
            clients={analyseClients}
            plan={plan}
            customFrom={params.from}
            customTo={params.to}
          />
        ) : (
          <StatsClient
            primaryColor={merchant.primary_color}
            period={period}
            kpis={{ totalClients, stampsCount, rewardsInPeriod, returnRate }}
            weeklyNewClients={weeklyNewClients}
            dailyStamps={dailyStamps}
            byDayOfWeek={byDayOfWeek}
            top5={top5}
            customFrom={params.from}
            customTo={params.to}
          />
        )}
      </Suspense>
    </UpgradeGate>
  )
}
