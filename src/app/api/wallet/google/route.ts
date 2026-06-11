import { createServiceClient } from '@/lib/supabase/service'
import { buildGoogleWalletURL, isConfigured } from '@/lib/google-wallet'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const ip = getClientIp(request)
  const { allowed, retryAfter } = checkRateLimit(`wallet:${ip}`, 10, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes, veuillez réessayer dans quelques instants.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  const { searchParams } = new URL(request.url)
  const cardId = searchParams.get('card_id')

  // ── Step 0: env vars ────────────────────────────────────────────────────────
  // Show processed key shape (never log secret bytes)
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? ''
  const b64Key = process.env.GOOGLE_PRIVATE_KEY_BASE64 ?? ''
  const processedKey = b64Key
    ? Buffer.from(b64Key, 'base64').toString('utf-8').trim()
    : rawKey.replace(/\\n/g, '\n').replace(/\\r/g, '').trim()
  const lines = processedKey.split('\n')

  const envCheck = {
    GOOGLE_WALLET_ISSUER_ID: !!process.env.GOOGLE_WALLET_ISSUER_ID,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: !!rawKey,
    GOOGLE_PRIVATE_KEY_BASE64: !!b64Key,
    key_source: b64Key ? 'base64' : 'raw',
    // Raw key diagnostics
    raw_length: rawKey.length,
    raw_has_literal_backslash_n: rawKey.includes('\\n'),
    raw_has_real_newline: rawKey.includes('\n'),
    // Processed key diagnostics (safe: only structural info)
    processed_length: processedKey.length,
    processed_line_count: lines.length,
    processed_first_line: lines[0] ?? '',
    processed_last_line: lines[lines.length - 1] ?? '',
  }
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
  const service = createServiceClient()
  const { data: card, error: cardError } = await service
    .from('loyalty_cards')
    .select('id, stamps_count, merchants(id, business_name, primary_color, loyalty_rule, stamps_required, logo_url, hero_image_url, wallet_message, card_expiry_months, show_instagram_on_card, instagram_handle), customers(first_name)')
    .eq('id', cardId)
    .single()

  if (cardError || !card) {
    console.error('[wallet/google] card fetch error:', cardError)
    return NextResponse.json(
      { error: 'Loyalty card not found', debug: { cardError, envCheck } },
      { status: 404 },
    )
  }

  const merchant = Array.isArray(card.merchants) ? card.merchants[0] : card.merchants as {
    id: string; business_name: string; primary_color: string; loyalty_rule: string; stamps_required: number; logo_url: string | null
    hero_image_url?: string | null; wallet_message?: string | null; card_expiry_months?: number | null
    show_instagram_on_card?: boolean; instagram_handle?: string | null
  }

  if (!merchant) {
    return NextResponse.json({ error: 'Merchant not found', debug: { envCheck } }, { status: 404 })
  }

  // ── Step 2: build wallet URL ─────────────────────────────────────────────────
  try {
    const customer = Array.isArray(card.customers) ? card.customers[0] : card.customers as { first_name: string } | null
    const customerName = customer?.first_name ?? 'Client'

    const url = await buildGoogleWalletURL({
      cardId: card.id,
      merchantId: merchant.id,
      customerName,
      merchantName: merchant.business_name,
      loyaltyRule: merchant.loyalty_rule,
      primaryColor: merchant.primary_color,
      logoUrl: merchant.logo_url,
      stampsCount: card.stamps_count,
      stampsRequired: merchant.stamps_required,
      heroImageUrl: merchant.hero_image_url,
      walletMessage: merchant.wallet_message,
      cardExpiryMonths: merchant.card_expiry_months,
      instagramHandle: merchant.instagram_handle,
      showInstagram: merchant.show_instagram_on_card,
    })
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
