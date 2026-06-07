import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { caisseCookieName, getCaisseSession } from '@/lib/caisse/session'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))

  // Commerçant authentifié : déconnecte TOUTES les sessions actives du merchant.
  if (body?.all) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    }
    const service = createServiceClient()
    await service.from('caisse_sessions').delete().eq('merchant_id', merchant.id)
    return NextResponse.json({ success: true })
  }

  // Serveur : déconnexion simple (supprime sa session + son cookie).
  const slug = typeof body?.slug === 'string' ? body.slug : undefined
  if (slug) {
    const session = await getCaisseSession(slug)
    if (session) {
      const service = createServiceClient()
      await service.from('caisse_sessions').delete().eq('id', session.sessionId)
    }
    const cookieStore = await cookies()
    cookieStore.delete(caisseCookieName(slug))
  }

  return NextResponse.json({ success: true })
}
