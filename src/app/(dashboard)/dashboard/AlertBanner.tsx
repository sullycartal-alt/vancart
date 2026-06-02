'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TriangleAlert } from 'lucide-react'

interface Alert {
  id: string
  message: string
  triggered_at: string
}

export default function AlertBanner({ alerts }: { alerts: Alert[] }) {
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()

  if (dismissed || alerts.length === 0) return null

  async function handleDismiss() {
    setDismissed(true)
    await fetch('/api/stamp-alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    router.refresh()
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
      <TriangleAlert size={20} strokeWidth={1.9} className="text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800">Activité inhabituelle détectée</p>
        <p className="text-xs text-amber-700 mt-0.5">
          {alerts.length > 1
            ? `${alerts.length} alertes — dont : ${alerts[0].message}`
            : alerts[0].message}
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors whitespace-nowrap flex-shrink-0 underline"
      >
        Ignorer
      </button>
    </div>
  )
}
