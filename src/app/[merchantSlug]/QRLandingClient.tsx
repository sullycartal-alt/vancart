'use client'

import { useRef, useState } from 'react'
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useRef((() => {
    if (!active || !canvasRef.current) return
  }) as never)

  if (!active) return null

  return (
    <canvas
      ref={(canvasEl) => {
        if (!canvasEl || !active) return
        const el: HTMLCanvasElement = canvasEl
        const ctx = el.getContext('2d')!
        el.width = window.innerWidth
        el.height = window.innerHeight
        const colors = [color, '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6']
        const pieces = Array.from({ length: 130 }, () => ({
          x: Math.random() * el.width, y: -20 - Math.random() * 80,
          vx: (Math.random() - 0.5) * 5, vy: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          w: Math.random() * 10 + 4, h: Math.random() * 6 + 3,
          angle: Math.random() * Math.PI * 2, va: (Math.random() - 0.5) * 0.15,
        }))
        let id: number
        let frame = 0
        const max = 200
        function draw() {
          ctx.clearRect(0, 0, el.width, el.height)
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
          else ctx.clearRect(0, 0, el.width, el.height)
        }
        id = requestAnimationFrame(draw)
        return () => cancelAnimationFrame(id)
      }}
      className="fixed inset-0 pointer-events-none z-[60]"
    />
  )
}

function StampGrid({ total, filled, color }: { total: number; filled: number; color: string }) {
  const count = Math.min(total, 20)
  return (
    <div className="flex flex-wrap gap-2.5 justify-center">
      {Array.from({ length: count }).map((_, i) => {
        const isFilled = i < filled
        return (
          <div
            key={i}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: isFilled ? color : 'transparent',
              border: isFilled ? 'none' : `1.5px solid ${color}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {isFilled ? '✓' : ''}
          </div>
        )
      })}
    </div>
  )
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
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

  const handle = merchant.instagram_handle?.replace(/^@/, '')

  if (submitted && cardId) {
    const cardUrl = `/carte/${cardId}`
    return (
      <div className="min-h-screen bg-[#F8F7FF]">
        <ConfettiCanvas active={confettiActive} color={color} />

        {/* Success header */}
        <div
          className="relative px-6 pt-16 pb-20 flex flex-col items-center text-center"
          style={{ background: color }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-4"
            style={{ background: 'rgba(255,255,255,0.95)' }}
          >
            {merchant.logo_url && !logoError ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={merchant.logo_url}
                alt={merchant.business_name}
                className="w-10 h-10 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-2xl font-bold" style={{ color }}>
                {merchant.business_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold" style={{ color: tc }}>{merchant.business_name}</h1>
          <div
            className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.2)', color: tc }}
          >
            ✓ Carte créée, {firstName} !
          </div>
        </div>

        {/* Body card */}
        <div
          className="relative -mt-6 bg-white rounded-t-3xl px-5 pt-6 pb-10 max-w-sm mx-auto space-y-4"
          style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.06)' }}
        >
          {/* Stamp count */}
          <div className="text-center">
            <p className="text-4xl font-black tabular-nums" style={{ color }}>0</p>
            <p className="text-sm text-gray-400 mt-0.5">/ {merchant.stamps_required} tampons</p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="h-1.5 rounded-full w-0" style={{ background: color }} />
            </div>
          </div>

          <div className="rounded-xl px-4 py-3 text-center" style={{ background: `${color}12` }}>
            <p className="text-sm font-semibold" style={{ color }}>
              🎯 {merchant.stamps_required} tampon{merchant.stamps_required > 1 ? 's' : ''} pour votre récompense
            </p>
          </div>

          {/* See card */}
          <a
            href={cardUrl}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl text-sm font-bold transition-all active:scale-95"
            style={{
              background: color,
              color: tc,
              boxShadow: `0 4px 20px ${color}50`,
            }}
          >
            Voir ma carte →
          </a>
          <p className="text-xs text-center text-gray-400">📌 Mettez cette page en favori</p>

          {/* Wallet */}
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
          <div className="flex items-center justify-center w-full py-3.5 rounded-2xl bg-gray-50 border border-gray-100 cursor-not-allowed">
            <span className="text-sm font-medium text-gray-300">Apple Wallet — bientôt</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF]" style={{ fontFamily: 'var(--font-jakarta, sans-serif)' }}>

      {/* ── Header ~40vh ─────────────────────────────────────────────── */}
      <div
        className="relative px-6 pb-16 flex flex-col items-center text-center"
        style={{ background: color, minHeight: '42vh', paddingTop: 'max(env(safe-area-inset-top), 48px)' }}
      >
        {/* Logo circle */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-4"
          style={{ background: 'rgba(255,255,255,0.97)' }}
        >
          {merchant.logo_url && !logoError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={merchant.logo_url}
              alt={merchant.business_name}
              className="w-10 h-10 object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-2xl font-bold" style={{ color }}>
              {merchant.business_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight" style={{ color: tc }}>
          {merchant.business_name}
        </h1>

        {merchant.description && (
          <p className="text-sm mt-1.5 max-w-xs leading-relaxed" style={{ color: tc, opacity: 0.8 }}>
            {merchant.description}
          </p>
        )}

        {/* Loyalty rule pill */}
        <div
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-semibold"
          style={{ background: 'rgba(255,255,255,0.18)', color: tc }}
        >
          🎴 {merchant.loyalty_rule}
        </div>

        {/* Instagram */}
        {handle && (
          <a
            href={`https://instagram.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-xs transition-opacity hover:opacity-100"
            style={{ color: tc, opacity: 0.65 }}
          >
            <InstagramIcon />
            @{handle}
          </a>
        )}
      </div>

      {/* ── Body card (overlaps header) ──────────────────────────────── */}
      <div
        className="relative -mt-6 bg-white rounded-t-3xl max-w-sm mx-auto px-5 pt-6 pb-10 space-y-7"
        style={{ boxShadow: '0 -4px 32px rgba(0,0,0,0.07)' }}
      >

        {/* ── Stamps ─────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <StampGrid total={merchant.stamps_required} filled={0} color={color} />

          <div className="space-y-1.5">
            <p className="text-sm text-center text-gray-400">
              0 / {merchant.stamps_required} tampons
            </p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-1.5 rounded-full w-0" style={{ background: color }} />
            </div>
          </div>
        </div>

        {/* ── Divider ────────────────────────────────────────────────── */}
        <div className="border-t border-gray-100" />

        {/* ── Registration form ──────────────────────────────────────── */}
        <div className="space-y-5">
          <div className="text-center space-y-2">
            <h2 className="text-base font-bold text-gray-900">Rejoignez le programme</h2>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: `${color}15`, color }}
            >
              Gratuit · 30 secondes
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <input
                {...register('first_name')}
                type="text"
                id="first_name"
                placeholder="Prénom"
                autoComplete="given-name"
                className="block w-full px-4 py-3.5 text-base text-gray-900 rounded-xl border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{
                  background: '#F8F7FF',
                  '--tw-ring-color': `${color}55`,
                } as React.CSSProperties}
              />
              {errors.first_name && (
                <p className="mt-1.5 text-xs text-red-500">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                placeholder="Numéro de téléphone"
                autoComplete="tel"
                className="block w-full px-4 py-3.5 text-base text-gray-900 rounded-xl border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{
                  background: '#F8F7FF',
                  '--tw-ring-color': `${color}55`,
                } as React.CSSProperties}
              />
              {errors.phone && (
                <p className="mt-1.5 text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {errors.root && (
              <div className="rounded-xl bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: color,
                color: tc,
                height: 56,
                borderRadius: 14,
                boxShadow: isSubmitting ? 'none' : `0 4px 20px ${color}45`,
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

          <p className="text-[11px] text-center text-gray-300 leading-relaxed">
            En continuant, vous acceptez que vos données soient utilisées pour ce programme de fidélité.{' '}
            <a href="/politique-confidentialite" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-500 transition-colors">
              Confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
