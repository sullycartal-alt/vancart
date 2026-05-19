import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StampClient from './StampClient'

export default async function StampPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, business_name, stamps_required, primary_color')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/dashboard/settings')

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Donner un tampon</h1>
        <p className="mt-1 text-sm text-gray-500">
          Entrez le numéro de téléphone du client pour trouver sa carte.
        </p>
      </div>
      <StampClient merchant={merchant} />
    </div>
  )
}
