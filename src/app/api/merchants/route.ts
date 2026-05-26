import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sanitizeText } from '@/lib/sanitize'
import { updateWalletClass } from '@/lib/google-wallet'

const merchantSchema = z.object({
  business_name: z.string().min(2).max(100),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  logo_url: z.string().url().nullable().optional(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional(),
  loyalty_rule: z.string().max(200).optional(),
  stamps_required: z.number().int().min(1).max(100).optional(),
  loyalty_type: z.enum(['stamps', 'points']).optional(),
  points_per_euro: z.number().int().min(1).nullable().optional(),
  points_required: z.number().int().min(1).nullable().optional(),
  description: z.string().max(200).nullable().optional(),
  instagram_handle: z.string().max(30).nullable().optional(),
  city: z.string().max(60).nullable().optional(),
  hero_image_url: z.string().url().nullable().optional(),
  wallet_message: z.string().max(100).nullable().optional(),
  card_expiry_months: z.number().int().min(0).max(60).nullable().optional(),
  show_instagram_on_card: z.boolean().optional(),
  allow_multiple_stamps: z.boolean().optional(),
  min_minutes_between_stamps: z.number().int().min(0).max(1440).optional(),
})

function sanitizeMerchantData<T extends Record<string, unknown>>(data: T): T {
  const textFields = ['business_name', 'loyalty_rule', 'description', 'instagram_handle', 'city'] as const
  const result = { ...data }
  for (const field of textFields) {
    if (typeof result[field] === 'string') {
      (result as Record<string, unknown>)[field] = sanitizeText(result[field] as string)
    }
  }
  return result
}

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = merchantSchema.safeParse(body)

  if (!parsed.success) {
    console.error('[POST /api/merchants] Zod error:', parsed.error.flatten())
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const sanitized = sanitizeMerchantData(parsed.data)

  // Guard against duplicates: if a merchant already exists, update it instead
  const { data: existing } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing?.id) {
    const { data, error } = await supabase
      .from('merchants')
      .update(sanitized)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[POST→PATCH /api/merchants] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  }

  const { data, error } = await supabase
    .from('merchants')
    .insert({ ...sanitized, user_id: user.id })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/merchants] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  console.log('[PATCH /api/merchants] body:', JSON.stringify(body))
  const parsed = merchantSchema.partial().safeParse(body)

  if (!parsed.success) {
    console.error('[PATCH /api/merchants] Zod error:', parsed.error.flatten())
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const sanitized = sanitizeMerchantData(parsed.data)
  console.log('[PATCH /api/merchants] sanitized primary_color:', sanitized.primary_color)

  // Fetch current merchant to detect branding changes for Google Wallet sync
  const { data: current } = await supabase
    .from('merchants')
    .select('id, logo_url, primary_color, loyalty_rule, business_name')
    .eq('user_id', user.id)
    .single()

  const { data, error } = await supabase
    .from('merchants')
    .update(sanitized)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('[PATCH /api/merchants] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  console.log('[PATCH /api/merchants] saved primary_color:', data?.primary_color)

  // Sync Google Wallet class when logo or branding changes (fire-and-forget)
  const brandingChanged = current && (
    (parsed.data.logo_url !== undefined && parsed.data.logo_url !== current.logo_url) ||
    (parsed.data.primary_color !== undefined && parsed.data.primary_color !== current.primary_color) ||
    (parsed.data.loyalty_rule !== undefined && parsed.data.loyalty_rule !== current.loyalty_rule)
  )
  if (brandingChanged && current) {
    updateWalletClass({
      merchantId: current.id,
      merchantName: data.business_name ?? current.business_name,
      loyaltyRule: data.loyalty_rule ?? current.loyalty_rule,
      primaryColor: data.primary_color ?? current.primary_color,
      logoUrl: data.logo_url ?? current.logo_url,
    }).catch(err => console.error('[PATCH /api/merchants] updateWalletClass failed:', err))
  }

  return NextResponse.json(data)
}
