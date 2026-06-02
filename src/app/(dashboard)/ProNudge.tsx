'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

const getNudgeKey = () => `vancart_pro_nudge_${new Date().toISOString().slice(0, 7)}`

export default function ProNudge() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(getNudgeKey())) {
      const t = setTimeout(() => setVisible(true), 2500)
      return () => clearTimeout(t)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(getNudgeKey(), 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 right-6 z-40 max-w-xs bg-white border border-[#E8E8E3] rounded-2xl shadow-xl p-4 space-y-3 animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[#1A1A1A]">
          <Sparkles size={16} strokeWidth={1.9} className="inline-block mr-1 text-[#6C47FF]" />Passez au plan Pro
        </p>
        <button onClick={dismiss} className="text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors text-lg leading-none mt-0.5">×</button>
      </div>
      <p className="text-xs text-[#6B6B6B] leading-relaxed">
        Débloquez les SMS, le multi-boutique et votre RDV mensuel inclus.
      </p>
      <div className="flex gap-2">
        <Link
          href="/dashboard/upgrade"
          className="flex-1 py-2 bg-[#6C47FF] text-white text-xs font-semibold rounded-xl text-center hover:bg-[#5835e0] transition-colors"
        >
          Passer au Pro →
        </Link>
        <button
          onClick={dismiss}
          className="flex-1 py-2 border border-[#E8E8E3] text-[#6B6B6B] text-xs rounded-xl hover:bg-[#F7F6F3] transition-colors"
        >
          Ce mois c&apos;est bon
        </button>
      </div>
    </div>
  )
}
