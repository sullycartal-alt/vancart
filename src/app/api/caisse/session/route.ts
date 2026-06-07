import { NextResponse } from 'next/server'
import { getCaisseSession } from '@/lib/caisse/session'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get('slug') ?? ''
  const session = await getCaisseSession(slug)
  if (!session) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }

  const service = createServiceClient()
  const { data: merchant } = await service
    .from('merchants')
    .select('business_name')
    .eq('id', session.merchantId)
    .single()

  return NextResponse.json({
    valid: true,
    serveurName: session.serveurName,
    merchantName: merchant?.business_name ?? '',
    expiresAt: session.expiresAt,
  })
}
