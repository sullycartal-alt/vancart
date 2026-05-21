import { createServiceClient } from '@/lib/supabase/service'
import { buildGoogleWalletURL, isConfigured } from '@/lib/google-wallet'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cardId = searchParams.get('card_id')

  // ── Step 0: env vars ────────────────────────────────────────────────────────
  const envCheck = {
    GOOGLE_WALLET_ISSUER_ID: !!process.env.GOOGLE_WALLET_ISSUER_ID,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    // Key diagnostics (no secret values)
    key_length: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.length ?? 0,
    key_starts_with: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.slice(0, 30) ?? '',
    key_has_literal_backslash_n: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '').includes('\\n'),
    key_has_real_newline: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '').includes('\n'),
  }
  console.log('[wallet/google] env check:', JSON.stringify(envCheck))

  if (!cardId) {
    return NextResponse.json({ error: 'card_id is required', debug: { envCheck } }, { status: 400 })
  }

  if (!isConfigured()) {
    return NextResponse.json(
      {
        error: 'Google Wallet not configured. Set GOOGLE_WALLET_ISSUER_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.',
        debug: { envCheck },
      },
      { status: 501 },
    )
  }

  // ── Step 1: fetch card from Supabase ────────────────────────────────────────
  console.log('[wallet/google] fetching card:', cardId)
  const service = createServiceClient()
  const { data: card, error: cardError } = await service
    .from('loyalty_cards')
    .select('id, stamps_count, merchants(id, business_name, primary_color, loyalty_rule, stamps_required), customers(first_name)')
    .eq('id', cardId)
    .single()

  if (cardError || !card) {
    console.error('[wallet/google] card fetch error:', cardError)
    return NextResponse.json(
      { error: 'Loyalty card not found', debug: { cardError, envCheck } },
      { status: 404 },
    )
  }
  console.log('[wallet/google] card found, stamps_count:', card.stamps_count)

  const merchant = Array.isArray(card.merchants) ? card.merchants[0] : card.merchants as {
    id: string; business_name: string; primary_color: string; loyalty_rule: string; stamps_required: number
  }

  if (!merchant) {
    return NextResponse.json({ error: 'Merchant not found', debug: { envCheck } }, { status: 404 })
  }
  console.log('[wallet/google] merchant:', merchant.business_name)

  // ── Step 2: build wallet URL ─────────────────────────────────────────────────
  try {
    console.log('[wallet/google] calling buildGoogleWalletURL…')
    const url = await buildGoogleWalletURL({
      cardId: card.id,
      merchantId: merchant.id,
      merchantName: merchant.business_name,
      loyaltyRule: merchant.loyalty_rule,
      primaryColor: merchant.primary_color,
      stampsCount: card.stamps_count,
      stampsRequired: merchant.stamps_required,
    })
    console.log('[wallet/google] success, redirecting to pay.google.com')
    return NextResponse.redirect(url)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    console.error('[wallet/google] buildGoogleWalletURL failed:', message, stack)
    return NextResponse.json(
      {
        error: message,
        stack,
        debug: { envCheck },
      },
      { status: 500 },
    )
  }
}
