'use client'

import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useRouter } from 'next/navigation'

interface KPIs {
  totalMerchants: number
  activeMerchantsThisMonth: number
  totalCards: number
  totalStamps: number
  totalRewards: number
}

interface MerchantRow {
  id: string
  business_name: string
  email: string
  created_at: string
  stamps_this_month: number
  active_cards: number
  loyalty_type: string
}

interface WeeklyPoint { label: string; count: number }
interface DailyPoint { label: string; count: number }

interface Props {
  kpis: KPIs
  merchants: MerchantRow[]
  weeklyMerchants: WeeklyPoint[]
  dailyStamps: DailyPoint[]
}

type SortKey = 'created_at' | 'stamps_this_month' | 'active_cards'

const KPI_CARDS = [
  { key: 'totalMerchants', label: 'Commerçants inscrits', icon: '🏪', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { key: 'activeMerchantsThisMonth', label: 'Actifs ce mois', icon: '⚡', color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'totalCards', label: 'Cartes clients', icon: '🎴', color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'totalStamps', label: 'Tampons distribués', icon: '✅', color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'totalRewards', label: 'Récompenses débloquées', icon: '🏆', color: 'text-amber-600', bg: 'bg-amber-50' },
] as const

export default function AdminClient({ kpis, merchants, weeklyMerchants, dailyStamps }: Props) {
  const router = useRouter()
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDesc, setSortDesc] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const sorted = [...merchants].sort((a, b) => {
    const av = sortKey === 'created_at' ? new Date(a.created_at).getTime() : a[sortKey]
    const bv = sortKey === 'created_at' ? new Date(b.created_at).getTime() : b[sortKey]
    return sortDesc ? (bv as number) - (av as number) : (av as number) - (bv as number)
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDesc(!sortDesc)
    else { setSortKey(key); setSortDesc(true) }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    await fetch('/api/admin/merchants', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantId: id }),
    })
    setConfirmId(null)
    setDeleting(null)
    router.refresh()
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-indigo-500 ml-1">{sortDesc ? '↓' : '↑'}</span>
  }

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {KPI_CARDS.map(({ key, label, icon, color, bg }) => (
          <div key={key} className="bg-white rounded-xl shadow-sm p-4">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center text-lg mb-3`}>{icon}</div>
            <p className={`text-2xl font-bold ${color}`}>{kpis[key].toLocaleString('fr-FR')}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Nouveaux commerçants / semaine</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyMerchants} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, 'Commerçants']} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Activité tampons / jour (30j)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyStamps} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, 'Tampons']} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Merchants table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Commerçants ({merchants.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Commerce</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                  onClick={() => toggleSort('created_at')}
                >
                  Inscrit <SortIcon k="created_at" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                  onClick={() => toggleSort('stamps_this_month')}
                >
                  Tampons / mois <SortIcon k="stamps_this_month" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
                  onClick={() => toggleSort('active_cards')}
                >
                  Cartes <SortIcon k="active_cards" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Mode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((m) => {
                const isActive = m.stamps_this_month > 0
                return (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[160px] truncate">{m.business_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[180px] truncate">{m.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(m.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{m.stamps_this_month}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{m.active_cards}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${m.loyalty_type === 'points' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700'}`}>
                        {m.loyalty_type === 'points' ? '🏆 Points' : '🎴 Tampons'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {confirmId === m.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs text-gray-500">Confirmer ?</span>
                          <button
                            onClick={() => handleDelete(m.id)}
                            disabled={deleting === m.id}
                            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            {deleting === m.id ? '…' : 'Oui'}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                          >
                            Non
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(m.id)}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          Supprimer
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Aucun commerçant</p>
          )}
        </div>
      </div>
    </div>
  )
}
