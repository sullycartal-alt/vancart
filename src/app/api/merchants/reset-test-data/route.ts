import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })

  // Safety: only allow reset if < 5 clients
  const { count } = await supabase
    .from('loyalty_cards')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', merchant.id)

  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: 'Too many clients to reset' }, { status: 403 })
  }

  // Delete stamps first (FK constraint), then loyalty_cards
  await supabase.from('stamps').delete().eq('merchant_id', merchant.id)
  await supabase.from('loyalty_cards').delete().eq('merchant_id', merchant.id)

  return NextResponse.json({ ok: true })
}
