import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin-config'

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { merchantId } = await request.json()
  if (!merchantId) return NextResponse.json({ error: 'merchantId required' }, { status: 400 })

  const service = createServiceClient()
  const { error } = await service.from('merchants').delete().eq('id', merchantId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
