'use client'

import { useEffect, useRef, useState } from 'react'

interface Merchant {
  business_name: string
  logo_url: string | null
  primary_color: string
  loyalty_rule: string
  stamps_required: number
  loyalty_type?: string
  points_required?: number
}

interface CardData {
  id: string
  stamps_count: number
  points: number
  rewards_unlocked: number
  merchants: Merchant
  customers: { first_name: string }
}

function textColorFor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#1f2937' : '#ffffff'
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

function StampGrid({ count, total, color, newStampIdx }: {
  count: number; total: number; color: string; newStampIdx: number | null
}) {
  const tc = textColorFor(color)
  const display = Math.min(total, 20)
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2.5 justify-center">
        {Array.from({ length: display }).map((_, i) => {
          const filled = i < count
          const isNew = newStampIdx === i
          return (
            <div
              key={i}
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500"
              style={filled
                ? {
                    backgroundColor: color,
                    color: tc,
                    boxShadow: isNew ? `0 0 16px ${color}90, 0 2px 8px ${color}60` : `0 2px 6px ${color}40`,
                    transform: isNew ? 'scale(1.2)' : 'scale(1)',
                    animation: isNew ? 'stamp-pop 0.45s cubic-bezier(0.16,1,0.3,1) both' : undefined,
                  }
                : {
                    backgroundColor: '#f3f4f6',
                    border: '2px dashed #e5e7eb',
                    color: 'transparent',
                  }}
            >
              {filled ? '✓' : '·'}
            </div>
          )
        })}
        {total > 20 && (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-xs text-gray-400 font-medium">
            +{total - 20}
          </div>
        )}
      </div>
      <p className="text-center text-sm text-gray-500">
        <span className="font-bold text-gray-900">{count}</span>
        <span className="text-gray-300"> / {total}</span>
        {' '}tampons
      </p>
    </div>
  )
}

function PointsBar({ count, total, color }: { count: number; total: number; color: string }) {
  const pct = Math.min(100, Math.round((count / total) * 100))
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-5xl font-bold tabular-nums" style={{ color }}>{count}</span>
          <span className="text-2xl text-gray-300 font-light"> / {total}</span>
        </div>
        <span className="text-sm text-gray-400 pb-2">points</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div className="h-3 rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function CardClient({ initialCard }: { initialCard: CardData }) {
  const [card, setCard] = useState(initialCard)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [confettiActive, setConfettiActive] = useState(false)
  const [newStampIdx, setNewStampIdx] = useState<number | null>(null)
  const [showRewardQR, setShowRewardQR] = useState(false)
  const prevCount = useRef(initialCard.stamps_count)

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
        const req = next.merchants.stamps_required
        if (newCount > prevCount.current) {
          const idx = Math.min(newCount, req) - 1
          setNewStampIdx(idx)
          setTimeout(() => setNewStampIdx(null), 1600)
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
  const tc = textColorFor(color)
  const isPoints = merchant.loyalty_type === 'points'
  const count = isPoints ? (card.points ?? 0) : card.stamps_count
  const total = isPoints ? (merchant.points_required ?? 100) : merchant.stamps_required
  const isComplete = count >= total
  const left = total - Math.min(count, total)

  return (
    <div className="min-h-screen pb-8" style={{ background: `linear-gradient(160deg, ${color}18 0%, #f9fafb 60%)` }}>
      <ConfettiCanvas active={confettiActive} color={color} />

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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

      <div className="max-w-sm mx-auto px-4 pt-6 space-y-4">

        {/* Physical card */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
        >
          {/* Header */}
          <div className="px-6 pt-7 pb-5 text-center">
            {merchant.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={merchant.logo_url}
                alt={merchant.business_name}
                className="h-12 w-auto mx-auto mb-3 object-contain"
                style={{ filter: tc === '#ffffff' ? 'brightness(0) invert(1)' : 'none' }}
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${tc}20` }}>
                <span className="text-2xl font-bold" style={{ color: tc }}>{merchant.business_name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <h1 className="text-xl font-bold tracking-tight" style={{ color: tc }}>{merchant.business_name}</h1>
            <p className="text-xs mt-1 opacity-75" style={{ color: tc }}>{merchant.loyalty_rule}</p>
            <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${tc}20`, color: tc }}>
              Carte de {card.customers.first_name}
            </div>
          </div>

          {/* Stamp / points area — glass panel */}
          <div className="mx-4 mb-4 rounded-2xl p-5" style={{ backgroundColor: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(12px)' }}>
            {isPoints
              ? <PointsBar count={count} total={total} color={color} />
              : <StampGrid count={count} total={total} color={color} newStampIdx={newStampIdx} />
            }
          </div>

          {/* Status bar */}
          <div className="mx-4 mb-5 rounded-xl px-4 py-2.5 text-center" style={{ backgroundColor: `${tc}18` }}>
            {(() => {
              const unit = isPoints ? 'pt' : 'tampon'
              const unitPlural = isPoints ? 'pts' : 'tampons'
              const pct = Math.round((count / total) * 100)
              let msg: string
              if (isComplete) {
                msg = '🎉 Récompense prête ! Montrez cette carte au commerçant.'
              } else if (pct >= 95) {
                msg = `😍 Plus que ${left} ${left === 1 ? unit : unitPlural}... votre récompense vous attend !`
              } else if (pct >= 90) {
                msg = `🚀 Ça sent la récompense, plus que ${left} ${left === 1 ? unit : unitPlural} !`
              } else if (pct >= 80) {
                msg = '💪 Vous y êtes presque, encore un effort !'
              } else if (pct >= 70) {
                msg = `🔥 C'est pour bientôt, plus que ${left} ${left === 1 ? unit : unitPlural} !`
              } else if (pct >= 50) {
                msg = '⚡ Vous êtes à mi-chemin, continuez !'
              } else {
                msg = `🎯 Plus que ${left} ${left === 1 ? unit : unitPlural} pour votre récompense`
              }
              return <p className="text-xs font-semibold" style={{ color: tc }}>{msg}</p>
            })()}
          </div>
        </div>

        {/* QR code */}
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center space-y-3">
          <p className="text-sm font-semibold text-gray-800">Présentez ce QR code au commerçant</p>
          <div className="flex justify-center"><QRCanvas value={card.id} /></div>
        </div>

        {/* Reward QR block — shown when card is complete */}
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

        {/* Google Wallet — prominent */}
        <a
          href={`/api/wallet/google?card_id=${card.id}`}
          className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-sm font-semibold text-gray-700">Ajouter à Google Wallet</span>
        </a>

        <div className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gray-50 border border-gray-100 cursor-not-allowed">
          <span className="text-sm font-medium text-gray-300">Apple Wallet — bientôt</span>
        </div>

        {/* Bookmark hint */}
        <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: `${color}10` }}>
          <p className="text-xs font-medium" style={{ color }}>📌 Mettez cette page en favori pour retrouver votre carte</p>
          {lastUpdated && (
            <p className="text-xs mt-1 opacity-50" style={{ color }}>
              Mis à jour à {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {card.rewards_unlocked > 0 && (
          <p className="text-xs text-center text-gray-300">
            🏆 {card.rewards_unlocked} récompense{card.rewards_unlocked > 1 ? 's' : ''} obtenue{card.rewards_unlocked > 1 ? 's' : ''} au total
          </p>
        )}
      </div>
    </div>
  )
}
