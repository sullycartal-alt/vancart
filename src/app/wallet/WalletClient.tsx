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

function NotificationBanner({ merchantIds }: { merchantIds: string[] }) {
  const [visible, setVisible] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  useEffect(() => {
    if (localStorage.getItem('push_dismissed')) return
    const supported = 'Notification' in window && 'PushManager' in window && 'serviceWorker' in navigator
    if (!supported || Notification.permission !== 'default') return
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  async function activate() {
    setStatus('loading')
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setStatus('idle'); return }
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) { setStatus('idle'); return }
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const sub = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      const customerId = getCookie('vancart_customer_id')
      if (!customerId) { setStatus('idle'); return }
      const subJson = sub.toJSON()
      await Promise.all(
        merchantIds.map((merchantId) =>
          fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer_id: customerId, merchant_id: merchantId, subscription: subJson }),
          })
        )
      )
      setStatus('success')
      setTimeout(() => setVisible(false), 2000)
    } catch {
      setStatus('idle')
    }
  }

  function dismiss() {
    localStorage.setItem('push_dismissed', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        backgroundColor: 'white',
        border: '1px solid #E8E8E3',
        borderRadius: 12,
        padding: '12px 16px',
        marginBottom: 16,
      }}
    >
      {status === 'success' ? (
        <span style={{ fontSize: 13, fontWeight: 600, color: '#22c55e' }}>Notifications activées ✓</span>
      ) : (
        <>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', flex: '1 1 auto', minWidth: 0 }}>
            🔔 Recevez les offres de vos commerçants
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              onClick={activate}
              disabled={status === 'loading'}
              style={{
                backgroundColor: '#6C47FF',
                color: 'white',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 8,
                padding: '6px 12px',
                border: 'none',
                cursor: status === 'loading' ? 'wait' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
              }}
            >
              {status === 'loading' ? '…' : 'Activer'}
            </button>
            <button
              onClick={dismiss}
              aria-label="Fermer"
              style={{ color: '#6B6B6B', background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', padding: 4, lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
        </>
      )}
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
    <div>
      <NotificationBanner merchantIds={[...new Set(cards.map((c) => c.merchants.id))]} />
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
    </div>
  )
}
