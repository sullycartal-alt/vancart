'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const DISCOVER_LINKS = [
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#tableau-de-bord', label: 'Tableau de bord' },
  { href: '#roadmap', label: 'Roadmap' },
]

const MOBILE_LINKS = [
  { href: '#comment-ca-marche', label: 'Comment ça marche' },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#faq', label: 'FAQ' },
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#tableau-de-bord', label: 'Tableau de bord' },
  { href: '#roadmap', label: 'Roadmap' },
]

export default function LandingNav() {
  const [discoverOpen, setDiscoverOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const discoverRef = useRef<HTMLDivElement>(null)
  const mobileRef = useRef<HTMLDivElement>(null)

  // Close menus on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (discoverRef.current && !discoverRef.current.contains(e.target as Node)) {
        setDiscoverOpen(false)
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  return (
    <nav className="border-b border-[#E8E8E3] px-4 sm:px-6 py-4 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <span className="text-xl font-bold text-[#6C47FF]">VanCart</span>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-5">
          <a href="#comment-ca-marche" className="text-sm font-medium text-gray-700 hover:text-[#6C47FF] transition-colors">
            Comment ça marche
          </a>

          {/* Discover dropdown */}
          <div ref={discoverRef} className="relative">
            <button
              onClick={() => setDiscoverOpen(o => !o)}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-[#6C47FF] transition-colors"
            >
              Découvrir
              <svg
                className="w-3.5 h-3.5 transition-transform"
                style={{ transform: discoverOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {discoverOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E8E8E3] py-1.5 z-50">
                {DISCOVER_LINKS.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setDiscoverOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#6C47FF] transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <a href="#tarifs" className="text-sm font-medium text-gray-700 hover:text-[#6C47FF] transition-colors">
            Tarifs
          </a>
          <a href="#faq" className="text-sm font-medium text-gray-700 hover:text-[#6C47FF] transition-colors">
            FAQ
          </a>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Desktop CTA */}
          <Link href="/login" className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-[#6C47FF] transition-colors">
            Connexion
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline text-sm font-semibold text-white bg-[#6C47FF] hover:bg-[#5835e0] px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
          >
            Commencer gratuitement
          </Link>

          {/* Mobile 3-dot menu */}
          <div ref={mobileRef} className="relative sm:hidden">
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors text-xl leading-none"
              aria-label="Menu"
            >
              ⋮
            </button>

            {mobileOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E8E8E3] py-1.5 z-50">
                {MOBILE_LINKS.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#6C47FF] transition-colors"
                  >
                    {label}
                  </a>
                ))}
                <div className="my-1.5 border-t border-[#E8E8E3]" />
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#6C47FF] transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block mx-3 my-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#6C47FF] hover:bg-[#5835e0] rounded-xl text-center transition-colors"
                >
                  Commencer gratuitement
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
