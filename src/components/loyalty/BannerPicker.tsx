'use client'

import { useState } from 'react'
import { ImageIcon, Sparkles } from 'lucide-react'
import { BANNER_PATTERNS, patternTileDataUri, type BannerPattern } from '@/lib/banner-patterns'

const STAMP_COLOR_PRESETS = [
  { name: 'Blanc', hex: '#FFFFFF' },
  { name: 'Noir', hex: '#1A1A1A' },
  { name: 'Or', hex: '#F5C518' },
  { name: 'Argent', hex: '#C0C0C0' },
  { name: 'Rouge', hex: '#E63946' },
]

const STAMP_ICON_OPTIONS = [
  { id: 'check' as const, label: '✓ Validation' },
  { id: 'star' as const, label: '★ Étoile' },
]

interface BannerPickerProps {
  primaryColor: string
  bannerPattern: string | null
  generating: boolean
  onSelectPattern: (pattern: BannerPattern) => void
  stampColor: string
  onSelectStampColor: (hex: string) => void
  stampIcon: 'check' | 'star'
  onSelectStampIcon: (icon: 'check' | 'star') => void
  /** Existing photo-upload UI, rendered as-is under the "Photo" tab. */
  photoSlot: React.ReactNode
}

export default function BannerPicker({
  primaryColor,
  bannerPattern,
  generating,
  onSelectPattern,
  stampColor,
  onSelectStampColor,
  stampIcon,
  onSelectStampIcon,
  photoSlot,
}: BannerPickerProps) {
  const [tab, setTab] = useState<'photo' | 'interactive'>(bannerPattern ? 'interactive' : 'photo')

  const tabClass = (active: boolean) =>
    `flex-1 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center justify-center gap-1.5 ${
      active ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#6B6B6B]'
    }`

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex rounded-xl border border-[#E8E8E3] bg-[#F7F6F3] p-1 gap-1">
        <button type="button" onClick={() => setTab('photo')} className={tabClass(tab === 'photo')}>
          <ImageIcon className="size-4" strokeWidth={1.9} /> Photo
        </button>
        <button type="button" onClick={() => setTab('interactive')} className={tabClass(tab === 'interactive')}>
          <Sparkles className="size-4" strokeWidth={1.9} /> Bannière interactive
        </button>
      </div>

      {tab === 'photo' ? (
        photoSlot
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-[#6B6B6B]">Choisissez un motif : il s&apos;adapte à votre couleur principale.</p>
          <div className="grid grid-cols-3 gap-3">
            {BANNER_PATTERNS.map(({ id, label }) => {
              const tile = patternTileDataUri(id)
              const selected = bannerPattern === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectPattern(id)}
                  disabled={generating}
                  className={`group flex flex-col items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed`}
                  aria-label={label}
                  aria-pressed={selected}
                >
                  <span
                    className={`block w-full h-10 rounded-lg border transition-all ${
                      selected ? 'ring-2 ring-offset-2 ring-[#6C47FF] border-transparent' : 'border-[#E8E8E3] group-hover:border-[#6C47FF]'
                    }`}
                    style={{
                      backgroundColor: primaryColor,
                      backgroundImage: tile ? `url("${tile}")` : undefined,
                      backgroundSize: '40px 40px',
                    }}
                  />
                  <span className={`text-xs ${selected ? 'font-semibold text-[#1A1A1A]' : 'text-[#6B6B6B]'}`}>{label}</span>
                </button>
              )
            })}
          </div>
          {generating && <p className="text-xs text-[#6B6B6B]">Génération de la bannière…</p>}

          {bannerPattern && (
            <div className="pt-3 border-t border-[#E8E8E3] space-y-2">
              <p className="text-xs font-medium text-[#1A1A1A]">Couleur des tampons</p>
              <div className="flex flex-wrap gap-2">
                {[...STAMP_COLOR_PRESETS, { name: 'Couleur principale', hex: primaryColor }].map(({ name, hex }) => (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    onClick={() => onSelectStampColor(hex)}
                    disabled={generating}
                    className="w-8 h-8 rounded-full border border-[#E8E8E3] transition-all hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: hex,
                      outline: stampColor.toLowerCase() === hex.toLowerCase() ? '2px solid #6C47FF' : 'none',
                      outlineOffset: '2px',
                    }}
                    aria-label={name}
                    aria-pressed={stampColor.toLowerCase() === hex.toLowerCase()}
                  />
                ))}
              </div>
            </div>
          )}

          {bannerPattern && (
            <div className="pt-3 border-t border-[#E8E8E3] space-y-2">
              <p className="text-xs font-medium text-[#1A1A1A]">Icône du tampon</p>
              <div className="flex gap-2">
                {STAMP_ICON_OPTIONS.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelectStampIcon(id)}
                    disabled={generating}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                      stampIcon === id ? 'border-[#6C47FF] bg-[#6C47FF]/5 text-[#6C47FF]' : 'border-[#E8E8E3] text-[#6B6B6B]'
                    }`}
                    aria-pressed={stampIcon === id}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
