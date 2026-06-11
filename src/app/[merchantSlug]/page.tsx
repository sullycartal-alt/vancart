import { createServiceClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import QRLandingClient from './QRLandingClient'

interface Props {
  params: Promise<{ merchantSlug: string }>
}

export default async function MerchantLandingPage({ params }: Props) {
  const { merchantSlug } = await params
  // Service role bypasses RLS — merchants are publicly accessible via their slug
  const service = createServiceClient()

  const { data: merchant, error } = await service
    .from('merchants')
    .select('id, business_name, slug, logo_url, primary_color, loyalty_rule, stamps_required, description, instagram_handle')
    .eq('slug', merchantSlug)
    .single()

  if (error || !merchant) notFound()

  return <QRLandingClient merchant={merchant} />
}
