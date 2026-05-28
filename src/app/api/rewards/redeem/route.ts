import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  card_id: z.string().uuid(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })

  const { data: card } = await supabase
    .from('loyalty_cards')
    .select('id, stamps_count, points, rewards_unlocked, customers(first_name, phone)')
    .eq('id', parsed.data.card_id)
    .eq('merchant_id', merchant.id)
    .single()
  if (!card) return NextResponse.json({ error: 'Card not found or access denied' }, { status: 403 })

  const { data: updated, error: updateError } = await supabase
    .from('loyalty_cards')
    .update({ stamps_count: 0, points: 0, rewards_unlocked: card.rewards_unlocked + 1 })
    .eq('id', card.id)
    .select('*, customers(first_name, phone)')
    .single()
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ card: updated, success: true })
}
