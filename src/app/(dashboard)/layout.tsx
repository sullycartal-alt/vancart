import Link from 'next/link'
import { LogoLockup } from '@/components/brand/Logo'
import LogoutButton from './LogoutButton'
import GuideHelper from './GuideHelper'
import ProNudge from './ProNudge'
import ToastListener from './ToastListener'
import TrialBanner from './TrialBanner'
import MobileNav from './MobileNav'
import NavSettingsHint from './NavSettingsHint'
import { createClient } from '@/lib/supabase/server'
import { effectivePlan, type Plan } from '@/lib/plan-features'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'

const ADMIN_EMAIL = 'sullycartal@gmail.com'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isAdmin = user.email === ADMIN_EMAIL

  const { data: merchant } = await supabase
    .from('merchants')
    .select('plan, trial_ends_at, primary_color, business_name')
    .eq('user_id', user.id)
    .single()

  // No merchant or no name yet → onboarding (no loop: /dashboard/onboarding is in (onboarding) group, not this layout)
  if (!merchant || !merchant.business_name?.trim()) {
    redirect('/dashboard/onboarding')
  }

  const merchantColor = merchant?.primary_color && /^#[0-9a-fA-F]{6}$/.test(merchant.primary_color)
    ? merchant.primary_color
    : '#6C47FF'

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
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col" style={{ '--merchant-color': merchantColor } as React.CSSProperties}>
      {/* Trial banner — free plan only */}
      {plan === 'free' && trialDaysLeft !== null && (
        <TrialBanner daysLeft={trialDaysLeft} endDate={trialEndDate} />
      )}

      {/* Upgrade nudge — free plan with no active trial */}
      {plan === 'free' && trialDaysLeft === null && (
        <div className="border-b border-[#6C47FF]/20 bg-[#6C47FF]/8 py-2 px-4 text-center">
          <span className="text-sm text-[#6C47FF]">
            ✨ Passez à Essentiel pour débloquer Google Wallet et les stats avancées{' '}
            <a href="/dashboard/upgrade" className="font-semibold underline underline-offset-2 hover:text-[#5835e0] transition-colors">
              Voir les plans →
            </a>
          </span>
        </div>
      )}

      <nav className="bg-white/95 backdrop-blur-sm border-b border-[#E8E8E3] sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center">
                <LogoLockup size={26} />
              </Link>
              <div className="hidden sm:flex items-center gap-6">
                <Link prefetch href="/dashboard" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors">
                  Accueil
                </Link>
                <Link prefetch href="/dashboard/clients" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors">
                  Mes clients
                </Link>
                <Link prefetch href="/dashboard/stats" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors">
                  Tableau de bord
                </Link>
                <Link prefetch href="/dashboard/accompagnement" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors">
                  Accompagnement
                </Link>
                <NavSettingsHint hasBusinessName={!!merchant.business_name?.trim()} />
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
                  className="px-4 py-1.5 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--merchant-color, #6C47FF)' }}
                >
                  Tamponner
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/stamp"
                className="sm:hidden px-3 py-2 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90 min-h-[44px] flex items-center"
                style={{ backgroundColor: 'var(--merchant-color, #6C47FF)' }}
              >
                Tamponner
              </Link>
              <LogoutButton />
              <MobileNav isAdmin={isAdmin} plan={plan} primaryColor={merchantColor} hasBusinessName={!!merchant.business_name?.trim()} />
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
