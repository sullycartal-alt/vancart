'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Zap, WalletCards, Check, Trophy, BarChart3, Store, Gift, Rocket, Trash2, Flame, Target, BookmarkCheck, AlertTriangle, ClipboardList, TrendingUp, Mail, User, Phone, MapPin, Clipboard } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface KPIs {
  activeMerchants: number
  newThisMonth: number
  totalCards: number
  totalActivity: number
  totalRewards: number
  mrr: number
}

interface MerchantRow {
  id: string
  business_name: string
  email: string
  plan: string | null
  loyalty_type: string
  city: string | null
  owner_name: string | null
  phone: string | null
  address: string | null
  created_at: string
  client_count: number
  total_activity: number
  total_rewards: number
  last_activity: string | null
  status: 'active' | 'at_risk' | 'inactive'
}

interface Alert {
  id: string
  level: 'urgent' | 'attention'
  merchant_name: string
  merchant_id: string
  message: string
  created_at: string
  type: 'inactive_14d' | 'no_clients' | 'ready_to_reward' | 'slow_start'
}

interface ActivityEvent {
  id: string
  type: 'new_merchant' | 'new_client' | 'stamp'
  description: string
  merchant_name: string
  timestamp: string
}

interface Props {
  kpis: KPIs
  weeklyNewMerchants: { week: string; count: number }[]
  dailyActivity: { date: string; count: number }[]
  merchantRows: MerchantRow[]
  merchantClients: Record<string, { firstName: string; totalStamps: number; lastVisit: string }[]>
  alerts: Alert[]
  activityEvents: ActivityEvent[]
  retentionData: { name: string; returning: number; oneTime: number }[]
  topRewardsData: { name: string; rewards: number }[]
  loyaltyTypeData: { name: string; value: number }[]
  weeklyGrowthData: { week: string; total: number }[]
}

type Tab = 'overview' | 'merchants' | 'alertes' | 'activite' | 'metriques'
type SortKey = 'created_at' | 'client_count' | 'total_activity' | 'total_rewards'

const PIE_COLORS = ['#6C47FF', '#10b981']
const DISMISSED_KEY = 'vancart:admin:dismissed-alerts'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `il y a ${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'hier'
  return `il y a ${days}j`
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })
}

type LucideIcon = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>

function KPICard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: LucideIcon; sub?: string }) {
  return (
    <div className="bg-white border border-[#E8E8E3] rounded-xl p-5 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Icon size={18} strokeWidth={1.9} className="text-[#6C47FF] flex-shrink-0" />
        <span className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide leading-tight">{label}</span>
      </div>
      <span className="text-2xl font-bold text-[#1A1A1A]">{value}</span>
      {sub && <span className="text-xs text-[#6B6B6B]">{sub}</span>}
    </div>
  )
}

function PlanBadge({ plan }: { plan: string | null }) {
  if (plan === 'pro') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">Pro</span>
  if (plan === 'essentiel') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Essentiel</span>
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F7F6F3] text-[#6B6B6B] border border-[#E8E8E3]">Découverte</span>
}

function HealthBadge({ status }: { status: 'active' | 'at_risk' | 'inactive' }) {
  if (status === 'active') return <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Actif</span>
  if (status === 'at_risk') return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> À risque</span>
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Inactif</span>
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  kpis,
  weeklyNewMerchants,
  dailyActivity,
}: { kpis: KPIs; weeklyNewMerchants: { week: string; count: number }[]; dailyActivity: { date: string; count: number }[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard icon={Zap} label="Commerçants actifs" value={kpis.activeMerchants} sub="30 derniers jours" />
        <KPICard icon={Store} label="Nouveaux ce mois" value={kpis.newThisMonth} />
        <KPICard icon={WalletCards} label="Cartes clients" value={kpis.totalCards.toLocaleString('fr-FR')} />
        <KPICard icon={Check} label="Activité totale" value={kpis.totalActivity.toLocaleString('fr-FR')} sub="tampons + points" />
        <KPICard icon={Trophy} label="Récompenses" value={kpis.totalRewards.toLocaleString('fr-FR')} />
        <KPICard icon={BarChart3} label="MRR potentiel" value={`${kpis.mrr.toLocaleString('fr-FR')} €`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E8E8E3] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Nouveaux commerçants / semaine</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyNewMerchants}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E8E8E3' }} formatter={(v) => [String(v), 'Commerçants']} />
              <Line type="monotone" dataKey="count" stroke="#6C47FF" strokeWidth={2} dot={{ fill: '#6C47FF', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#E8E8E3] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Activité / jour (30j)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E8E8E3' }} formatter={(v) => [String(v), 'Tampons']} />
              <Line type="monotone" dataKey="count" stroke="#6C47FF" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#6C47FF' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ─── Merchants Tab ────────────────────────────────────────────────────────────

function MerchantsTab({
  merchantRows,
  merchantClients,
}: { merchantRows: MerchantRow[]; merchantClients: Record<string, { firstName: string; totalStamps: number; lastVisit: string }[]> }) {
  const router = useRouter()
  const [sortKey, setSortKey] = useState<SortKey>('client_count')
  const [sortDesc, setSortDesc] = useState(true)
  const [drawer, setDrawer] = useState<MerchantRow | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const confirmRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (deleteModal) {
      setConfirmText('')
      setTimeout(() => confirmRef.current?.focus(), 50)
    }
  }, [deleteModal])

  const sorted = [...merchantRows].sort((a, b) => {
    const av = sortKey === 'created_at' ? new Date(a.created_at).getTime() : (a[sortKey] as number)
    const bv = sortKey === 'created_at' ? new Date(b.created_at).getTime() : (b[sortKey] as number)
    return sortDesc ? bv - av : av - bv
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDesc(d => !d)
    else { setSortKey(key); setSortDesc(true) }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="text-[#E8E8E3] ml-1">↕</span>
    return <span className="text-[#6C47FF] ml-1">{sortDesc ? '↓' : '↑'}</span>
  }

  async function copyEmail(email: string) {
    await navigator.clipboard.writeText(email)
    setCopied(email)
    setTimeout(() => setCopied(null), 2000)
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

  const canDelete = confirmText === deleteModal?.name

  return (
    <>
      {/* Delete modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#1A1A1A]">Supprimer ce commerçant ?</h3>
            <div className="rounded-xl bg-red-50 border border-red-100 p-3">
              <p className="text-sm text-red-700 font-medium">Cette action est irréversible.</p>
              <p className="text-xs text-red-600 mt-0.5">Toutes les cartes et données client seront supprimées.</p>
            </div>
            <div>
              <label className="block text-xs text-[#6B6B6B] mb-1.5">
                Tapez <span className="font-mono font-bold text-[#1A1A1A]">{deleteModal.name}</span> pour confirmer :
              </label>
              <input
                ref={confirmRef}
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder={deleteModal.name}
                onKeyDown={e => { if (e.key === 'Enter' && canDelete) handleDelete() }}
                className="w-full rounded-xl border border-[#E8E8E3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[#6B6B6B] border border-[#E8E8E3] hover:bg-[#F7F6F3] transition-colors">
                Annuler
              </button>
              <button onClick={handleDelete} disabled={!canDelete || deleting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {deleting ? '…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 flex" onClick={() => setDrawer(null)}>
          <div className="flex-1 bg-black/40" />
          <div
            className="w-full max-w-[420px] bg-white shadow-2xl overflow-y-auto flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-[#E8E8E3] flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A]">{drawer.business_name}</h3>
                {drawer.city && <p className="text-xs text-[#6B6B6B]">{drawer.city}</p>}
              </div>
              <button onClick={() => setDrawer(null)} className="text-[#6B6B6B] hover:text-[#1A1A1A] text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6 space-y-5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <PlanBadge plan={drawer.plan} />
                <HealthBadge status={drawer.status} />
                <span className="inline-flex items-center gap-1 text-xs text-[#6B6B6B] px-2 py-0.5 rounded-full bg-[#F7F6F3] border border-[#E8E8E3]">
                  {drawer.loyalty_type === 'points' ? <><Trophy size={12} strokeWidth={1.9} /> Points</> : <><WalletCards size={12} strokeWidth={1.9} /> Tampons</>}
                </span>
              </div>

              <dl className="space-y-2.5 text-sm">
                {[
                  { label: 'Inscrit le', value: formatDate(drawer.created_at) },
                  { label: 'Clients', value: `${drawer.client_count}` },
                  { label: 'Activité totale', value: `${drawer.total_activity}` },
                  { label: 'Récompenses', value: `${drawer.total_rewards}` },
                  { label: 'Dernière activité', value: drawer.last_activity ? timeAgo(drawer.last_activity) : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4 py-1.5 border-b border-[#F7F6F3]">
                    <dt className="text-[#6B6B6B] font-medium shrink-0">{label}</dt>
                    <dd className="text-[#1A1A1A] text-right">{value}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] mb-3">Coordonnées</h4>
                <div className="space-y-2 text-sm">
                  {[
                    { icon: '📧', label: drawer.email || 'Non renseigné' },
                    { icon: '👤', label: drawer.owner_name || 'Non renseigné' },
                    { icon: '📞', label: drawer.phone || 'Non renseigné' },
                    { icon: '📍', label: drawer.address || 'Non renseigné' },
                  ].map(({ icon, label }) => (
                    <div key={icon} className="flex items-start gap-2.5 py-1.5 border-b border-[#F7F6F3]">
                      <span className="text-base leading-5 flex-shrink-0">{icon}</span>
                      <span className={label === 'Non renseigné' ? 'text-[#9CA3AF] italic' : 'text-[#1A1A1A] break-all'}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {(merchantClients[drawer.id] ?? []).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] mb-3">Top clients</h4>
                  <div className="space-y-2">
                    {(merchantClients[drawer.id] ?? []).map((c, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#F7F6F3] rounded-xl px-4 py-2.5">
                        <span className="text-sm font-medium text-[#1A1A1A]">{c.firstName}</span>
                        <div className="flex items-center gap-3 text-xs text-[#6B6B6B]">
                          <span>{c.totalStamps} pts</span>
                          <span>{timeAgo(c.lastVisit)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#E8E8E3] flex gap-3">
              <button
                onClick={() => copyEmail(drawer.email)}
                className="flex-1 py-2.5 text-sm rounded-xl border border-[#E8E8E3] text-[#6B6B6B] hover:bg-[#F7F6F3] transition-colors"
              >
                {copied === drawer.email ? '✓ Copié' : '📋 Copier email'}
              </button>
              <button
                onClick={() => { setDrawer(null); setDeleteModal({ id: drawer.id, name: drawer.business_name }) }}
                className="flex-1 py-2.5 text-sm rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              >
                🗑 Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#E8E8E3] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E8E8E3]">
          <p className="text-sm font-semibold text-[#1A1A1A]">Commerçants ({merchantRows.length})</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E8E8E3]">
            <thead className="bg-[#F7F6F3]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Commerce</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide cursor-pointer select-none hover:text-[#1A1A1A]" onClick={() => toggleSort('client_count')}>
                  Clients <SortIcon k="client_count" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide cursor-pointer select-none hover:text-[#1A1A1A]" onClick={() => toggleSort('total_activity')}>
                  Activité <SortIcon k="total_activity" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide cursor-pointer select-none hover:text-[#1A1A1A]" onClick={() => toggleSort('total_rewards')}>
                  Récompenses <SortIcon k="total_rewards" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">Santé</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide cursor-pointer select-none hover:text-[#1A1A1A]" onClick={() => toggleSort('created_at')}>
                  Inscrit <SortIcon k="created_at" />
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E3]">
              {sorted.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-[#6B6B6B]">Aucun commerçant</td></tr>
              )}
              {sorted.map(m => (
                <tr key={m.id} className="hover:bg-[#F7F6F3] transition-colors cursor-pointer" onClick={() => setDrawer(m)}>
                  <td className="px-4 py-3 max-w-[180px]">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">{m.business_name}</p>
                    {m.city && <p className="text-xs text-[#6B6B6B]">{m.city}</p>}
                    <p className="text-xs text-[#6B6B6B] truncate">{m.email}</p>
                  </td>
                  <td className="px-4 py-3"><PlanBadge plan={m.plan} /></td>
                  <td className="px-4 py-3 text-sm text-[#1A1A1A] font-medium">{m.client_count}</td>
                  <td className="px-4 py-3 text-sm text-[#1A1A1A] font-medium">{m.total_activity}</td>
                  <td className="px-4 py-3 text-sm text-[#1A1A1A]">{m.total_rewards}</td>
                  <td className="px-4 py-3"><HealthBadge status={m.status} /></td>
                  <td className="px-4 py-3 text-xs text-[#6B6B6B] whitespace-nowrap">{formatDate(m.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={e => { e.stopPropagation(); setDrawer(m) }}
                      className="text-xs text-[#6C47FF] hover:text-[#5835e0] font-medium transition-colors"
                    >
                      Voir →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// ─── Alertes Tab ──────────────────────────────────────────────────────────────

const ALERT_ICONS: Record<Alert['type'], string> = {
  inactive_14d: '😴',
  no_clients: '👥',
  ready_to_reward: '🎁',
  slow_start: '🚀',
}

function AlertesTab({ alerts }: { alerts: Alert[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DISMISSED_KEY)
      if (raw) setDismissed(new Set(JSON.parse(raw) as string[]))
    } catch {}
  }, [])

  function dismiss(id: string) {
    const next = new Set([...dismissed, id])
    setDismissed(next)
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]))
  }

  function resetDismissed() {
    setDismissed(new Set())
    localStorage.removeItem(DISMISSED_KEY)
  }

  const visible = alerts.filter(a => !dismissed.has(a.id))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-[#6B6B6B]">
          {visible.length === 0
            ? 'Aucune alerte active.'
            : `${visible.length} alerte${visible.length > 1 ? 's' : ''} active${visible.length > 1 ? 's' : ''}`}
        </p>
        {dismissed.size > 0 && (
          <button onClick={resetDismissed} className="text-xs text-[#6C47FF] hover:text-[#5835e0]">
            Réafficher les traitées ({dismissed.size})
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="bg-white border border-[#E8E8E3] rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-sm font-semibold text-[#1A1A1A]">Tout va bien !</p>
          <p className="text-xs text-[#6B6B6B] mt-1">Aucune alerte à traiter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(alert => (
            <div
              key={alert.id}
              className={`bg-white border rounded-2xl p-4 flex items-start gap-4 ${
                alert.level === 'urgent' ? 'border-red-200' : 'border-[#E8E8E3]'
              }`}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{ALERT_ICONS[alert.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    alert.level === 'urgent' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {alert.level === 'urgent' ? '🔴 Urgent' : '🟡 Attention'}
                  </span>
                  <span className="text-xs font-semibold text-[#1A1A1A]">{alert.merchant_name}</span>
                </div>
                <p className="text-sm text-[#6B6B6B]">{alert.message}</p>
              </div>
              <button
                onClick={() => dismiss(alert.id)}
                className="flex-shrink-0 text-xs text-[#6B6B6B] hover:text-[#1A1A1A] border border-[#E8E8E3] px-3 py-1.5 rounded-xl hover:bg-[#F7F6F3] transition-colors whitespace-nowrap"
              >
                ✓ Traité
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Activité Tab ─────────────────────────────────────────────────────────────

const EVENT_ICONS: Record<ActivityEvent['type'], string> = {
  new_merchant: '🏪',
  new_client: '👤',
  stamp: '✅',
}

function ActiviteTab({ activityEvents }: { activityEvents: ActivityEvent[] }) {
  const [shown, setShown] = useState(20)

  return (
    <div className="bg-white border border-[#E8E8E3] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E8E8E3]">
        <p className="text-sm font-semibold text-[#1A1A1A]">Activité récente — {activityEvents.length} événements</p>
      </div>

      {activityEvents.length === 0 ? (
        <div className="p-8 text-center text-sm text-[#6B6B6B]">Aucune activité récente</div>
      ) : (
        <>
          <div className="divide-y divide-[#E8E8E3]">
            {activityEvents.slice(0, shown).map(event => (
              <div key={event.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="text-lg flex-shrink-0">{EVENT_ICONS[event.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#6B6B6B]">{event.description}</p>
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{event.merchant_name}</p>
                </div>
                <span className="text-xs text-[#6B6B6B] whitespace-nowrap flex-shrink-0">{timeAgo(event.timestamp)}</span>
              </div>
            ))}
          </div>

          {shown < activityEvents.length && (
            <div className="px-5 py-4 border-t border-[#E8E8E3] text-center">
              <button
                onClick={() => setShown(s => Math.min(s + 20, activityEvents.length))}
                className="text-xs text-[#6C47FF] hover:text-[#5835e0] font-semibold transition-colors"
              >
                Charger plus — {activityEvents.length - shown} restants
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Métriques Tab ────────────────────────────────────────────────────────────

function MetriquesTab({
  retentionData,
  topRewardsData,
  loyaltyTypeData,
  weeklyGrowthData,
}: {
  retentionData: { name: string; returning: number; oneTime: number }[]
  topRewardsData: { name: string; rewards: number }[]
  loyaltyTypeData: { name: string; value: number }[]
  weeklyGrowthData: { week: string; total: number }[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Retention */}
      <div className="bg-white border border-[#E8E8E3] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-0.5">Rétention clients</h3>
        <p className="text-xs text-[#6B6B6B] mb-4">Fidèles (2+ visites) vs 1 seule visite, par commerce</p>
        {retentionData.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-[#6B6B6B] text-center">
            Données insuffisantes<br /><span className="text-xs">(3+ clients requis par commerce)</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(180, retentionData.length * 32)}>
            <BarChart data={retentionData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E8E8E3' }} formatter={(v, name) => [String(v), name === 'returning' ? 'Fidèles' : '1 visite']} />
              <Bar dataKey="returning" stackId="a" fill="#6C47FF" name="Fidèles" />
              <Bar dataKey="oneTime" stackId="a" fill="#E8E8E3" radius={[0, 4, 4, 0]} name="1 visite" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top récompenses */}
      <div className="bg-white border border-[#E8E8E3] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-0.5">Top récompenses</h3>
        <p className="text-xs text-[#6B6B6B] mb-4">Récompenses débloquées par commerce</p>
        {topRewardsData.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-[#6B6B6B]">
            Aucune récompense distribuée
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(180, topRewardsData.length * 32)}>
            <BarChart data={topRewardsData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E8E8E3' }} formatter={(v) => [String(v), 'Récompenses']} />
              <Bar dataKey="rewards" fill="#6C47FF" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Loyalty type distribution */}
      <div className="bg-white border border-[#E8E8E3] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-0.5">Répartition des programmes</h3>
        <p className="text-xs text-[#6B6B6B] mb-4">Merchants par type de fidélité</p>
        {loyaltyTypeData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm text-[#6B6B6B]">Aucun commerçant</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={loyaltyTypeData}
                cx="50%"
                cy="50%"
                outerRadius={75}
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={true}
              >
                {loyaltyTypeData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E8E8E3' }}
                formatter={(v, name) => [String(v), String(name)]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Weekly growth */}
      <div className="bg-white border border-[#E8E8E3] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-0.5">Croissance clients</h3>
        <p className="text-xs text-[#6B6B6B] mb-4">Cartes de fidélité cumulées (90 jours)</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weeklyGrowthData}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6C47FF" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6C47FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={false} tickLine={false} interval={2} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B6B6B' }} axisLine={false} tickLine={false} width={36} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E8E8E3' }} formatter={(v) => [String(v), 'Cartes']} />
            <Area type="monotone" dataKey="total" stroke="#6C47FF" strokeWidth={2} fill="url(#growthGradient)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#6C47FF' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminClient({
  kpis,
  weeklyNewMerchants,
  dailyActivity,
  merchantRows,
  merchantClients,
  alerts,
  activityEvents,
  retentionData,
  topRewardsData,
  loyaltyTypeData,
  weeklyGrowthData,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const TABS: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: 'overview', label: 'Vue globale', icon: '📊' },
    { id: 'merchants', label: 'Merchants', icon: '🏪', count: merchantRows.length },
    { id: 'alertes', label: 'Alertes', icon: '⚠️', count: alerts.length },
    { id: 'activite', label: 'Activité', icon: '📋' },
    { id: 'metriques', label: 'Métriques', icon: '📈' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Backoffice Admin</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">Vue d&apos;ensemble de la plateforme VanCart</p>
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-0.5 border-b border-[#E8E8E3] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id
                ? 'border-[#6C47FF] text-[#6C47FF]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
            }`}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab.id ? 'bg-[#6C47FF]/10 text-[#6C47FF]' : 'bg-[#F7F6F3] text-[#6B6B6B]'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <OverviewTab kpis={kpis} weeklyNewMerchants={weeklyNewMerchants} dailyActivity={dailyActivity} />
      )}
      {activeTab === 'merchants' && (
        <MerchantsTab merchantRows={merchantRows} merchantClients={merchantClients} />
      )}
      {activeTab === 'alertes' && (
        <AlertesTab alerts={alerts} />
      )}
      {activeTab === 'activite' && (
        <ActiviteTab activityEvents={activityEvents} />
      )}
      {activeTab === 'metriques' && (
        <MetriquesTab
          retentionData={retentionData}
          topRewardsData={topRewardsData}
          loyaltyTypeData={loyaltyTypeData}
          weeklyGrowthData={weeklyGrowthData}
        />
      )}
    </div>
  )
}
