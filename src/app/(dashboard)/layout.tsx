import Link from 'next/link'
import LogoutButton from './LogoutButton'
import GuideHelper from './GuideHelper'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'sullycartal@gmail.com'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.email === ADMIN_EMAIL

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <nav className="bg-white border-b border-[#E8E8E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-[#6C47FF]">
                VanCart
              </Link>
              <div className="hidden sm:flex items-center gap-6">
                <Link href="/dashboard" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors">
                  Accueil
                </Link>
                <Link href="/dashboard/clients" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors">
                  Mes clients
                </Link>
                <Link href="/dashboard/stats" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors">
                  Stats
                </Link>
                <Link href="/dashboard/settings" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors">
                  Mon commerce
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard/stamp"
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-[#6C47FF] rounded-xl hover:bg-[#5835e0] transition-colors"
                >
                  Tamponner
                </Link>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
        {children}
      </main>
      <GuideHelper />
    </div>
  )
}
