'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Props {
  campaign?: string
}

// ── Confetti ──────────────────────────────────────────────────────────────────
function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!active || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const colors = ['#6C47FF', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6']
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 80,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      w: Math.random() * 10 + 4,
      h: Math.random() * 6 + 3,
      angle: Math.random() * Math.PI * 2,
      va: (Math.random() - 0.5) * 0.15,
    }))
    let rafId: number
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
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.07
        p.angle += p.va
      }
      frame++
      if (frame < max) rafId = requestAnimationFrame(draw)
      else ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    rafId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafId)
  }, [active])

  if (!active) return null
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  )
}

// ── Wallet preview card ────────────────────────────────────────────────────────
function WalletCard({ color = '#6C47FF' }: { color?: string }) {
  const stampsTotal = 8
  const stampsDone = 3
  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-2xl select-none mx-auto"
      style={{ maxWidth: 320, background: `linear-gradient(145deg, ${color} 0%, #4a2dbf 100%)` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
          CA
        </div>
        <div>
          <p className="text-white/60 text-xs leading-none">Carte de fidélité</p>
          <p className="text-white font-bold text-sm leading-tight mt-0.5">Café Demo ☕</p>
        </div>
        <div className="ml-auto">
          <div className="bg-white/10 rounded-lg px-2 py-0.5">
            <p className="text-white/80 text-[10px] font-semibold">MEMBRE</p>
          </div>
        </div>
      </div>

      {/* Stamps grid */}
      <div className="px-5 pb-3">
        <p className="text-white/60 text-xs mb-2.5">
          {stampsDone}/{stampsTotal} tampons — encore {stampsTotal - stampsDone} pour votre récompense
        </p>
        <div className="flex gap-1">
          {Array.from({ length: stampsTotal }).map((_, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
              style={
                i < stampsDone
                  ? { background: 'rgba(255,255,255,0.9)', color: color }
                  : { border: '2px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.4)' }
              }
            >
              {i < stampsDone ? '✓' : ''}
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${(stampsDone / stampsTotal) * 100}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
            <rect x="2" y="2" width="16" height="16" rx="2" stroke="rgba(255,255,255,0.6)" strokeWidth="3" fill="none"/>
            <rect x="46" y="2" width="16" height="16" rx="2" stroke="rgba(255,255,255,0.6)" strokeWidth="3" fill="none"/>
            <rect x="2" y="46" width="16" height="16" rx="2" stroke="rgba(255,255,255,0.6)" strokeWidth="3" fill="none"/>
            <rect x="6" y="6" width="8" height="8" fill="rgba(255,255,255,0.6)"/>
            <rect x="50" y="6" width="8" height="8" fill="rgba(255,255,255,0.6)"/>
            <rect x="6" y="50" width="8" height="8" fill="rgba(255,255,255,0.6)"/>
          </svg>
          <span className="text-white/60 text-[10px] font-medium">Scanner en caisse</span>
        </div>
        <p className="text-white/30 text-[9px] font-mono">VC-DEMO</p>
      </div>
    </div>
  )
}

// ── Steps data ─────────────────────────────────────────────────────────────────
const STEPS = [
  {
    icon: '⚡',
    title: 'Créez votre carte',
    desc: 'Nom, couleur, logo. C\'est tout.',
  },
  {
    icon: '📱',
    title: 'Posez le QR code en caisse',
    desc: 'Vos clients scannent, la carte apparaît dans leur téléphone.',
  },
  {
    icon: '🏆',
    title: 'Ils reviennent',
    desc: 'Points, tampons, récompenses. Automatique.',
  },
]

// ── Pricing data ───────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Découverte',
    price: 'Gratuit',
    period: '',
    sub: '1 mois · Sans carte bancaire',
    features: ['1 carte de fidélité', "Jusqu'à 50 clients", 'Google & Apple Wallet', 'Stats basiques', 'Rendez-vous de suivi avec l\'équipe VanCart'],
    cta: 'Démarrer gratuitement',
    highlight: false,
    badge: 'Pour commencer',
  },
  {
    name: 'Essentiel',
    price: '29€',
    period: '/mois',
    sub: 'Sans engagement',
    features: ['1 carte de fidélité', "Jusqu'à 500 clients", 'Stats avancées', 'Support prioritaire'],
    cta: 'Choisir Essentiel',
    highlight: true,
    badge: 'Le plus populaire',
  },
  {
    name: 'Pro',
    price: '59€',
    period: '/mois',
    sub: 'Sans engagement',
    features: ['Clients illimités', 'Conseiller IA Mistral 🇫🇷', 'Notifications push', 'Export données'],
    cta: 'Choisir Pro',
    highlight: false,
    badge: null,
  },
]

// ── Form state ─────────────────────────────────────────────────────────────────
interface FormState {
  prenom: string
  commerce: string
  adresse_commerce: string
  email: string
  telephone: string
  logiciel_caisse: string
  message: string
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DemoPage({ campaign }: Props) {
  const COLOR = '#6C47FF'

  const formRef = useRef<HTMLDivElement>(null)
  const [ctaVisible, setCtaVisible] = useState(true)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [form, setForm] = useState<FormState>({ prenom: '', commerce: '', adresse_commerce: '', email: '', telephone: '', logiciel_caisse: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hide sticky CTA when form section reaches viewport
  useEffect(() => {
    const el = formRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setCtaVisible(!entry.isIntersecting),
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Touch swipe for carousel
  const touchStartX = useRef<number | null>(null)
  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) {
      setCarouselIndex(prev =>
        dx < 0 ? Math.min(prev + 1, STEPS.length - 1) : Math.max(prev - 1, 0)
      )
    }
    touchStartX.current = null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/demo-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, campaign }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Une erreur est survenue. Réessayez.')
      } else {
        setSuccess(true)
        setConfetti(true)
        setTimeout(() => setConfetti(false), 4000)
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion et réessayez.')
    } finally {
      setLoading(false)
    }
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Input base classes — enforces 16px font (no iOS zoom), 52px touch target
  const inputCls = [
    'w-full rounded-xl border border-[#E8E8E3] px-4 bg-white text-[#1A1A1A]',
    'text-base', // 16px — prevents iOS auto-zoom
    'focus:outline-none focus:border-[#6C47FF] focus:ring-2 focus:ring-[#6C47FF]/15',
    'transition-colors placeholder:text-[#C4C4C4]',
  ].join(' ')

  return (
    <div className="min-h-screen bg-white" style={{ WebkitFontSmoothing: 'antialiased' }}>
      <ConfettiCanvas active={confetti} />

      {/* ═══════════════════════════════════════════════════════
          A. HERO
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-[#F7F6F3] to-white px-5 pt-10 pb-8 text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center mb-6">
          <span className="text-2xl font-black text-[#6C47FF] tracking-tight">VanCart</span>
        </div>

        {/* H1 — percutant, 2 lignes sur mobile */}
        <h1
          className="font-black text-[#1A1A1A] leading-[1.15] max-w-[300px] mx-auto"
          style={{ fontSize: 'clamp(28px, 9vw, 40px)' }}
        >
          Fidélisez vos clients.{' '}
          <span style={{ color: COLOR }}>Zéro application.</span>
        </h1>

        <p className="mt-4 text-[#6B6B6B] leading-relaxed max-w-xs mx-auto" style={{ fontSize: 18 }}>
          Une carte dans leur téléphone en 2 minutes.
        </p>

        {/* Wallet card preview */}
        <div className="mt-8 px-2">
          <WalletCard color={COLOR} />
        </div>

        {/* Spacer so sticky CTA doesn't cover content */}
        <div className="h-6 sm:hidden" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          B. STEPS CAROUSEL
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-10 px-5">
        <h2
          className="text-center font-black text-[#1A1A1A] mb-8"
          style={{ fontSize: 'clamp(18px, 5vw, 24px)' }}
        >
          Vous avez 30 secondes ?{' '}
          <span style={{ color: COLOR }}>Regardez ça.</span>
        </h2>

        {/* Mobile carousel */}
        <div
          className="sm:hidden relative overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
          >
            {STEPS.map((step, i) => (
              <div key={i} className="min-w-full px-2">
                <div className="bg-[#F7F6F3] rounded-2xl p-7 text-center">
                  <div style={{ fontSize: 52 }} className="mb-4 leading-none">{step.icon}</div>
                  <h3 className="font-black text-[#1A1A1A] mb-2" style={{ fontSize: 20 }}>{step.title}</h3>
                  <p className="text-[#6B6B6B] leading-relaxed" style={{ fontSize: 17 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselIndex(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === carouselIndex ? 28 : 8,
                  height: 8,
                  minHeight: 8,
                  backgroundColor: i === carouselIndex ? COLOR : '#E8E8E3',
                }}
                aria-label={`Étape ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop: 3 col */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4">
          {STEPS.map((step, i) => (
            <div key={i} className="bg-[#F7F6F3] rounded-2xl p-6 text-center">
              <div style={{ fontSize: 44 }} className="mb-3 leading-none">{step.icon}</div>
              <h3 className="font-black text-[#1A1A1A] mb-1.5" style={{ fontSize: 18 }}>{step.title}</h3>
              <p className="text-[#6B6B6B] leading-relaxed" style={{ fontSize: 15 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          C. PRICING
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#F7F6F3] py-10 px-5">
        <h2
          className="text-center font-black text-[#1A1A1A] mb-1"
          style={{ fontSize: 'clamp(18px, 5vw, 24px)' }}
        >
          Tarifs simples
        </h2>
        <p className="text-center text-[#6B6B6B] mb-8" style={{ fontSize: 15 }}>
          1 mois gratuit pour tester · Puis on échange ensemble
        </p>

        {/* Mobile: stacked full-width / Desktop: 3 cols */}
        <div className="flex flex-col gap-4 max-w-lg mx-auto sm:flex-row sm:items-stretch">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className="relative flex-1 bg-white rounded-2xl p-5 flex flex-col gap-3"
              style={{
                border: plan.highlight ? `2px solid ${COLOR}` : '1px solid #E8E8E3',
                boxShadow: plan.highlight ? `0 8px 32px ${COLOR}22` : undefined,
              }}
            >
              {plan.badge && (
                <span
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white font-bold whitespace-nowrap"
                  style={{ backgroundColor: COLOR, fontSize: 12 }}
                >
                  {plan.badge}
                </span>
              )}
              <div className={plan.badge ? 'mt-2' : ''}>
                <p className="font-bold uppercase tracking-wider text-[#6B6B6B]" style={{ fontSize: 12 }}>{plan.name}</p>
                <p className="font-black text-[#1A1A1A] mt-0.5" style={{ fontSize: 26 }}>
                  {plan.price}
                  {plan.period && <span className="font-medium text-[#6B6B6B]" style={{ fontSize: 14 }}>{plan.period}</span>}
                </p>
                {'sub' in plan && plan.sub && (
                  <p className="text-[#6B6B6B]" style={{ fontSize: 12 }}>{plan.sub}</p>
                )}
              </div>
              <ul className="flex-1 space-y-2">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-[#1A1A1A]" style={{ fontSize: 15 }}>
                    <span className="flex-shrink-0 font-bold" style={{ color: COLOR }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={scrollToForm}
                className="w-full rounded-xl font-bold active:scale-95 transition-transform"
                style={{
                  minHeight: 52,
                  fontSize: 16,
                  ...(plan.highlight
                    ? { backgroundColor: COLOR, color: 'white' }
                    : { border: `1.5px solid ${COLOR}`, color: COLOR, background: 'transparent' }),
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          D. FORM
      ═══════════════════════════════════════════════════════ */}
      <section ref={formRef} id="formulaire" className="bg-white py-12 px-5 scroll-mt-4">
        <div className="max-w-md mx-auto">
          <h2
            className="font-black text-[#1A1A1A] text-center mb-2"
            style={{ fontSize: 'clamp(22px, 6vw, 28px)' }}
          >
            Recevez votre carte de fidélité personnalisée sous 24h 🚀
          </h2>
          <p className="text-center text-[#6B6B6B] mb-8" style={{ fontSize: 16 }}>
            Gratuit · Sans engagement · 5 minutes pour tout configurer ensemble
          </p>

          {success ? (
            <div className="text-center py-10 space-y-4">
              <div style={{ fontSize: 64 }}>🎉</div>
              <h3 className="font-black text-[#1A1A1A]" style={{ fontSize: 22 }}>
                Merci ! On vous recontacte très vite.
              </h3>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-6 rounded-xl text-white font-bold transition-opacity hover:opacity-90 active:scale-95"
                style={{ backgroundColor: COLOR, minHeight: 52, fontSize: 16 }}
              >
                Créer mon compte gratuitement →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Prénom — full width on mobile */}
              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1.5" style={{ fontSize: 16 }}>
                  Prénom <span className="text-[#6C47FF]">*</span>
                </label>
                <input
                  required
                  type="text"
                  autoComplete="given-name"
                  value={form.prenom}
                  onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                  placeholder="Marie"
                  className={inputCls}
                  style={{ minHeight: 52 }}
                />
              </div>

              {/* Commerce — full width */}
              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1.5" style={{ fontSize: 16 }}>
                  Nom du commerce <span className="text-[#6C47FF]">*</span>
                </label>
                <input
                  required
                  type="text"
                  autoComplete="organization"
                  value={form.commerce}
                  onChange={e => setForm(f => ({ ...f, commerce: e.target.value }))}
                  placeholder="Boulangerie Paul"
                  className={inputCls}
                  style={{ minHeight: 52 }}
                />
              </div>

              {/* Adresse commerce */}
              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1.5" style={{ fontSize: 16 }}>
                  Adresse du commerce <span className="text-[#6C47FF]">*</span>
                </label>
                <input
                  required
                  type="text"
                  autoComplete="street-address"
                  value={form.adresse_commerce}
                  onChange={e => setForm(f => ({ ...f, adresse_commerce: e.target.value }))}
                  placeholder="12 rue de la Paix, Paris"
                  className={inputCls}
                  style={{ minHeight: 52 }}
                />
              </div>

              {/* Email */}
              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1.5" style={{ fontSize: 16 }}>
                  Email <span className="text-[#6C47FF]">*</span>
                </label>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="marie@boulangerie-paul.fr"
                  className={inputCls}
                  style={{ minHeight: 52 }}
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1.5" style={{ fontSize: 16 }}>
                  Téléphone
                </label>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={form.telephone}
                  onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                  placeholder="+33 6 12 34 56 78"
                  className={inputCls}
                  style={{ minHeight: 52 }}
                />
              </div>

              {/* Logiciel de caisse */}
              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1.5" style={{ fontSize: 16 }}>
                  Logiciel de caisse utilisé <span className="text-[#6C47FF]">*</span>
                </label>
                <select
                  required
                  value={form.logiciel_caisse}
                  onChange={e => setForm(f => ({ ...f, logiciel_caisse: e.target.value }))}
                  className={inputCls}
                  style={{ minHeight: 52 }}
                >
                  <option value="" disabled>Choisissez une option</option>
                  <option value="Aucun">Aucun</option>
                  <option value="SumUp">SumUp</option>
                  <option value="Zelty">Zelty</option>
                  <option value="Tiller">Tiller</option>
                  <option value="Lightspeed">Lightspeed</option>
                  <option value="L'Addition">L&apos;Addition</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1.5" style={{ fontSize: 16 }}>
                  Message (optionnel)
                </label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Une question ?"
                  className={`${inputCls} resize-none`}
                  style={{ paddingTop: 14, paddingBottom: 14 }}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700" style={{ fontSize: 16 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl text-white font-bold active:scale-95 transition-all disabled:opacity-60"
                style={{ backgroundColor: COLOR, minHeight: 56, fontSize: 18 }}
              >
                {loading ? 'Envoi en cours…' : '🚀 Tester VanCart gratuitement'}
              </button>

              <p className="text-center text-[#9CA3AF]" style={{ fontSize: 14 }}>
                Sans engagement · Réponse sous 24h
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          E. FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer className="bg-[#F7F6F3] border-t border-[#E8E8E3] py-6 text-center">
        <p className="text-[#9CA3AF]" style={{ fontSize: 13 }}>
          VanCart ·{' '}
          <a href="https://vancart.vercel.app" className="underline hover:text-[#6C47FF] transition-colors">
            vancart.vercel.app
          </a>
        </p>
      </footer>

      {/* ═══════════════════════════════════════════════════════
          STICKY CTA (mobile only, disappears at form)
      ═══════════════════════════════════════════════════════ */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 sm:hidden"
        style={{ transform: ctaVisible ? 'translateY(0)' : 'translateY(110%)' }}
      >
        <div className="bg-white border-t border-[#E8E8E3] shadow-[0_-4px_24px_rgba(0,0,0,0.10)] px-5 py-3">
          <button
            onClick={scrollToForm}
            className="w-full rounded-xl text-white font-bold active:scale-95 transition-transform"
            style={{ backgroundColor: COLOR, minHeight: 52, fontSize: 17 }}
          >
            Créer ma carte gratuite →
          </button>
        </div>
      </div>

      {/* Bottom padding to clear sticky CTA */}
      <div className="sm:hidden h-20" />
    </div>
  )
}
