'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
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

interface Client {
  id: string
  firstName: string
  phone: string
  totalStamps: number
  rewardsUnlocked: number
  firstVisit: string
  lastVisit: string
}

interface Props {
  primaryColor: string
  period: Period
  loyaltyType: string
  clients: Client[]
  plan: Plan
  customFrom?: string
  customTo?: string
}

function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return phone
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 8) return phone
  return `${digits.slice(0, 2)} ** ** ** ${digits.slice(-2)}`
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })
}

function calcFrequency(firstVisit: string, totalStamps: number): string {
  if (!firstVisit || totalStamps === 0) return '—'
  const weeks = Math.max(1, (Date.now() - new Date(firstVisit).getTime()) / (7 * 24 * 60 * 60 * 1000))
  const freq = totalStamps / weeks
  if (freq < 0.5) return '< 1×/sem.'
  return `${freq.toFixed(1)}×/sem.`
}

function isActive(lastVisit: string): boolean {
  return Date.now() - new Date(lastVisit).getTime() < 30 * 24 * 60 * 60 * 1000
}

type SortKey = 'firstName' | 'totalStamps' | 'rewardsUnlocked' | 'firstVisit' | 'lastVisit'

export default function StatsAnalyseClient({ primaryColor, period, loyaltyType, clients, plan, customFrom, customTo }: Props) {
  const isPoints = loyaltyType === 'points'
  const activityLabel = isPoints ? 'Points' : 'Tampons'
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('totalStamps')
  const [sortAsc, setSortAsc] = useState(false)

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined) params.delete(k)
      else params.set(k, v)
    }
    router.push(`/dashboard/stats?${params.toString()}`)
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(key === 'firstName') }
  }

  const filtered = useMemo(() => {
    let list = [...clients]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c => c.firstName.toLowerCase().includes(q))
    }
    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'firstName') cmp = a.firstName.localeCompare(b.firstName)
      else if (sortKey === 'totalStamps') cmp = a.totalStamps - b.totalStamps
      else if (sortKey === 'rewardsUnlocked') cmp = a.rewardsUnlocked - b.rewardsUnlocked
      else if (sortKey === 'firstVisit') cmp = new Date(a.firstVisit).getTime() - new Date(b.firstVisit).getTime()
      else if (sortKey === 'lastVisit') cmp = new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime()
      return sortAsc ? cmp : -cmp
    })
    return list
  }, [clients, search, sortKey, sortAsc])

  function exportCSV() {
    const header = ['Prénom', 'Téléphone', `${activityLabel} totaux`, 'Récompenses', 'Première visite', 'Dernière visite', 'Fréquence', 'Statut']
    const rows = clients.map(c => [
      c.firstName,
      c.phone,
      c.totalStamps,
      c.rewardsUnlocked,
      formatDate(c.firstVisit),
      formatDate(c.lastVisit),
      calcFrequency(c.firstVisit, c.totalStamps),
      isActive(c.lastVisit) ? 'Actif' : 'Inactif',
    ])
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `clients-vancart-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="text-[#E8E8E3] ml-1">↕</span>
    return <span className="ml-1" style={{ color: primaryColor }}>{sortAsc ? '↑' : '↓'}</span>
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
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                key === 'analyse'
                  ? 'border-[#6C47FF] text-[#6C47FF]'
                  : 'border-transparent text-[#6B6B6B] hover:text-[#1A1A1A]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

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

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <input
            type="text"
            placeholder="Rechercher par prénom…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontSize: 16 }}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#E8E8E3] rounded-xl focus:outline-none focus:border-[#6C47FF] bg-white"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
        </div>

        {plan === 'essential' || plan === 'pro' ? (
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl border border-[#E8E8E3] text-[#6B6B6B] hover:bg-[#F7F6F3] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        ) : (
          <span className="text-xs text-[#6B6B6B] bg-[#F7F6F3] border border-[#E8E8E3] px-3 py-2 rounded-xl">
            <ShieldCheck size={14} strokeWidth={1.9} className="inline-block mr-1" />Export CSV — Plan Essentiel+
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8E8E3] rounded-2xl overflow-hidden">
        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-[#E8E8E3]">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#6B6B6B]">Aucun client trouvé</div>
          ) : filtered.map(client => (
            <div key={client.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-[#1A1A1A]">{client.firstName}</p>
                  <p className="text-xs text-[#6B6B6B]">{maskPhone(client.phone)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isActive(client.lastVisit) ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-[#F7F6F3] text-[#6B6B6B] border border-[#E8E8E3]'}`}>
                  {isActive(client.lastVisit) ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#6B6B6B]">
                <span><strong className="text-[#1A1A1A]">{client.totalStamps}</strong> {isPoints ? 'points' : 'tampons'}</span>
                <span><strong className="text-[#1A1A1A]">{client.rewardsUnlocked}</strong> récompense{client.rewardsUnlocked !== 1 ? 's' : ''}</span>
                <span>{calcFrequency(client.firstVisit, client.totalStamps)}</span>
              </div>
              <div className="text-xs text-[#6B6B6B]">
                Dernière visite : {formatDate(client.lastVisit)}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E8E8E3]">
            <thead className="bg-[#F7F6F3]">
              <tr>
                {[
                  { key: 'firstName' as SortKey, label: 'Client' },
                  { key: 'totalStamps' as SortKey, label: activityLabel },
                  { key: 'rewardsUnlocked' as SortKey, label: 'Récompenses' },
                  { key: 'firstVisit' as SortKey, label: '1ère visite' },
                  { key: 'lastVisit' as SortKey, label: 'Dernière visite' },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider cursor-pointer hover:text-[#1A1A1A] select-none"
                  >
                    {label}<SortIcon k={key} />
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Fréquence</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#E8E8E3]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-[#6B6B6B]">Aucun client trouvé</td>
                </tr>
              ) : filtered.map(client => (
                <tr key={client.id} className="hover:bg-[#F7F6F3] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-[#1A1A1A]">{client.firstName}</p>
                    <p className="text-xs text-[#6B6B6B]">{maskPhone(client.phone)}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#1A1A1A] font-semibold">{client.totalStamps}</td>
                  <td className="px-4 py-3 text-sm text-[#1A1A1A]">{client.rewardsUnlocked}</td>
                  <td className="px-4 py-3 text-xs text-[#6B6B6B]">{formatDate(client.firstVisit)}</td>
                  <td className="px-4 py-3 text-xs text-[#6B6B6B]">{formatDate(client.lastVisit)}</td>
                  <td className="px-4 py-3 text-xs text-[#6B6B6B]">{calcFrequency(client.firstVisit, client.totalStamps)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isActive(client.lastVisit) ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-[#F7F6F3] text-[#6B6B6B] border border-[#E8E8E3]'}`}>
                      {isActive(client.lastVisit) ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-[#F7F6F3] border-t border-[#E8E8E3]">
          <p className="text-xs text-[#6B6B6B]">
            {filtered.length} client{filtered.length > 1 ? 's' : ''}{search ? ` sur ${clients.length}` : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
