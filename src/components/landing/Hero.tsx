'use client'
import Link from 'next/link'
import { ArrowRight, Play, CheckCheck, BellRing, Gift, Check } from 'lucide-react'

function StampDots() {
  return (
    <span className="inline-flex items-center gap-2">
      <i className="w-[11px] h-[11px] rounded-full block" style={{ background: 'var(--violet)' }} />
      <i className="w-[11px] h-[11px] rounded-full block" style={{ background: 'var(--violet)' }} />
      <i className="w-[11px] h-[11px] rounded-full border-[1.6px] block opacity-35" style={{ borderColor: 'var(--violet)' }} />
    </span>
  )
}

function HeroCard({ back = false }: { back?: boolean }) {
  const stamps = back ? [true, true, true, false, false] : [true, true, true, true, true, true, true, false, false, false]
  return (
    <div
      className="relative rounded-[26px] p-[26px] text-white"
      style={{
        width: back ? 300 : 340,
        background: 'linear-gradient(150deg, #7C5CFC 0%, #6C47FF 45%, #5126C9 100%)',
        boxShadow: back
          ? 'none'
          : '0 1px 0 rgba(255,255,255,.6) inset, 0 24px 60px -20px rgba(21,19,26,.28), 0 8px 20px -12px rgba(108,71,255,.35)',
        animation: back ? 'floatb 6s ease-in-out infinite' : 'float 6s ease-in-out infinite',
        position: back ? 'absolute' : 'relative',
        transform: back ? 'rotate(8deg) translate(40px, 30px)' : undefined,
        filter: back ? 'saturate(.9) brightness(.96)' : undefined,
        opacity: back ? 0.85 : 1,
        zIndex: back ? 2 : 3,
      }}
    >
      {/* halo + inset ring */}
      <div className="absolute inset-0 rounded-[26px] pointer-events-none" style={{ background: 'linear-gradient(140deg, rgba(255,255,255,.28), transparent 40%)' }} />
      <div className="absolute inset-0 rounded-[26px] pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.18)' }} />

      <div className="flex items-center justify-between mb-[22px]">
        <div className="flex items-center gap-3">
          <span className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center font-bold text-[15px]" style={{ background: 'rgba(255,255,255,.18)', fontFamily: 'var(--font-display)' }}>
            {back ? 'BL' : 'CA'}
          </span>
          <div>
            <b className="block text-[16px] font-bold leading-[1.1]" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              {back ? 'Boulangerie Lumière' : 'Café des Arts'}
            </b>
            <small className="text-[11px] opacity-70">Carte de fidélité</small>
          </div>
        </div>
      </div>

      <div className="text-[13px] font-medium opacity-85 mb-4" style={{ fontFamily: 'var(--font-display)' }}>
        {back ? 'La 10ᵉ viennoiserie offerte' : '9 cafés achetés, le 10ᵉ offert'}
      </div>

      <div className="grid grid-cols-5 gap-[11px] mb-5">
        {stamps.map((on, i) => (
          <div key={i} className={`aspect-square rounded-full flex items-center justify-center ${on ? 'bg-white' : 'border-[1.6px] border-dashed border-white/40'}`}>
            {on && <Check size={16} strokeWidth={1.9} color="#6C47FF" />}
          </div>
        ))}
      </div>

      {!back && (
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>7 / 10 tampons</span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold" style={{ background: 'rgba(255,255,255,.16)' }}>
            <Gift size={13} strokeWidth={1.9} />Bientôt votre récompense
          </span>
        </div>
      )}
    </div>
  )
}

function FloatingChip({ variant }: { variant: 'stamp' | 'bell' }) {
  const isStamp = variant === 'stamp'
  return (
    <div
      className="absolute z-[4] rounded-[14px] p-3 flex items-center gap-2.5"
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        boxShadow: '0 18px 40px -16px rgba(21,19,26,.35)',
        animation: `float 5s ease-in-out infinite`,
        animationDelay: isStamp ? '0.6s' : '1.4s',
        top: isStamp ? 34 : undefined,
        left: isStamp ? -26 : undefined,
        bottom: !isStamp ? 60 : undefined,
        right: !isStamp ? -30 : undefined,
      }}
    >
      <span
        className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={{ background: isStamp ? 'color-mix(in srgb, var(--green) 14%, transparent)' : 'color-mix(in srgb, var(--violet) 12%, transparent)', color: isStamp ? 'var(--green)' : 'var(--violet)' }}
      >
        {isStamp ? <CheckCheck size={18} strokeWidth={1.9} /> : <BellRing size={18} strokeWidth={1.9} />}
      </span>
      <div>
        <b className="block text-[13px] font-semibold leading-[1.2]" style={{ fontFamily: 'var(--font-display)' }}>
          {isStamp ? 'Tampon ajouté' : 'Marie revient'}
        </b>
        <small className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>
          {isStamp ? 'il y a 2 secondes' : '« plus qu\'1 café ! »'}
        </small>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <header className="relative" style={{ padding: '70px 0 90px' }}>
      {/* halo */}
      <div className="absolute pointer-events-none" style={{ width: 680, height: 680, right: -160, top: -120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,71,255,.16), transparent 62%)', zIndex: 0 }} />

      <div className="max-w-[1200px] mx-auto px-8 relative z-[2]">
        <div className="grid grid-cols-1 md:grid-cols-[1.05fr_.95fr] gap-10 md:gap-10 items-center">
          {/* Left */}
          <div>
            <span className="inline-flex items-center gap-2.5 mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--violet)' }}>
              <StampDots />
              Cartes de fidélité dématérialisées
            </span>

            <h1 className="font-bold" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(46px, 6.6vw, 90px)', letterSpacing: '-0.035em', lineHeight: 0.98, color: 'var(--ink)' }}>
              La fidélité qui ne&nbsp;finit&nbsp;
              <span style={{ color: 'var(--violet)', position: 'relative', whiteSpace: 'nowrap' }}>
                <span className="relative">
                  pas&nbsp;à&nbsp;la&nbsp;poubelle.
                  <span
                    className="absolute"
                    style={{
                      left: '-2%', right: '-2%', top: '54%',
                      height: 6, background: 'var(--amber)',
                      borderRadius: 4, transform: 'rotate(-1.5deg)',
                      opacity: 0, animation: 'strike 0.6s 1s cubic-bezier(0.16,1,0.3,1) forwards',
                    }}
                  />
                </span>
              </span>
            </h1>

            <p className="mt-7 mb-8" style={{ fontSize: 20, color: 'var(--ink-soft)', lineHeight: 1.6, maxWidth: 480 }}>
              VanCart transforme votre programme de fidélité en une carte digitale, droit dans Apple&nbsp;&amp; Google Wallet. Aucune appli à installer. Aucune carte à perdre.
            </p>

            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 font-semibold text-[15px] text-white px-[26px] py-[15px] rounded-[13px] transition-all duration-200 hover:-translate-y-0.5"
                style={{ fontFamily: 'var(--font-display)', background: 'var(--violet)', boxShadow: '0 10px 24px -8px rgba(108,71,255,.6)' }}
              >
                Créer ma carte — gratuit <ArrowRight size={18} strokeWidth={1.9} />
              </Link>
              <a
                href="#produit"
                className="inline-flex items-center gap-2 font-semibold text-[15px] px-[26px] py-[15px] rounded-[13px] transition-all duration-200 hover:-translate-y-0.5"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', border: '1.5px solid var(--line)', background: 'transparent' }}
              >
                <Play size={18} strokeWidth={1.9} />Voir la démo
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3.5 mt-9">
              <div className="flex">
                {[['#6C47FF','JD'],['#10B981','ML'],['#F59E0B','SC'],['#EF4444','AR']].map(([bg, initials], i) => (
                  <span
                    key={i}
                    className="w-[38px] h-[38px] rounded-full border-[2.5px] flex items-center justify-center font-bold text-[12px] text-white"
                    style={{ background: bg, borderColor: 'var(--bg)', marginLeft: i === 0 ? 0 : -11, boxShadow: '0 2px 8px rgba(21,19,26,.15)', fontFamily: 'var(--font-display)' }}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <p className="text-[14px]" style={{ color: 'var(--ink-soft)' }}>
                <b style={{ color: 'var(--ink)', fontWeight: 700 }}>+124 commerçants</b> indépendants fidélisent déjà sans plastique
              </p>
            </div>
          </div>

          {/* Right — card stage */}
          <div className="relative flex items-center justify-center" style={{ height: 560 }}>
            {/* rings */}
            <div className="absolute rounded-full opacity-40" style={{ width: 520, height: 520, border: '1.5px dashed color-mix(in srgb, var(--violet) 40%, transparent)' }} />
            <div className="absolute rounded-full opacity-40" style={{ width: 380, height: 380, border: '1.5px dotted color-mix(in srgb, var(--violet) 40%, transparent)' }} />

            <HeroCard back />
            <HeroCard />
            <FloatingChip variant="stamp" />
            <FloatingChip variant="bell" />
          </div>
        </div>
      </div>
    </header>
  )
}
