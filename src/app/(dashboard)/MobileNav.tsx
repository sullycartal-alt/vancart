'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CircleArrowUp, LogOut } from 'lucide-react'
import NavSettingsHint from './NavSettingsHint'
import { createClient } from '@/lib/supabase/client'
import { RESTRICTIONS_ENABLED } from '@/lib/plan-config'

interface Props {
  isAdmin: boolean
  plan: string
  primaryColor?: string
  hasBusinessName?: boolean
}

const links = [
  { href: '/dashboard', label: 'Accueil' },
  { href: '/dashboard/clients', label: 'Mes clients' },
  { href: '/dashboard/stats', label: 'Tableau de bord' },
  { href: '/dashboard/caisse', label: 'Caisse' },
  { href: '/dashboard/accompagnement', label: 'Accompagnement' },
]

export default function MobileNav({ isAdmin, plan, primaryColor = '#6C47FF', hasBusinessName = true }: Props) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    close()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden flex items-center justify-center w-10 h-10 rounded-xl text-[#1A1A1A] hover:bg-[#F7F6F3] transition-colors"
        aria-label="Ouvrir le menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

          {/* Drawer */}
          <div className="absolute top-0 left-0 right-0 bg-white rounded-b-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E8E3]">
              <span className="text-lg font-bold text-[#6C47FF]">VanCart</span>
              <button
                onClick={close}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-[#6B6B6B] hover:bg-[#F7F6F3] transition-colors text-xl"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {/* Links */}
            <nav className="px-4 py-3 space-y-1">
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#1A1A1A] font-medium text-sm hover:bg-[#F7F6F3] transition-colors"
                >
                  {label}
                </Link>
              ))}
              <NavSettingsHint hasBusinessName={hasBusinessName} variant="mobile" onNavigate={close} />
              {isAdmin && (
                <Link href="/admin" onClick={close}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 font-medium text-sm hover:bg-red-50 transition-colors">
                  Admin
                </Link>
              )}
              {RESTRICTIONS_ENABLED && plan === 'free' && (
                <Link href="/dashboard/upgrade" onClick={close}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#6C47FF] font-medium text-sm bg-[#6C47FF]/8 hover:bg-[#6C47FF]/12 transition-colors">
                  <CircleArrowUp size={16} strokeWidth={1.9} className="inline-block mr-1" />Upgrade vers Essentiel
                </Link>
              )}
            </nav>

            {/* Logout */}
            <div className="px-4 pt-2 pb-1 border-t border-[#E8E8E3] mt-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-[#6B6B6B] font-medium text-sm hover:bg-[#F7F6F3] transition-colors"
              >
                <LogOut size={16} strokeWidth={1.9} />
                Déconnexion
              </button>
            </div>

            {/* CTA Tamponner */}
            <div className="px-4 pb-5 pt-2">
              <Link
                href="/dashboard/stamp"
                onClick={close}
                className="flex items-center justify-center gap-2 w-full py-3.5 text-white font-bold text-sm rounded-xl transition-opacity hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5V16M4.5 4.5h3v3h-3v-3zm10 0h3v3h-3v-3zm0 10h3v3h-3v-3zM4.5 14.5h3v3h-3v-3z" />
                </svg>
                Tamponner
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
