import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MerchantForm from '../settings/MerchantForm'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Already fully onboarded — go to dashboard
  if (merchant?.business_name?.trim()) redirect('/dashboard')

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="text-5xl">🚀</div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Bienvenue sur VanCart !</h1>
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          Commençons par configurer votre commerce pour créer votre programme de fidélité.
        </p>
      </div>
      <MerchantForm merchant={merchant as Parameters<typeof MerchantForm>[0]['merchant']} />
    </div>
  )
}
