import Link from 'next/link'
import { LogoLockup } from '@/components/brand/Logo'
import { ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative z-[2]" style={{ borderTop: '1px solid var(--line)', padding: '54px 0 40px' }}>
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="flex flex-wrap justify-between items-start gap-10">
          <div style={{ maxWidth: 300 }}>
            <LogoLockup size={28} />
            <p className="mt-3 text-[14px]" style={{ color: 'var(--ink-soft)' }}>
              La fidélité digitale pour les commerçants indépendants. Conçu et hébergé en Europe.
            </p>
            <span className="inline-flex items-center gap-2 mt-3.5 text-[12px] px-3 py-1.5 rounded-full" style={{ color: 'var(--ink-soft)', background: 'var(--paper)', border: '1px solid var(--line)' }}>
              <ShieldCheck size={14} strokeWidth={1.9} color="var(--violet)" />
              Données hébergées en Europe 🇪🇺
            </span>
          </div>

          <div className="flex flex-wrap gap-14">
            <div>
              <h4 className="text-[13px] font-semibold tracking-[0.08em] uppercase mb-3.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Produit</h4>
              <a href="#produit" className="block text-[14px] mb-2 transition-colors hover:text-[var(--violet)]" style={{ color: 'var(--ink-soft)' }}>Le produit</a>
              <a href="#comment" className="block text-[14px] mb-2 transition-colors hover:text-[var(--violet)]" style={{ color: 'var(--ink-soft)' }}>Comment ça marche</a>
              <a href="#tarifs" className="block text-[14px] mb-2 transition-colors hover:text-[var(--violet)]" style={{ color: 'var(--ink-soft)' }}>Tarifs</a>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold tracking-[0.08em] uppercase mb-3.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Société</h4>
              <a href="#" className="block text-[14px] mb-2 transition-colors hover:text-[var(--violet)]" style={{ color: 'var(--ink-soft)' }}>À propos</a>
              <a href="#" className="block text-[14px] mb-2 transition-colors hover:text-[var(--violet)]" style={{ color: 'var(--ink-soft)' }}>Confidentialité</a>
              <a href="#" className="block text-[14px] mb-2 transition-colors hover:text-[var(--violet)]" style={{ color: 'var(--ink-soft)' }}>CGU</a>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold tracking-[0.08em] uppercase mb-3.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Contact</h4>
              <a href="mailto:contact@vancart.fr" className="block text-[14px] mb-2 transition-colors hover:text-[var(--violet)]" style={{ color: 'var(--ink-soft)' }}>contact@vancart.fr</a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between mt-11 pt-6 text-[13px] gap-2.5" style={{ borderTop: '1px solid var(--line)', color: 'var(--ink-faint)' }}>
          <span>© 2026 VanCart — Tous droits réservés</span>
          <span>Fait avec soin pour le commerce de quartier</span>
        </div>
      </div>
    </footer>
  )
}
