'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const customerSchema = z.object({
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  first_name: z.string().min(1, 'Le prénom est requis'),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface Merchant {
  id: string
  business_name: string
  slug: string
  logo_url: string | null
  primary_color: string
  loyalty_rule: string
  stamps_required: number
  description?: string | null
  instagram_handle?: string | null
}

interface Props {
  merchant: Merchant
}

function textColorFor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#1f2937' : '#ffffff'
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

function StampPreview({ total, color }: { total: number; color: string }) {
  const display = Math.min(total, 10)
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-3">
      {Array.from({ length: display }).map((_, i) => (
        <div
          key={i}
          className="w-7 h-7 rounded-full border-2"
          style={{
            borderColor: `${textColorFor(color)}40`,
            backgroundColor: i === 0 ? `${textColorFor(color)}30` : 'transparent',
          }}
        />
      ))}
      {total > 10 && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium"
          style={{ color: `${textColorFor(color)}70` }}>
          +{total - 10}
        </div>
      )}
    </div>
  )
}

export default function QRLandingClient({ merchant }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [cardId, setCardId] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [logoError, setLogoError] = useState(false)
  const [confettiActive, setConfettiActive] = useState(false)

  const color = /^#[0-9a-f]{6}$/i.test(merchant.primary_color)
    ? merchant.primary_color
    : '#4f46e5'
  const tc = textColorFor(color)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  })

  async function onSubmit(data: CustomerFormData) {
    try {
      const customerRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: data.phone, first_name: data.first_name }),
      })

      if (!customerRes.ok) {
        const err = await customerRes.json()
        setError('root', { message: err.error ?? 'Une erreur est survenue' })
        return
      }

      const customer = await customerRes.json()

      const cardRes = await fetch('/api/loyalty-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchant_id: merchant.id, customer_id: customer.id }),
      })

      if (!cardRes.ok) {
        const err = await cardRes.json()
        setError('root', { message: err.error ?? 'Une erreur est survenue' })
        return
      }

      const card = await cardRes.json()
      setFirstName(data.first_name)
      setCardId(card.id)
      setConfettiActive(true)
      setTimeout(() => setConfettiActive(false), 3500)
      setSubmitted(true)
    } catch {
      setError('root', { message: 'Une erreur réseau est survenue' })
    }
  }

  if (submitted && cardId) {
    const cardUrl = `/carte/${cardId}`
    return (
      <div
        className="min-h-screen pb-8"
        style={{ background: `linear-gradient(160deg, ${color}18 0%, #f9fafb 60%)` }}
      >
        <ConfettiCanvas active={confettiActive} color={color} />

        <div className="max-w-sm mx-auto px-4 pt-10 space-y-4">
          {/* Success card */}
          <div
            className="rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
              animation: 'slide-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            <div className="px-6 pt-8 pb-6 text-center">
              {merchant.logo_url && !logoError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={merchant.logo_url}
                  alt={merchant.business_name}
                  className="h-12 w-auto mx-auto mb-3 object-contain"
                  onError={() => setLogoError(true)}
                  style={{ filter: tc === '#ffffff' ? 'brightness(0) invert(1)' : 'none' }}
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${tc}20` }}>
                  <span className="text-2xl font-bold" style={{ color: tc }}>{merchant.business_name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <h1 className="text-xl font-bold tracking-tight" style={{ color: tc }}>{merchant.business_name}</h1>
              <p className="text-xs mt-1 opacity-75" style={{ color: tc }}>{merchant.loyalty_rule}</p>

              {/* Success badge */}
              <div
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  color: tc,
                  animation: 'stamp-pop 0.5s 0.2s cubic-bezier(0.16,1,0.3,1) both',
                }}
              >
                <span>✓</span>
                <span>Carte créée, {firstName} !</span>
              </div>
            </div>

            {/* Glass panel */}
            <div className="mx-4 mb-5 rounded-2xl p-5 text-center space-y-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(12px)' }}>
              <p className="text-4xl font-bold tabular-nums" style={{ color }}>0</p>
              <p className="text-sm text-gray-400">/ {merchant.stamps_required} tampons</p>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
                <div className="h-2 rounded-full w-0" style={{ backgroundColor: color }} />
              </div>
            </div>

            <div className="mx-4 mb-5 rounded-xl px-4 py-2.5 text-center" style={{ backgroundColor: `${tc}18` }}>
              <p className="text-xs font-semibold" style={{ color: tc }}>
                🎯 {merchant.stamps_required} tampon{merchant.stamps_required > 1 ? 's' : ''} pour votre récompense
              </p>
            </div>
          </div>

          {/* Bookmark CTA */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3" style={{ animation: 'slide-up 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both' }}>
            <p className="text-sm font-semibold text-gray-800 text-center">Accédez à votre carte</p>
            <a
              href={cardUrl}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm"
              style={{ backgroundColor: color, color: tc, boxShadow: `0 4px 16px ${color}40` }}
            >
              Voir ma carte →
            </a>
            <p className="text-xs text-center text-gray-400">📌 Mettez cette page en favori</p>
          </div>

          {/* Google Wallet */}
          <div style={{ animation: 'slide-up 0.5s 0.2s cubic-bezier(0.16,1,0.3,1) both' }}>
            <a
              href={`/api/wallet/google?card_id=${cardId}`}
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
            <div className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gray-50 border border-gray-100 cursor-not-allowed mt-3">
              <span className="text-sm font-medium text-gray-300">Apple Wallet — bientôt</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen pb-8"
      style={{ background: `linear-gradient(160deg, ${color}12 0%, #f9fafb 55%)` }}
    >
      {/* Hero */}
      <div
        className="px-6 pt-14 pb-16 text-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, ${tc} 1px, transparent 1px), radial-gradient(circle at 80% 20%, ${tc} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />

        <div className="relative">
          {merchant.logo_url && !logoError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={merchant.logo_url}
              alt={merchant.business_name}
              className="h-16 w-auto mx-auto mb-4 object-contain drop-shadow-lg"
              onError={() => setLogoError(true)}
              style={{ filter: tc === '#ffffff' ? 'brightness(0) invert(1)' : 'none' }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ backgroundColor: `${tc}25` }}
            >
              <span className="text-4xl font-bold" style={{ color: tc }}>
                {merchant.business_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <h1 className="text-2xl font-bold tracking-tight" style={{ color: tc }}>
            {merchant.business_name}
          </h1>
          {merchant.description && (
            <p className="text-sm mt-1 opacity-80" style={{ color: tc }}>{merchant.description}</p>
          )}

          <div
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ backgroundColor: `${tc}20`, color: tc }}
          >
            🎴 {merchant.loyalty_rule}
          </div>

          <StampPreview total={merchant.stamps_required} color={color} />

          {merchant.instagram_handle && (
            <a
              href={`https://instagram.com/${merchant.instagram_handle.replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-xs opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: tc }}
            >
              📸 @{merchant.instagram_handle.replace(/^@/, '')}
            </a>
          )}
        </div>
      </div>

      {/* Form card — floats over the hero */}
      <div className="max-w-sm mx-auto px-4 -mt-6">
        <div
          className="bg-white rounded-3xl shadow-2xl p-6 space-y-5"
          style={{ animation: 'slide-up 0.45s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          <div className="text-center">
            <h2 className="text-base font-bold text-gray-900">Rejoignez le programme de fidélité</h2>
            <p className="text-sm text-gray-400 mt-0.5">Gratuit · 30 secondes</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="first_name" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Prénom
              </label>
              <input
                {...register('first_name')}
                type="text"
                id="first_name"
                placeholder="Jean-Baptiste"
                autoComplete="given-name"
                className="block w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base text-gray-900 bg-white shadow-sm focus:border-transparent focus:outline-none focus:ring-2 transition-all"
                style={{ '--tw-ring-color': `${color}60` } as React.CSSProperties}
              />
              {errors.first_name && (
                <p className="mt-1.5 text-xs text-red-500">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Téléphone
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                placeholder="+33 6 12 34 56 78"
                autoComplete="tel"
                className="block w-full rounded-2xl border border-gray-200 px-4 py-3.5 text-base text-gray-900 bg-white shadow-sm focus:border-transparent focus:outline-none focus:ring-2 transition-all"
                style={{ '--tw-ring-color': `${color}60` } as React.CSSProperties}
              />
              {errors.phone && (
                <p className="mt-1.5 text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {errors.root && (
              <div className="rounded-2xl bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 rounded-2xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style={{
                backgroundColor: color,
                color: tc,
                boxShadow: isSubmitting ? 'none' : `0 4px 20px ${color}50`,
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 rounded-full border-current border-t-transparent animate-spin" />
                  Création en cours…
                </span>
              ) : (
                'Obtenir ma carte gratuite →'
              )}
            </button>
          </form>

          <p className="text-xs text-center text-gray-400 leading-relaxed">
            En continuant, vous acceptez que vos données soient utilisées pour ce programme de fidélité.{' '}
            <a href="/politique-confidentialite" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
              Confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
