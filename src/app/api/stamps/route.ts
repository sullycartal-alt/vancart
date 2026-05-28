import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isConfigured, updateWalletPass } from '@/lib/google-wallet'

const stampSchema = z.object({
  loyalty_card_id: z.string().uuid(),
  amount: z.number().positive().optional(), // required in points mode (purchase € amount)
  nb_stamps: z.number().int().min(1).max(10).optional(), // stamps mode only: stamps to add at once
})

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { allowed, retryAfter } = checkRateLimit(`stamps:${ip}`, 30, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes, veuillez réessayer dans quelques instants.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('id, stamps_required, loyalty_type, points_per_euro, points_required, business_name, plan')
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

  const nbStamps = (!isPoints && parsed.data.nb_stamps) ? parsed.data.nb_stamps : 1
  const stampRows = Array.from({ length: nbStamps }, () => ({
    loyalty_card_id: card.id,
    merchant_id: merchant.id,
    ip_address: ip,
  }))
  const { error: stampError } = await supabase.from('stamps').insert(stampRows)
  if (stampError) return NextResponse.json({ error: stampError.message }, { status: 500 })

  // Rapid stamp detection: check if >= 5 stamps in last 5 minutes for this merchant
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { count: recentCount } = await supabase
      .from('stamps')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant.id)
      .gte('given_at', fiveMinutesAgo)

    if ((recentCount ?? 0) >= 5) {
      await supabase.from('stamp_alerts').insert({
        merchant_id: merchant.id,
        alert_type: 'rapid_stamps',
        message: '5 tampons donnés en moins de 5 minutes',
      })

      // Auto-dismiss if merchant has 5+ rapid_stamps alerts today (they naturally stamp fast)
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const { count: todayAlertCount } = await supabase
        .from('stamp_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', merchant.id)
        .eq('alert_type', 'rapid_stamps')
        .gte('triggered_at', todayStart.toISOString())

      if ((todayAlertCount ?? 0) >= 5) {
        await supabase
          .from('stamp_alerts')
          .update({ auto_dismissed: true })
          .eq('merchant_id', merchant.id)
          .eq('alert_type', 'rapid_stamps')
          .gte('triggered_at', todayStart.toISOString())
      }
    }
  } catch {
    // Alert logic never breaks the stamp flow
  }

  let updateData: Record<string, number>
  let rewardPending = false
  let pointsAdded: number | undefined

  if (isPoints) {
    pointsAdded = Math.round((parsed.data.amount ?? 0) * (merchant.points_per_euro ?? 1))
    const newPoints = (card.points ?? 0) + pointsAdded
    const required = merchant.points_required ?? 100
    rewardPending = newPoints >= required
    const finalPoints = rewardPending ? required : newPoints
    updateData = {
      points: finalPoints,
      total_stamps_earned: card.total_stamps_earned + pointsAdded,
    }
  } else {
    const newStamps = card.stamps_count + nbStamps
    rewardPending = newStamps >= merchant.stamps_required
    const finalStamps = rewardPending ? merchant.stamps_required : newStamps
    updateData = {
      stamps_count: finalStamps,
      total_stamps_earned: card.total_stamps_earned + nbStamps,
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
    reward_pending: rewardPending,
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
