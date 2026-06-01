'use client'

import { useEffect, useRef } from 'react'

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

export default function ScrollingCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // rAF loop to highlight center item
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function tick() {
      const rect = container!.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const items = container!.querySelectorAll<HTMLElement>('[data-item]')
      let minDist = Infinity
      let centerEl: HTMLElement | null = null

      items.forEach(el => {
        const r = el.getBoundingClientRect()
        const dist = Math.abs(r.left + r.width / 2 - centerX)
        if (dist < minDist) {
          minDist = dist
          centerEl = el
        }
      })

      items.forEach(el => {
        if (el === centerEl) {
          el.style.opacity = '1'
          el.style.transform = 'scale(1.08)'
        } else {
          el.style.opacity = '0.65'
          el.style.transform = 'scale(1)'
        }
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Duplicate items for seamless loop
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <section className="py-10 bg-[#F7F6F3]">
      <style>{`
        @keyframes vc-scroll-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .vc-scroll-track {
          animation: vc-scroll-left 30s linear infinite;
          will-change: transform;
        }
        .vc-scroll-track:hover {
          animation-play-state: paused;
        }
        [data-item] {
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
      `}</style>

      <div ref={containerRef} className="overflow-hidden">
        <div ref={trackRef} className="vc-scroll-track flex gap-3" style={{ width: 'max-content' }}>
          {doubled.map((item, i) => (
            <span
              key={i}
              data-item=""
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E8E3] rounded-full text-sm font-semibold text-[#1A1A1A] whitespace-nowrap flex-shrink-0 shadow-sm"
              style={{ opacity: 0.65 }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-gray-300 mt-3">⚠️ test — données fictives</p>
    </section>
  )
}
