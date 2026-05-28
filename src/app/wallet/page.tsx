import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import WalletClient, { type WalletCard } from './WalletClient'

export const metadata: Metadata = {
  title: 'Mon Wallet — VanCart',
}

export const dynamic = 'force-dynamic'

export default async function WalletPage() {
  const cookieStore = await cookies()
  const customerId = cookieStore.get('vancart_customer_id')?.value

  if (!customerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3] px-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-[#6C47FF]/10">
            <svg className="w-8 h-8 text-[#6C47FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              <rect x="14" y="3" width="7" height="7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              <rect x="3" y="14" width="7" height="7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 14h3v3m0 4h4m-4 0v-4m4-4v4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Mon Wallet</h1>
            <p className="mt-2 text-sm text-[#6B6B6B] leading-relaxed">
              Scannez un QR code chez un commerçant VanCart pour voir vos cartes ici
            </p>
          </div>
        </div>
      </div>
    )
  }

  const service = createServiceClient()

  const { data: cards } = await service
    .from('loyalty_cards')
    .select(
      'id, stamps_count, points, rewards_unlocked, customers(first_name), merchants(id, business_name, primary_color, loyalty_rule, stamps_required, loyalty_type, points_required, logo_url)'
    )
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  // Fetch banner_url separately — graceful if column doesn't exist yet
  const merchantIds = (cards ?? [])
    .map((c) => {
      const m = Array.isArray(c.merchants) ? c.merchants[0] : c.merchants
      return (m as { id?: string } | null)?.id
    })
    .filter((id): id is string => Boolean(id))

  const bannerMap: Record<string, string | null> = {}
  if (merchantIds.length > 0) {
    const { data: banners, error: bannerErr } = await service
      .from('merchants')
      .select('id, banner_url')
      .in('id', merchantIds)
    if (!bannerErr && banners) {
      for (const b of banners) {
        bannerMap[b.id] = (b as { id: string; banner_url?: string | null }).banner_url ?? null
      }
    }
  }

  const normalised: WalletCard[] = (cards ?? []).map((c) => {
    const m = (Array.isArray(c.merchants) ? c.merchants[0] : c.merchants) as {
      id: string
      business_name: string
      primary_color: string
      loyalty_rule: string
      stamps_required: number
      loyalty_type: string | null
      points_required: number | null
      logo_url: string | null
    } | null
    const customer = (Array.isArray(c.customers) ? c.customers[0] : c.customers) as {
      first_name: string
    } | null
    const merchantId = m?.id ?? ''
    return {
      id: c.id,
      stamps_count: c.stamps_count,
      points: (c as { points?: number | null }).points ?? 0,
      rewards_unlocked: c.rewards_unlocked,
      first_name: customer?.first_name ?? '',
      merchants: {
        id: merchantId,
        business_name: m?.business_name ?? '',
        primary_color: m?.primary_color ?? '#6C47FF',
        loyalty_rule: m?.loyalty_rule ?? '',
        stamps_required: m?.stamps_required ?? 10,
        loyalty_type: m?.loyalty_type ?? null,
        points_required: m?.points_required ?? null,
        logo_url: m?.logo_url ?? null,
        banner_url: bannerMap[merchantId] ?? null,
      },
    }
  })

  return (
    <div className="min-h-screen bg-[#F7F6F3] px-4 py-8">
      <div className="max-w-sm mx-auto space-y-6">
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2 }}>
            Mon Wallet
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            {normalised.length} carte{normalised.length !== 1 ? 's' : ''} de fidélité
          </p>
        </div>
        <WalletClient cards={normalised} />
      </div>
    </div>
  )
}
