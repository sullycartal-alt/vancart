import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isConfigured, updateWalletPass } from '@/lib/google-wallet'
import { effectivePlan, type Plan } from '@/lib/plan-features'

const stampSchema = z.object({
  loyalty_card_id: z.string().uuid(),
  amount: z.number().positive().optional(), // required in points mode (purchase € amount)
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

  const { error: stampError } = await supabase.from('stamps').insert({
    loyalty_card_id: card.id,
    merchant_id: merchant.id,
    ip_address: ip,
  })
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

  // SMS notification when reward unlocked (Pro plan only)
  if (rewardUnlocked) {
    const plan = effectivePlan((merchant.plan ?? 'free') as Plan, user.email ?? undefined)
    if (plan === 'pro') {
      const customerPhone = (updatedCard as { customers?: { phone?: string; first_name?: string } }).customers?.phone
      const customerFirstName = (updatedCard as { customers?: { phone?: string; first_name?: string } }).customers?.first_name ?? 'vous'
      if (
        customerPhone &&
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER
      ) {
        try {
          const twilio = require('twilio')
          const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
          const e164Phone = customerPhone.startsWith('+') ? customerPhone : `+33${customerPhone.replace(/^0/, '')}`
          await client.messages.create({
            body: `🎉 Félicitations ${customerFirstName} ! Votre récompense chez ${merchant.business_name} est débloquée. Présentez cette carte lors de votre prochaine visite !`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: e164Phone,
          })
        } catch {
          // SMS failure never breaks the stamp flow
        }
      }
    }
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
