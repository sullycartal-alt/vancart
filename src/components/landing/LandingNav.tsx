'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LogoLockup } from '@/components/brand/Logo'
import { ArrowRight, Menu, X } from 'lucide-react'

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-8 flex items-center justify-between h-[74px]">
        <Link href="/" className="flex items-center">
          <LogoLockup size={32} />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#comment" className="text-[14.5px] font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Comment ça marche</a>
          <a href="#produit" className="text-[14.5px] font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Le produit</a>
          <a href="#tarifs" className="text-[14.5px] font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors">Tarifs</a>
        </div>

        <div className="hidden md:flex items-center gap-5">
          <Link href="/login" className="text-[14.5px] font-semibold text-[var(--ink)]">Connexion</Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 font-semibold text-[15px] text-white px-6 py-3 rounded-[13px] transition-all duration-200"
            style={{ background: 'var(--violet)', boxShadow: '0 10px 24px -8px rgba(108,71,255,.6)' }}
          >
            Créer ma carte <ArrowRight size={16} strokeWidth={1.9} />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[var(--ink)]"
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? <X size={22} strokeWidth={1.9} /> : <Menu size={22} strokeWidth={1.9} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden px-8 pb-6 flex flex-col gap-4 border-t border-[var(--line)]" style={{ background: 'var(--bg)' }}>
          <a href="#comment" onClick={() => setOpen(false)} className="text-[15px] font-medium text-[var(--ink-soft)] py-2">Comment ça marche</a>
          <a href="#produit" onClick={() => setOpen(false)} className="text-[15px] font-medium text-[var(--ink-soft)] py-2">Le produit</a>
          <a href="#tarifs" onClick={() => setOpen(false)} className="text-[15px] font-medium text-[var(--ink-soft)] py-2">Tarifs</a>
          <hr style={{ borderColor: 'var(--line)' }} />
          <Link href="/login" onClick={() => setOpen(false)} className="text-[15px] font-semibold text-[var(--ink)]">Connexion</Link>
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center gap-2 font-semibold text-[15px] text-white px-6 py-3 rounded-[13px]"
            style={{ background: 'var(--violet)' }}
          >
            Créer ma carte <ArrowRight size={16} strokeWidth={1.9} />
          </Link>
        </div>
      )}
    </nav>
  )
}
