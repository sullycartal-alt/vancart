import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MerchantForm from './MerchantForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurer mon commerce</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ces informations apparaîtront sur la carte de fidélité de vos clients.
        </p>
      </div>
      <MerchantForm merchant={merchant} />
    </div>
  )
}
