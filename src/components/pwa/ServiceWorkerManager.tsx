'use client'

import { useEffect, useState, useCallback } from 'react'
import { PWAContext, type BeforeInstallPromptEvent } from './PWAContext'

export default function ServiceWorkerManager({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showUpdateToast, setShowUpdateToast] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  const [isIOS] = useState(() => {
    if (typeof navigator === 'undefined') return false
    return /iphone|ipad|ipod/i.test(navigator.userAgent)
  })
  const [isStandalone] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then((registration) => {
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing
        if (!worker) return
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(worker)
            setShowUpdateToast(true)
          }
        })
      })
    }).catch((err) => console.error('[SW] Registration failed:', err))

    const beforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    const appInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', beforeInstall)
    window.addEventListener('appinstalled', appInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall)
      window.removeEventListener('appinstalled', appInstalled)
    }
  }, [])

  const triggerInstall = useCallback(async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setInstallPrompt(null)
    }
  }, [installPrompt])

  function handleUpdate() {
    if (waitingWorker) waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    setShowUpdateToast(false)
    window.location.reload()
  }

  return (
    <PWAContext.Provider value={{ installPrompt, isInstalled, isIOS, isStandalone, triggerInstall }}>
      {children}
      {showUpdateToast && (
        <div className="fixed bottom-4 left-4 right-4 z-[100] flex items-center justify-between gap-3 rounded-2xl bg-[#1A1A1A] px-4 py-3 shadow-2xl sm:left-auto sm:right-4 sm:w-80">
          <p className="text-sm text-white font-medium">Mise à jour disponible</p>
          <button
            onClick={handleUpdate}
            className="flex-shrink-0 rounded-xl bg-[#6C47FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5835e0] transition-colors"
          >
            Actualiser
          </button>
        </div>
      )}
    </PWAContext.Provider>
  )
}
