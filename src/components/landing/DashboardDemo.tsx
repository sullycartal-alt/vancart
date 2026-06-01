'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const BARS = [
  { day: 'Lun', h: 45 },
  { day: 'Mar', h: 72 },
  { day: 'Mer', h: 53 },
  { day: 'Jeu', h: 88 },
  { day: 'Ven', h: 61 },
  { day: 'Sam', h: 95 },
  { day: 'Dim', h: 38 },
]

const KPIS = [
  { icon: '👥', label: 'Clients actifs', value: 247, prefix: '', suffix: '' },
  { icon: '📈', label: 'Nouveaux ce mois', value: 18, prefix: '+', suffix: '' },
  { icon: '🔄', label: 'Taux de retour', value: 73, prefix: '', suffix: '%' },
  { icon: '🎁', label: 'Récompenses utilisées', value: 41, prefix: '', suffix: '' },
]

function CountUp({ target, prefix, suffix, active }: { target: number; prefix: string; suffix: string; active: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) return
    const duration = 1200
    const step = 16
    const total = Math.ceil(duration / step)
    let frame = 0

    const timer = setInterval(() => {
      frame++
      const progress = frame / total
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.min(Math.round(target * eased), target))
      if (frame >= total) clearInterval(timer)
    }, step)

    return () => clearInterval(timer)
  }, [active, target])

  return <>{prefix}{count}{suffix}</>
}

export default function DashboardDemo() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true) },
      { threshold: 0.25 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="tableau-de-bord"
      ref={ref}
      className="px-4 sm:px-6 py-20 bg-white"
      style={{ scrollMarginTop: '80px' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Tableau de bord</p>
            <span className="bg-[#6C47FF] text-white font-bold px-2 py-0.5 rounded-full" style={{ fontSize: 10 }}>DÉMO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">Gardez le contrôle sur votre fidélité</h2>
          <p className="text-[#6B6B6B]">Aperçu en direct de votre tableau de bord</p>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {KPIS.map(({ icon, label, value, prefix, suffix }) => (
            <div key={label} className="bg-white border border-[#E8E8E3] rounded-xl p-5 shadow-sm text-center space-y-1.5">
              <p className="text-xl">{icon}</p>
              <p className="text-2xl font-black text-[#6C47FF]">
                <CountUp target={value} prefix={prefix} suffix={suffix} active={active} />
              </p>
              <p className="text-xs text-[#6B6B6B] leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="bg-white border border-[#E8E8E3] rounded-xl p-6 shadow-sm mb-5">
          <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide mb-5">
            Activité des 7 derniers jours
          </p>
          <div className="flex items-end gap-2" style={{ height: 96 }}>
            {BARS.map(({ day, h }, i) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-md"
                  style={{
                    height: active ? `${h}%` : '0%',
                    backgroundColor: '#6C47FF',
                    transition: `height 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 60}ms`,
                  }}
                />
                <span className="text-[10px] text-[#9CA3AF] font-medium">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-xs text-gray-400">DÉMO — données fictives à titre illustratif</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#6C47FF] text-white font-semibold rounded-xl hover:bg-[#5835e0] transition-colors text-sm"
          >
            Accéder à mon tableau de bord →
          </Link>
        </div>
      </div>
    </section>
  )
}
