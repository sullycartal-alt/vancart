import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { effectivePlan, type Plan } from '@/lib/plan-features'
import UpgradePageClient from './UpgradePageClient'

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const plan = effectivePlan((merchant?.plan ?? 'free') as Plan, user.email)

  return <UpgradePageClient currentPlan={plan} />
}
