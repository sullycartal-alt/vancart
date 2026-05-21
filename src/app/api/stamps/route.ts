import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isConfigured, updateWalletPass } from '@/lib/google-wallet'

const stampSchema = z.object({
  loyalty_card_id: z.string().uuid(),
  amount: z.number().positive().optional(), // required in points mode (purchase € amount)
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
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('id, stamps_required, loyalty_type, points_per_euro, points_required')
    .eq('user_id', user.id)
    .single()
  if (merchantError || !merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })

  const body = await request.json()
  const parsed = stampSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const isPoints = merchant.loyalty_type === 'points'
  if (isPoints && !parsed.data.amount) {
    return NextResponse.json({ error: 'amount is required in points mode' }, { status: 400 })
  }

  // Ownership check: .eq('merchant_id') ensures a merchant can only stamp their own cards
  const { data: card, error: cardError } = await supabase
    .from('loyalty_cards')
    .select('id, stamps_count, points, total_stamps_earned, rewards_unlocked')
    .eq('id', parsed.data.loyalty_card_id)
    .eq('merchant_id', merchant.id)
    .single()
  if (cardError || !card) {
    return NextResponse.json({ error: 'Loyalty card not found or access denied' }, { status: 403 })
  }

  const { error: stampError } = await supabase.from('stamps').insert({
    loyalty_card_id: card.id,
    merchant_id: merchant.id,
  })
  if (stampError) return NextResponse.json({ error: stampError.message }, { status: 500 })

  let updateData: Record<string, number>
  let rewardUnlocked = false
  let pointsAdded: number | undefined

  if (isPoints) {
    pointsAdded = Math.round((parsed.data.amount ?? 0) * (merchant.points_per_euro ?? 1))
    const newPoints = (card.points ?? 0) + pointsAdded
    const required = merchant.points_required ?? 100
    let finalPoints = newPoints
    let newRewards = card.rewards_unlocked
    if (newPoints >= required) {
      newRewards += 1
      finalPoints = newPoints - required
      rewardUnlocked = true
    }
    updateData = {
      points: finalPoints,
      total_stamps_earned: card.total_stamps_earned + pointsAdded,
      rewards_unlocked: newRewards,
    }
  } else {
    const newStamps = card.stamps_count + 1
    let finalStamps = newStamps
    let newRewards = card.rewards_unlocked
    if (newStamps >= merchant.stamps_required) {
      newRewards += 1
      finalStamps = newStamps - merchant.stamps_required
      rewardUnlocked = true
    }
    updateData = {
      stamps_count: finalStamps,
      total_stamps_earned: card.total_stamps_earned + 1,
      rewards_unlocked: newRewards,
    }
  }

  const { data: updatedCard, error: updateError } = await supabase
    .from('loyalty_cards')
    .update(updateData)
    .eq('id', card.id)
    .select('*, customers(first_name, phone)')
    .single()
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  if (!isPoints && isConfigured()) {
    await updateWalletPass(card.id, updateData.stamps_count ?? 0, merchant.stamps_required).catch(() => {})
  }

  return NextResponse.json({
    card: updatedCard,
    reward_unlocked: rewardUnlocked,
    mode: merchant.loyalty_type,
    points_added: pointsAdded,
  })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: merchant, error: merchantError } = await supabase
    .from('merchants').select('id').eq('user_id', user.id).single()
  if (merchantError || !merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })

  const cardId = searchParams.get('card_id')
  let query = supabase.from('stamps').select('*').eq('merchant_id', merchant.id).order('given_at', { ascending: false })
  if (cardId) query = query.eq('loyalty_card_id', cardId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
