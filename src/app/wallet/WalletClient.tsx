'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TriangleAlert, WalletCards } from 'lucide-react'
import LoyaltyCardMockup from '@/components/loyalty/LoyaltyCardMockup'

const PEEK = 72
const FULL = 600

interface Merchant {
  id: string
  business_name: string
  primary_color: string
  loyalty_rule: string
  stamps_required: number
  loyalty_type: string | null
  points_required: number | null
  logo_url: string | null
  banner_url: string | null
  plan: string | null
}

export interface WalletCard {
  id: string
  stamps_count: number
  points: number
  rewards_unlocked: number
  first_name: string
  merchants: Merchant
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function PushButton({ merchantId }: { merchantId: string }) {
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('PushManager' in window) || !('serviceWorker' in navigator)) return
    setPermission(Notification.permission)
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(async (reg) => {
        const sub = await reg.pushManager.getSubscription()
        setSubscribed(!!sub)
      })
    }
  }, [])

  async function activate() {
    if (!('Notification' in window) || !('PushManager' in window)) return
    setLoading(true)
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) return
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const sub = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      const customerId = getCookie('vancart_customer_id')
      if (!customerId) return
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, merchant_id: merchantId, subscription: sub.toJSON() }),
      })
      setSubscribed(true)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  if (permission === null) return null

  if (permission === 'denied') {
    return (
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textAlign: 'center', padding: '8px 16px', fontWeight: 600 }}>
        Notifications bloquées — vérifiez vos réglages
      </p>
    )
  }

  if (permission === 'granted' && subscribed) {
    return (
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textAlign: 'center', padding: '8px 16px', fontWeight: 600 }}>
        Notifications activées ✓
      </p>
    )
  }

  return (
    <div style={{ padding: '0 16px' }}>
      <button
        onClick={activate}
        disabled={loading}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 10,
          backgroundColor: '#6C47FF',
          border: '1px solid rgba(255,255,255,0.25)',
          color: 'white',
          fontSize: 12,
          fontWeight: 600,
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? '…' : '🔔 Activer les notifications'}
      </button>
    </div>
  )
}

export default function WalletClient({ cards, error }: { cards: WalletCard[]; error?: boolean }) {
  const router = useRouter()
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 30000)
    return () => clearInterval(interval)
  }, [router])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (openIdx === null) return
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenIdx(null)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [openIdx])

  if (error) {
    return (
      <div className="bg-white border border-[#E8E8E3] rounded-2xl p-8 text-center space-y-4">
        <TriangleAlert size={28} strokeWidth={1.9} className="text-[#6B6B6B] mx-auto" />
        <p className="text-sm text-[#6B6B6B]">Impossible de charger vos cartes.</p>
        <button
          onClick={() => router.refresh()}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#6C47FF' }}
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="bg-white border border-[#E8E8E3] rounded-2xl p-8 text-center space-y-3">
        <WalletCards size={28} strokeWidth={1.9} className="text-[#6B6B6B] mx-auto" />
        <p className="text-sm text-[#6B6B6B]">Vous n&apos;avez pas encore de carte de fidélité.</p>
      </div>
    )
  }

  const containerHeight =
    openIdx === null ? cards.length * PEEK : cards.length * PEEK + (FULL - PEEK)

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: containerHeight, transition: 'height 0.4s ease' }}
    >
      {cards.map((card, i) => {
        const isOpen = openIdx === i
        const merchant = card.merchants
        const color = merchant.primary_color || '#6C47FF'
        const isPoints = merchant.loyalty_type === 'points'
        const top =
          openIdx !== null && i > openIdx ? i * PEEK + (FULL - PEEK) : i * PEEK

        return (
          <div
            key={card.id}
            className="absolute left-3 right-3 overflow-hidden"
            style={{
              top,
              height: isOpen ? FULL : PEEK,
              borderRadius: 18,
              backgroundColor: color,
              zIndex: isOpen ? 100 : cards.length - i,
              transition: 'top 0.4s ease, height 0.4s ease',
            }}
          >
            {/* Full mockup — clipped to PEEK height when collapsed */}
            <LoyaltyCardMockup
              cardId={card.id}
              width="100%"
              primaryColor={color}
              businessName={merchant.business_name}
              logoUrl={merchant.logo_url ?? undefined}
              bannerUrl={merchant.banner_url ?? undefined}
              loyaltyType={(merchant.loyalty_type ?? 'stamps') as 'stamps' | 'points'}
              stampsRequired={merchant.stamps_required}
              pointsRequired={merchant.points_required ?? 100}
              loyaltyRule={merchant.loyalty_rule}
              clientName={card.first_name}
              currentStamps={isPoints ? 0 : card.stamps_count}
              currentPoints={isPoints ? (card.points ?? 0) : 0}
            />

            {/* Push notifications — feature client, dispo pour toutes les cartes, visible quand ouvert */}
            {isOpen && (
              <div style={{ padding: '8px 16px 16px', backgroundColor: color }}>
                <PushButton merchantId={merchant.id} />
              </div>
            )}

            {/* Transparent click zone over Zone 1 (header) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: PEEK,
                cursor: 'pointer',
                zIndex: 5,
              }}
              onClick={() => setOpenIdx(isOpen ? null : i)}
            />
          </div>
        )
      })}
    </div>
  )
}
