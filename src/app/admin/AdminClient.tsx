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
  total_stamps: number
  active_cards: number
  loyalty_type: string
  city: string | null
  last_stamp_at: string | null
  plan: string | null
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

interface AlertRow {
  id: string
  merchant_id: string
  merchant_name: string
  alert_type: string
  message: string
  triggered_at: string
  dismissed: boolean
  auto_dismissed: boolean
}

interface StampActivity {
  id: string
  given_at: string
  merchant_name: string
  loyalty_card_id: string
  ip_address: string | null
}

interface TodayMetrics {
  stampsToday: number
  newMerchantsToday: number
  activeMerchantsToday: number
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
  alerts: AlertRow[]
  todayMetrics: TodayMetrics
  recentStampsActivity: StampActivity[]
}

type SortKey = 'created_at' | 'stamps_this_month' | 'active_cards' | 'total_stamps'
type Tab = 'merchants' | 'alertes' | 'activite'

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

function MerchantStatus({ lastStampAt }: { lastStampAt: string | null }) {
  if (!lastStampAt) return <span className="inline-flex items-center gap-1 text-xs text-gray-400">— Aucun</span>
  const days = Math.floor((Date.now() - new Date(lastStampAt).getTime()) / 86400000)
  if (days <= 7) return <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">🟢 Actif</span>
  if (days <= 30) return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">🟡 Inactif</span>
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">🔴 Churn risk</span>
}

function PlanBadge({ plan }: { plan: string | null }) {
  if (plan === 'pro') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">Pro</span>
  if (plan === 'essentiel') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Essentiel</span>
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Découverte</span>
}

function timeAgoFmt(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `il y a ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `il y a ${days}j`
}

export default function AdminClient({
  kpis, merchants, weeklyMerchants, dailyStamps,
  inactiveMerchants, recentActivity,
  alerts, todayMetrics, recentStampsActivity,
}: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('merchants')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDesc, setSortDesc] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [detailMerchant, setDetailMerchant] = useState<MerchantRow | null>(null)
  const [dismissingAlert, setDismissingAlert] = useState<string | null>(null)
  const [localAlerts, setLocalAlerts] = useState(alerts)
  const confirmInputRef = useRef<HTMLInputElement>(null)

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 30000)
    return () => clearInterval(id)
  }, [router])

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

  async function dismissAlert(alertId: string) {
    setDismissingAlert(alertId)
    await fetch('/api/stamp-alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId }),
    })
    setLocalAlerts(prev => prev.filter(a => a.id !== alertId))
    setDismissingAlert(null)
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-indigo-500 ml-1">{sortDesc ? '↓' : '↑'}</span>
  }

  const churnColor = kpis.churnRate > 10 ? 'text-red-600' : kpis.churnRate > 5 ? 'text-amber-600' : 'text-green-600'
  const churnBg = kpis.churnRate > 10 ? 'bg-red-50' : kpis.churnRate > 5 ? 'bg-amber-50' : 'bg-green-50'
  const activeAlerts = localAlerts.filter(a => !a.dismissed && !a.auto_dismissed)
  const canDelete = confirmText === deleteModal?.name

  return (
    <div className="space-y-8">
      {/* Delete modal */}
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
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button onClick={handleDelete} disabled={!canDelete || deleting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {deleting ? '…' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merchant detail slide-over */}
      {detailMerchant && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setDetailMerchant(null)}>
          <div className="flex-1 bg-black/40" />
          <div
            className="w-full max-w-md bg-white shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">{detailMerchant.business_name}</h3>
              <button onClick={() => setDetailMerchant(null)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <PlanBadge plan={detailMerchant.plan} />
                <MerchantStatus lastStampAt={detailMerchant.last_stamp_at} />
              </div>
              <dl className="space-y-2">
                {[
                  { label: 'Email', value: detailMerchant.email },
                  { label: 'Ville', value: detailMerchant.city ?? '—' },
                  { label: 'Inscrit le', value: new Date(detailMerchant.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) },
                  { label: 'Mode fidélité', value: detailMerchant.loyalty_type === 'points' ? '🏆 Points' : '🎴 Tampons' },
                  { label: 'Cartes actives', value: String(detailMerchant.active_cards) },
                  { label: detailMerchant.loyalty_type === 'points' ? 'Points ce mois' : 'Tampons ce mois', value: String(detailMerchant.stamps_this_month) },
                  { label: detailMerchant.loyalty_type === 'points' ? 'Points total' : 'Tampons total', value: String(detailMerchant.total_stamps) },
                  { label: detailMerchant.loyalty_type === 'points' ? 'Dernier point' : 'Dernier tampon', value: detailMerchant.last_stamp_at ? timeAgoFmt(detailMerchant.last_stamp_at) : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="text-gray-500 font-medium shrink-0">{label}</dt>
                    <dd className="text-gray-900 text-right">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => { copyEmail(detailMerchant.email); }}
                  className="flex-1 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {copiedEmail === detailMerchant.email ? '✓ Copié' : '📋 Copier email'}
                </button>
                <button
                  onClick={() => { setDetailMerchant(null); setDeleteModal({ id: detailMerchant.id, name: detailMerchant.business_name }) }}
                  className="flex-1 py-2 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                >
                  🗑 Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs (toujours visibles, au-dessus des onglets) */}
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
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {([
            { key: 'merchants', label: 'Merchants', count: merchants.length },
            { key: 'alertes', label: 'Alertes', count: activeAlerts.length },
            { key: 'activite', label: 'Activité', count: null },
          ] as const).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
                tab === key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
              {count !== null && count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  tab === key ? 'bg-indigo-100 text-indigo-700' : key === 'alertes' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ─── Onglet Merchants ─── */}
      {tab === 'merchants' && (
        <div className="space-y-6">
          {/* Inactive alerts */}
          {inactiveMerchants.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-amber-900 mb-3">
                ⚠ {inactiveMerchants.length} commerçant{inactiveMerchants.length > 1 ? 's' : ''} inactif{inactiveMerchants.length > 1 ? 's' : ''} depuis +14 jours
              </h2>
              <div className="space-y-2">
                {inactiveMerchants.map(m => (
                  <div key={m.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 shadow-sm">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.business_name}</p>
                      <p className="text-xs text-gray-500">{m.email} · Dernier tampon : {new Date(m.last_stamp_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <button onClick={() => copyEmail(m.email)} className="ml-4 text-xs px-3 py-1.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors whitespace-nowrap">
                      {copiedEmail === m.email ? '✓ Copié' : '📋 Copier email'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Activité récente</h2>
                <span className="text-xs text-gray-400">Rafraîchissement auto · 30s</span>
              </div>
              <div className="divide-y divide-gray-50">
                {recentActivity.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Aucune activité</p>}
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3">
                    <span className="text-base mt-0.5">{{ stamp: '✅', new_card: '🎴', new_merchant: '🏪' }[a.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">{{ stamp: 'Tampon distribué', new_card: 'Nouvelle carte client', new_merchant: 'Nouveau commerçant' }[a.type]}</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{a.business_name}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{a.timeAgo}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Présence en France</h2>
              </div>
              <div className="p-4"><FranceMap merchants={merchants} /></div>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none" onClick={() => toggleSort('active_cards')}>
                      Clients <SortIcon k="active_cards" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none" onClick={() => toggleSort('total_stamps')}>
                      Activité totale <SortIcon k="total_stamps" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none" onClick={() => toggleSort('stamps_this_month')}>
                      Ce mois <SortIcon k="stamps_this_month" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Dernière activité</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sorted.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[160px]">
                        <p className="truncate">{m.business_name}</p>
                        {m.city && <p className="text-xs text-gray-400 font-normal">{m.city}</p>}
                        <p className="text-xs text-gray-400">{m.email}</p>
                      </td>
                      <td className="px-4 py-3"><PlanBadge plan={m.plan} /></td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{m.active_cards}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{m.total_stamps}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{m.stamps_this_month}</td>
                      <td className="px-4 py-3"><MerchantStatus lastStampAt={m.last_stamp_at} /></td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {m.last_stamp_at ? timeAgoFmt(m.last_stamp_at) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setDetailMerchant(m)}
                          className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                        >
                          Voir détail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sorted.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Aucun commerçant</p>}
            </div>
          </div>
        </div>
      )}

      {/* ─── Onglet Alertes ─── */}
      {tab === 'alertes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {activeAlerts.length === 0
                ? 'Aucune alerte active.'
                : `${activeAlerts.length} alerte${activeAlerts.length > 1 ? 's' : ''} active${activeAlerts.length > 1 ? 's' : ''}.`}
            </p>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-3xl mb-3">✅</p>
              <p className="text-sm text-gray-500">Aucune alerte — tout est normal.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Commerçant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Message</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Statut</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeAlerts.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.merchant_name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {a.alert_type === 'rapid_stamps' ? '⚡ tampons rapides' : a.alert_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">{a.message}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(a.triggered_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        {a.dismissed
                          ? <span className="text-xs text-gray-400">Vu</span>
                          : <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Actif</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!a.dismissed && (
                          <button
                            onClick={() => dismissAlert(a.id)}
                            disabled={dismissingAlert === a.id}
                            className="text-xs text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40"
                          >
                            {dismissingAlert === a.id ? '…' : 'Marquer comme vu'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Onglet Activité ─── */}
      {tab === 'activite' && (
        <div className="space-y-6">
          {/* Today metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Nouveaux merchants', value: todayMetrics.newMerchantsToday, icon: '🏪', color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Tampons aujourd\'hui', value: todayMetrics.stampsToday, icon: '✅', color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Nouveaux clients', value: '—', icon: '👤', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Merchants actifs', value: todayMetrics.activeMerchantsToday, icon: '⚡', color: 'text-green-600', bg: 'bg-green-50' },
            ].map(({ label, value, icon, color, bg }) => (
              <div key={label} className="bg-white rounded-xl shadow-sm p-4">
                <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center text-lg mb-3`}>{icon}</div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{label}</p>
              </div>
            ))}
          </div>

          {/* Recent stamps table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Derniers 50 tampons</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Heure</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Merchant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Carte</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentStampsActivity.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(s.given_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.merchant_name}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{s.loyalty_card_id.slice(0, 8)}…</td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{s.ip_address ?? '—'}</td>
                    </tr>
                  ))}
                  {recentStampsActivity.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">Aucun tampon récent</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
