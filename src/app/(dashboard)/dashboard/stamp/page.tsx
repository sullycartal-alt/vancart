import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StampClient from './StampClient'

export default async function StampPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, business_name, stamps_required, primary_color, loyalty_type, points_per_euro, points_required')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/dashboard/settings')

  const isPoints = merchant.loyalty_type === 'points'

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isPoints ? 'Valider un achat' : 'Donner un tampon'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isPoints
            ? "Scannez la carte du client et entrez le montant de l'achat."
            : 'Scannez le QR code du client ou recherchez par téléphone.'}
        </p>
      </div>
      <StampClient merchant={merchant} />
    </div>
  )
}
