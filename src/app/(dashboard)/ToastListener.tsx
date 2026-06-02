'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check } from 'lucide-react'

const MESSAGES: Record<string, string> = {
  password_updated: 'Mot de passe mis à jour !',
}

export default function ToastListener() {
  const searchParams = useSearchParams()
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const key = searchParams.get('toast')
    if (key && MESSAGES[key]) {
      setToast(MESSAGES[key])
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [searchParams])

  if (!toast) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg animate-fade-in flex items-center gap-2">
      <Check size={16} strokeWidth={1.9} className="text-green-400 flex-shrink-0" />
      {toast}
    </div>
  )
}
