import { createServiceClient } from '@/lib/supabase/service'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const customerSchema = z.object({
  phone: z.string().min(8, 'Le numéro de téléphone est trop court.').max(20, 'Le numéro de téléphone est trop long.'),
  first_name: z.string().min(1, 'Le prénom est requis.').max(50, 'Le prénom est trop long.'),
  merchant_id: z.string().uuid().optional(),
})

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { allowed, retryAfter } = checkRateLimit(`customers:${ip}`, 20, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes, veuillez réessayer dans quelques instants.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  // Use service role to bypass RLS — this is a public endpoint (QR scan flow)
  const service = createServiceClient()

  const body = await request.json()
  const parsed = customerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { phone, first_name, merchant_id } = parsed.data

  if (merchant_id) {
    const { data: merchant } = await service
      .from('merchants')
      .select('id')
      .eq('id', merchant_id)
      .single()

    if (!merchant) {
      return NextResponse.json({ error: 'Commerçant introuvable.' }, { status: 404 })
    }
  }

  const { data: existing } = await service
    .from('customers')
    .select('id, phone, first_name')
    .eq('phone', phone)
    .single()

  if (existing) {
    // If merchant_id provided, check for duplicate loyalty card
    if (merchant_id) {
      const { data: existingCard } = await service
        .from('loyalty_cards')
        .select('id')
        .eq('merchant_id', merchant_id)
        .eq('customer_id', existing.id)
        .single()

      if (existingCard) {
        return NextResponse.json(
          { error: 'DUPLICATE_PHONE', existingCardId: existingCard.id },
          { status: 409 },
        )
      }
    }
    return NextResponse.json(existing)
  }

  const { data, error } = await service
    .from('customers')
    .insert({ phone, first_name })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
