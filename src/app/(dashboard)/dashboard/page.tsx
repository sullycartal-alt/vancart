import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Rocket, Stamp } from 'lucide-react'
import DashboardQR from './DashboardQR'
import AlertBanner from './AlertBanner'
import PushNotifySection from './PushNotifySection'
import { effectivePlan, type Plan } from '@/lib/plan-features'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // No merchant yet — prompt to configure via settings
  if (!merchant) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">Tableau de bord</h1>
        <div className="bg-white border border-[#E8E8E3] rounded-2xl p-8 text-center space-y-4">
          <div className="flex justify-center mb-2"><Rocket size={40} strokeWidth={1.9} className="text-[#6C47FF]" /></div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">Bienvenue sur VanCart !</h2>
          <p className="text-sm text-[#6B6B6B]">Configurez votre commerce pour démarrer votre programme de fidélité.</p>
          <Link
            href="/dashboard/settings"
            className="inline-block px-6 py-3 bg-[#6C47FF] text-white text-sm font-semibold rounded-xl hover:bg-[#5835e0] transition-colors"
          >
            Configurer mon commerce →
          </Link>
        </div>
      </div>
    )
  }

  // New merchant: card never configured (primary_color stays at DB default '#000000')
  if (!merchant.primary_color || merchant.primary_color === '#000000') {
    redirect('/dashboard/ma-carte')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [{ count: activeCards }, { count: stampsToday }, { data: rewardsData }, { data: alertsData }] = await Promise.all([
    supabase
      .from('loyalty_cards')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant.id),
    supabase
      .from('stamps')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant.id)
      .gte('given_at', today.toISOString()),
    supabase
      .from('loyalty_cards')
      .select('rewards_unlocked')
      .eq('merchant_id', merchant.id),
    supabase
      .from('stamp_alerts')
      .select('id, message, triggered_at')
      .eq('merchant_id', merchant.id)
      .eq('dismissed', false)
      .eq('auto_dismissed', false)
      .order('triggered_at', { ascending: false })
      .limit(5),
  ])

  const totalRewards = rewardsData?.reduce((sum, c) => sum + c.rewards_unlocked, 0) ?? 0

  const plan = effectivePlan((merchant.plan ?? 'free') as Plan, user.email)
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${merchant.slug}`

  const brandColor = merchant.primary_color && merchant.primary_color !== '#000000'
    ? merchant.primary_color
    : '#6C47FF'

  const activeAlerts = (alertsData ?? []).map(a => ({ id: a.id, message: a.message, triggered_at: a.triggered_at as string }))

  return (
    <div className="space-y-6">
      <div style={{ height: 3, backgroundColor: brandColor, borderRadius: '0 0 4px 4px', marginBottom: 24 }} />
      {activeAlerts.length > 0 && <AlertBanner alerts={activeAlerts} />}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">Tableau de bord</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">{merchant.business_name}</p>
        </div>
        <Link
          href="/dashboard/settings"
          className="text-sm text-[#6C47FF] hover:text-[#5835e0] font-medium transition-colors whitespace-nowrap flex-shrink-0"
        >
          Modifier →
        </Link>
      </div>

      {/* Primary action */}
      <Link
        href="/dashboard/stamp"
        className="flex items-center justify-between text-white rounded-2xl p-6 transition-opacity hover:opacity-90 shadow-sm"
        style={{ backgroundColor: brandColor }}
      >
        <div>
          <p className="text-lg font-bold">Donner un tampon</p>
          <p className="text-sm mt-0.5 opacity-75">Scanner le QR code du client ou rechercher par téléphone</p>
        </div>
        <Stamp size={32} strokeWidth={1.9} className="text-white opacity-90" />
      </Link>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E8E8E3] rounded-xl px-5 py-4 flex items-center justify-between sm:block">
          <p className="text-sm font-medium text-[#6B6B6B]">Cartes actives</p>
          <p className="text-3xl font-bold text-[#1A1A1A] sm:mt-1.5">{activeCards ?? 0}</p>
        </div>
        <div className="bg-white border border-[#E8E8E3] rounded-xl px-5 py-4 flex items-center justify-between sm:block">
          <p className="text-sm font-medium text-[#6B6B6B]">Tampons aujourd&apos;hui</p>
          <p className="text-3xl font-bold text-[#1A1A1A] sm:mt-1.5">{stampsToday ?? 0}</p>
        </div>
        <div className="bg-white border border-[#E8E8E3] rounded-xl px-5 py-4 flex items-center justify-between sm:block">
          <p className="text-sm font-medium text-[#6B6B6B]">Récompenses</p>
          <p className="text-3xl font-bold text-[#1A1A1A] sm:mt-1.5">{totalRewards}</p>
        </div>
      </div>

      {/* QR code widget */}
      <DashboardQR
        url={qrUrl}
        businessName={merchant.business_name}
        color={brandColor}
      />

      {/* Push notifications — Pro only */}
      {plan === 'pro' && <PushNotifySection merchantId={merchant.id} />}
    </div>
  )
}
