'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Lock } from 'lucide-react'
import type { Period } from './page'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'this_week', label: 'Cette semaine' },
  { value: 'this_month', label: 'Ce mois' },
  { value: 'last_month', label: 'Mois dernier' },
  { value: '3_months', label: '3 derniers mois' },
  { value: '6_months', label: '6 derniers mois' },
  { value: 'this_year', label: 'Année en cours' },
  { value: 'custom', label: 'Personnalisé' },
]

interface KPIs {
  totalClients: number
  stampsCount: number
  rewardsInPeriod: number
  returnRate: number
}

interface Props {
  primaryColor: string
  period: Period
  loyaltyType: string
  kpis: KPIs
  weeklyNewClients: { week: string; clients: number }[]
  dailyStamps: { date: string; tampons: number }[]
  byDayOfWeek: { day: string; tampons: number }[]
  top5: { firstName: string; totalStamps: number; lastVisit: string }[]
  plan?: string
  customFrom?: string
  customTo?: string
}

function KPICard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-[#E8E8E3] rounded-xl p-5 flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">{label}</span>
      <span className="text-3xl font-bold text-[#1A1A1A]">{value}</span>
      {sub && <span className="text-xs text-[#6B6B6B]">{sub}</span>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-[#1A1A1A] mb-4">{children}</h2>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function StatsClient({
  primaryColor, period, loyaltyType, kpis, weeklyNewClients, dailyStamps, byDayOfWeek, top5, plan, customFrom, customTo,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const maxDow = Math.max(...byDayOfWeek.map(d => d.tampons), 1)
  const isPoints = loyaltyType === 'points'
  const activityLabel = isPoints ? 'Points' : 'Tampons'

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined) params.delete(k)
      else params.set(k, v)
    }
    router.push(`/dashboard/stats?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      {/* Header + tabs */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Tableau de bord</h1>
        <div className="mt-4 flex items-center gap-1 border-b border-[#E8E8E3]">
          {[
            { key: 'overview', label: 'Vue générale' },
            { key: 'analyse', label: 'Analyse clients' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => updateParams({ tab: key === 'overview' ? undefined : key })}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                (key === 'overview' ? !searchParams.get('tab') || searchParams.get('tab') === 'overview' : searchParams.get('tab') === key)
                  ? 'border-[#6C47FF] text-[#6C47FF]'
                  : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
              }`}
            >
              {label}
              {key === 'analyse' && plan === 'free' && (
                <Lock size={12} strokeWidth={1.9} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Period filter — free plan locked to this_week */}
      {plan === 'free' ? (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Période :</span>
          <span className="px-3 py-1.5 text-xs font-medium rounded-xl border bg-[#6C47FF] text-white border-[#6C47FF]">
            Cette semaine
          </span>
          <span className="text-xs text-[#9CA3AF]">— Filtres disponibles dès le plan Essentiel</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Période :</span>
          <div className="flex flex-wrap gap-1.5">
            {PERIOD_OPTIONS.filter(o => o.value !== 'custom').map(({ value, label }) => (
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
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Clients inscrits" value={kpis.totalClients} sub="total" />
        <KPICard label={activityLabel} value={kpis.stampsCount} sub="sur la période" />
        <KPICard label="Récompenses" value={kpis.rewardsInPeriod} sub="sur la période" />
        <KPICard label="Taux de retour" value={`${kpis.returnRate}%`} sub="clients actifs / total" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E8E8E3] rounded-xl p-5">
          <SectionTitle>Nouveaux clients par semaine</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyNewClients} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B6B6B' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E8E8E3' }} formatter={(v) => [v, 'Nouveaux clients']} />
              <Bar dataKey="clients" fill={primaryColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#E8E8E3] rounded-xl p-5">
          <SectionTitle>{activityLabel} sur la période</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyStamps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(dailyStamps.length / 6) - 1)} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B6B6B' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E8E8E3' }} formatter={(v) => [v, activityLabel]} />
              <Line type="monotone" dataKey="tampons" stroke={primaryColor} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Day of week heatmap */}
      <div className="bg-white border border-[#E8E8E3] rounded-xl p-5">
        <SectionTitle>Activité par jour de la semaine</SectionTitle>
        <div className="flex items-end gap-3 mt-2">
          {byDayOfWeek.map(({ day, tampons }) => {
            const intensity = maxDow > 0 ? tampons / maxDow : 0
            const barHeight = Math.max(8, Math.round(intensity * 120))
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium text-[#6B6B6B]">{tampons > 0 ? tampons : ''}</span>
                <div className="w-full rounded-t-md transition-all" style={{ height: barHeight, backgroundColor: primaryColor, opacity: 0.2 + intensity * 0.8 }} />
                <span className="text-xs text-[#6B6B6B]">{day}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top 5 clients */}
      <div className="bg-white border border-[#E8E8E3] rounded-xl p-5">
        <SectionTitle>Top 5 clients les plus fidèles</SectionTitle>
        {top5.length === 0 ? (
          <p className="text-sm text-[#6B6B6B] py-4 text-center">Aucun {isPoints ? 'point' : 'tampon'} distribué pour l&apos;instant</p>
        ) : (
          <div className="divide-y divide-[#E8E8E3]">
            {top5.map((client, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : primaryColor }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-[#1A1A1A]">{client.firstName}</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-[#6B6B6B]">
                  <span><strong className="text-[#1A1A1A]">{client.totalStamps}</strong> {isPoints ? 'point' : 'tampon'}{client.totalStamps !== 1 ? 's' : ''}</span>
                  <span className="hidden sm:block text-xs text-[#6B6B6B]">Dernière visite : {formatDate(client.lastVisit)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
