import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChatClient from './ChatClient'

export default async function AccompagnementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('business_name, loyalty_rule, stamps_required, loyalty_type')
    .eq('user_id', user.id)
    .single()

  const merchantContext = merchant
    ? {
        business_name: merchant.business_name,
        loyalty_rule: merchant.loyalty_rule,
        stamps_required: merchant.stamps_required,
        loyalty_type: merchant.loyalty_type,
      }
    : {}

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Votre conseiller fidélité IA</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Obtenez des recommandations personnalisées pour votre programme de fidélité
        </p>
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2 w-fit mt-3">
          <span>🇫🇷</span>
          <span>Conseils générés par une IA française — vos données restent en Europe</span>
        </div>
      </div>

      {merchant && (
        <div className="bg-[#6C47FF]/8 border border-[#6C47FF]/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-[#6C47FF] text-lg">✨</span>
          <p className="text-sm text-[#6C47FF] font-medium">
            L&apos;IA connaît déjà votre commerce <strong>{merchant.business_name}</strong> et votre programme actuel.
          </p>
        </div>
      )}

      <ChatClient merchantContext={merchantContext} />
    </div>
  )
}
