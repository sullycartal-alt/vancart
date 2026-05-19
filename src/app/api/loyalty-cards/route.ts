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
  const supabase = await createClient()

  const body = await request.json()
  const parsed = loyaltyCardSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Check if card already exists
  const { data: existing } = await supabase
    .from('loyalty_cards')
    .select('id')
    .eq('merchant_id', parsed.data.merchant_id)
    .eq('customer_id', parsed.data.customer_id)
    .single()

  if (existing) {
    return NextResponse.json(existing)
  }

  const { data, error } = await supabase
    .from('loyalty_cards')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
