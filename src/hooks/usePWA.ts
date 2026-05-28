'use client'

import { useCallback, useState } from 'react'
import { usePWAContext } from '@/components/pwa/PWAContext'

const DISMISSED_KEY = 'pwa-banner-dismissed'

export function usePWA() {
  const { installPrompt, isInstalled, isIOS, isStandalone, triggerInstall } = usePWAContext()
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(DISMISSED_KEY) === '1'
  })

  const canInstall = !isStandalone && (installPrompt !== null || (isIOS && !isInstalled))

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }, [])

  return {
    canInstall,
    isInstalled,
    isIOS,
    isStandalone,
    triggerInstall,
    hasBeenDismissed: dismissed,
    dismiss,
  }
}
