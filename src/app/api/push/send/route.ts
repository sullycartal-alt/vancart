import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { z } from 'zod'

webpush.setVapidDetails(
  'mailto:contact@vancart.fr',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const schema = z.object({
  merchant_id: z.string().uuid(),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(200),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const { merchant_id, title, body: notifBody } = parsed.data
  const service = createServiceClient()

  // Verify caller owns the merchant
  const { data: merchant } = await service
    .from('merchants')
    .select('id')
    .eq('id', merchant_id)
    .eq('user_id', user.id)
    .single()

  if (!merchant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: subs } = await service
    .from('push_subscriptions')
    .select('subscription')
    .eq('merchant_id', merchant_id)

  if (!subs?.length) return NextResponse.json({ sent: 0 })

  const payload = JSON.stringify({ title, body: notifBody, url: '/wallet' })

  const results = await Promise.allSettled(
    subs.map(({ subscription }) =>
      webpush.sendNotification(subscription as webpush.PushSubscription, payload)
    )
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  return NextResponse.json({ sent, total: subs.length })
}
