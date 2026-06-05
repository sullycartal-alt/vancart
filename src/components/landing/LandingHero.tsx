'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, Clock, Lock, ShieldCheck, Headphones } from 'lucide-react'
import LoyaltyCardMockup from '@/components/loyalty/LoyaltyCardMockup'

// ── Hero section — single floating loyalty card + handwritten annotation ──────

const BULLETS = [
  'Vos clients scannent votre QR code',
  'Ils collectent des tampons à chaque visite',
  'Ils reçoivent leurs récompenses directement dans leur téléphone',
  'Plus de cartes perdues, plus de clients fidélisés',
]

const AVATARS = [
  { initials: 'JD', color: '#6C47FF' },
  { initials: 'ML', color: '#F97316' },
  { initials: 'SC', color: '#10B981' },
  { initials: 'AR', color: '#F59E0B' },
  { initials: 'PB', color: '#EF4444' },
]

const TRUST = [
  { Icon: Clock, label: '5 minutes', sub: 'pour démarrer' },
  { Icon: Lock, label: 'Sans engagement', sub: 'Annulez quand vous voulez' },
  { Icon: ShieldCheck, label: 'Données hébergées', sub: 'en Europe' },
  { Icon: Headphones, label: 'Support disponible', sub: '7j/7' },
]

export default function LandingHero() {
  const [heroMerchant, setHeroMerchant] = useState({
    primaryColor: '#6C47FF',
    businessName: 'Café des Arts',
    loyaltyType: 'stamps' as 'stamps' | 'points',
    stampsRequired: 9,
    loyaltyRule: '1 café offert',
  })

  useEffect(() => {
    fetch('/api/public/hero-merchant')
      .then(r => r.json())
      .then(data => {
        if (data?.business_name) {
          setHeroMerchant({
            primaryColor: data.primary_color || '#6C47FF',
            businessName: data.business_name,
            loyaltyType: data.loyalty_type || 'stamps',
            stampsRequired: data.stamps_required || 9,
            loyaltyRule: data.loyalty_rule || '1 café offert',
          })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="relative overflow-hidden bg-[#F7F6F3] px-4 sm:px-6 py-20">
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: rotate(8deg) translateY(0px); }
          50%      { transform: rotate(8deg) translateY(-12px); }
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Left column ── */}
          <div className="space-y-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#F0EDFF] text-[#6C47FF] text-sm font-medium px-4 py-2 rounded-full border border-[#6C47FF]/20">
              <span>✉</span> La carte de fidélité nouvelle génération
            </div>

            <h1 className="text-5xl font-black text-gray-900 leading-tight">
              La fidélité qui ne finit
              <br />
              <span style={{ color: '#6C47FF', textDecoration: 'line-through', textDecorationColor: '#6C47FF' }}>
                pas à la poubelle.
              </span>
            </h1>

            <p className="text-gray-600 text-lg max-w-lg mx-auto lg:mx-0">
              VanCart remplace votre carte papier par une carte digitale dans Apple Wallet et Google Wallet.
            </p>

            {/* Bullets */}
            <ul className="space-y-3 text-left max-w-lg mx-auto lg:mx-0">
              {BULLETS.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span
                    className="flex items-center justify-center rounded-full bg-[#6C47FF] flex-shrink-0 mt-0.5"
                    style={{ width: 22, height: 22 }}
                  >
                    <Check size={13} strokeWidth={3} className="text-white" />
                  </span>
                  <span className="text-gray-700 text-base">{b}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                href="/register"
                className="bg-[#6C47FF] hover:bg-[#5835FF] text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors text-center"
              >
                Créer mon compte gratuit →
              </Link>
              <span className="text-gray-500 text-sm">
                Déjà un compte ?{' '}
                <Link href="/login" className="text-[#6C47FF] font-medium">Se connecter</Link>
              </span>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="flex flex-shrink-0" style={{ gap: 0 }}>
                {AVATARS.map(({ initials, color }, i) => (
                  <div
                    key={initials}
                    className="flex items-center justify-center rounded-full border-2 border-white text-white text-xs font-bold flex-shrink-0"
                    style={{ width: 36, height: 36, backgroundColor: color, marginLeft: i === 0 ? 0 : -8 }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 max-w-xs text-left">
                Déjà rejoint par les premiers commerçants — Rejoignez-vous aussi les pionniers.
              </p>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-6">
              {TRUST.map(({ Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-2" style={{ minWidth: 0 }}>
                  <Icon className="w-4 h-4 text-[#6C47FF] mt-0.5 flex-shrink-0" strokeWidth={1.9} />
                  <div style={{ minWidth: 0 }}>
                    <p className="text-sm font-semibold text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="hidden lg:flex justify-center">
            <div style={{ position: 'relative', width: 520, height: 620 }}>
              {/* Decorative blob */}
              <div
                style={{
                  position: 'absolute',
                  width: 420,
                  height: 420,
                  borderRadius: '50%',
                  background: '#EDE9FF',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 0,
                }}
              />

              {/* Floating card */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                transform: 'rotate(8deg)',
                animation: 'heroFloat 4s ease-in-out infinite',
                filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.25))',
                flexShrink: 0,
              }}>
                <LoyaltyCardMockup
                  primaryColor={heroMerchant.primaryColor}
                  businessName={heroMerchant.businessName}
                  loyaltyType={heroMerchant.loyaltyType}
                  stampsRequired={heroMerchant.stampsRequired}
                  currentStamps={5}
                  loyaltyRule={heroMerchant.loyaltyRule}
                  clientName="Marie Laurent"
                  bannerUrl="/hero-cafe.svg"
                />
              </div>

              {/* Handwritten annotation */}
              <div style={{ position: 'absolute', bottom: 80, right: -8, textAlign: 'right', zIndex: 10 }}>
                <svg width="70" height="60" viewBox="0 0 70 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', marginLeft: 'auto', marginBottom: 6 }}>
                  <path d="M 60 50 C 55 35, 35 15, 10 5" stroke="#6C47FF" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="none"/>
                  <path d="M 10 5 Q 14 11 18 9" stroke="#6C47FF" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </svg>
                <p style={{ fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif', fontStyle: 'italic', color: '#6C47FF', fontSize: 13, lineHeight: 1.4, maxWidth: 160 }}>
                  Toujours dans le<br/>téléphone de vos clients !
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
