import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DashboardQR from './DashboardQR'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // No merchant yet — prompt to configure
  if (!merchant) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">Tableau de bord</h1>
        <div className="bg-white border border-[#E8E8E3] rounded-2xl p-8 text-center space-y-4">
          <div className="text-4xl">🚀</div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">Bienvenue sur VanCart !</h2>
          <p className="text-sm text-[#6B6B6B]">Configurez votre commerce pour démarrer votre programme de fidélité.</p>
          <Link
            href="/dashboard/onboarding"
            className="inline-block px-6 py-3 bg-[#6C47FF] text-white text-sm font-semibold rounded-xl hover:bg-[#5835e0] transition-colors"
          >
            Lancer l&apos;assistant de configuration →
          </Link>
        </div>
      </div>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [{ count: activeCards }, { count: stampsToday }, { data: rewardsData }] = await Promise.all([
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
  ])

  const totalRewards = rewardsData?.reduce((sum, c) => sum + c.rewards_unlocked, 0) ?? 0

  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${merchant.slug}`

  return (
    <div className="space-y-6">
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
        style={{ backgroundColor: merchant.primary_color }}
      >
        <div>
          <p className="text-lg font-bold">Donner un tampon</p>
          <p className="text-sm mt-0.5 opacity-75">Scanner le QR code du client ou rechercher par téléphone</p>
        </div>
        <span className="text-4xl">🪙</span>
      </Link>

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E8E8E3] rounded-xl p-5">
          <p className="text-xs font-medium text-[#6B6B6B]">Cartes actives</p>
          <p className="mt-1.5 text-3xl font-bold text-[#1A1A1A]">{activeCards ?? 0}</p>
        </div>
        <div className="bg-white border border-[#E8E8E3] rounded-xl p-5">
          <p className="text-xs font-medium text-[#6B6B6B]">Tampons aujourd&apos;hui</p>
          <p className="mt-1.5 text-3xl font-bold text-[#1A1A1A]">{stampsToday ?? 0}</p>
        </div>
        <div className="bg-white border border-[#E8E8E3] rounded-xl p-5">
          <p className="text-xs font-medium text-[#6B6B6B]">Récompenses</p>
          <p className="mt-1.5 text-3xl font-bold text-[#1A1A1A]">{totalRewards}</p>
        </div>
      </div>

      {/* QR code widget */}
      <DashboardQR
        url={qrUrl}
        businessName={merchant.business_name}
        color={merchant.primary_color}
      />
    </div>
  )
}
