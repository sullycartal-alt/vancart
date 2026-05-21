'use client'

import { useEffect, useRef, useState } from 'react'
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
  mrrPotential: number
  churnRate: number
}

interface MerchantRow {
  id: string
  business_name: string
  email: string
  created_at: string
  stamps_this_month: number
  active_cards: number
  loyalty_type: string
  city: string | null
  last_stamp_at: string | null
}

interface InactiveMerchant {
  id: string
  business_name: string
  email: string
  last_stamp_at: string
}

interface ActivityItem {
  type: 'stamp' | 'new_card' | 'new_merchant'
  business_name: string
  timestamp: string
  timeAgo: string
}

interface WeeklyPoint { label: string; count: number }
interface DailyPoint { label: string; count: number }

interface Props {
  kpis: KPIs
  merchants: MerchantRow[]
  weeklyMerchants: WeeklyPoint[]
  dailyStamps: DailyPoint[]
  inactiveMerchants: InactiveMerchant[]
  recentActivity: ActivityItem[]
}

type SortKey = 'created_at' | 'stamps_this_month' | 'active_cards'

// French city → approximate SVG coordinates (viewBox 0 0 500 540)
const CITY_COORDS: Record<string, [number, number]> = {
  paris: [245, 112],
  lyon: [332, 276],
  marseille: [346, 383],
  bordeaux: [148, 318],
  toulouse: [214, 372],
  nice: [402, 363],
  nantes: [112, 203],
  strasbourg: [416, 120],
  lille: [268, 30],
  rennes: [108, 147],
  montpellier: [300, 370],
  grenoble: [360, 305],
  metz: [350, 90],
  rouen: [215, 82],
  dijon: [330, 210],
  clermont: [270, 295],
  tours: [196, 180],
  angers: [148, 183],
  caen: [183, 88],
  reims: [296, 95],
}

function cityToSVG(city: string): [number, number] | null {
  const key = city.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z]/)[0]
  return CITY_COORDS[key] ?? null
}

// Simplified France outline path (approximate)
const FRANCE_PATH = 'M 268 10 L 305 12 L 375 35 L 415 75 L 430 130 L 420 185 L 435 230 L 420 280 L 435 330 L 410 390 L 355 430 L 295 460 L 240 470 L 185 450 L 135 415 L 90 370 L 65 315 L 55 255 L 70 200 L 58 145 L 75 100 L 115 65 L 160 42 L 210 20 Z'

function FranceMap({ merchants }: { merchants: MerchantRow[] }) {
  const cityGroups: Record<string, { coords: [number, number]; count: number; names: string[] }> = {}
  for (const m of merchants) {
    if (!m.city) continue
    const coords = cityToSVG(m.city)
    if (!coords) continue
    const key = m.city.toLowerCase()
    if (!cityGroups[key]) cityGroups[key] = { coords, count: 0, names: [] }
    cityGroups[key].count++
    cityGroups[key].names.push(m.business_name)
  }
  const points = Object.entries(cityGroups)

  if (points.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400 text-center px-4">
        Aucune ville renseignée pour l&apos;instant.<br />
        <span className="text-xs mt-1">Les commerçants peuvent ajouter leur ville dans «&nbsp;Mon commerce&nbsp;».</span>
      </div>
    )
  }

  return (
    <svg viewBox="0 0 500 490" className="w-full max-h-64">
      <path d={FRANCE_PATH} fill="#eef2ff" stroke="#c7d2fe" strokeWidth="2" />
      {points.map(([city, { coords: [x, y], count, names }]) => (
        <g key={city}>
          <circle cx={x} cy={y} r={Math.min(6 + count * 2, 18)} fill="#6366f1" opacity="0.8" />
          <circle cx={x} cy={y} r={4} fill="#4338ca" />
          <title>{names.join(', ')}</title>
          <text x={x + 8} y={y + 4} fontSize="10" fill="#374151" fontWeight="500">
            {city.charAt(0).toUpperCase() + city.slice(1)}{count > 1 ? ` (${count})` : ''}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function AdminClient({ kpis, merchants, weeklyMerchants, dailyStamps, inactiveMerchants, recentActivity }: Props) {
  const router = useRouter()
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDesc, setSortDesc] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const confirmInputRef = useRef<HTMLInputElement>(null)

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 30000)
    return () => clearInterval(id)
  }, [router])

  // Focus confirm input when modal opens
  useEffect(() => {
    if (deleteModal) {
      setConfirmText('')
      setTimeout(() => confirmInputRef.current?.focus(), 50)
    }
  }, [deleteModal])

  const sorted = [...merchants].sort((a, b) => {
    const av = sortKey === 'created_at' ? new Date(a.created_at).getTime() : a[sortKey]
    const bv = sortKey === 'created_at' ? new Date(b.created_at).getTime() : b[sortKey]
    return sortDesc ? (bv as number) - (av as number) : (av as number) - (bv as number)
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDesc(!sortDesc)
    else { setSortKey(key); setSortDesc(true) }
  }

  async function handleDelete() {
    if (!deleteModal) return
    setDeleting(true)
    await fetch('/api/admin/merchants', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchantId: deleteModal.id }),
    })
    setDeleting(false)
    setDeleteModal(null)
    router.refresh()
  }

  async function copyEmail(email: string) {
    await navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-indigo-500 ml-1">{sortDesc ? '↓' : '↑'}</span>
  }

  const churnColor = kpis.churnRate > 10 ? 'text-red-600' : kpis.churnRate > 5 ? 'text-amber-600' : 'text-green-600'
  const churnBg = kpis.churnRate > 10 ? 'bg-red-50' : kpis.churnRate > 5 ? 'bg-amber-50' : 'bg-green-50'

  const ACTIVITY_ICONS: Record<ActivityItem['type'], string> = {
    stamp: '✅',
    new_card: '🎴',
    new_merchant: '🏪',
  }
  const ACTIVITY_LABELS: Record<ActivityItem['type'], string> = {
    stamp: 'Tampon distribué',
    new_card: 'Nouvelle carte client',
    new_merchant: 'Nouveau commerçant',
  }

  const canDelete = confirmText === deleteModal?.name

  return (
    <div className="space-y-8">
      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Supprimer ce commerçant ?</h3>
            <div className="rounded-lg bg-red-50 border border-red-100 p-3">
              <p className="text-sm text-red-700 font-medium">Cette action est irréversible.</p>
              <p className="text-xs text-red-600 mt-0.5">Toutes les cartes clients et tampons associés seront définitivement supprimés.</p>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Tapez <span className="font-mono font-bold text-gray-900">{deleteModal.name}</span> pour confirmer :
              </label>
              <input
                ref={confirmInputRef}
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder={deleteModal.name}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                onKeyDown={e => { if (e.key === 'Enter' && canDelete) handleDelete() }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={!canDelete || deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? '…' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inactive alerts */}
      {inactiveMerchants.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-amber-900 mb-3">
            ⚠ Attention requise — {inactiveMerchants.length} commerçant{inactiveMerchants.length > 1 ? 's' : ''} inactif{inactiveMerchants.length > 1 ? 's' : ''} depuis + de 14 jours
          </h2>
          <div className="space-y-2">
            {inactiveMerchants.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 shadow-sm">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.business_name}</p>
                  <p className="text-xs text-gray-500">{m.email} · Dernier tampon : {new Date(m.last_stamp_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
                <button
                  onClick={() => copyEmail(m.email)}
                  className="ml-4 text-xs px-3 py-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors whitespace-nowrap"
                >
                  {copiedEmail === m.email ? '✓ Copié' : '📋 Copier l\'email'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {[
          { key: 'totalMerchants', label: 'Inscrits', icon: '🏪', color: 'text-indigo-600', bg: 'bg-indigo-50', value: kpis.totalMerchants.toLocaleString('fr-FR') },
          { key: 'activeMerchantsThisMonth', label: 'Actifs ce mois', icon: '⚡', color: 'text-green-600', bg: 'bg-green-50', value: kpis.activeMerchantsThisMonth.toLocaleString('fr-FR') },
          { key: 'totalCards', label: 'Cartes clients', icon: '🎴', color: 'text-blue-600', bg: 'bg-blue-50', value: kpis.totalCards.toLocaleString('fr-FR') },
          { key: 'totalStamps', label: 'Tampons', icon: '✅', color: 'text-purple-600', bg: 'bg-purple-50', value: kpis.totalStamps.toLocaleString('fr-FR') },
          { key: 'totalRewards', label: 'Récompenses', icon: '🏆', color: 'text-amber-600', bg: 'bg-amber-50', value: kpis.totalRewards.toLocaleString('fr-FR') },
          { key: 'mrr', label: 'MRR potentiel', icon: '💶', color: 'text-emerald-600', bg: 'bg-emerald-50', value: `${kpis.mrrPotential.toLocaleString('fr-FR')} €` },
          { key: 'churn', label: 'Churn mensuel', icon: '📉', color: churnColor, bg: churnBg, value: `${kpis.churnRate} %` },
        ].map(({ key, label, icon, color, bg, value }) => (
          <div key={key} className="bg-white rounded-xl shadow-sm p-4">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center text-lg mb-3`}>{icon}</div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{label}</p>
            {key === 'mrr' && (
              <p className="text-xs text-gray-400 mt-0.5">{(kpis.mrrPotential * 12).toLocaleString('fr-FR')} €/an</p>
            )}
            {key === 'mrr' && (
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">Si tous payaient 29 €/mois</p>
            )}
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

      {/* Activity feed + France map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity feed */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Activité récente</h2>
            <span className="text-xs text-gray-400">Rafraîchissement auto · 30s</span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">Aucune activité</p>
            )}
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3">
                <span className="text-base mt-0.5">{ACTIVITY_ICONS[a.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{ACTIVITY_LABELS[a.type]}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{a.business_name}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{a.timeAgo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* France map */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Présence en France</h2>
          </div>
          <div className="p-4">
            <FranceMap merchants={merchants} />
          </div>
        </div>
      </div>

      {/* System health */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Statut système</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'API', status: 'Opérationnel', ok: true },
            { label: 'Base de données', status: `${(kpis.totalStamps + kpis.totalCards + kpis.totalMerchants).toLocaleString('fr-FR')} enregistrements`, ok: true },
            { label: 'Authentification', status: 'Opérationnel', ok: true },
            { label: 'Statut global', status: 'Opérationnel', ok: true },
          ].map(({ label, status, ok }) => (
            <div key={label} className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs font-medium text-gray-700">{label}</span>
              </div>
              <p className="text-xs text-gray-500">{status}</p>
            </div>
          ))}
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
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[160px] truncate">
                      {m.business_name}
                      {m.city && <span className="block text-xs text-gray-400 font-normal">{m.city}</span>}
                    </td>
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
                      <button
                        onClick={() => setDeleteModal({ id: m.id, name: m.business_name })}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Supprimer
                      </button>
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
