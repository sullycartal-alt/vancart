'use client'

import { useState } from 'react'
import { ChevronDown, Share, Plus, MoreVertical } from 'lucide-react'

interface Props {
  /** Si true, affiché toujours ouvert (dashboard). Sinon accordéon repliable (caisse). */
  alwaysOpen?: boolean
  /** Style sombre pour fond violet (caisse). */
  variant?: 'light' | 'onColor'
}

export default function InstallTutorial({ alwaysOpen = false, variant = 'light' }: Props) {
  const [open, setOpen] = useState(alwaysOpen)
  const onColor = variant === 'onColor'

  const textMuted = onColor ? 'text-white/70' : 'text-[#6B6B6B]'
  const textStrong = onColor ? 'text-white' : 'text-[#1A1A1A]'

  const content = (
    <div className="space-y-4 text-sm">
      <div className="space-y-1.5">
        <p className={`font-semibold ${textStrong}`}>📱 Sur iPhone (Safari)</p>
        <ol className={`space-y-1 ${textMuted} list-decimal list-inside`}>
          <li className="flex items-center gap-1.5"><Share size={14} strokeWidth={1.9} className="inline" /> Touchez le bouton Partager</li>
          <li>Choisissez « Sur l&apos;écran d&apos;accueil »</li>
          <li>Validez : l&apos;icône caisse apparaît sur votre écran</li>
        </ol>
      </div>
      <div className="space-y-1.5">
        <p className={`font-semibold ${textStrong}`}>🤖 Sur Android (Chrome)</p>
        <ol className={`space-y-1 ${textMuted} list-decimal list-inside`}>
          <li className="flex items-center gap-1.5"><MoreVertical size={14} strokeWidth={1.9} className="inline" /> Ouvrez le menu (3 points)</li>
          <li className="flex items-center gap-1.5"><Plus size={14} strokeWidth={1.9} className="inline" /> « Ajouter à l&apos;écran d&apos;accueil »</li>
          <li>Validez : l&apos;icône caisse apparaît sur votre écran</li>
        </ol>
      </div>
    </div>
  )

  if (alwaysOpen) {
    return content
  }

  const border = onColor ? 'border-white/20' : 'border-[#E8E8E3]'
  const bg = onColor ? 'bg-white/10' : 'bg-white'

  return (
    <div className={`rounded-2xl border ${border} ${bg} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold ${textStrong}`}
      >
        Comment installer cette page
        <ChevronDown size={18} strokeWidth={1.9} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4">{content}</div>}
    </div>
  )
}
