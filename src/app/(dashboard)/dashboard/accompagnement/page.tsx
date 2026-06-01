import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccompagnementLayout from './AccompagnementLayout'
import UpgradeGate from '@/components/UpgradeGate'
import { effectivePlan, type Plan } from '@/lib/plan-features'

export const dynamic = 'force-dynamic'

export default async function AccompagnementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('business_name, loyalty_rule, stamps_required, points_required, loyalty_type, plan')
    .eq('user_id', user.id)
    .single()

  const plan = effectivePlan((merchant?.plan ?? 'free') as Plan, user.email)

  // Gate at page level — avoids loading ChatClient entirely for non-Pro users
  if (plan !== 'pro') {
    return (
      <UpgradeGate plan={plan} feature="aiAdvisor" requiredPlan="pro">
        <div className="h-96" />
      </UpgradeGate>
    )
  }

  const merchantContext = merchant
    ? {
        business_name: merchant.business_name,
        loyalty_rule: merchant.loyalty_rule,
        stamps_required: merchant.stamps_required,
        points_required: merchant.points_required,
        loyalty_type: merchant.loyalty_type,
      }
    : {}

  return (
    <AccompagnementLayout
      plan={plan}
      merchantContext={merchantContext}
      businessName={merchant?.business_name ?? undefined}
    />
  )
}
