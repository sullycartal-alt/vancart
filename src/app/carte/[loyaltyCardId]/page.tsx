import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import CardClient from './CardClient'

export const revalidate = 0

interface Props {
  params: Promise<{ loyaltyCardId: string }>
}

export default async function CartePage({ params }: Props) {
  const { loyaltyCardId } = await params
  const service = createServiceClient()

  const { data: card, error } = await service
    .from('loyalty_cards')
    .select('id, stamps_count, points, rewards_unlocked, customer_id, merchants(business_name, logo_url, primary_color, loyalty_rule, stamps_required, loyalty_type, points_required), customers(first_name)')
    .eq('id', loyaltyCardId)
    .single()

  if (error || !card) notFound()

  // Persist customer identity in a long-lived cookie so /wallet can show all cards
  const cookieStore = await cookies()
  cookieStore.set('vancart_customer_id', card.customer_id as string, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === 'production',
  })

  const normalised = {
    ...card,
    merchants: Array.isArray(card.merchants) ? card.merchants[0] : card.merchants,
    customers: Array.isArray(card.customers) ? card.customers[0] : card.customers,
  }

  return <CardClient initialCard={normalised as Parameters<typeof CardClient>[0]['initialCard']} />
}
