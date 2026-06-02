import { Store, QrCode, Smartphone, TrendingUp, ArrowRight } from 'lucide-react'

const STEPS = [
  { num: '01', icon: Store, title: 'Créez votre carte', desc: 'Vos couleurs, votre règle de fidélité, votre récompense. En deux minutes.' },
  { num: '02', icon: QrCode, title: 'Posez le QR en caisse', desc: 'Un code unique à imprimer. Il vit sur votre comptoir, c\'est tout.' },
  { num: '03', icon: Smartphone, title: 'Le client scanne', desc: 'La carte tombe dans son Wallet. Sans appli, sans compte, sans friction.' },
  { num: '04', icon: TrendingUp, title: 'Fidélisez, analysez', desc: 'Un clic pour tamponner. Vos stats se construisent toutes seules.' },
]

export default function Steps() {
  return (
    <section id="comment" className="relative z-[2]" style={{ padding: '110px 0' }}>
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="reveal mb-[60px]">
          <span className="flex items-center gap-3 mb-5" style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--violet)' }}>
            <span className="flex items-center gap-2">
              <i className="w-[11px] h-[11px] rounded-full block" style={{ background: 'var(--violet)' }} />
              <i className="w-[11px] h-[11px] rounded-full block" style={{ background: 'var(--violet)' }} />
            </span>
            Comment ça marche
          </span>
          <h2 className="font-bold" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 4.4vw, 58px)', letterSpacing: '-0.035em', lineHeight: 0.98, color: 'var(--ink)' }}>
            Opérationnel avant<br />votre prochain café.
          </h2>
          <p className="mt-5 text-[19px]" style={{ color: 'var(--ink-soft)', maxWidth: 560 }}>
            Quatre étapes, cinq minutes. Pas de matériel, pas de contrat, pas de formation.
          </p>
        </div>

        <div className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-[18px] border border-[var(--line)]" style={{ background: 'var(--paper)' }}>
          {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
            <div
              key={num}
              className="relative p-[34px_28px] border-b lg:border-b-0 border-r-0 lg:border-r border-[var(--line)] last:border-none sm:[&:nth-child(2)]:border-r-0 lg:[&:nth-child(2)]:border-r"
            >
              <span className="block text-[13px] font-semibold tracking-[0.1em]" style={{ fontFamily: 'var(--font-display)', color: 'var(--violet)' }}>{num}</span>
              <div className="mt-5 mb-5 w-[52px] h-[52px] rounded-[14px] flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--violet) 10%, transparent)', color: 'var(--violet)' }}>
                <Icon size={25} strokeWidth={1.9} />
              </div>
              <h3 className="text-[20px] font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: 'var(--ink)' }}>{title}</h3>
              <p className="mt-2.5 text-[14.5px] leading-[1.55]" style={{ color: 'var(--ink-soft)' }}>{desc}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden lg:flex absolute top-[48px] right-[-13px] w-[26px] h-[26px] rounded-full z-[5] items-center justify-center" style={{ background: 'var(--paper)', border: '1px solid var(--line)', color: 'var(--ink-faint)' }}>
                  <ArrowRight size={14} strokeWidth={1.9} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
