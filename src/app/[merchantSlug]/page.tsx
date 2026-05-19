import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QRLandingClient from './QRLandingClient'

interface Props {
  params: Promise<{ merchantSlug: string }>
}

export default async function MerchantLandingPage({ params }: Props) {
  const { merchantSlug } = await params
  const supabase = await createClient()

  const { data: merchant, error } = await supabase
    .from('merchants')
    .select('id, business_name, slug, logo_url, primary_color, loyalty_rule, stamps_required')
    .eq('slug', merchantSlug)
    .single()

  if (error || !merchant) {
    notFound()
  }

  return <QRLandingClient merchant={merchant} />
}
