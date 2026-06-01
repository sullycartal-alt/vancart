'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

function CheckIcon({ color = '#6C47FF' }: { color?: string }) {
  return (
    <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
      <svg className="w-2.5 h-2.5" fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  )
}

const CONTACT_HREF = 'mailto:vancart@gmail.com?subject=Offre%20Sur%20mesure%20VanCart'

const cards = [
  {
    key: 'decouverte',
    badge: 'Pour commencer',
    title: 'Découverte',
    price: 'Gratuit',
    priceNote: '1 mois · Sans carte bancaire',
    subNote: 'Testez VanCart gratuitement pendant 1 mois, puis échangeons ensemble.',
    features: ["1 carte de fidélité", "Jusqu'à 50 clients", 'Google & Apple Wallet', 'Carte PWA installable', 'Stats basiques', "Rendez-vous de suivi avec l'équipe VanCart"],
    featureColor: '#6B6B6B' as string,
    cta: 'Démarrer gratuitement',
    ctaHref: '/register',
    ctaClass: 'block w-full py-3 border border-[#E8E8E3] text-[#1A1A1A] font-semibold rounded-xl hover:bg-[#F7F6F3] transition-colors text-sm text-center',
    cardClass: 'bg-white border border-[#E8E8E3] rounded-2xl p-7 flex flex-col transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(108,71,255,0.12)]',
    popular: false,
  },
  {
    key: 'essentiel',
    badge: null,
    title: 'Essentiel',
    price: '29€',
    priceSuffix: ' / mois',
    priceNote: 'Sans engagement',
    subNote: null,
    features: ["1 programme de fidélité", "Jusqu'à 500 clients", 'Stats avancées', 'Support prioritaire'],
    featureColor: '#6C47FF' as string,
    cta: 'Choisir Essentiel',
    ctaHref: '/register?plan=essentiel',
    ctaClass: 'block w-full py-3 bg-[#6C47FF] text-white font-semibold rounded-xl hover:bg-[#5835e0] transition-colors text-sm text-center',
    cardClass: 'bg-white border-2 border-[#6C47FF] rounded-2xl p-7 flex flex-col relative shadow-lg shadow-[#6C47FF]/10 transition-all duration-200 hover:scale-[1.05] hover:shadow-[0_12px_40px_rgba(108,71,255,0.22)]',
    popular: true,
  },
  {
    key: 'pro',
    badge: 'Pour aller plus loin',
    title: 'Pro',
    price: '59€',
    priceSuffix: ' / mois',
    priceNote: 'Sans engagement',
    subNote: null,
    features: ['Tout du plan Essentiel', 'Clients illimités', 'Assistant IA marketing', 'Notifications push clients', 'Export données clients'],
    featureColor: '#6B6B6B' as string,
    cta: 'Choisir Pro',
    ctaHref: '/register?plan=pro',
    ctaClass: 'block w-full py-3 border border-[#E8E8E3] text-[#1A1A1A] font-semibold rounded-xl hover:bg-[#F7F6F3] transition-colors text-sm text-center',
    cardClass: 'bg-white border border-[#E8E8E3] rounded-2xl p-7 flex flex-col transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(108,71,255,0.12)]',
    popular: false,
  },
  {
    key: 'sur-mesure',
    badge: 'Intégration caisse',
    title: 'Sur mesure',
    price: 'Sur devis',
    priceNote: 'Intégration caisse & accompagnement',
    subNote: 'Pour les commerçants qui veulent automatiser la fidélité avec leur logiciel de caisse.',
    features: [
      'Intégration caisse disponible sur demande',
      'Automatisation des points après achat',
      'Accompagnement personnalisé',
      'Import clients',
      'Support prioritaire',
    ],
    featureColor: '#6C47FF' as string,
    cta: 'Nous contacter',
    ctaHref: CONTACT_HREF,
    ctaClass: 'block w-full py-3 border border-[#6C47FF] text-[#6C47FF] font-semibold rounded-xl hover:bg-[#6C47FF]/5 transition-colors text-sm text-center',
    cardClass: 'bg-white border border-[#E8E8E3] rounded-2xl p-7 flex flex-col transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(108,71,255,0.12)]',
    popular: false,
  },
]

export default function PricingCards() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    function onScroll() {
      if (!el) return
      const cardWidth = el.scrollWidth / cards.length
      const index = Math.round(el.scrollLeft / cardWidth)
      setActiveIndex(Math.max(0, Math.min(cards.length - 1, index)))
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Mobile: horizontal scroll carousel */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-4 pt-5 pb-4 -mx-4 px-4 [&::-webkit-scrollbar]:hidden md:hidden"
      >
        {cards.map((card) => (
          <div
            key={card.key}
            className={`${card.cardClass} snap-center shrink-0 w-[85vw]`}
            style={{ minHeight: 440 }}
          >
            <CardContent card={card} />
          </div>
        ))}
      </div>

      {/* Pagination dots — mobile only */}
      <div className="flex justify-center gap-2 mt-4 md:hidden">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const el = scrollRef.current
              if (!el) return
              const cardWidth = el.scrollWidth / cards.length
              el.scrollTo({ left: cardWidth * i, behavior: 'smooth' })
            }}
            className={`w-2 h-2 rounded-full transition-colors ${i === activeIndex ? 'bg-[#6C47FF]' : 'bg-[#D1D5DB]'}`}
            aria-label={`Carte ${i + 1}`}
          />
        ))}
      </div>

      {/* Desktop: regular grid */}
      <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-4 md:gap-6 md:items-stretch">
        {cards.map((card) => (
          <div
            key={card.key}
            className={card.cardClass}
            style={{ minHeight: 440 }}
          >
            <CardContent card={card} />
          </div>
        ))}
      </div>
    </>
  )
}

function CardContent({ card }: { card: typeof cards[number] }) {
  return (
    <>
      {card.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <div className="bg-[#6C47FF] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">Le plus populaire</div>
        </div>
      )}
      <div className="flex-1 space-y-6">
        <div>
          {card.badge && (
            <div className="inline-flex items-center bg-[#F7F6F3] text-[#6B6B6B] text-xs font-semibold px-3 py-1 rounded-full border border-[#E8E8E3] mb-3">{card.badge}</div>
          )}
          <h3 className="text-xl font-bold text-[#1A1A1A]">{card.title}</h3>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">{card.price}</span>
            {'priceSuffix' in card && card.priceSuffix && (
              <span className="text-[#6B6B6B] text-sm">{card.priceSuffix}</span>
            )}
          </div>
          <p className="text-xs text-[#6B6B6B] mt-1">{card.priceNote}</p>
          {card.subNote && <p className="text-xs text-[#6B6B6B] mt-0.5">{card.subNote}</p>}
        </div>
        <ul className="space-y-2.5">
          {card.features.map(f => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-[#1A1A1A]">
              <CheckIcon color={card.featureColor} />{f}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <Link href={card.ctaHref} className={card.ctaClass}>
          {card.cta}
        </Link>
      </div>
    </>
  )
}
