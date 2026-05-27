import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientsTable from './ClientsTable'

export default async function ClientsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, stamps_required, points_required, primary_color, loyalty_type')
    .eq('user_id', user.id)
    .single()

  if (!merchant) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Mes clients</h1>
        <div className="bg-white border border-[#E8E8E3] rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm text-[#6B6B6B]">Configurez votre commerce pour voir vos clients.</p>
          <a href="/dashboard/settings" className="inline-block px-5 py-2.5 bg-[#6C47FF] text-white text-sm font-semibold rounded-xl hover:bg-[#5835e0] transition-colors">
            Configurer mon commerce →
          </a>
        </div>
      </div>
    )
  }

  const [{ data: cards }, { data: lastStamps }] = await Promise.all([
    supabase
      .from('loyalty_cards')
      .select('id, stamps_count, rewards_unlocked, customers(first_name, phone)')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('stamps')
      .select('loyalty_card_id, given_at')
      .eq('merchant_id', merchant.id)
      .order('given_at', { ascending: false }),
  ])

  // Map last stamp per card (stamps are ordered desc so first match = latest)
  const lastStampMap = new Map<string, string>()
  for (const s of lastStamps ?? []) {
    if (!lastStampMap.has(s.loyalty_card_id)) {
      lastStampMap.set(s.loyalty_card_id, s.given_at)
    }
  }

  const loyaltyType = (merchant.loyalty_type ?? 'stamps') as 'stamps' | 'points'
  const clients = (cards ?? []).map((card) => ({
    ...card,
    customers: Array.isArray(card.customers) ? card.customers[0] : card.customers,
    last_stamp_at: lastStampMap.get(card.id) ?? null,
    stampsRequired: merchant.stamps_required,
    pointsRequired: merchant.points_required ?? 100,
    loyaltyType,
    primaryColor: merchant.primary_color,
  })) as Parameters<typeof ClientsTable>[0]['clients']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Mes clients</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          {clients.length} client{clients.length !== 1 ? 's' : ''} avec une carte de fidélité
        </p>
      </div>
      <ClientsTable clients={clients} />
    </div>
  )
}
