'use client'

import { useEffect, useState } from 'react'
import { usePWA } from '@/hooks/usePWA'

export default function InstallBanner() {
  const { canInstall, hasBeenDismissed, isInstalled, isIOS, triggerInstall, dismiss } = usePWA()
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!canInstall || hasBeenDismissed || isInstalled) return
    const t = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(t)
  }, [canInstall, hasBeenDismissed, isInstalled])

  useEffect(() => { setMounted(true) }, [])

  if (!mounted || !canInstall || hasBeenDismissed || isInstalled) return null

  return (
    <div
      role="banner"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform 400ms ease-out',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E8E8E3] shadow-[0_-8px_32px_rgba(0,0,0,0.12)] rounded-t-3xl px-5 pt-5 pb-4"
    >
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-[10px] text-white font-bold text-xl"
          style={{ backgroundColor: '#6C47FF' }}
        >
          V
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1A1A1A] leading-tight">Installez VanCart</p>
          {isIOS ? (
            <p className="text-xs text-[#6B6B6B] mt-0.5 leading-snug">
              Appuyez sur{' '}
              <svg className="inline w-3.5 h-3.5 mb-0.5" fill="currentColor" viewBox="0 0 24 24" aria-label="Partager">
                <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
              </svg>
              {' '}puis &quot;Sur l&apos;écran d&apos;accueil&quot;
            </p>
          ) : (
            <p className="text-xs text-[#6B6B6B] mt-0.5">Retrouvez toutes vos cartes en un tap</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isIOS && (
            <button
              onClick={triggerInstall}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#6C47FF' }}
            >
              Installer
            </button>
          )}
          <button
            onClick={() => { dismiss(); setVisible(false) }}
            aria-label="Fermer"
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#6B6B6B] hover:bg-[#F7F6F3] transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
