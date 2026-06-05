'use client'

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

const TRACK = ITEMS.map((name, i) => (
  <span key={i} className="whitespace-nowrap">
    <span className="text-white text-sm font-medium">{name}</span>
    <span className="text-white/50 mx-3">·</span>
  </span>
))

export default function ScrollingCarousel() {
  return (
    <section className="w-full bg-[#6C47FF] py-2.5 overflow-hidden flex items-center">
      <style>{`
        @keyframes vc-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .vc-marquee { animation: vc-marquee 20s linear infinite; }
      `}</style>

      {/* Fixed label — desktop only */}
      <span className="hidden sm:flex items-center gap-2 flex-shrink-0 pl-6 pr-4 text-xs font-medium text-white/70 whitespace-nowrap">
        Ils font confiance à VanCart
        <span className="text-white/30">|</span>
      </span>

      {/* Scrolling track — two identical copies for seamless loop */}
      <div className="overflow-hidden flex-1">
        <div className="vc-marquee flex">
          <div className="flex">{TRACK}</div>
          <div className="flex" aria-hidden>{TRACK}</div>
        </div>
      </div>
    </section>
  )
}
