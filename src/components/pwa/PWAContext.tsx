'use client'

import { createContext, useContext } from 'react'

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

export interface PWAContextValue {
  installPrompt: BeforeInstallPromptEvent | null
  isInstalled: boolean
  isIOS: boolean
  isStandalone: boolean
  triggerInstall: () => Promise<void>
}

export const PWAContext = createContext<PWAContextValue>({
  installPrompt: null,
  isInstalled: false,
  isIOS: false,
  isStandalone: false,
  triggerInstall: async () => {},
})

export function usePWAContext() {
  return useContext(PWAContext)
}
