import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { z } from 'zod'

const schema = z.object({
  customer_id: z.string().uuid(),
  merchant_id: z.string().uuid(),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({ p256dh: z.string(), auth: z.string() }),
  }).passthrough(),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const { customer_id, merchant_id, subscription } = parsed.data
  const service = createServiceClient()

  const { data: card } = await service
    .from('loyalty_cards')
    .select('id')
    .eq('customer_id', customer_id)
    .eq('merchant_id', merchant_id)
    .single()

  if (!card) {
    return NextResponse.json({ error: 'Carte de fidélité introuvable.' }, { status: 404 })
  }

  const { error } = await service.from('push_subscriptions').upsert(
    { customer_id, merchant_id, subscription },
    { onConflict: 'endpoint,merchant_id' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
