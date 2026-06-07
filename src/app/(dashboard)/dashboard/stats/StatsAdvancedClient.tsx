'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Lock, Sparkles, RefreshCw, Trophy, AlertTriangle, CalendarClock, TrendingUp, Wallet } from 'lucide-react'
import type { Period } from './page'
import type { Plan } from '@/lib/plan-features'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'this_week', label: 'Cette semaine' },
  { value: 'this_month', label: 'Ce mois' },
  { value: 'last_month', label: 'Mois dernier' },
  { value: '3_months', label: '3 derniers mois' },
  { value: '6_months', label: '6 derniers mois' },
  { value: 'this_year', label: 'Année en cours' },
]

export interface AdvancedMetrics {
  avgRevisitDays: number | null
  activeCount: number
  inactiveCount: number
  completionRate: number
  completedClients: number
  totalCards: number
  churnCount: number
  bestDayLabel: string | null
  bestHourLabel: string | null
  growth: { date: string; clients: number }[]
  periodStampsCount: number
  estRevenuePeriod: number | null
  estRevenueReactivated: number | null
}

interface Props {
  primaryColor: string
  period: Period
  plan: Plan
  averageTicket: number | null
  metrics: AdvancedMetrics
  customFrom?: string
  customTo?: string
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-[#E8E8E3] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-[#1A1A1A] mb-4">{children}</h2>
}

function formatEuro(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function StatsAdvancedClient({
  primaryColor, period, plan, averageTicket, metrics, customFrom, customTo,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [ticketValue, setTicketValue] = useState<string>(averageTicket != null ? String(averageTicket) : '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined) params.delete(k)
      else params.set(k, v)
    }
    router.push(`/dashboard/stats?${params.toString()}`)
  }

  async function saveTicket() {
    setSaving(true)
    setError(null)
    setSaved(false)
    const parsed = ticketValue.trim() === '' ? null : Math.round(Number(ticketValue))
    if (parsed != null && (Number.isNaN(parsed) || parsed < 0)) {
      setError('Entrez un montant valide.')
      setSaving(false)
      return
    }
    try {
      const res = await fetch('/api/merchants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ average_ticket: parsed }),
      })
      if (!res.ok) throw new Error('save failed')
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError("L'enregistrement a échoué. Réessayez.")
    } finally {
      setSaving(false)
    }
  }

  const donutData = [
    { name: 'Actifs', value: metrics.activeCount },
    { name: 'Inactifs', value: metrics.inactiveCount },
  ]
  const DONUT_COLORS = [primaryColor, '#E8E8E3']
  const hasClients = metrics.totalCards > 0

  return (
    <div className="space-y-8">
      {/* Header + tabs */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Tableau de bord</h1>
        <div className="mt-4 flex items-center gap-1 border-b border-[#E8E8E3] overflow-x-auto">
          {[
            { key: 'overview', label: 'Vue générale' },
            { key: 'analyse', label: 'Analyse clients' },
            { key: 'advanced', label: 'Stats avancées' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => updateParams({ tab: key === 'overview' ? undefined : key })}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                key === 'advanced'
                  ? 'border-[#6C47FF] text-[#6C47FF]'
                  : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
              }`}
            >
              {label}
              {key === 'advanced' && plan === 'free' && <Lock size={12} strokeWidth={1.9} />}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket moyen box */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label htmlFor="average_ticket" className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
              Ticket moyen estimé (€)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="average_ticket"
                type="number"
                min={0}
                inputMode="numeric"
                value={ticketValue}
                onChange={e => { setTicketValue(e.target.value); setSaved(false) }}
                placeholder="ex. 12"
                style={{ fontSize: 16 }}
                className="w-32 px-3 py-2.5 text-sm border border-[#E8E8E3] rounded-xl focus:outline-none focus:border-[#6C47FF] bg-white"
              />
              <button
                onClick={saveTicket}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              {saved && <span className="text-xs font-medium text-green-600">Enregistré ✓</span>}
              {error && <span className="text-xs font-medium text-red-500">{error}</span>}
            </div>
            <p className="mt-2 text-xs text-[#6B6B6B]">
              Montant moyen dépensé par visite. Utilisé pour estimer votre chiffre d&apos;affaires.
            </p>
          </div>
        </div>
      </Card>

      {/* Soft banner when no ticket set */}
      {averageTicket == null && (
        <div className="flex items-start gap-2.5 bg-[#6C47FF]/8 border border-[#6C47FF]/20 rounded-xl px-4 py-3">
          <Sparkles size={16} strokeWidth={1.9} className="text-[#6C47FF] mt-0.5 shrink-0" />
          <p className="text-sm text-[#6C47FF]">
            Renseignez votre ticket moyen pour débloquer les estimations financières.
          </p>
        </div>
      )}

      {/* Period filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Période :</span>
        <div className="flex flex-wrap gap-1.5">
          {PERIOD_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateParams({ period: value, from: undefined, to: undefined })}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                period === value
                  ? 'bg-[#6C47FF] text-white border-[#6C47FF]'
                  : 'bg-white text-[#6B6B6B] border-[#E8E8E3] hover:border-[#6C47FF]/30'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => updateParams({ period: 'custom' })}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
              period === 'custom'
                ? 'bg-[#6C47FF] text-white border-[#6C47FF]'
                : 'bg-white text-[#6B6B6B] border-[#E8E8E3] hover:border-[#6C47FF]/30'
            }`}
          >
            Personnalisé
          </button>
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2 mt-1 w-full sm:w-auto">
            <input
              type="date"
              defaultValue={customFrom ?? ''}
              onChange={e => updateParams({ period: 'custom', from: e.target.value })}
              className="text-xs border border-[#E8E8E3] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#6C47FF]"
            />
            <span className="text-xs text-[#6B6B6B]">→</span>
            <input
              type="date"
              defaultValue={customTo ?? ''}
              onChange={e => updateParams({ period: 'custom', to: e.target.value })}
              className="text-xs border border-[#E8E8E3] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#6C47FF]"
            />
          </div>
        )}
      </div>

      {/* Financial estimates — only when average_ticket is set */}
      {averageTicket != null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${primaryColor}, #5835E0)` }}>
            <div className="flex items-center gap-2 mb-1.5">
              <Wallet size={16} strokeWidth={1.9} />
              <span className="text-xs font-semibold uppercase tracking-wide opacity-90">CA estimé sur la période</span>
            </div>
            <span className="text-3xl font-bold">{formatEuro(metrics.estRevenuePeriod ?? 0)}</span>
            <p className="mt-1.5 text-xs opacity-80">
              {metrics.periodStampsCount} visite{metrics.periodStampsCount !== 1 ? 's' : ''} × {formatEuro(averageTicket)}
            </p>
          </div>
          <Card>
            <div className="flex items-center gap-2 mb-1.5">
              <RefreshCw size={16} strokeWidth={1.9} className="text-[#6C47FF]" />
              <span className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">CA estimé clients réactivés</span>
            </div>
            <span className="text-3xl font-bold text-[#1A1A1A]">{formatEuro(metrics.estRevenueReactivated ?? 0)}</span>
            <p className="mt-1.5 text-xs text-[#6B6B6B]">
              Clients revenus après 30+ jours d&apos;absence
            </p>
          </Card>
          <p className="sm:col-span-2 text-xs text-[#9CA3AF]">
            Estimation basée sur votre ticket moyen de {formatEuro(averageTicket)}
          </p>
        </div>
      )}

      {/* Key metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Revisit frequency */}
        <Card>
          <div className="flex items-center gap-2 mb-1.5">
            <CalendarClock size={16} strokeWidth={1.9} className="text-[#6C47FF]" />
            <span className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Fréquence de revisite</span>
          </div>
          {metrics.avgRevisitDays != null ? (
            <>
              <span className="text-3xl font-bold text-[#1A1A1A]">{metrics.avgRevisitDays} j</span>
              <p className="mt-1.5 text-sm text-[#6B6B6B]">
                Vos clients reviennent en moyenne tous les {metrics.avgRevisitDays} jours.
              </p>
            </>
          ) : (
            <p className="text-sm text-[#6B6B6B] py-2">Pas assez de visites sur la période pour estimer la fréquence.</p>
          )}
        </Card>

        {/* Completion rate */}
        <Card>
          <div className="flex items-center gap-2 mb-1.5">
            <Trophy size={16} strokeWidth={1.9} className="text-[#6C47FF]" />
            <span className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Taux de complétion</span>
          </div>
          <span className="text-3xl font-bold text-[#1A1A1A]">{metrics.completionRate}%</span>
          <p className="mt-1.5 text-sm text-[#6B6B6B]">
            {metrics.completionRate}% de vos clients ont complété leur carte ({metrics.completedClients} client{metrics.completedClients !== 1 ? 's' : ''}).
          </p>
        </Card>

        {/* Churn risk */}
        <Card>
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle size={16} strokeWidth={1.9} className="text-orange-500" />
            <span className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Risque de churn</span>
          </div>
          <span className="text-3xl font-bold text-orange-500">{metrics.churnCount}</span>
          <p className="mt-1.5 text-sm text-[#6B6B6B]">
            {metrics.churnCount} client{metrics.churnCount !== 1 ? 's' : ''} risque{metrics.churnCount !== 1 ? 'nt' : ''} de ne plus revenir.
          </p>
        </Card>
      </div>

      {/* Active vs inactive donut + best day/hour */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionTitle>Clients actifs vs inactifs <span className="font-normal text-[#9CA3AF]">(à ce jour)</span></SectionTitle>
          {hasClients ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-1/2 h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {donutData.map((entry, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E8E8E3' }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <span className="text-sm text-[#1A1A1A]"><strong>{metrics.activeCount}</strong> actif{metrics.activeCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#E8E8E3]" />
                  <span className="text-sm text-[#1A1A1A]"><strong>{metrics.inactiveCount}</strong> inactif{metrics.inactiveCount !== 1 ? 's' : ''}</span>
                </div>
                <p className="text-xs text-[#9CA3AF] max-w-[160px]">Actif = au moins une visite ces 30 derniers jours.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#6B6B6B] py-8 text-center">Aucun client pour l&apos;instant.</p>
          )}
        </Card>

        <Card>
          <SectionTitle>Pic d&apos;activité</SectionTitle>
          {metrics.bestDayLabel && metrics.bestHourLabel ? (
            <div className="flex flex-col items-center justify-center h-[180px] text-center">
              <CalendarClock size={32} strokeWidth={1.6} className="text-[#6C47FF] mb-3" />
              <p className="text-xl font-bold text-[#1A1A1A]">
                {metrics.bestDayLabel} entre {metrics.bestHourLabel}
              </p>
              <p className="mt-1.5 text-sm text-[#6B6B6B]">Votre créneau le plus fréquenté sur la période.</p>
            </div>
          ) : (
            <p className="text-sm text-[#6B6B6B] py-8 text-center">Pas assez de données sur la période.</p>
          )}
        </Card>
      </div>

      {/* Client growth curve */}
      <Card>
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp size={15} strokeWidth={1.9} className="text-[#6C47FF]" />
            Croissance des clients dans le temps
          </span>
        </SectionTitle>
        {metrics.growth.length > 0 ? (
          <div className="h-[250px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(metrics.growth.length / 8) - 1)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B6B6B' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E8E8E3' }} formatter={(v) => [v, 'Clients cumulés']} />
                <Line type="monotone" dataKey="clients" stroke="#6C47FF" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-[#6B6B6B] py-8 text-center">Aucun client enregistré pour l&apos;instant.</p>
        )}
      </Card>
    </div>
  )
}
