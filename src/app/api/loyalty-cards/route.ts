import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const loyaltyCardSchema = z.object({
  merchant_id: z.string().uuid(),
  customer_id: z.string().uuid(),
})

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

  // Get merchant for this user
  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (merchantError || !merchant) {
    return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
  }

  const cardId = searchParams.get('id')
  const phone = searchParams.get('phone')

  if (cardId) {
    const { data, error } = await supabase
      .from('loyalty_cards')
      .select('*, customers(*)')
      .eq('id', cardId)
      .eq('merchant_id', merchant.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  }

  if (phone) {
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Aucun client avec ce numéro' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('loyalty_cards')
      .select('*, customers(*)')
      .eq('merchant_id', merchant.id)
      .eq('customer_id', customer.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Ce client n\'a pas encore de carte chez vous' }, { status: 404 })
    }

    return NextResponse.json(data)
  }

  const { data, error } = await supabase
    .from('loyalty_cards')
    .select('*, customers(*)')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  // Use service role for public QR scan flow — no user session available
  const { createServiceClient } = await import('@/lib/supabase/service')
  const service = createServiceClient()

  const body = await request.json()
  const parsed = loyaltyCardSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data: existing } = await service
    .from('loyalty_cards')
    .select('id, stamps_count, rewards_unlocked')
    .eq('merchant_id', parsed.data.merchant_id)
    .eq('customer_id', parsed.data.customer_id)
    .single()

  if (existing) return NextResponse.json(existing)

  // Check client limit based on merchant plan
  const { effectivePlan, PLAN_FEATURES } = await import('@/lib/plan-features')
  const { data: merchantData } = await service
    .from('merchants')
    .select('plan, user_id')
    .eq('id', parsed.data.merchant_id)
    .single()

  if (merchantData) {
    const { data: { user: merchantUser } } = await service.auth.admin.getUserById(merchantData.user_id)
    const userEmail = merchantUser?.email ?? null
    const plan = effectivePlan((merchantData.plan ?? 'free') as Parameters<typeof effectivePlan>[0], userEmail)
    const maxClients = PLAN_FEATURES[plan].maxClients

    if (maxClients !== -1) {
      const { count } = await service
        .from('loyalty_cards')
        .select('id', { count: 'exact', head: true })
        .eq('merchant_id', parsed.data.merchant_id)

      if ((count ?? 0) >= maxClients) {
        const limitLabel = maxClients === 50 ? '50 clients' : `${maxClients} clients`
        const nextPlan = maxClients === 50 ? 'Essentiel' : 'Pro'
        return NextResponse.json(
          { error: `Limite de ${limitLabel} atteinte. Passez au plan ${nextPlan}.` },
          { status: 403 },
        )
      }
    }
  }

  const { data, error } = await service
    .from('loyalty_cards')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
