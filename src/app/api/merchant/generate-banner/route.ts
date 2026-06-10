import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { bannerSvg, stampsRowSvg, isBannerPattern, isStampIcon, type BannerPattern } from '@/lib/banner-patterns'

const HEX = /^#[0-9a-fA-F]{6}$/

// Generates a 1000×400 PNG banner (solid color + tiled SVG texture), uploads it
// to the public `banners` bucket at {merchantId}/banner.png and stores the URL on
// the merchant. Called from the onboarding / edit UI (user session) and, server
// to server, from the stamp routes (x-internal-key header) to refresh on each stamp.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const service = createServiceClient()

  // Resolve which merchant we're generating for, with authorization.
  let merchantId: string
  const internalKey = request.headers.get('x-internal-key')
  if (internalKey && internalKey === process.env.SUPABASE_SERVICE_ROLE_KEY) {
    if (!body.merchantId || typeof body.merchantId !== 'string') {
      return NextResponse.json({ error: 'merchantId requis' }, { status: 400 })
    }
    merchantId = body.merchantId
  } else {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: mine } = await service
      .from('merchants')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!mine) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
    merchantId = mine.id
  }

  // Authoritative merchant branding (used as fallback when not supplied in body).
  const { data: merchant } = await service
    .from('merchants')
    .select('id, primary_color, banner_pattern, stamps_required, stamp_color, stamp_icon')
    .eq('id', merchantId)
    .single()
  if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })

  const rawColor = typeof body.primaryColor === 'string' ? body.primaryColor : merchant.primary_color
  const primaryColor = HEX.test(rawColor ?? '') ? rawColor : '#6C47FF'

  const rawPattern = body.bannerPattern ?? merchant.banner_pattern
  const pattern: BannerPattern = isBannerPattern(rawPattern) ? rawPattern : 'none'

  const stampsCount = typeof body.stampsCount === 'number' && body.stampsCount >= 0 ? body.stampsCount : 0
  const stampsRequired = typeof body.stampsRequired === 'number' && body.stampsRequired > 0
    ? body.stampsRequired
    : (merchant.stamps_required ?? 9)

  const rawStampColor = typeof body.stampColor === 'string' ? body.stampColor : merchant.stamp_color
  const stampColor = HEX.test(rawStampColor ?? '') ? rawStampColor : '#FFFFFF'

  const rawStampIcon = body.stampIcon ?? merchant.stamp_icon
  const stampIcon = isStampIcon(rawStampIcon) ? rawStampIcon : 'check'

  let png: Buffer
  try {
    const base = sharp(Buffer.from(bannerSvg(primaryColor, pattern)))
    const stampsLayer = Buffer.from(stampsRowSvg(stampColor, stampIcon, stampsCount, stampsRequired))
    png = await base.composite([{ input: stampsLayer }]).png().toBuffer()
  } catch (e) {
    console.error('[generate-banner] render failed:', e)
    return NextResponse.json({ error: 'Génération de la bannière échouée' }, { status: 500 })
  }

  // Ensure the bucket exists (idempotent) then overwrite the merchant's banner.
  await service.storage.createBucket('banners', { public: true }).catch(() => {})

  const path = `${merchantId}/banner.png`
  const { error: uploadError } = await service.storage
    .from('banners')
    .upload(path, png, { upsert: true, contentType: 'image/png' })
  if (uploadError) {
    console.error('[generate-banner] upload failed:', uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = service.storage.from('banners').getPublicUrl(path)
  // Cache-bust: the storage path is stable, so vary the query string to force the
  // card preview / wallet to fetch the freshly generated image.
  const bannerUrl = `${publicUrl}?v=${Date.now()}`

  await service.from('merchants').update({ banner_url: bannerUrl }).eq('id', merchantId)

  return NextResponse.json({ banner_url: bannerUrl })
}
