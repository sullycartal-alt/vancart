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
    .select('id, slug, business_name, primary_color, loyalty_rule, stamps_required, logo_url, description, loyalty_type, points_required, points_per_euro, hero_image_url, wallet_message, card_expiry_months, show_instagram_on_card, instagram_handle, banner_url')
    .eq('user_id', user.id)
    .single()

  if (!merchant || !merchant.business_name?.trim()) redirect('/dashboard/settings')

  const { count: clientCount } = await supabase
    .from('loyalty_cards')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', merchant.id)

  const isAdmin = user.email === 'sullycartal@gmail.com'
  const hasClients = !isAdmin && (clientCount ?? 0) > 0

  return (
    <CardDesignClient
      merchant={{
        id: merchant.id,
        slug: merchant.slug,
        business_name: merchant.business_name ?? '',
        primary_color: merchant.primary_color ?? '#6C47FF',
        loyalty_rule: merchant.loyalty_rule ?? '',
        stamps_required: merchant.stamps_required ?? 10,
        logo_url: merchant.logo_url ?? null,
        description: merchant.description ?? '',
        loyalty_type: (merchant.loyalty_type ?? 'stamps') as 'stamps' | 'points',
        points_required: merchant.points_required ?? null,
        points_per_euro: merchant.points_per_euro ?? null,
        hero_image_url: merchant.hero_image_url ?? null,
        wallet_message: merchant.wallet_message ?? null,
        card_expiry_months: merchant.card_expiry_months ?? 12,
        show_instagram_on_card: merchant.show_instagram_on_card ?? false,
        instagram_handle: merchant.instagram_handle ?? null,
        banner_url: merchant.banner_url ?? null,
      }}
      hasClients={hasClients}
    />
  )
}
