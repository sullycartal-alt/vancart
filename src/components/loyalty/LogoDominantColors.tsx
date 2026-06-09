'use client'

import { useEffect, useState } from 'react'
import { getPaletteSync } from 'colorthief'

interface Props {
  logoUrl: string | null
  selectedColor: string
  onSelect: (hex: string) => void
}

export default function LogoDominantColors({ logoUrl, selectedColor, onSelect }: Props) {
  const [colors, setColors] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false

    async function extract() {
      if (!logoUrl) {
        setColors([])
        return
      }

      await new Promise<void>((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          if (cancelled) { resolve(); return }
          try {
            const palette = getPaletteSync(img, { colorCount: 2 })
            setColors(palette && palette.length > 0 ? palette.map(c => c.hex()) : [])
          } catch {
            setColors([])
          }
          resolve()
        }
        img.onerror = () => {
          if (!cancelled) setColors([])
          resolve()
        }
        img.src = logoUrl
      })
    }

    extract()
    return () => { cancelled = true }
  }, [logoUrl])

  if (colors.length === 0) return null

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">Couleurs de votre logo</p>
      <div className="flex gap-3 mb-3">
        {colors.map(hex => (
          <button
            key={hex}
            type="button"
            title={hex}
            onClick={() => onSelect(hex)}
            className={`w-9 h-9 rounded-full transition-all hover:scale-110 flex-shrink-0 ${selectedColor === hex ? 'ring-2 ring-offset-2 ring-[#6C47FF]' : ''}`}
            style={{ backgroundColor: hex }}
            aria-label={hex}
          />
        ))}
      </div>
    </div>
  )
}
