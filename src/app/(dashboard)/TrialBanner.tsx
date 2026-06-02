'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Gift } from 'lucide-react'

const LS_KEY = 'vancart_banner_closed'

interface Props {
  daysLeft: number
  endDate: string | null
}

export default function TrialBanner({ daysLeft, endDate }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(LS_KEY)) setVisible(true)
  }, [])

  if (!visible) return null

  const close = () => {
    localStorage.setItem(LS_KEY, 'true')
    setVisible(false)
  }

  return (
    <div className="bg-amber-500 text-white text-sm px-4 py-2.5 flex items-center justify-center gap-3 flex-wrap">
      <span>
        <Gift size={16} strokeWidth={1.9} className="inline-block mr-1 flex-shrink-0" />Essai gratuit —{' '}
        <strong>{daysLeft} jour{daysLeft !== 1 ? 's' : ''} restant{daysLeft !== 1 ? 's' : ''}</strong>
        {endDate && ` · Expire le ${endDate}`}
      </span>
      <Link
        href="/dashboard/upgrade"
        className="bg-white text-amber-600 font-semibold text-xs px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors"
      >
        Passer au plan Essentiel →
      </Link>
      <button
        onClick={close}
        className="ml-2 text-white/80 hover:text-white text-xl font-bold leading-none"
        aria-label="Fermer"
      >
        ×
      </button>
    </div>
  )
}
