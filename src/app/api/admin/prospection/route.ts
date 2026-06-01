import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

const ADMIN_EMAILS = ['sullycartal@gmail.com', 'audrey@vancart.fr']

async function getAdminUser() {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user?.email || !ADMIN_EMAILS.includes(user.email)) return null
  return user
}

// GET /api/admin/prospection — list all campaigns
export async function GET() {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data, error } = await service
    .from('prospection_campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
  return NextResponse.json({ campaigns: data ?? [] })
}

// POST /api/admin/prospection — create campaign
export async function POST(request: NextRequest) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.nom || !body?.slug || !body?.url) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const service = createServiceClient()
  const { error } = await service
    .from('prospection_campaigns')
    .insert({
      admin_user_id: user.id,
      admin_name: user.email,
      nom: body.nom,
      slug: body.slug,
      url: body.url,
      leads_count: 0,
    })

  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/prospection — delete own campaign
export async function DELETE(request: NextRequest) {
  const user = await getAdminUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.id) return NextResponse.json({ error: 'id manquant' }, { status: 400 })

  const service = createServiceClient()
  const { error } = await service
    .from('prospection_campaigns')
    .delete()
    .eq('id', body.id)
    .eq('admin_user_id', user.id)

  if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
  return NextResponse.json({ ok: true })
}
