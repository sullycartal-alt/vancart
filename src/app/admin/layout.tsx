import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const ADMIN_EMAILS = ['sullycartal@gmail.com', 'audrey@vancart.fr']

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!user.email || !ADMIN_EMAILS.includes(user.email)) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <nav className="bg-[#1A1A1A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-6">
              <span className="text-sm font-bold text-red-400">⚙ Admin VanCart</span>
              <Link href="/admin" className="text-sm text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/prospection" className="text-sm text-gray-300 hover:text-white transition-colors">
                🎯 Prospection
              </Link>
            </div>
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Retour app
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
