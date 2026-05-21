import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                VanCart
              </Link>
              <div className="hidden sm:flex items-center gap-6">
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                  Accueil
                </Link>
                <Link href="/dashboard/clients" className="text-sm text-gray-600 hover:text-gray-900">
                  Mes clients
                </Link>
                <Link href="/dashboard/stats" className="text-sm text-gray-600 hover:text-gray-900">
                  Stats
                </Link>
                <Link href="/dashboard/guide" className="text-sm text-gray-600 hover:text-gray-900">
                  Guide
                </Link>
                <Link href="/dashboard/settings" className="text-sm text-gray-600 hover:text-gray-900">
                  Mon commerce
                </Link>
                <Link
                  href="/dashboard/stamp"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700"
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
    </div>
  )
}
