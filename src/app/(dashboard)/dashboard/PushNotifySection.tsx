'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

export default function PushNotifySection({ merchantId }: { merchantId: string }) {
  const [message, setMessage] = useState('☕ Revenez nous voir — votre récompense vous attend !')
  const [status, setStatus] = useState<{ sent: number; total: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function send() {
    setLoading(true)
    setError(null)
    setStatus(null)
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId,
          title: 'VanCart',
          body: message,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur')
      setStatus(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🔔</span>
        <h2 className="text-sm font-bold text-[#1A1A1A]">Notifier mes clients</h2>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={200}
        rows={2}
        className="w-full text-sm text-[#1A1A1A] border border-[#E8E8E3] rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/30 focus:border-[#6C47FF]"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={send}
          disabled={loading || !message.trim()}
          className="px-5 py-2.5 bg-[#6C47FF] text-white text-sm font-semibold rounded-xl hover:bg-[#5835e0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Envoi…' : 'Envoyer la notification'}
        </button>

        {status && (
          <p className="text-sm text-green-600 font-medium">
            <Check size={16} strokeWidth={1.9} className="inline-block mr-1 text-green-600 flex-shrink-0" />Envoyée à {status.sent} client{status.sent !== 1 ? 's' : ''}
            {status.sent < status.total ? ` (${status.total - status.sent} échec${status.total - status.sent !== 1 ? 's' : ''})` : ''}
          </p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  )
}
