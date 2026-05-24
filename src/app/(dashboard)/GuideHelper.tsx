'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STEPS = [
  {
    num: '01',
    title: 'Configurez votre commerce',
    desc: 'Logo, couleur de marque, règle de fidélité, nombre de tampons — 2 minutes.',
    href: '/dashboard/onboarding',
    cta: 'Lancer l\'assistant →',
  },
  {
    num: '02',
    title: 'Imprimez votre QR code',
    desc: 'Téléchargez le QR code depuis "Mon commerce" et posez-le en caisse.',
    href: '/dashboard/settings',
    cta: 'Mon commerce →',
  },
  {
    num: '03',
    title: 'Tamponnez les cartes clients',
    desc: 'Bouton "Tamponner" → scannez le QR code du client ou recherchez par téléphone.',
    href: '/dashboard/stamp',
    cta: 'Tamponner →',
  },
  {
    num: '04',
    title: 'Partagez avec vos clients',
    desc: 'Envoyez le lien de votre carte sur Instagram, WhatsApp, ou vos menus.',
    href: '/dashboard/settings',
    cta: 'Copier le lien →',
  },
]

const LS_KEY = 'vancart_guide_seen_v2'

export default function GuideHelper() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(LS_KEY)
    if (!seen) {
      const timer = setTimeout(() => setOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  function close() {
    localStorage.setItem(LS_KEY, 'true')
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-[#6C47FF] text-white rounded-full shadow-lg flex items-center justify-center text-xl font-bold hover:bg-[#5835e0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6C47FF] focus:ring-offset-2"
        aria-label="Guide d'aide"
      >
        ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) close() }}
        >
          <div className="bg-white border border-[#E8E8E3] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#6C47FF] px-6 py-5 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Guide de démarrage</h2>
              <p className="text-white/70 text-sm mt-0.5">Lancez votre programme de fidélité en 10 minutes</p>
            </div>

            <div className="p-6 space-y-4">
              {STEPS.map(({ num, title, desc, href, cta }) => (
                <div key={num} className="flex gap-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#6C47FF]/10 flex items-center justify-center text-xs font-bold text-[#6C47FF]">
                    {num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
                    <p className="text-xs text-[#6B6B6B] mt-0.5 leading-relaxed">{desc}</p>
                    <Link
                      href={href}
                      onClick={close}
                      className="inline-block mt-1.5 text-xs text-[#6C47FF] font-medium hover:underline"
                    >
                      {cta}
                    </Link>
                  </div>
                </div>
              ))}

              <div className="pt-2 space-y-2">
                <button
                  onClick={close}
                  className="w-full py-3 bg-[#6C47FF] text-white rounded-xl text-sm font-semibold hover:bg-[#5835e0] transition-colors"
                >
                  Commencer !
                </button>
                <button
                  onClick={close}
                  className="w-full py-2 text-xs text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
                >
                  Ne plus afficher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
