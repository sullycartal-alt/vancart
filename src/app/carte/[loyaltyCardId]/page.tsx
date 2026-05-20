import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import CardClient from './CardClient'

interface Props {
  params: Promise<{ loyaltyCardId: string }>
}

export default async function CartePage({ params }: Props) {
  const { loyaltyCardId } = await params
  const service = createServiceClient()

  const { data: card, error } = await service
    .from('loyalty_cards')
    .select('id, stamps_count, rewards_unlocked, merchants(business_name, logo_url, primary_color, loyalty_rule, stamps_required), customers(first_name)')
    .eq('id', loyaltyCardId)
    .single()

  if (error || !card) notFound()

  // Supabase returns joined relations as arrays; normalise to objects
  const normalised = {
    ...card,
    merchants: Array.isArray(card.merchants) ? card.merchants[0] : card.merchants,
    customers: Array.isArray(card.customers) ? card.customers[0] : card.customers,
  }

  return <CardClient initialCard={normalised as Parameters<typeof CardClient>[0]['initialCard']} />
}
