'use client'

import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface KPIs {
  totalClients: number
  stampsMonthCount: number
  rewardsThisMonth: number
  returnRate: number
}

interface Props {
  primaryColor: string
  kpis: KPIs
  weeklyNewClients: { week: string; clients: number }[]
  dailyStamps: { date: string; tampons: number }[]
  byDayOfWeek: { day: string; tampons: number }[]
  top5: { firstName: string; totalStamps: number; lastVisit: string }[]
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
  primaryColor,
  kpis,
  weeklyNewClients,
  dailyStamps,
  byDayOfWeek,
  top5,
}: Props) {
  const maxDow = Math.max(...byDayOfWeek.map(d => d.tampons), 1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Statistiques</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">Vue d&apos;ensemble de votre programme de fidélité</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Clients inscrits" value={kpis.totalClients} sub="total" />
        <KPICard label="Tampons ce mois" value={kpis.stampsMonthCount} sub="depuis le 1er du mois" />
        <KPICard label="Récompenses ce mois" value={kpis.rewardsThisMonth} sub="cartes complétées" />
        <KPICard label="Taux de retour" value={`${kpis.returnRate}%`} sub="clients actifs ce mois" />
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
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E8E8E3', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                formatter={(v) => [v, 'Nouveaux clients']}
              />
              <Bar dataKey="clients" fill={primaryColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#E8E8E3] rounded-xl p-5">
          <SectionTitle>Tampons par jour (30 jours)</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyStamps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#6B6B6B' }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B6B6B' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E8E8E3', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                formatter={(v) => [v, 'Tampons']}
              />
              <Line
                type="monotone"
                dataKey="tampons"
                stroke={primaryColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Day of week heatmap */}
      <div className="bg-white border border-[#E8E8E3] rounded-xl p-5">
        <SectionTitle>Activité par jour de la semaine (30 jours)</SectionTitle>
        <div className="flex items-end gap-3 mt-2">
          {byDayOfWeek.map(({ day, tampons }) => {
            const intensity = maxDow > 0 ? tampons / maxDow : 0
            const barHeight = Math.max(8, Math.round(intensity * 120))
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium text-[#6B6B6B]">{tampons > 0 ? tampons : ''}</span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: barHeight,
                    backgroundColor: primaryColor,
                    opacity: 0.2 + intensity * 0.8,
                  }}
                />
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
          <p className="text-sm text-[#6B6B6B] py-4 text-center">Aucun tampon distribué pour l&apos;instant</p>
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
                  <span>
                    <strong className="text-[#1A1A1A]">{client.totalStamps}</strong> tampon{client.totalStamps !== 1 ? 's' : ''}
                  </span>
                  <span className="hidden sm:block text-xs text-[#6B6B6B]">
                    Dernière visite : {formatDate(client.lastVisit)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
