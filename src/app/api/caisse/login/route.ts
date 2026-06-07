import { createServiceClient } from '@/lib/supabase/service'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { signCaisseToken, caisseCookieName } from '@/lib/caisse/session'

const schema = z.object({
  slug: z.string().min(1),
  pin: z.string().regex(/^\d{4}$/),
  serveur_name: z.string().trim().min(1).max(30),
})

const SESSION_HOURS = 7

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })
  }

  const { slug, pin, serveur_name } = parsed.data
  const service = createServiceClient()

  const { data: merchant } = await service
    .from('merchants')
    .select('id, business_name, caisse_pin_hash')
    .eq('caisse_slug', slug)
    .single()
  if (!merchant || !merchant.caisse_pin_hash) {
    return NextResponse.json({ error: 'Caisse introuvable.' }, { status: 404 })
  }

  const ok = await bcrypt.compare(pin, merchant.caisse_pin_hash)
  if (!ok) {
    return NextResponse.json({ error: 'Code PIN incorrect.' }, { status: 401 })
  }

  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600_000)
  const { data: session, error } = await service
    .from('caisse_sessions')
    .insert({ merchant_id: merchant.id, serveur_name, expires_at: expiresAt.toISOString() })
    .select('id')
    .single()
  if (error || !session) {
    return NextResponse.json({ error: 'Impossible de créer la session.' }, { status: 500 })
  }

  const token = signCaisseToken({
    sessionId: session.id,
    merchantId: merchant.id,
    serveurName: serveur_name,
    expiresAt: expiresAt.toISOString(),
  })

  const cookieStore = await cookies()
  cookieStore.set(caisseCookieName(slug), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })

  return NextResponse.json({ success: true, merchantName: merchant.business_name })
}
