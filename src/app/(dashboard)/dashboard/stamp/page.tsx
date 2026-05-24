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

  if (!merchant) {
    return (
      <div className="max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Donner un tampon</h1>
        <div className="bg-white border border-[#E8E8E3] rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm text-[#6B6B6B]">Configurez votre commerce pour commencer à tamponner.</p>
          <a href="/dashboard/onboarding" className="inline-block px-5 py-2.5 bg-[#6C47FF] text-white text-sm font-semibold rounded-xl hover:bg-[#5835e0] transition-colors">
            Lancer l&apos;assistant →
          </a>
        </div>
      </div>
    )
  }

  const isPoints = merchant.loyalty_type === 'points'

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">
          {isPoints ? 'Valider un achat' : 'Donner un tampon'}
        </h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          {isPoints
            ? "Scannez la carte du client et entrez le montant de l'achat."
            : 'Scannez le QR code du client ou recherchez par téléphone.'}
        </p>
      </div>
      <StampClient merchant={merchant} />
    </div>
  )
}
