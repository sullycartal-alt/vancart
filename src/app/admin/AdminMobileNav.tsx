'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdminMobileNav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden flex items-center justify-center w-10 h-10 rounded-xl text-white hover:bg-white/10 transition-colors"
        aria-label="Ouvrir le menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />
          <div className="absolute top-0 left-0 right-0 bg-[#1A1A1A] rounded-b-2xl shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <span className="text-sm font-bold text-red-400">Admin</span>
              <button
                onClick={close}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-white/10 transition-colors text-xl"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <nav className="px-4 py-3 space-y-1">
              <Link href="/admin" onClick={close}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 font-medium text-sm hover:bg-white/10 transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/prospection" onClick={close}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 font-medium text-sm hover:bg-white/10 transition-colors">
                Prospection
              </Link>
              <Link href="/dashboard" onClick={close}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 font-medium text-sm hover:bg-white/10 transition-colors">
                ← Retour app
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
