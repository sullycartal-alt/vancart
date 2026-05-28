import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/service'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' as any })

const PRICE_TO_PLAN: Record<string, 'essential' | 'pro'> = {
  [process.env.STRIPE_PRICE_ESSENTIEL ?? '']: 'essential',
  [process.env.STRIPE_PRICE_PRO ?? '']: 'pro',
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const service = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const { merchant_id, plan } = session.metadata ?? {}

      if (merchant_id && plan) {
        await service
          .from('merchants')
          .update({
            plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq('id', merchant_id)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const priceId = sub.items.data[0]?.price?.id
      const plan = priceId ? PRICE_TO_PLAN[priceId] : undefined

      if (sub.status === 'past_due') {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        await service
          .from('merchants')
          .update({ plan_expires_at: expiresAt })
          .eq('stripe_subscription_id', sub.id)
      } else if (plan) {
        await service
          .from('merchants')
          .update({ plan, plan_expires_at: null })
          .eq('stripe_subscription_id', sub.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string

      // Only downgrade if no other active subscription exists
      const activeSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      })

      if (activeSubs.data.length === 0) {
        await service
          .from('merchants')
          .update({ plan: 'free', stripe_subscription_id: null, plan_expires_at: null })
          .eq('stripe_subscription_id', sub.id)
      }
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
