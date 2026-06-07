import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { ensureUniqueSlug } from '@/lib/caisse/slug'

const schema = z.object({ pin: z.string().regex(/^\d{4}$/) })

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Le PIN doit contenir exactement 4 chiffres.' }, { status: 400 })
  }

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, business_name, caisse_slug')
    .eq('user_id', user.id)
    .single()
  if (!merchant) {
    return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
  }

  const pinHash = await bcrypt.hash(parsed.data.pin, 10)
  let slug = merchant.caisse_slug
  if (!slug) {
    slug = await ensureUniqueSlug(merchant.business_name, merchant.id, supabase)
  }

  const { error } = await supabase
    .from('merchants')
    .update({ caisse_pin_hash: pinHash, caisse_slug: slug })
    .eq('id', merchant.id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ slug })
}
