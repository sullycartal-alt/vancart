'use client'

import { useEffect, useState } from 'react'

const ITEMS = [
  'Café Voltaire',
  'Pizza Napoli',
  'Boulangerie Martin',
  'Barber Shop Rex',
  'Ramen Yuki',
  'Pâtisserie Sucrée',
  'Bar Le Central',
  'Épicerie Bio Verde',
  'Glacier Douceur',
  'Studio Beauté Léa',
]
const N = ITEMS.length

export default function ScrollingCarousel() {
  const [center, setCenter] = useState(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCenter(c => (c + 1) % N)
      setTick(t => t + 1)
    }, 2000)
    return () => clearInterval(id)
  }, [])

  const prev = (center - 1 + N) % N
  const next = (center + 1) % N

  return (
    <section className="w-full bg-[#6C47FF] py-3 overflow-hidden">
      <style>{`
        @keyframes vc-slide-in {
          from { opacity: 0; transform: translateX(36px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .vc-row-enter { animation: vc-slide-in 0.4s ease forwards; }
      `}</style>

      {/* Desktop: label + 3 badges */}
      <div className="hidden sm:flex items-center justify-center gap-0">
        <span className="text-xs font-medium text-white/70 whitespace-nowrap mr-4">
          Ils font confiance à VanCart ·
        </span>
        <div
          key={tick}
          className="vc-row-enter flex items-center gap-4"
        >
          {[
            { idx: prev, isCenter: false },
            { idx: center, isCenter: true },
            { idx: next, isCenter: false },
          ].map(({ idx, isCenter }) => (
            <span
              key={idx}
              className="inline-flex items-center px-4 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 text-sm font-semibold text-white transition-all duration-400"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: isCenter ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.2)',
                opacity: isCenter ? 1 : 0.6,
                transform: isCenter ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {ITEMS[idx]}
            </span>
          ))}
        </div>
      </div>

      {/* Mobile: single badge */}
      <div className="sm:hidden flex items-center justify-center">
        <span
          key={tick}
          className="vc-row-enter inline-flex items-center px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-semibold text-white"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          {ITEMS[center]}
        </span>
      </div>
    </section>
  )
}
