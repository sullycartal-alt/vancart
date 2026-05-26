import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: merchant } = await supabase
    .from('merchants').select('id').eq('user_id', user.id).single()
  if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })

  const { alertId } = await request.json()

  const query = supabase.from('stamp_alerts').update({ dismissed: true })
  if (alertId) {
    query.eq('id', alertId).eq('merchant_id', merchant.id)
  } else {
    query.eq('merchant_id', merchant.id).eq('dismissed', false).eq('auto_dismissed', false)
  }

  const { error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
