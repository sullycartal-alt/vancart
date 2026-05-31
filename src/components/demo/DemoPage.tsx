'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Props {
  campaign?: string
}

function LoyaltyStampsPreview({ color }: { color: string }) {
  const stamps = Array.from({ length: 8 })
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {stamps.map((_, i) => (
        <div
          key={i}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold shadow-md transition-transform active:scale-95"
          style={{ backgroundColor: i < 3 ? color : 'transparent', border: `2.5px solid ${color}`, color: i < 3 ? 'white' : color }}
        >
          {i < 3 ? '✓' : ''}
        </div>
      ))}
    </div>
  )
}

function PhoneMockup({ businessName, color }: { businessName: string; color: string }) {
  return (
    <div className="relative mx-auto" style={{ width: 240, height: 440 }}>
      {/* Phone frame */}
      <div
        className="absolute inset-0 rounded-[2.5rem] shadow-2xl border-4 border-[#1A1A1A] bg-white overflow-hidden"
        style={{ boxShadow: `0 24px 60px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.08)` }}
      >
        {/* Status bar */}
        <div className="h-8 bg-[#F7F6F3] flex items-center justify-between px-5">
          <span className="text-[10px] font-semibold text-[#1A1A1A]">9:41</span>
          <div className="w-16 h-4 rounded-full bg-[#1A1A1A] mx-auto absolute left-1/2 -translate-x-1/2 top-1.5" style={{ width: 60, height: 16 }} />
          <div className="flex gap-1 items-center">
            <div className="w-4 h-2 border border-[#1A1A1A] rounded-sm relative"><div className="absolute inset-0.5 right-1 bg-[#1A1A1A] rounded-sm" /></div>
          </div>
        </div>

        {/* Card header */}
        <div className="px-4 py-3" style={{ background: color }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-black">
              {businessName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-[11px] font-bold leading-tight">{businessName}</p>
              <p className="text-white/70 text-[9px]">Carte de fidélité</p>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="px-4 py-3 bg-white">
          <p className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Vos tampons</p>
          <LoyaltyStampsPreview color={color} />
          <div className="mt-3 bg-[#F7F6F3] rounded-xl p-2.5">
            <p className="text-[10px] text-[#6B6B6B]">3 / 8 tampons</p>
            <div className="mt-1 h-1.5 bg-[#E8E8E3] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '37.5%', backgroundColor: color }} />
            </div>
          </div>
        </div>

        {/* QR scanner area */}
        <div className="px-4 py-3 border-t border-[#E8E8E3]">
          <div className="rounded-xl bg-[#F7F6F3] flex flex-col items-center justify-center py-4 gap-2">
            <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
              <rect x="2" y="2" width="18" height="18" rx="2" stroke={color} strokeWidth="3" fill="none"/>
              <rect x="44" y="2" width="18" height="18" rx="2" stroke={color} strokeWidth="3" fill="none"/>
              <rect x="2" y="44" width="18" height="18" rx="2" stroke={color} strokeWidth="3" fill="none"/>
              <rect x="7" y="7" width="8" height="8" fill={color}/>
              <rect x="49" y="7" width="8" height="8" fill={color}/>
              <rect x="7" y="49" width="8" height="8" fill={color}/>
              <rect x="26" y="2" width="4" height="4" fill={color}/>
              <rect x="32" y="2" width="4" height="4" fill={color}/>
              <rect x="26" y="8" width="4" height="4" fill={color}/>
              <rect x="26" y="26" width="4" height="4" fill={color}/>
              <rect x="32" y="32" width="4" height="4" fill={color}/>
              <rect x="44" y="26" width="4" height="4" fill={color}/>
              <rect x="26" y="44" width="4" height="4" fill={color}/>
              <rect x="32" y="50" width="4" height="4" fill={color}/>
            </svg>
            <p className="text-[9px] text-[#6B6B6B] font-medium">Scanner en caisse</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  {
    icon: '📲',
    title: 'Le client scanne',
    desc: 'Un QR code posé en caisse — aucune application à télécharger',
  },
  {
    icon: '✅',
    title: 'Vous tamponnez',
    desc: 'Un clic sur votre dashboard suffit. Le client voit son tampon en temps réel',
  },
  {
    icon: '🎁',
    title: 'Il revient !',
    desc: 'Carte pleine = récompense. Vos meilleurs clients reviennent naturellement',
  },
]

const PLANS = [
  {
    name: 'Découverte',
    price: '0€',
    period: '/mois',
    features: ['1 carte de fidélité', '50 clients', 'QR code en caisse', 'Statistiques basiques'],
    cta: 'Commencer gratuit',
    highlight: false,
    badge: null,
  },
  {
    name: 'Essentiel',
    price: '29€',
    period: '/mois',
    features: ['Clients illimités', 'Stats avancées', 'Google Wallet', 'Support email'],
    cta: 'Essayer 30j gratuit',
    highlight: true,
    badge: 'Recommandé',
  },
  {
    name: 'Pro',
    price: '59€',
    period: '/mois',
    features: ['Tout Essentiel +', 'Apple Wallet', 'Notifications push', 'Export CSV'],
    cta: 'Essayer 30j gratuit',
    highlight: false,
    badge: null,
  },
]

interface FormState {
  prenom: string
  commerce: string
  email: string
  tel: string
  message: string
}

export default function DemoPage({ campaign }: Props) {
  const color = '#6C47FF'
  const businessName = 'Café Demo ☕'

  const formRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [ctaVisible, setCtaVisible] = useState(true)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [form, setForm] = useState<FormState>({ prenom: '', commerce: '', email: '', tel: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hide sticky CTA when form is visible
  useEffect(() => {
    const el = formRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setCtaVisible(!entry.isIntersecting),
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Touch swipe for carousel
  const touchStartX = useRef<number | null>(null)
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
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
        setError(data.error ?? 'Une erreur est survenue.')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-white font-sans" style={{ WebkitFontSmoothing: 'antialiased' }}>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#F7F6F3] to-white px-5 pt-12 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-[#E8E8E3] rounded-full px-4 py-1.5 mb-6 shadow-sm">
          <span className="text-lg font-black text-[#6C47FF]">VanCart</span>
        </div>

        <h1 className="text-3xl font-black text-[#1A1A1A] leading-tight max-w-xs mx-auto" style={{ fontSize: 'clamp(26px, 8vw, 36px)' }}>
          Fidélisez vos clients.<br />
          <span style={{ color }}>Zéro application.</span>
        </h1>

        <p className="mt-4 text-[#6B6B6B] text-base leading-relaxed max-w-xs mx-auto">
          Un QR code en caisse, une carte digitale sur le smartphone de vos clients. Simple, rapide, efficace.
        </p>

        <div className="mt-8 flex justify-center">
          <PhoneMockup businessName={businessName} color={color} />
        </div>
      </section>

      {/* ── Steps carousel ─────────────────────────────────── */}
      <section className="bg-white py-10 px-5">
        <h2 className="text-center text-xl font-black text-[#1A1A1A] mb-8">Comment ça marche ?</h2>

        <div
          className="relative overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex transition-transform duration-300"
            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
          >
            {STEPS.map((step, i) => (
              <div key={i} className="min-w-full px-4">
                <div className="bg-[#F7F6F3] rounded-2xl p-6 text-center">
                  <div className="text-5xl mb-4">{step.icon}</div>
                  <h3 className="text-lg font-black text-[#1A1A1A] mb-2">{step.title}</h3>
                  <p className="text-[#6B6B6B] text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCarouselIndex(i)}
              className="transition-all rounded-full"
              style={{
                width: i === carouselIndex ? 24 : 8,
                height: 8,
                backgroundColor: i === carouselIndex ? color : '#E8E8E3',
              }}
              aria-label={`Étape ${i + 1}`}
            />
          ))}
        </div>

        {/* Desktop: all 3 visible */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4 mt-8">
          {STEPS.map((step, i) => (
            <div key={i} className="bg-[#F7F6F3] rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">{step.icon}</div>
              <h3 className="text-base font-black text-[#1A1A1A] mb-1.5">{step.title}</h3>
              <p className="text-[#6B6B6B] text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────── */}
      <section className="bg-[#F7F6F3] py-10 px-5">
        <h2 className="text-center text-xl font-black text-[#1A1A1A] mb-2">Tarifs simples</h2>
        <p className="text-center text-sm text-[#6B6B6B] mb-8">30 jours d&apos;essai gratuit · Sans carte bancaire</p>

        <div className="flex flex-col gap-4 max-w-lg mx-auto sm:flex-row sm:items-stretch">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className="relative flex-1 bg-white rounded-2xl p-5 flex flex-col gap-3"
              style={{
                border: plan.highlight ? `2px solid ${color}` : '1px solid #E8E8E3',
                boxShadow: plan.highlight ? `0 8px 30px ${color}20` : undefined,
              }}
            >
              {plan.badge && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-white text-xs font-bold"
                  style={{ backgroundColor: color }}
                >
                  {plan.badge}
                </span>
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">{plan.name}</p>
                <p className="text-2xl font-black text-[#1A1A1A] mt-0.5">
                  {plan.price}<span className="text-sm font-medium text-[#6B6B6B]">{plan.period}</span>
                </p>
              </div>
              <ul className="space-y-1.5 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-[#1A1A1A]">
                    <span style={{ color }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={scrollToForm}
                className="w-full py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 active:scale-95"
                style={plan.highlight
                  ? { backgroundColor: color, color: 'white' }
                  : { border: `1.5px solid ${color}`, color, background: 'transparent' }
                }
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact form ───────────────────────────────────── */}
      <section ref={formRef} id="formulaire" className="bg-white py-12 px-5 scroll-mt-4">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-black text-[#1A1A1A] text-center mb-2">
            Démo gratuite pour votre commerce
          </h2>
          <p className="text-center text-sm text-[#6B6B6B] mb-8">
            On vous configure ensemble en 15 minutes — sans engagement.
          </p>

          {success ? (
            <div className="text-center py-10">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-black text-[#1A1A1A] mb-2">Demande envoyée !</h3>
              <p className="text-[#6B6B6B] text-sm leading-relaxed mb-6">
                Sullivan vous contacte sous 24h pour organiser votre démo.
              </p>
              <Link
                href="/register"
                className="inline-block px-6 py-3.5 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: color }}
              >
                Créer mon compte gratuitement →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1A1A1A] block mb-1.5">Prénom *</label>
                  <input
                    required
                    value={form.prenom}
                    onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                    placeholder="Marie"
                    className="w-full border border-[#E8E8E3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6C47FF] transition-colors"
                    style={{ minHeight: 48 }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1A1A1A] block mb-1.5">Commerce *</label>
                  <input
                    required
                    value={form.commerce}
                    onChange={e => setForm(f => ({ ...f, commerce: e.target.value }))}
                    placeholder="Boulangerie Paul"
                    className="w-full border border-[#E8E8E3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6C47FF] transition-colors"
                    style={{ minHeight: 48 }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1A1A] block mb-1.5">Email *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="marie@boulangerie-paul.fr"
                  className="w-full border border-[#E8E8E3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6C47FF] transition-colors"
                  style={{ minHeight: 48 }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1A1A] block mb-1.5">Téléphone</label>
                <input
                  type="tel"
                  value={form.tel}
                  onChange={e => setForm(f => ({ ...f, tel: e.target.value }))}
                  placeholder="06 12 34 56 78"
                  className="w-full border border-[#E8E8E3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6C47FF] transition-colors"
                  style={{ minHeight: 48 }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1A1A] block mb-1.5">Message (optionnel)</label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Parlez-nous de votre commerce, vos questions..."
                  className="w-full border border-[#E8E8E3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6C47FF] transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-60"
                style={{ backgroundColor: color, minHeight: 56 }}
              >
                {loading ? 'Envoi...' : 'Demander ma démo gratuite →'}
              </button>

              <p className="text-center text-xs text-[#9CA3AF]">
                Sans engagement · Réponse sous 24h
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-[#F7F6F3] border-t border-[#E8E8E3] py-6 text-center">
        <p className="text-xs text-[#9CA3AF]">
          VanCart · <a href="https://vancart.vercel.app" className="underline hover:text-[#6C47FF]">vancart.vercel.app</a>
        </p>
      </footer>

      {/* ── Sticky CTA ─────────────────────────────────────── */}
      {ctaVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-[#E8E8E3] shadow-2xl sm:hidden">
          <button
            onClick={scrollToForm}
            className="w-full py-4 rounded-xl text-white font-bold text-base active:scale-95 transition-transform"
            style={{ backgroundColor: color, minHeight: 56 }}
          >
            Créer ma carte gratuite →
          </button>
        </div>
      )}

      {/* Bottom padding to avoid overlap with sticky CTA */}
      <div className="sm:hidden h-24" />
    </div>
  )
}
