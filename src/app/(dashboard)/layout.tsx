import Link from 'next/link'
import LogoutButton from './LogoutButton'
import GuideHelper from './GuideHelper'
import { createClient } from '@/lib/supabase/server'
import { effectivePlan, type Plan } from '@/lib/plan-features'

const ADMIN_EMAIL = 'sullycartal@gmail.com'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.email === ADMIN_EMAIL

  const { data: merchant } = await supabase
    .from('merchants')
    .select('plan, trial_ends_at')
    .eq('user_id', user?.id ?? '')
    .single()

  const plan = effectivePlan((merchant?.plan ?? 'free') as Plan, user?.email)

  const trialDaysLeft = (() => {
    if (plan !== 'free' || !merchant?.trial_ends_at) return null
    const diff = new Date(merchant.trial_ends_at).getTime() - Date.now()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  })()

  const trialEndDate = merchant?.trial_ends_at
    ? new Date(merchant.trial_ends_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    : null

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      {/* Trial banner */}
      {plan === 'free' && trialDaysLeft !== null && (
        <div className="bg-[#6C47FF] text-white text-sm px-4 py-2.5 text-center">
          <span>
            🎁 Vous êtes en période d&apos;essai gratuit —{' '}
            <strong>{trialDaysLeft} jour{trialDaysLeft !== 1 ? 's' : ''} restant{trialDaysLeft !== 1 ? 's' : ''}</strong>.{' '}
            Passez au plan Essentiel pour continuer après le {trialEndDate}.
          </span>
          {' '}
          <Link href="/dashboard/upgrade" className="underline font-semibold hover:text-white/80 transition-colors">
            Voir les plans →
          </Link>
        </div>
      )}

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
                <Link href="/dashboard/accompagnement" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors">
                  Accompagnement
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
