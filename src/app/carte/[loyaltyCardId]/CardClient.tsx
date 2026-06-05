'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import InstallBanner from '@/components/pwa/InstallBanner'
import LoyaltyCardMockup from '@/components/loyalty/LoyaltyCardMockup'

interface Merchant {
  business_name: string
  logo_url: string | null
  primary_color: string
  loyalty_rule: string
  stamps_required: number
  loyalty_type?: string
  points_required?: number
  banner_url?: string | null
}

interface CardData {
  id: string
  stamps_count: number
  points: number
  rewards_unlocked: number
  merchants: Merchant
  customers: { first_name: string }
}

function QRCanvas({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    import('qrcode').then((QRCode) => {
      if (canvasRef.current)
        QRCode.toCanvas(canvasRef.current, value, { width: 210, margin: 2, color: { dark: '#111827', light: '#ffffff' } })
    })
  }, [value])
  return <canvas ref={canvasRef} className="rounded-xl" />
}

function ConfettiCanvas({ active, color }: { active: boolean; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!active || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const colors = [color, '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6']
    const pieces = Array.from({ length: 130 }, () => ({
      x: Math.random() * canvas.width, y: -20 - Math.random() * 80,
      vx: (Math.random() - 0.5) * 5, vy: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      w: Math.random() * 10 + 4, h: Math.random() * 6 + 3,
      angle: Math.random() * Math.PI * 2, va: (Math.random() - 0.5) * 0.15,
    }))
    let id: number
    let frame = 0
    const max = 200
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of pieces) {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.globalAlpha = Math.max(0, 1 - frame / max)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
        p.x += p.vx; p.y += p.vy; p.vy += 0.07; p.angle += p.va
      }
      frame++
      if (frame < max) id = requestAnimationFrame(draw)
      else ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    id = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(id)
  }, [active, color])
  if (!active) return null
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[60]" />
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export default function CardClient({ initialCard, customerId, merchantId }: {
  initialCard: CardData
  customerId: string
  merchantId: string
}) {
  const router = useRouter()
  const [card, setCard] = useState(initialCard)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [confettiActive, setConfettiActive] = useState(false)
  const [showRewardQR, setShowRewardQR] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  const prevCount = useRef(initialCard.stamps_count)

  useEffect(() => {
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    )
  }, [])

  useEffect(() => {
    const maxAge = 60 * 60 * 24 * 365
    const secure = location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `vancart_customer_id=${customerId}; max-age=${maxAge}; path=/; SameSite=Lax${secure}`
  }, [customerId])

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) return

    navigator.serviceWorker.ready.then(async (reg) => {
      try {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return
        const existing = await reg.pushManager.getSubscription()
        const sub = existing ?? await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer_id: customerId, merchant_id: merchantId, subscription: sub.toJSON() }),
        })
        /* subscription saved */
      } catch { /* permission denied or unsupported — silent */ }
    })
  }, [customerId, merchantId])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/public/card?id=${card.id}`)
        if (!res.ok) return
        const fresh = await res.json()
        const next: CardData = {
          ...fresh,
          points: fresh.points ?? 0,
          merchants: Array.isArray(fresh.merchants) ? fresh.merchants[0] : fresh.merchants,
          customers: Array.isArray(fresh.customers) ? fresh.customers[0] : fresh.customers,
        }
        const newCount = next.stamps_count
        if (newCount > prevCount.current) {
          const req = next.merchants.stamps_required
          if (newCount >= req) {
            setShowCelebration(true)
            setConfettiActive(true)
            setTimeout(() => setConfettiActive(false), 3500)
          }
        }
        prevCount.current = newCount
        setCard(next)
        setLastUpdated(new Date())
      } catch { /* silent */ }
    }, 8000)
    return () => clearInterval(interval)
  }, [card.id])

  const merchant = card.merchants
  const color = merchant.primary_color
  const isPoints = merchant.loyalty_type === 'points'
  const count = isPoints ? (card.points ?? 0) : card.stamps_count
  const total = isPoints ? (merchant.points_required ?? 100) : merchant.stamps_required
  const isComplete = count >= total

  return (
    <div className="min-h-screen pb-8" style={{ background: '#0F0D13' }}>
      <ConfettiCanvas active={confettiActive} color={color} />

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xs w-full p-8 text-center space-y-5" style={{ animation: 'celebrate 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div className="text-6xl" style={{ animation: 'stamp-pop 0.6s 0.2s both' }}>🎉</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Félicitations !</h2>
              <p className="text-gray-500 mt-1 text-sm">Votre récompense est débloquée !</p>
            </div>
            <div className="rounded-2xl p-4" style={{ backgroundColor: `${color}15` }}>
              <p className="text-sm font-semibold" style={{ color }}>{merchant.loyalty_rule}</p>
            </div>
            <button
              onClick={() => setShowCelebration(false)}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 shadow-lg"
              style={{ backgroundColor: color, boxShadow: `0 4px 16px ${color}50` }}
            >
              Montrer au commerçant
            </button>
            <button onClick={() => setShowCelebration(false)} className="text-xs text-gray-400 hover:text-gray-600">
              Fermer
            </button>
          </div>
        </div>
      )}

      {isStandalone && (
        <div className="max-w-sm mx-auto px-4 pt-4">
          <button
            onClick={() => router.push('/wallet')}
            className="flex items-center gap-1 text-sm text-[#79747F] hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Mes cartes
          </button>
        </div>
      )}

      <div className="max-w-sm mx-auto px-4 pt-6 space-y-4">

        {/* Cover card */}
        <LoyaltyCardMockup
          cardId={card.id}
          width="100%"
          primaryColor={color}
          businessName={merchant.business_name}
          logoUrl={merchant.logo_url ?? undefined}
          bannerUrl={merchant.banner_url ?? undefined}
          loyaltyType={isPoints ? 'points' : 'stamps'}
          stampsRequired={merchant.stamps_required}
          pointsRequired={merchant.points_required ?? 100}
          loyaltyRule={merchant.loyalty_rule}
          clientName={card.customers.first_name}
          currentStamps={isPoints ? 0 : card.stamps_count}
          currentPoints={isPoints ? (card.points ?? 0) : 0}
        />

        {/* Reward QR — shown when card is complete */}
        {isComplete && (
          <div className="border-2 border-amber-400 bg-amber-50 rounded-2xl p-5 text-center space-y-3" style={{ boxShadow: '0 0 0 4px #fef3c720' }}>
            <p className="text-base font-bold text-amber-800">🎁 Récompense prête !</p>
            <p className="text-sm text-amber-700">{merchant.loyalty_rule}</p>
            {showRewardQR ? (
              <div className="space-y-3">
                <div className="flex justify-center bg-white rounded-xl p-3">
                  <QRCanvas value={`REWARD:${card.id}`} />
                </div>
                <p className="text-xs font-semibold text-amber-700">Montrez ce QR code doré au commerçant</p>
                <button
                  onClick={() => setShowRewardQR(false)}
                  className="text-xs text-amber-500 underline hover:text-amber-700"
                >
                  Masquer
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowRewardQR(true)}
                className="w-full py-3 rounded-xl font-semibold text-sm text-amber-900 bg-amber-400 hover:bg-amber-500 active:scale-[0.98] transition-all shadow-md"
              >
                Demander ma récompense →
              </button>
            )}
          </div>
        )}

        {/* Google Wallet */}
        <a
          href={`/api/wallet/google?card_id=${card.id}`}
          className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl bg-[#1C1A22] border border-[#2a2730] hover:bg-[#242130] transition-all active:scale-[0.98]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-sm font-semibold text-white">Ajouter à Google Wallet</span>
        </a>

        <div className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#1C1A22] border border-[#2a2730] cursor-not-allowed">
          <span className="text-sm font-medium text-[#4a4758]">Apple Wallet — bientôt</span>
        </div>

        {/* Bookmark hint */}
        <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: `${color}14`, border: `1px solid ${color}25` }}>
          <p className="text-xs font-medium" style={{ color }}>📌 Mettez cette page en favori pour retrouver votre carte</p>
          {lastUpdated && (
            <p className="text-xs mt-1" style={{ color, opacity: 0.5 }}>
              Mis à jour à {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {card.rewards_unlocked > 0 && (
          <p className="text-xs text-center" style={{ color: '#4a4758' }}>
            🏆 {card.rewards_unlocked} récompense{card.rewards_unlocked > 1 ? 's' : ''} obtenue{card.rewards_unlocked > 1 ? 's' : ''} au total
          </p>
        )}
      </div>

      <InstallBanner />

      <style>{`
        @keyframes celebrate {
          from { opacity: 0; transform: scale(0.85) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes stamp-pop {
          0% { transform: scale(0.4); opacity: 0; }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
