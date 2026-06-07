import { createServiceClient } from '@/lib/supabase/service'
import type { Metadata, Viewport } from 'next'
import CaisseClient from './CaisseClient'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  themeColor: '#6C47FF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = createServiceClient()
  const { data: merchant } = await service
    .from('merchants')
    .select('business_name')
    .eq('caisse_slug', slug)
    .single()
  const title = merchant?.business_name ? `Caisse — ${merchant.business_name}` : 'Caisse — VanCart'
  return {
    title,
    appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: merchant?.business_name ?? 'Caisse' },
    other: { 'mobile-web-app-capable': 'yes' },
  }
}

export default async function CaissePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = createServiceClient()

  const { data: merchant } = await service
    .from('merchants')
    .select('business_name, caisse_pin_hash')
    .eq('caisse_slug', slug)
    .single()

  if (!merchant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3] px-6 text-center">
        <div className="space-y-3">
          <h1 className="text-xl font-bold text-[#1A1A1A]">Caisse introuvable</h1>
          <p className="text-sm text-[#6B6B6B]">Ce lien de caisse n&apos;existe pas ou a été désactivé.</p>
        </div>
      </div>
    )
  }

  return (
    <CaisseClient
      slug={slug}
      merchantName={merchant.business_name}
      pinConfigured={!!merchant.caisse_pin_hash}
    />
  )
}
