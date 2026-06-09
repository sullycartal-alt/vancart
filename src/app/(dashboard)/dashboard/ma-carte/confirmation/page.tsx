import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LoyaltyCardMockup from '@/components/loyalty/LoyaltyCardMockup'
import { PartyPopper } from 'lucide-react'

export const dynamic = 'force-dynamic'

const NEXT_STEPS = [
  {
    num: 1,
    title: 'Imprimez votre QR code',
    desc: 'Rendez-vous dans Tableau de bord pour télécharger votre QR code.',
  },
  {
    num: 2,
    title: 'Posez-le en caisse',
    desc: 'Placez le QR code bien visible à côté de votre caisse.',
  },
  {
    num: 3,
    title: 'Présentez-le à vos clients',
    desc: 'Invitez vos clients à scanner pour recevoir leur carte fidélité.',
  },
]

export default async function ConfirmationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id, business_name, primary_color, loyalty_type, stamps_required, points_required, loyalty_rule, logo_url, banner_url')
    .eq('user_id', user.id)
    .single()

  if (!merchant) redirect('/dashboard/ma-carte')

  return (
    <div className="min-h-screen bg-[#F7F6F3] px-4 py-16">
      <div className="max-w-xl mx-auto space-y-10 text-center">

        {/* Success icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[#6C47FF] flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-black text-[#1A1A1A] flex items-center justify-center gap-3">Votre carte est prête ! <PartyPopper size={28} strokeWidth={1.9} className="text-[#6C47FF]" /></h1>
          <p className="text-[#6B6B6B] mt-3 text-base">
            Vos clients peuvent maintenant recevoir leur carte directement dans leur téléphone.
          </p>
        </div>

        {/* Card mockup */}
        <div className="flex justify-center">
          <LoyaltyCardMockup
            primaryColor={merchant.primary_color ?? '#6C47FF'}
            businessName={merchant.business_name ?? ''}
            loyaltyType={(merchant.loyalty_type ?? 'stamps') as 'stamps' | 'points'}
            stampsRequired={merchant.stamps_required ?? 9}
            pointsRequired={merchant.points_required ?? 100}
            loyaltyRule={merchant.loyalty_rule ?? ''}
            logoUrl={merchant.logo_url ?? undefined}
            bannerUrl={merchant.banner_url ?? undefined}
            currentStamps={5}
            currentPoints={Math.round((merchant.points_required ?? 100) * 0.6)}
            cardId={merchant.id}
            width={280}
          />
        </div>

        {/* Next steps */}
        <div className="space-y-3 text-left">
          <h2 className="text-lg font-bold text-[#1A1A1A] text-center">Et maintenant ?</h2>
          {NEXT_STEPS.map(({ num, title, desc }) => (
            <div key={num} className="bg-white border border-[#E8E8E3] rounded-2xl p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-[#F0EDFF] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-[#6C47FF]">{num}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
                <p className="text-sm text-[#6B6B6B] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="inline-block w-full py-4 bg-[#6C47FF] hover:bg-[#5835e0] text-white font-bold text-base rounded-xl transition-colors"
        >
          Aller au tableau de bord →
        </Link>
      </div>
    </div>
  )
}
