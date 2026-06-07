import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCaisseSession } from '@/lib/caisse/session'
import { createServiceClient } from '@/lib/supabase/service'

const schema = z.object({ qr_code: z.string().min(1), slug: z.string().min(1) })

function firstName(customers: unknown): string {
  const c = Array.isArray(customers) ? customers[0] : customers
  return (c as { first_name?: string } | null)?.first_name ?? 'Client'
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })
  }

  const session = await getCaisseSession(parsed.data.slug)
  if (!session) {
    return NextResponse.json({ error: 'Session expirée.' }, { status: 401 })
  }

  const cardId = parsed.data.qr_code.replace(/^REWARD:/, '').trim()
  const service = createServiceClient()

  const { data: card } = await service
    .from('loyalty_cards')
    .select('id, merchant_id, rewards_unlocked, customers(first_name)')
    .eq('id', cardId)
    .single()
  if (!card || card.merchant_id !== session.merchantId) {
    return NextResponse.json({ error: 'QR code invalide.' }, { status: 404 })
  }

  // Remet le compteur à zéro et incrémente le nombre de récompenses utilisées.
  await service
    .from('loyalty_cards')
    .update({ stamps_count: 0, points: 0, rewards_unlocked: (card.rewards_unlocked ?? 0) + 1 })
    .eq('id', card.id)

  return NextResponse.json({ success: true, customerName: firstName(card.customers) })
}
