'use client'

import { useState } from 'react'
import type { Plan } from '@/lib/plan-features'

interface Props {
  currentPlan: Plan
}

const CONTACT = 'vancart@gmail.com'

const DECOUVERTE_FEATURES = [
  '1 carte de fidélité',
  '50 clients max',
  'Statistiques basiques',
  'QR code de fidélité',
]

const ESSENTIAL_FEATURES = [
  'Cartes illimitées',
  'Clients illimités',
  'Stats avancées',
  'Google Wallet',
  'Conseiller IA français 🇫🇷',
  'Export données clients',
  'Support réactif',
]

const PRO_FEATURES = [
  'Tout du plan Essentiel',
  'Apple Wallet',
  'Notifications push',
  'Notifications SMS',
  'Multi-boutique',
  'RDV mensuel inclus',
]

function CheckIcon() {
  return (
    <span className="w-4 h-4 rounded-full bg-[#6C47FF]/10 flex items-center justify-center flex-shrink-0">
      <svg className="w-2.5 h-2.5 text-[#6C47FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  )
}

export default function UpgradePageClient({ currentPlan }: Props) {
  const [loading, setLoading] = useState<'essential' | 'pro' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isFree = currentPlan === 'free'
  const isEssential = currentPlan === 'essential'
  const isPro = currentPlan === 'pro'

  async function handleCheckout(plan: 'essential' | 'pro') {
    setLoading(plan)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Erreur lors de la création de la session')
      }
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Choisissez votre plan</h1>
        <p className="text-[#6B6B6B]">Débloquez toutes les fonctionnalités de VanCart</p>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">

        {/* Plan Découverte */}
        <div className={`bg-white rounded-2xl p-7 flex flex-col border relative ${isFree ? 'border-2 border-[#6C47FF]' : 'border-[#E8E8E3]'}`}>
          {isFree && (
            <div className="absolute -top-3.5 left-6">
              <div className="bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                Votre plan actuel
              </div>
            </div>
          )}

          <div className="flex-1 space-y-5 pt-2">
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Découverte</h2>
              <div className="mt-1.5">
                <span className="text-3xl font-bold text-[#1A1A1A]">0€</span>
                <span className="text-[#6B6B6B] text-sm"> / mois</span>
              </div>
            </div>

            <ul className="space-y-2.5">
              {DECOUVERTE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[#1A1A1A]">
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <button
            disabled
            className="mt-6 w-full py-3 border border-[#E8E8E3] text-[#6B6B6B] font-semibold rounded-xl text-sm cursor-not-allowed"
          >
            {isFree ? 'Plan actuel' : 'Rétrograder'}
          </button>
        </div>

        {/* Plan Essentiel */}
        <div className={`bg-white rounded-2xl p-7 flex flex-col border-2 relative ${isEssential ? 'border-green-500' : 'border-[#6C47FF]'} shadow-lg shadow-[#6C47FF]/10`}>
          <div className="absolute -top-3.5 left-6">
            {isEssential ? (
              <div className="bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                Votre plan actuel
              </div>
            ) : !isPro ? (
              <div className="bg-[#6C47FF] text-white text-xs font-bold px-4 py-1 rounded-full">
                Recommandé
              </div>
            ) : null}
          </div>

          <div className="flex-1 space-y-5 pt-2">
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Essentiel</h2>
              <div className="mt-1.5">
                <span className="text-3xl font-bold text-[#1A1A1A]">29€</span>
                <span className="text-[#6B6B6B] text-sm"> / mois · Sans engagement</span>
              </div>
            </div>

            <ul className="space-y-2.5">
              {ESSENTIAL_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[#1A1A1A]">
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => handleCheckout('essential')}
            disabled={isEssential || loading !== null}
            className="mt-6 w-full py-3 bg-[#6C47FF] text-white font-semibold rounded-xl hover:bg-[#5835e0] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading === 'essential' ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Redirection…
              </>
            ) : isEssential ? 'Plan actuel' : 'Passer à Essentiel'}
          </button>
        </div>

        {/* Plan Pro */}
        <div className={`bg-white rounded-2xl p-7 flex flex-col border relative ${isPro ? 'border-2 border-green-500' : isEssential ? 'border-2 border-[#6C47FF]' : 'border-[#E8E8E3]'}`}>
          {isPro ? (
            <div className="absolute -top-3.5 left-6">
              <div className="bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                Votre plan actuel
              </div>
            </div>
          ) : isEssential ? (
            <div className="absolute -top-3.5 left-6">
              <div className="bg-[#6C47FF] text-white text-xs font-bold px-4 py-1 rounded-full">
                Recommandé
              </div>
            </div>
          ) : null}

          <div className="flex-1 space-y-5 pt-2">
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Pro</h2>
              <div className="mt-1.5">
                <span className="text-3xl font-bold text-[#1A1A1A]">59€</span>
                <span className="text-[#6B6B6B] text-sm"> / mois · Sans engagement</span>
              </div>
            </div>

            <ul className="space-y-2.5">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[#1A1A1A]">
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => handleCheckout('pro')}
            disabled={isPro || loading !== null}
            className="mt-6 w-full py-3 border border-[#6C47FF] text-[#6C47FF] font-semibold rounded-xl hover:bg-[#6C47FF]/5 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading === 'pro' ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Redirection…
              </>
            ) : isPro ? 'Plan actuel' : 'Passer à Pro'}
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-[#6B6B6B]">
        Des questions ? Écrivez-nous à{' '}
        <a href={`mailto:${CONTACT}`} className="text-[#6C47FF] hover:underline font-medium">
          {CONTACT}
        </a>
      </p>
    </div>
  )
}
