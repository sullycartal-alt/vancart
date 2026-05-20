import { createServiceClient } from '@/lib/supabase/service'
import { buildGoogleWalletURL, isConfigured } from '@/lib/google-wallet'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cardId = searchParams.get('card_id')

  if (!cardId) {
    return NextResponse.json({ error: 'card_id is required' }, { status: 400 })
  }

  if (!isConfigured()) {
    return NextResponse.json(
      { error: 'Google Wallet not configured. Set GOOGLE_WALLET_ISSUER_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.' },
      { status: 501 },
    )
  }

  const service = createServiceClient()
  const { data: card } = await service
    .from('loyalty_cards')
    .select('id, stamps_count, merchants(id, business_name, primary_color, loyalty_rule, stamps_required), customers(first_name)')
    .eq('id', cardId)
    .single()

  if (!card) {
    return NextResponse.json({ error: 'Loyalty card not found' }, { status: 404 })
  }

  // Supabase returns joined rows as objects or arrays depending on cardinality
  const merchant = Array.isArray(card.merchants) ? card.merchants[0] : card.merchants as {
    id: string; business_name: string; primary_color: string; loyalty_rule: string; stamps_required: number
  }

  if (!merchant) {
    return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
  }

  try {
    const url = await buildGoogleWalletURL({
      cardId: card.id,
      merchantId: merchant.id,
      merchantName: merchant.business_name,
      loyaltyRule: merchant.loyalty_rule,
      primaryColor: merchant.primary_color,
      stampsCount: card.stamps_count,
      stampsRequired: merchant.stamps_required,
    })
    return NextResponse.redirect(url)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Google Wallet error: ${message}` }, { status: 500 })
  }
}
