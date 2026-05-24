import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingClient from './OnboardingClient'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, business_name, slug, logo_url, primary_color, loyalty_type, stamps_required, points_per_euro, points_required, loyalty_rule')
    .eq('user_id', user.id)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  return (
    <OnboardingClient
      existingMerchant={merchant ?? null}
      appUrl={appUrl}
    />
  )
}
