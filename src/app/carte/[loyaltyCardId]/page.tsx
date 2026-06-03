import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import CardClient from './CardClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ loyaltyCardId: string }>
}

export default async function CartePage({ params }: Props) {
  const { loyaltyCardId } = await params
  const service = createServiceClient()

  const { data: card, error } = await service
    .from('loyalty_cards')
    .select('id, stamps_count, points, rewards_unlocked, customer_id, merchant_id, merchants(business_name, logo_url, primary_color, merchant_color_2, loyalty_rule, stamps_required, loyalty_type, points_required, banner_url), customers(first_name)')
    .eq('id', loyaltyCardId)
    .single()

  if (error || !card) notFound()

  const normalised = {
    ...card,
    merchants: Array.isArray(card.merchants) ? card.merchants[0] : card.merchants,
    customers: Array.isArray(card.customers) ? card.customers[0] : card.customers,
  }

  return (
    <CardClient
      initialCard={normalised as Parameters<typeof CardClient>[0]['initialCard']}
      customerId={card.customer_id as string}
      merchantId={card.merchant_id as string}
    />
  )
}

