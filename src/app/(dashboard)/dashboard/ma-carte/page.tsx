import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CardDesignClient from './CardDesignClient'

export const dynamic = 'force-dynamic'

export default async function MaCartePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, slug, business_name, primary_color, loyalty_rule, stamps_required, loyalty_type, points_required, points_per_euro, logo_url, banner_url, banner_pattern, stamp_color')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/dashboard/settings')

  return (
    <CardDesignClient
      merchant={{
        id: merchant.id,
        slug: merchant.slug,
        business_name: merchant.business_name ?? '',
        primary_color: merchant.primary_color ?? '#6C47FF',
        loyalty_rule: merchant.loyalty_rule ?? '',
        stamps_required: merchant.stamps_required ?? 9,
        loyalty_type: (merchant.loyalty_type ?? 'stamps') as 'stamps' | 'points',
        points_required: merchant.points_required ?? null,
        points_per_euro: merchant.points_per_euro ?? null,
        logo_url: merchant.logo_url ?? null,
        banner_url: merchant.banner_url ?? null,
        banner_pattern: merchant.banner_pattern ?? null,
        stamp_color: merchant.stamp_color ?? null,
      }}
    />
  )
}
