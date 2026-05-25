import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StampClient from './StampClient'

export default async function StampPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, business_name, stamps_required, primary_color, loyalty_type, points_per_euro, points_required')
    .eq('user_id', user.id)
    .single()

  if (!merchant) {
    return (
      <div className="max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Donner un tampon</h1>
        <div className="bg-white border border-[#E8E8E3] rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm text-[#6B6B6B]">Configurez votre commerce pour commencer à tamponner.</p>
          <a href="/dashboard/settings" className="inline-block px-5 py-2.5 bg-[#6C47FF] text-white text-sm font-semibold rounded-xl hover:bg-[#5835e0] transition-colors">
            Configurer mon commerce →
          </a>
        </div>
      </div>
    )
  }

  const isPoints = merchant.loyalty_type === 'points'

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const [
    { count: stampsTodayCount },
    { count: stampsMonthCount },
    { data: recentStampsData },
    { data: monthStampsData },
    { data: rewardsData },
  ] = await Promise.all([
    supabase.from('stamps').select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant.id).gte('given_at', todayStart.toISOString()),
    supabase.from('stamps').select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant.id).gte('given_at', monthStart.toISOString()),
    supabase.from('stamps')
      .select('given_at, loyalty_cards(stamps_count, customers(first_name, phone))')
      .eq('merchant_id', merchant.id)
      .order('given_at', { ascending: false })
      .limit(5),
    supabase.from('stamps')
      .select('loyalty_card_id, loyalty_cards(customers(first_name, phone))')
      .eq('merchant_id', merchant.id)
      .gte('given_at', monthStart.toISOString()),
    supabase.from('loyalty_cards')
      .select('rewards_unlocked')
      .eq('merchant_id', merchant.id),
  ])

  // Build top 3 clients from monthly stamps
  const clientCounts = new Map<string, { first_name: string; phone: string; count: number }>()
  for (const stamp of (monthStampsData ?? [])) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customer = (stamp.loyalty_cards as any)?.customers as { first_name: string; phone: string } | null
    if (!customer) continue
    const key = customer.phone
    const entry = clientCounts.get(key)
    if (entry) { entry.count++ } else { clientCounts.set(key, { ...customer, count: 1 }) }
  }
  const topClients = Array.from(clientCounts.values()).sort((a, b) => b.count - a.count).slice(0, 3)
  const rewardsMonth = (rewardsData ?? []).reduce((sum, c) => sum + (c.rewards_unlocked ?? 0), 0)

  // Recent stamps with customer info
  const recentStamps = (recentStampsData ?? [])
    .map(s => ({
      given_at: s.given_at as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      customer: (s.loyalty_cards as any)?.customers as { first_name: string; phone: string } | null,
    }))
    .filter(s => s.customer !== null)

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          {isPoints ? 'Valider un achat' : 'Donner un tampon'}
        </h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          {isPoints
            ? "Scannez la carte du client et entrez le montant de l'achat."
            : 'Scannez le QR code du client ou recherchez par téléphone.'}
        </p>
      </div>
      <StampClient
        merchant={merchant}
        stampsToday={stampsTodayCount ?? 0}
        stampsMonth={stampsMonthCount ?? 0}
        rewardsTotal={rewardsMonth}
        recentStamps={recentStamps as { given_at: string; customer: { first_name: string; phone: string } }[]}
        topClients={topClients}
      />
    </div>
  )
}
