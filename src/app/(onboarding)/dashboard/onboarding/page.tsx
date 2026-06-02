import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Rocket } from 'lucide-react'
import MerchantForm from '@/app/(dashboard)/dashboard/settings/MerchantForm'

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

  // Already onboarded — go to dashboard
  if (merchant?.business_name?.trim()) redirect('/dashboard')

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="flex justify-center"><Rocket size={48} strokeWidth={1.9} className="text-[#6C47FF]" /></div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Bienvenue sur VanCart !</h1>
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          Commençons par configurer votre commerce pour créer votre programme de fidélité.
        </p>
      </div>
      <MerchantForm merchant={merchant as Parameters<typeof MerchantForm>[0]['merchant']} />
    </div>
  )
}
