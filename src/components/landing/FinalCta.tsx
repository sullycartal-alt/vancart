import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function FinalCta() {
  return (
    <section className="relative z-[2] text-center" style={{ padding: '120px 0' }}>
      <div className="max-w-[1200px] mx-auto px-8 reveal">
        {/* stamp dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[1,2,3,4].map(i => <i key={i} className="w-[11px] h-[11px] rounded-full block" style={{ background: 'var(--violet)' }} />)}
          <i className="w-[11px] h-[11px] rounded-full border-[1.6px] block opacity-35" style={{ borderColor: 'var(--violet)' }} />
        </div>
        <h2 className="font-bold" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5.5vw, 76px)', letterSpacing: '-0.035em', lineHeight: 0.98, color: 'var(--ink)' }}>
          Vos clients méritent mieux<br />qu'un bout de carton.
        </h2>
        <p className="mt-6 mb-9 mx-auto text-[20px]" style={{ color: 'var(--ink-soft)', maxWidth: 520, lineHeight: 1.6 }}>
          Créez votre carte de fidélité gratuitement. Opérationnel en cinq minutes, sans carte bancaire.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 font-semibold text-white rounded-[13px] transition-all duration-200 hover:-translate-y-0.5"
          style={{ fontFamily: 'var(--font-display)', fontSize: 17, padding: '18px 34px', background: 'var(--violet)', boxShadow: '0 10px 24px -8px rgba(108,71,255,.6)' }}
        >
          Créer ma carte maintenant <ArrowRight size={18} strokeWidth={1.9} />
        </Link>
      </div>
    </section>
  )
}
