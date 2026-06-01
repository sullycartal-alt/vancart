'use client'

import { useEffect, useState } from 'react'

const ITEMS = [
  '☕ Café Voltaire',
  '🍕 Pizza Napoli',
  '🥐 Boulangerie Martin',
  '💈 Barber Shop Rex',
  '🍜 Ramen Yuki',
  '🧁 Pâtisserie Sucrée',
  '🍺 Bar Le Central',
  '🌿 Épicerie Bio Verde',
  '🍦 Glacier Douceur',
  '🎨 Studio Beauté Léa',
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
    <section className="py-10 bg-[#F7F6F3] overflow-hidden">
      <style>{`
        @keyframes vc-slide-in {
          from { opacity: 0; transform: translateX(36px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .vc-row-enter { animation: vc-slide-in 0.4s ease forwards; }
      `}</style>

      {/* Desktop: 3 badges, center highlighted, edge fade */}
      <div
        className="hidden sm:block"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}
      >
        <div key={tick} className="vc-row-enter flex items-center justify-center gap-6 py-5">
          {[
            { idx: prev, isCenter: false },
            { idx: center, isCenter: true },
            { idx: next, isCenter: false },
          ].map(({ idx, isCenter }) => (
            <span
              key={idx}
              className="inline-flex items-center px-6 py-3 rounded-full whitespace-nowrap flex-shrink-0"
              style={{
                fontFamily: 'var(--font-jakarta, "Inter", sans-serif)',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#1A1A1A',
                background: 'white',
                border: isCenter ? '1.5px solid rgba(108,71,255,0.35)' : '1px solid #E8E8E3',
                opacity: isCenter ? 1 : 0.5,
                transform: isCenter ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.4s ease, opacity 0.4s ease',
                boxShadow: isCenter
                  ? '0 4px 20px rgba(108,71,255,0.14)'
                  : '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              {ITEMS[idx]}
            </span>
          ))}
        </div>
      </div>

      {/* Mobile: single badge, slide in on change */}
      <div className="sm:hidden flex items-center justify-center py-5">
        <span
          key={tick}
          className="vc-row-enter inline-flex items-center px-6 py-3 rounded-full whitespace-nowrap"
          style={{
            fontFamily: 'var(--font-jakarta, "Inter", sans-serif)',
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#1A1A1A',
            background: 'white',
            border: '1.5px solid rgba(108,71,255,0.35)',
            boxShadow: '0 4px 20px rgba(108,71,255,0.14)',
          }}
        >
          {ITEMS[center]}
        </span>
      </div>

      <p className="text-center text-xs text-gray-300 mt-3">⚠️ test — données fictives</p>
    </section>
  )
}
