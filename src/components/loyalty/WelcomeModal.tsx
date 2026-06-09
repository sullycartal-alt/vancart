'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'vancart_welcome_seen'

interface Props {
  show: boolean
  onDismiss: () => void
}

export default function WelcomeModal({ show, onDismiss }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show) return
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [show])

  function handleStart() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
    onDismiss()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-[#F0EDFF] rounded-2xl flex items-center justify-center mx-auto text-3xl select-none">
          👋
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-black text-[#1A1A1A]">Bienvenue sur VanCart !</h1>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Configurez votre carte de fidélité en quelques minutes et commencez à fidéliser vos clients.
          </p>
        </div>
        <button
          onClick={handleStart}
          className="w-full py-4 bg-[#6C47FF] hover:bg-[#5835e0] text-white font-bold text-base rounded-xl transition-colors"
        >
          Créer ma carte →
        </button>
      </div>
    </div>
  )
}
