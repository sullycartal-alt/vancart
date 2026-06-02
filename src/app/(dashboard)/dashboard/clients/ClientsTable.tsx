'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bell, Gift, Flame, PartyPopper, Check, WalletCards, Trophy } from 'lucide-react'

interface Client {
  id: string
  customer_id: string | null
  stamps_count: number
  points: number
  rewards_unlocked: number
  last_stamp_at: string | null
  customers: {
    first_name: string
    phone: string
  }
  stampsRequired: number
  pointsRequired: number
  loyaltyType: 'stamps' | 'points'
  primaryColor: string
}

interface Props {
  clients: Client[]
  merchantId: string
  subscribedCustomerIds: string[]
  isPro: boolean
}

interface NotifyTarget {
  customerId: string
  firstName: string
  left: number
  unit: string
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function NotifyModal({
  target,
  merchantId,
  onClose,
}: {
  target: NotifyTarget
  merchantId: string
  onClose: () => void
}) {
  const [message, setMessage] = useState(
    `Revenez nous voir, il vous reste ${target.left} ${target.unit} pour votre récompense !`
  )
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function send() {
    setStatus('sending')
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId,
          customer_id: target.customerId,
          title: 'VanCart',
          body: message,
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
      setTimeout(onClose, 1500)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5">
            <Bell size={16} strokeWidth={1.9} className="text-[#6C47FF]" /> Notifier {target.firstName}
          </h3>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#1A1A1A] text-lg leading-none">×</button>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
          rows={3}
          className="w-full text-sm text-[#1A1A1A] border border-[#E8E8E3] rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/30 focus:border-[#6C47FF]"
        />

        {status === 'sent' ? (
          <p className="text-sm text-green-600 font-medium text-center flex items-center justify-center gap-1"><Check size={16} strokeWidth={1.9} /> Notification envoyée !</p>
        ) : status === 'error' ? (
          <p className="text-sm text-red-500 text-center">Erreur — réessayez</p>
        ) : (
          <button
            onClick={send}
            disabled={status === 'sending' || !message.trim()}
            className="w-full py-2.5 bg-[#6C47FF] text-white text-sm font-semibold rounded-xl hover:bg-[#5835e0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'sending' ? 'Envoi…' : 'Envoyer'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function ClientsTable({ clients, merchantId, subscribedCustomerIds, isPro }: Props) {
  const router = useRouter()
  const [notifyTarget, setNotifyTarget] = useState<NotifyTarget | null>(null)
  const [subscribedSet, setSubscribedSet] = useState(() => new Set(subscribedCustomerIds))

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 30000)
    return () => clearInterval(interval)
  }, [router])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`push_subs_${merchantId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'push_subscriptions',
        filter: `merchant_id=eq.${merchantId}`,
      }, (payload) => {
        const cid = (payload.new as { customer_id: string }).customer_id
        setSubscribedSet(prev => new Set([...prev, cid]))
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'push_subscriptions',
        filter: `merchant_id=eq.${merchantId}`,
      }, (payload) => {
        const cid = (payload.old as { customer_id: string }).customer_id
        setSubscribedSet(prev => { const n = new Set(prev); n.delete(cid); return n })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [merchantId])

  function openNotify(client: Client) {
    if (!client.customer_id) return
    const isPoints = client.loyaltyType === 'points'
    const target = isPoints ? client.pointsRequired : client.stampsRequired
    const current = isPoints ? client.points : client.stamps_count
    const left = Math.max(0, target - current)
    setNotifyTarget({
      customerId: client.customer_id,
      firstName: client.customers.first_name,
      left,
      unit: isPoints ? 'points' : 'tampons',
    })
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white border border-[#E8E8E3] rounded-2xl p-12 text-center">
        <div className="text-4xl mb-3 flex justify-center"><WalletCards size={40} strokeWidth={1.9} className="text-[#6B6B6B]" /></div>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">Aucun client encore</h3>
        <p className="text-sm text-[#6B6B6B]">
          Vos clients apparaîtront ici après leur premier scan de votre QR code.
        </p>
      </div>
    )
  }

  return (
    <>
      {notifyTarget && (
        <NotifyModal
          target={notifyTarget}
          merchantId={merchantId}
          onClose={() => setNotifyTarget(null)}
        />
      )}

      <div className="bg-white border border-[#E8E8E3] rounded-2xl overflow-hidden">
        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-[#E8E8E3]">
          {clients.map((client) => {
            const isPoints = client.loyaltyType === 'points'
            const target = isPoints ? client.pointsRequired : client.stampsRequired
            const current = isPoints ? client.points : client.stamps_count
            const pct = Math.min(100, Math.round((current / target) * 100))
            const isRewardPending = current >= target
            const isAlmostFull = !isRewardPending && current === target - 1
            const unit = isPoints ? 'pts' : 'tampons'
            const canNotify = isPro && !!client.customer_id && subscribedSet.has(client.customer_id)
            return (
              <div key={client.id} className="px-4 py-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A1A]">{client.customers.first_name}</p>
                      <p className="text-xs text-[#6B6B6B] mt-0.5">{client.customers.phone}</p>
                    </div>
                    {canNotify && (
                      <button
                        onClick={() => openNotify(client)}
                        title="Envoyer une notification push"
                        className="flex-shrink-0 text-[#6C47FF] hover:text-[#5835e0] transition-colors"
                      >
                        <Bell size={16} strokeWidth={1.9} />
                      </button>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {isRewardPending ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-400">
                        <Gift size={12} strokeWidth={1.9} /> Récompense en attente
                      </span>
                    ) : isAlmostFull ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <Flame size={12} strokeWidth={1.9} /> Presque !
                      </span>
                    ) : client.rewards_unlocked > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <PartyPopper size={12} strokeWidth={1.9} /> {client.rewards_unlocked}
                      </span>
                    ) : (
                      <span className="text-xs text-[#6B6B6B]">{formatDate(client.last_stamp_at)}</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold flex items-center gap-1" style={{ color: client.primaryColor }}>
                      {isPoints ? <Trophy size={14} strokeWidth={1.9} /> : <WalletCards size={14} strokeWidth={1.9} />} {current}/{target} {unit}
                    </span>
                    <span className="text-xs text-[#6B6B6B]">{pct}%</span>
                  </div>
                  <div className="w-full bg-[#F7F6F3] rounded-full h-2.5">
                    <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: client.primaryColor }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop table */}
        <table className="hidden sm:table min-w-full divide-y divide-[#E8E8E3]">
          <thead className="bg-[#F7F6F3]">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Client</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">
                {clients[0]?.loyaltyType === 'points' ? 'Points' : 'Tampons'}
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Dernière activité</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#E8E8E3]">
            {clients.map((client) => {
              const isPoints = client.loyaltyType === 'points'
              const target = isPoints ? client.pointsRequired : client.stampsRequired
              const current = isPoints ? client.points : client.stamps_count
              const pct = Math.min(100, Math.round((current / target) * 100))
              const isRewardPending = current >= target
              const isAlmostFull = !isRewardPending && current === target - 1
              const canNotify = isPro && !!client.customer_id && subscribedSet.has(client.customer_id)
              return (
                <tr key={client.id} className="hover:bg-[#F7F6F3] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#1A1A1A]">{client.customers.first_name}</p>
                        <p className="text-xs text-[#6B6B6B]">{client.customers.phone}</p>
                      </div>
                      {canNotify && (
                        <button
                          onClick={() => openNotify(client)}
                          title="Envoyer une notification push"
                          className="text-[#6C47FF] hover:text-[#5835e0] transition-colors"
                        >
                          <Bell size={16} strokeWidth={1.9} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1">{isPoints ? <Trophy size={14} strokeWidth={1.9} /> : <WalletCards size={14} strokeWidth={1.9} />} {current}/{target}</span>
                      <div className="w-full bg-[#F7F6F3] rounded-full h-1.5 mt-1.5">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: client.primaryColor }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B6B6B]">{formatDate(client.last_stamp_at)}</td>
                  <td className="px-6 py-4">
                    {isRewardPending ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-400"><Gift size={12} strokeWidth={1.9} /> Récompense en attente</span>
                    ) : isAlmostFull ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Flame size={12} strokeWidth={1.9} /> Presque !</span>
                    ) : client.rewards_unlocked > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"><PartyPopper size={12} strokeWidth={1.9} /> {client.rewards_unlocked} récompense{client.rewards_unlocked > 1 ? 's' : ''}</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F7F6F3] text-[#6B6B6B] border border-[#E8E8E3]">En cours</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="px-5 py-3 bg-[#F7F6F3] border-t border-[#E8E8E3]">
          <p className="text-xs text-[#6B6B6B]">
            {clients.length} client{clients.length > 1 ? 's' : ''} · actualisation auto toutes les 30s
          </p>
        </div>
      </div>
    </>
  )
}
