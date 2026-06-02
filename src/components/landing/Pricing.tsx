'use client'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'

const PLANS = [
  {
    name: 'Découverte',
    price: 'Gratuit',
    sub: '1 mois · sans carte bancaire',
    features: ['Jusqu\'à 50 clients', 'Google & Apple Wallet', 'Carte installable (PWA)', 'Statistiques basiques', 'Rendez-vous de suivi'],
    cta: 'Démarrer gratuitement',
    ctaHref: '/register',
    ghost: true,
    popular: false,
  },
  {
    name: 'Essentiel',
    price: '29€',
    priceSub: '/ mois',
    sub: 'Sans engagement',
    features: ['Jusqu\'à 500 clients', 'Statistiques avancées', 'Support prioritaire', 'Tout du plan Découverte'],
    cta: 'Choisir Essentiel',
    ctaHref: '/register?plan=essentiel',
    ghost: false,
    popular: true,
  },
  {
    name: 'Pro',
    price: '59€',
    priceSub: '/ mois',
    sub: 'Sans engagement',
    features: ['Clients illimités', 'Conseiller IA Mistral 🇫🇷', 'Notifications push clients', 'Export des données', 'Tout du plan Essentiel'],
    cta: 'Choisir Pro',
    ctaHref: '/register?plan=pro',
    ghost: true,
    popular: false,
  },
]

export default function Pricing() {
  return (
    <section id="tarifs" className="relative z-[2]" style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '110px 0' }}>
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="reveal text-center mb-14" style={{ maxWidth: 720, margin: '0 auto 56px' }}>
          <span className="inline-flex items-center justify-center gap-2 mb-5" style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--violet)' }}>
            <i className="w-[11px] h-[11px] rounded-full block" style={{ background: 'var(--violet)' }} />
            <i className="w-[11px] h-[11px] rounded-full block" style={{ background: 'var(--violet)' }} />
            Tarifs
          </span>
          <h2 className="font-bold mt-4" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 4.4vw, 58px)', letterSpacing: '-0.035em', lineHeight: 0.98, color: 'var(--ink)' }}>
            Un prix par caractère,<br />pas par fonctionnalité.
          </h2>
          <p className="mt-5 text-[19px] mx-auto" style={{ color: 'var(--ink-soft)', maxWidth: 480 }}>
            1 mois gratuit pour tester. Puis on échange, sans engagement.
          </p>
        </div>

        <div className="reveal grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {PLANS.map(({ name, price, priceSub, sub, features, cta, ctaHref, ghost, popular }) => (
            <div
              key={name}
              className="relative flex flex-col rounded-[22px] p-8 transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'var(--paper)',
                border: popular ? '1.5px solid var(--violet)' : '1px solid var(--line)',
                boxShadow: popular ? '0 20px 50px -22px rgba(108,71,255,.4)' : undefined,
              }}
            >
              {popular && (
                <span
                  className="absolute -top-[13px] left-8 text-white text-[12px] font-semibold px-3.5 py-1 rounded-full"
                  style={{ fontFamily: 'var(--font-display)', background: 'var(--violet)' }}
                >
                  Le plus populaire
                </span>
              )}
              <div className="text-[15px] font-semibold tracking-[0.04em] uppercase mb-3.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-soft)' }}>{name}</div>
              <div className="font-bold leading-[1] mb-0.5" style={{ fontFamily: 'var(--font-display)', fontSize: 46, letterSpacing: '-0.04em', color: 'var(--ink)' }}>
                {price}{priceSub && <small className="text-[16px] font-medium ml-0.5" style={{ color: 'var(--ink-soft)', letterSpacing: 0 }}>{priceSub}</small>}
              </div>
              <div className="text-[13px] mb-6" style={{ color: 'var(--ink-faint)' }}>{sub}</div>
              <ul className="flex flex-col gap-3.5 mb-6 flex-1">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-[14.5px]" style={{ color: 'var(--ink)' }}>
                    <Check size={17} strokeWidth={1.9} color="var(--violet)" className="flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center gap-2 font-semibold text-[15px] w-full py-[15px] rounded-[13px] transition-all duration-200 hover:-translate-y-0.5"
                style={ghost
                  ? { fontFamily: 'var(--font-display)', color: 'var(--ink)', border: '1.5px solid var(--line)', background: 'transparent' }
                  : { fontFamily: 'var(--font-display)', color: '#fff', background: 'var(--violet)', boxShadow: '0 10px 24px -8px rgba(108,71,255,.6)' }
                }
              >
                {cta} {!ghost && <ArrowRight size={16} strokeWidth={1.9} />}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
