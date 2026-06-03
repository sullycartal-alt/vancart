'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { PenLine, QrCode, Smartphone, CreditCard } from 'lucide-react'

const STEPS = [
  {
    id: 'create' as const,
    num: '01',
    title: 'Créez votre carte',
    desc: 'Nom, couleur, logo — en 2 minutes',
    Icon: PenLine,
  },
  {
    id: 'qrcode' as const,
    num: '02',
    title: 'Votre QR code est prêt',
    desc: 'Posez-le en caisse ou sur vos tables',
    Icon: QrCode,
  },
  {
    id: 'scan' as const,
    num: '03',
    title: 'Le client scanne',
    desc: "Sans télécharger d'application",
    Icon: Smartphone,
  },
  {
    id: 'wallet' as const,
    num: '04',
    title: 'La carte dans son Wallet',
    desc: 'Dans Apple Wallet ou Google Wallet, pour toujours',
    Icon: CreditCard,
  },
]

function StepPlaceholder({ stepId, Icon }: { stepId: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }> }) {
  return (
    <div
      data-step={stepId}
      className="w-full aspect-video rounded-2xl bg-[#F7F6F3] border border-[#E8E8E3] flex flex-col items-center justify-center gap-3"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#F0EDFF] flex items-center justify-center">
        <Icon size={28} strokeWidth={1.6} className="text-[#6C47FF]" />
      </div>
      <p className="text-xs text-gray-400 font-medium">Capture d&apos;écran à venir</p>
    </div>
  )
}

export default function DemoCarousel() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const next = useCallback(() => setActive((a) => (a + 1) % STEPS.length), [])
  const prev = useCallback(() => setActive((a) => (a - 1 + STEPS.length) % STEPS.length), [])

  useEffect(() => {
    if (paused) return
    intervalRef.current = setInterval(next, 3000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [paused, next])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev() }
    touchStartX.current = null
  }

  return (
    <section className="px-4 sm:px-6 py-20 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Comment ça marche</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Voir comment ça marche</h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
            De la création à la carte dans le téléphone de vos clients — en moins de 5 minutes.
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Desktop: show all 4 with active highlighted */}
          <div className="hidden md:grid grid-cols-4 gap-4 items-end">
            {STEPS.map((step, i) => {
              const isActive = i === active
              return (
                <button
                  key={step.id}
                  onClick={() => setActive(i)}
                  className="text-left transition-all duration-500 ease-in-out focus:outline-none"
                  style={{
                    opacity: isActive ? 1 : 0.5,
                    transform: isActive ? 'scale(1.03)' : 'scale(0.97)',
                  }}
                >
                  <div
                    className="rounded-2xl p-4 border-2 transition-all duration-500"
                    style={{
                      borderColor: isActive ? '#6C47FF' : '#E8E8E3',
                      boxShadow: isActive ? '0 8px 32px rgba(108,71,255,0.15)' : 'none',
                      background: 'white',
                    }}
                  >
                    <StepPlaceholder stepId={step.id} Icon={step.Icon} />
                    <div className="mt-4 space-y-1">
                      <p className="text-xs font-bold text-[#6C47FF] tracking-widest">{step.num}</p>
                      <h3 className="font-bold text-gray-900 text-sm leading-snug">{step.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Mobile: single step */}
          <div className="md:hidden">
            <div className="rounded-2xl p-5 border-2 border-[#6C47FF] shadow-lg bg-white">
              <StepPlaceholder stepId={STEPS[active].id} Icon={STEPS[active].Icon} />
              <div className="mt-4 space-y-1">
                <p className="text-xs font-bold text-[#6C47FF] tracking-widest">{STEPS[active].num}</p>
                <h3 className="font-bold text-gray-900 text-base">{STEPS[active].title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{STEPS[active].desc}</p>
              </div>
            </div>
          </div>

          {/* Prev / Next arrows */}
          <button
            onClick={prev}
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white border border-[#E8E8E3] shadow-sm hover:border-[#6C47FF] hover:text-[#6C47FF] transition-colors text-gray-500"
            aria-label="Précédent"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-white border border-[#E8E8E3] shadow-sm hover:border-[#6C47FF] hover:text-[#6C47FF] transition-colors text-gray-500"
            aria-label="Suivant"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === active ? 24 : 8,
                height: 8,
                background: i === active ? '#6C47FF' : '#E8E8E3',
              }}
              aria-label={`Étape ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/auth/signup"
            className="inline-block bg-[#6C47FF] hover:bg-[#5835FF] text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-colors"
          >
            Créer ma carte gratuitement →
          </Link>
        </div>
      </div>
    </section>
  )
}
