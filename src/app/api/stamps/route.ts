import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isConfigured, updateWalletPass } from '@/lib/google-wallet'

const stampSchema = z.object({
  loyalty_card_id: z.string().uuid(),
})

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { allowed, retryAfter } = checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get merchant for this user
  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('id, stamps_required')
    .eq('user_id', user.id)
    .single()

  if (merchantError || !merchant) {
    return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
  }

  const body = await request.json()
  const parsed = stampSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Ownership check: only fetch the card if it belongs to the authenticated merchant.
  // The .eq('merchant_id', merchant.id) filter ensures a merchant cannot stamp
  // another merchant's customers — the query returns nothing if IDs don't match.
  const { data: card, error: cardError } = await supabase
    .from('loyalty_cards')
    .select('id, stamps_count, total_stamps_earned, rewards_unlocked')
    .eq('id', parsed.data.loyalty_card_id)
    .eq('merchant_id', merchant.id)
    .single()

  if (cardError || !card) {
    return NextResponse.json({ error: 'Loyalty card not found or access denied' }, { status: 403 })
  }

  // Insert stamp record
  const { error: stampError } = await supabase.from('stamps').insert({
    loyalty_card_id: card.id,
    merchant_id: merchant.id,
  })

  if (stampError) {
    return NextResponse.json({ error: stampError.message }, { status: 500 })
  }

  // Calculate new stamp counts
  const newStampsCount = card.stamps_count + 1
  const newTotalStamps = card.total_stamps_earned + 1
  let newRewardsUnlocked = card.rewards_unlocked
  let finalStampsCount = newStampsCount

  // Check if a reward is unlocked
  if (newStampsCount >= merchant.stamps_required) {
    newRewardsUnlocked += 1
    finalStampsCount = newStampsCount - merchant.stamps_required
  }

  // Update loyalty card
  const { data: updatedCard, error: updateError } = await supabase
    .from('loyalty_cards')
    .update({
      stamps_count: finalStampsCount,
      total_stamps_earned: newTotalStamps,
      rewards_unlocked: newRewardsUnlocked,
    })
    .eq('id', card.id)
    .select('*, customers(first_name, phone)')
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Push updated stamp count to Google Wallet (best-effort, never blocks the response)
  if (isConfigured()) {
    await updateWalletPass(card.id, finalStampsCount, merchant.stamps_required).catch(() => {})
  }

  return NextResponse.json({
    card: updatedCard,
    reward_unlocked: newRewardsUnlocked > card.rewards_unlocked,
  })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (merchantError || !merchant) {
    return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
  }

  const cardId = searchParams.get('card_id')
  let query = supabase
    .from('stamps')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('given_at', { ascending: false })

  if (cardId) {
    query = query.eq('loyalty_card_id', cardId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
