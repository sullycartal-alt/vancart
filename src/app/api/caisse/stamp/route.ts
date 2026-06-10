import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getCaisseSession } from '@/lib/caisse/session'
import { createServiceClient } from '@/lib/supabase/service'
import { isConfigured, updateWalletPass } from '@/lib/google-wallet'
import { triggerBannerRegen } from '@/lib/banner'

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
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cardId)) {
    return NextResponse.json({ error: 'QR code invalide.' }, { status: 400 })
  }

  const service = createServiceClient()

  const { data: card } = await service
    .from('loyalty_cards')
    .select('id, merchant_id, stamps_count, total_stamps_earned, customers(first_name)')
    .eq('id', cardId)
    .single()
  if (!card || card.merchant_id !== session.merchantId) {
    return NextResponse.json({ error: 'QR code invalide.' }, { status: 404 })
  }

  const { data: merchant } = await service
    .from('merchants')
    .select('id, stamps_required, loyalty_rule, primary_color, banner_pattern')
    .eq('id', session.merchantId)
    .single()
  const required = merchant?.stamps_required ?? 10
  const rewardDescription = merchant?.loyalty_rule ?? ''
  const customerName = firstName(card.customers)

  // Récompense déjà atteinte mais pas encore remise à zéro → pas de tampon en plus.
  if (card.stamps_count >= required) {
    return NextResponse.json({
      success: true,
      customerName,
      newCount: card.stamps_count,
      total: required,
      rewardReached: true,
      rewardDescription,
    })
  }

  // Enregistre le tampon (audit log) avec le prénom du serveur.
  await service.from('stamps').insert({
    loyalty_card_id: card.id,
    merchant_id: session.merchantId,
    serveur_name: session.serveurName,
  })

  const newCount = Math.min(card.stamps_count + 1, required)
  const rewardReached = newCount >= required

  await service
    .from('loyalty_cards')
    .update({ stamps_count: newCount, total_stamps_earned: (card.total_stamps_earned ?? 0) + 1 })
    .eq('id', card.id)

  if (isConfigured()) {
    try {
      await updateWalletPass(card.id, newCount, required)
    } catch {
      // ne jamais casser le flux de tampon
    }
  }

  // Rafraîchit la bannière interactive en arrière-plan (non bloquant).
  triggerBannerRegen({
    merchantId: session.merchantId,
    primaryColor: merchant?.primary_color ?? null,
    bannerPattern: merchant?.banner_pattern ?? null,
    stampsCount: newCount,
    stampsRequired: required,
  })

  return NextResponse.json({
    success: true,
    customerName,
    newCount,
    total: required,
    rewardReached,
    rewardDescription,
  })
}
