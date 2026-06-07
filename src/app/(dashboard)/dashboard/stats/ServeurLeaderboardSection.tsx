'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Medal, Lock } from 'lucide-react'
import type { Plan } from '@/lib/plan-features'

type Period = '7d' | '30d' | 'all'
interface Row {
  name: string
  count: number
  pct: number
}

const PERIODS: { id: Period; label: string }[] = [
  { id: '7d', label: '7 jours' },
  { id: '30d', label: '30 jours' },
  { id: 'all', label: 'Tout' },
]

const MEDAL_COLORS = ['#F5B301', '#9CA3AF', '#B45309']

export default function ServeurLeaderboardSection({
  plan,
  primaryColor,
}: {
  plan: Plan
  primaryColor: string
}) {
  const locked = plan === 'free'
  const [period, setPeriod] = useState<Period>('7d')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (locked) return
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const d = await fetch(`/api/caisse/leaderboard?period=${period}`).then((r) =>
          r.ok ? r.json() : { rows: [] },
        )
        if (active) setRows(d.rows ?? [])
      } catch {
        if (active) setRows([])
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [period, locked])

  const title = (
    <h2 className="flex items-center gap-2 text-lg font-bold text-[#1A1A1A]">
      <Trophy size={20} strokeWidth={1.9} className="text-[#6C47FF]" />
      Classement serveurs
    </h2>
  )

  if (locked) {
    return (
      <div className="mt-8 bg-white border border-[#E8E8E3] rounded-2xl p-6 space-y-4">
        {title}
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <div className="w-12 h-12 rounded-2xl bg-[#6C47FF]/10 flex items-center justify-center">
            <Lock size={22} strokeWidth={1.9} className="text-[#6C47FF]" />
          </div>
          <p className="text-sm text-[#6B6B6B] max-w-xs">
            Découvrez quels serveurs scannent le plus de clients. Disponible sur les plans Essentiel et Pro.
          </p>
          <Link
            href="/dashboard/upgrade"
            className="px-5 py-2.5 bg-[#6C47FF] text-white text-sm font-semibold rounded-xl hover:bg-[#5835e0] transition-colors"
          >
            Passer à Essentiel →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 bg-white border border-[#E8E8E3] rounded-2xl p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {title}
        <div className="flex gap-1 p-1 bg-[#F7F6F3] border border-[#E8E8E3] rounded-xl">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={
                period === p.id
                  ? { backgroundColor: primaryColor, color: 'white' }
                  : { color: '#6B6B6B' }
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-24 animate-pulse bg-[#F7F6F3] rounded-xl" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-[#6B6B6B] py-4">Aucun scan sur cette période.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, i) => (
            <li
              key={row.name}
              className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-[#F7F6F3]"
            >
              <span className="w-7 flex-shrink-0 flex items-center justify-center">
                {i < 3 ? (
                  <Medal size={20} strokeWidth={1.9} style={{ color: MEDAL_COLORS[i] }} />
                ) : (
                  <span className="text-sm font-bold text-[#6B6B6B]">{i + 1}</span>
                )}
              </span>
              <span className="flex-1 font-semibold text-[#1A1A1A] truncate">{row.name}</span>
              <span className="text-sm text-[#1A1A1A]">
                {row.count} scan{row.count > 1 ? 's' : ''}
              </span>
              <span className="w-12 text-right text-sm text-[#6B6B6B]">{row.pct}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
