import Link from 'next/link'
import LogoutButton from './LogoutButton'
import GuideHelper from './GuideHelper'
import ProNudge from './ProNudge'
import ToastListener from './ToastListener'
import TrialBanner from './TrialBanner'
import MobileNav from './MobileNav'
import { createClient } from '@/lib/supabase/server'
import { effectivePlan, type Plan } from '@/lib/plan-features'
import { Suspense } from 'react'

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
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col">
      {/* Trial banner — free plan only */}
      {plan === 'free' && trialDaysLeft !== null && (
        <TrialBanner daysLeft={trialDaysLeft} endDate={trialEndDate} />
      )}

      <nav className="bg-white/95 backdrop-blur-sm border-b border-[#E8E8E3] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-[#6C47FF]">
                VanCart
              </Link>
              <div className="hidden sm:flex items-center gap-6">
                <Link prefetch href="/dashboard" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors">
                  Accueil
                </Link>
                <Link prefetch href="/dashboard/clients" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors">
                  Mes clients
                </Link>
                <Link prefetch href="/dashboard/stats" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors">
                  Stats
                </Link>
                <Link prefetch href="/dashboard/accompagnement" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors">
                  Accompagnement
                </Link>
                <Link prefetch href="/dashboard/settings" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors">
                  Mon commerce
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
                    Admin
                  </Link>
                )}
                {plan === 'free' && (
                  <Link
                    href="/dashboard/upgrade"
                    className="px-3 py-1.5 text-sm font-semibold text-[#6C47FF] bg-[#6C47FF]/10 rounded-xl hover:bg-[#6C47FF]/20 transition-colors"
                  >
                    ⬆️ Upgrade
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
            <div className="flex items-center gap-2">
              <LogoutButton />
              <MobileNav isAdmin={isAdmin} plan={plan} />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
        {children}
      </main>

      {/* Footer — subtle upgrade link for essential plan */}
      {plan === 'essential' && (
        <div className="border-t border-[#E8E8E3] py-3 text-center">
          <Link href="/dashboard/upgrade" className="text-xs text-[#6B6B6B] hover:text-[#6C47FF] transition-colors">
            Passer au plan Pro → Clients illimités, SMS, multi-boutique
          </Link>
        </div>
      )}

      <GuideHelper />
      {plan === 'essential' && <ProNudge />}
      <Suspense><ToastListener /></Suspense>
    </div>
  )
}
