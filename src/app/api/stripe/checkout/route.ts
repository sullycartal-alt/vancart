import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' as any })
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const plan: 'essential' | 'pro' = body.plan

  const priceId =
    plan === 'pro'
      ? process.env.STRIPE_PRICE_PRO!
      : process.env.STRIPE_PRICE_ESSENTIEL!

  if (!priceId) {
    return NextResponse.json({ error: 'Price not configured' }, { status: 500 })
  }

  const service = createServiceClient()
  const { data: merchant } = await service
    .from('merchants')
    .select('id, stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!merchant) {
    return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
  }

  let customerId = merchant.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { merchant_id: merchant.id, user_id: user.id },
    })
    customerId = customer.id

    await service
      .from('merchants')
      .update({ stripe_customer_id: customerId })
      .eq('id', merchant.id)
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?upgrade=success`,
    cancel_url: `${origin}/dashboard/upgrade`,
    metadata: { merchant_id: merchant.id, user_id: user.id, plan },
  })

  return NextResponse.json({ url: session.url })
}
