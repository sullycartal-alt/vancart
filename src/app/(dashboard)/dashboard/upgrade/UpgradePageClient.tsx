'use client'

import { useState } from 'react'

interface Props {
  currentPlan: string
}

const CONTACT = 'vancart@gmail.com'

const ESSENTIAL_FEATURES = [
  "Jusqu'à 500 clients",
  'Stats avancées',
  'Conseiller IA français 🇫🇷',
  'Apple Wallet',
  'Export données clients',
  'Support réactif',
]

const PRO_FEATURES = [
  'Tout du plan Essentiel',
  'Clients illimités',
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
  const [toast, setToast] = useState(false)

  const showToast = () => {
    setToast(true)
    setTimeout(() => setToast(false), 4000)
  }

  const isEssential = currentPlan === 'essential'
  const isPro = currentPlan === 'pro'

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Choisissez votre plan</h1>
        <p className="text-[#6B6B6B]">Débloquez toutes les fonctionnalités de VanCart</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

        {/* Plan Essentiel */}
        <div className={`bg-white rounded-2xl p-7 flex flex-col border-2 relative ${isEssential ? 'border-[#6C47FF]' : 'border-[#6C47FF]'} shadow-lg shadow-[#6C47FF]/10`}>
          <div className="absolute -top-3.5 left-6">
            {isEssential ? (
              <div className="bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                Votre plan actuel
              </div>
            ) : (
              <div className="bg-[#6C47FF] text-white text-xs font-bold px-4 py-1 rounded-full">
                Le plus populaire
              </div>
            )}
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
            onClick={showToast}
            disabled={isEssential}
            className="mt-6 w-full py-3 bg-[#6C47FF] text-white font-semibold rounded-xl hover:bg-[#5835e0] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEssential ? 'Plan actuel' : 'Choisir Essentiel'}
          </button>
        </div>

        {/* Plan Pro */}
        <div className={`bg-white rounded-2xl p-7 flex flex-col border ${isPro ? 'border-2 border-[#6C47FF]' : 'border-[#E8E8E3]'} relative`}>
          <div className="absolute -top-3.5 left-6">
            {isPro ? (
              <div className="bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                Votre plan actuel
              </div>
            ) : (
              <div className="bg-[#F7F6F3] text-[#6B6B6B] border border-[#E8E8E3] text-xs font-bold px-4 py-1 rounded-full">
                Pour aller plus loin
              </div>
            )}
          </div>

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
            onClick={showToast}
            disabled={isPro}
            className="mt-6 w-full py-3 border border-[#E8E8E3] text-[#1A1A1A] font-semibold rounded-xl hover:bg-[#F7F6F3] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPro ? 'Plan actuel' : 'Choisir Pro'}
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-[#6B6B6B]">
        Des questions ? Écrivez-nous à{' '}
        <a href={`mailto:${CONTACT}`} className="text-[#6C47FF] hover:underline font-medium">
          {CONTACT}
        </a>
      </p>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg animate-fade-in">
          Disponible prochainement — contactez-nous à {CONTACT}
        </div>
      )}
    </div>
  )
}
