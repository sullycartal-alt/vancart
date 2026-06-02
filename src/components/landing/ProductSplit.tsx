import { Wallet, RefreshCw, BellRing, Check, QrCode } from 'lucide-react'

const FEATURES = [
  { icon: Wallet, title: 'Apple & Google Wallet natifs', desc: 'La carte s\'installe en un tap, à côté de la carte d\'embarquement et du pass transport. Là où le client regarde déjà.' },
  { icon: RefreshCw, title: 'Mise à jour en temps réel', desc: 'Un tampon donné, et la carte se met à jour dans la poche du client. Instantanément.' },
  { icon: BellRing, title: 'Notifications qui font revenir', desc: '« Plus qu\'un tampon avant votre récompense. » Le bon message, au bon moment.' },
]

function MiniCard() {
  const stamps = [true, true, true, true, true, true, true, false, false, false]
  return (
    <div className="rounded-[26px] p-[26px] text-white mb-3.5" style={{ background: 'linear-gradient(150deg, #7C5CFC 0%, #6C47FF 45%, #5126C9 100%)', boxShadow: '0 1px 0 rgba(255,255,255,.6) inset, 0 24px 60px -20px rgba(21,19,26,.28), 0 8px 20px -12px rgba(108,71,255,.35)' }}>
      <div className="flex items-center gap-3 mb-5">
        <span className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center font-bold text-[15px]" style={{ background: 'rgba(255,255,255,.18)', fontFamily: 'var(--font-display)' }}>CA</span>
        <div>
          <b className="block text-[16px] font-bold leading-[1.1]" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Café des Arts</b>
          <small className="text-[11px] opacity-70">Carte de fidélité</small>
        </div>
      </div>
      <div className="text-[13px] font-medium opacity-85 mb-4" style={{ fontFamily: 'var(--font-display)' }}>9 cafés achetés, le 10ᵉ offert</div>
      <div className="grid grid-cols-5 gap-[11px] mb-4">
        {stamps.map((on, i) => (
          <div key={i} className={`aspect-square rounded-full flex items-center justify-center ${on ? 'bg-white' : 'border-[1.6px] border-dashed border-white/40'}`}>
            {on && <Check size={16} strokeWidth={1.9} color="#6C47FF" />}
          </div>
        ))}
      </div>
      <div className="text-[12px] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>7 / 10 tampons</div>
    </div>
  )
}

export default function ProductSplit() {
  return (
    <section id="produit" className="relative z-[2]" style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '110px 0' }}>
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-[70px] items-center">
          {/* Left */}
          <div className="reveal">
            <span className="flex items-center gap-3 mb-5" style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--violet)' }}>
              <span className="flex items-center gap-2">
                {[0,1,2].map(i => <i key={i} className="w-[11px] h-[11px] rounded-full block" style={{ background: 'var(--violet)' }} />)}
              </span>
              Le produit
            </span>
            <h2 className="font-bold mb-[14px]" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 4.4vw, 56px)', letterSpacing: '-0.035em', lineHeight: 0.98, color: 'var(--ink)' }}>
              Une carte vivante,<br />pas un bout de carton.
            </h2>
            <div className="flex flex-col gap-6 mt-5">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 items-start">
                  <span className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--paper)', border: '1px solid var(--line)', color: 'var(--violet)' }}>
                    <Icon size={21} strokeWidth={1.9} />
                  </span>
                  <div>
                    <h3 className="text-[18px] font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: 'var(--ink)' }}>{title}</h3>
                    <p className="mt-1.5 text-[14.5px]" style={{ color: 'var(--ink-soft)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — phone mockup */}
          <div className="reveal flex items-center justify-center md:order-none order-first">
            <div className="relative rounded-[44px] p-[7px]" style={{ width: 290, background: '#15131A', boxShadow: '0 1px 0 rgba(255,255,255,.6) inset, 0 24px 60px -20px rgba(21,19,26,.28)' }}>
              {/* notch */}
              <div className="absolute top-[7px] left-1/2 -translate-x-1/2 z-[5] rounded-b-[16px]" style={{ width: 90, height: 26, background: '#15131A' }} />
              <div className="rounded-[38px] overflow-hidden min-h-[540px] p-[18px_16px] pt-[44px]" style={{ background: 'var(--bg)' }}>
                <MiniCard />
                <div className="rounded-[14px] p-[12px_14px] flex items-center gap-3" style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}>
                  <span className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--violet) 12%, transparent)', color: 'var(--violet)' }}>
                    <QrCode size={18} strokeWidth={1.9} />
                  </span>
                  <div>
                    <b className="block text-[13px] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Présenter en caisse</b>
                    <div className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>Scannez pour ajouter un tampon</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
