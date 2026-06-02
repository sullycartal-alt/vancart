'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TriangleAlert, WalletCards, Bell } from 'lucide-react'

const PEEK = 72
const FULL = 520

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
}

export interface WalletCard {
  id: string
  stamps_count: number
  points: number
  rewards_unlocked: number
  first_name: string
  merchants: Merchant
}

function QRCanvas({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    import('qrcode').then((QRCode) => {
      if (canvasRef.current)
        QRCode.toCanvas(canvasRef.current, value, {
          width: 148,
          margin: 1,
          color: { dark: '#111827', light: '#ffffff' },
        })
    })
  }, [value])
  return <canvas ref={canvasRef} className="rounded-lg block" />
}

function StampCircles({ count, total, color }: { count: number; total: number; color: string }) {
  const pct = Math.min(100, Math.round((count / total) * 100))
  return (
    <div className="px-4 space-y-2">
      <div className="flex flex-wrap gap-1.5 justify-center">
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < count
          return (
            <div
              key={i}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={
                filled
                  ? { backgroundColor: 'white' }
                  : { border: '2px solid rgba(255,255,255,0.35)', backgroundColor: 'transparent' }
              }
            >
              {filled && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6.5L4.5 9L10 3"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          )
        })}
      </div>
      <div className="w-full rounded-full h-1" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
        <div className="h-1 rounded-full bg-white" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
        {count} / {total} tampons
      </p>
    </div>
  )
}

function PointsProgress({ count, total }: { count: number; total: number }) {
  const pct = Math.min(100, Math.round((count / total) * 100))
  return (
    <div className="px-4 space-y-1.5">
      <div className="w-full rounded-full" style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.2)' }}>
        <div className="rounded-full bg-white" style={{ height: 4, width: `${pct}%` }} />
      </div>
      <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
        {count} / {total} pts
      </p>
    </div>
  )
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
      <p style={{ fontSize: 11, color: 'rgba(255,100,100,0.85)', textAlign: 'center', padding: '0 16px' }}>
        Notifications bloquées — modifiez vos réglages
      </p>
    )
  }

  if (permission === 'granted' && subscribed) {
    return (
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textAlign: 'center', padding: '0 16px' }}>
        <Bell size={11} strokeWidth={1.9} style={{ display: 'inline-block', marginRight: 4, verticalAlign: 'middle' }} /> Notifications activées
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
          backgroundColor: 'rgba(255,255,255,0.15)',
          border: '1px solid rgba(255,255,255,0.25)',
          color: 'white',
          fontSize: 12,
          fontWeight: 600,
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? '…' : <><Bell size={12} strokeWidth={1.9} style={{ display: 'inline-block', marginRight: 4, verticalAlign: 'middle' }} /> Activer les notifications</>}
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
        const count = isPoints ? (card.points ?? 0) : card.stamps_count
        const total = isPoints ? (merchant.points_required ?? 100) : merchant.stamps_required
        const displayValue = count
        const top =
          openIdx !== null && i > openIdx ? i * PEEK + (FULL - PEEK) : i * PEEK
        const height = isOpen ? FULL : PEEK

        return (
          <div
            key={card.id}
            className="absolute left-3 right-3 overflow-hidden"
            style={{
              top,
              height,
              borderRadius: 18,
              backgroundColor: color,
              zIndex: isOpen ? 100 : cards.length - i,
              transition: 'top 0.4s ease, height 0.4s ease',
            }}
          >
            {/* Header — always visible at 72px */}
            <div
              className="flex items-center justify-between px-4 cursor-pointer select-none"
              style={{ height: PEEK, flexShrink: 0 }}
              onClick={() => setOpenIdx(isOpen ? null : i)}
            >
              {/* Left: logo square + merchant name */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    overflow: 'hidden',
                  }}
                >
                  {merchant.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={merchant.logo_url}
                      alt=""
                      width={44}
                      height={44}
                      style={{ objectFit: 'contain', width: 44, height: 44 }}
                    />
                  ) : (
                    <span style={{ color: 'white', fontWeight: 700, fontSize: 18, lineHeight: 1 }}>
                      {merchant.business_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="font-semibold text-sm truncate" style={{ color: 'white' }}>
                  {merchant.business_name}
                </span>
              </div>

              {/* Right: type label + value */}
              <div className="text-right flex-shrink-0 ml-3">
                <p
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.6)',
                    letterSpacing: '0.08em',
                    lineHeight: 1.3,
                  }}
                >
                  {isPoints ? 'Points' : 'Tampons'}
                </p>
                <p style={{ fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1 }}>
                  {displayValue}
                </p>
              </div>
            </div>

            {/* Expanded body — fades in/out */}
            <div
              className="space-y-3 pb-4"
              style={{
                opacity: isOpen ? 1 : 0,
                transition: 'opacity 0.2s ease',
                pointerEvents: isOpen ? 'auto' : 'none',
              }}
            >
              {/* Banner */}
              <div
                className="mx-3 flex items-center justify-center overflow-hidden"
                style={{
                  height: 90,
                  borderRadius: 10,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                }}
              >
                {merchant.banner_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={merchant.banner_url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <span
                    className="font-bold text-center px-4 leading-tight"
                    style={{ color: 'white', fontSize: 28 }}
                  >
                    {merchant.business_name}
                  </span>
                )}
              </div>

              {/* Card holder name */}
              <p
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.6)',
                  letterSpacing: '0.06em',
                  marginLeft: 16,
                  marginRight: 16,
                }}
              >
                Carte de {card.first_name}
              </p>

              {/* Progress: stamps or points */}
              {isPoints ? (
                <PointsProgress count={count} total={total} />
              ) : (
                <StampCircles count={count} total={total} color={color} />
              )}

              {/* QR code */}
              <div className="flex flex-col items-center gap-2 px-4">
                <div
                  className="bg-white inline-flex items-center justify-center"
                  style={{ borderRadius: 12, padding: 12 }}
                >
                  <QRCanvas value={card.id} />
                </div>
                <p
                  className="font-mono"
                  style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}
                >
                  {card.id.slice(0, 8)}…{card.id.slice(-4)}
                </p>
              </div>

              {/* Push notifications */}
              <PushButton merchantId={merchant.id} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
