import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Mon commerce</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Ces informations apparaîtront sur la carte de fidélité de vos clients.
        </p>
      </div>

      {/* Setup assistant banner */}
      <div className="bg-[#6C47FF]/5 border border-[#6C47FF]/20 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-3xl">🚀</span>
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A]">Assistant de configuration</p>
            <p className="text-xs text-[#6B6B6B] mt-0.5">Configurez votre commerce en 3 étapes guidées</p>
          </div>
        </div>
        <Link
          href="/dashboard/onboarding"
          className="flex-shrink-0 px-4 py-2 bg-[#6C47FF] text-white text-sm font-semibold rounded-xl hover:bg-[#5835e0] transition-colors whitespace-nowrap"
        >
          Lancer l&apos;assistant →
        </Link>
      </div>

      <MerchantForm merchant={merchant} />

      {/* Wallet status */}
      <div className="bg-white border border-[#E8E8E3] rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-[#1A1A1A]">Intégrations Wallet</h2>

        {/* Google Wallet */}
        <div className="flex items-start gap-4 p-4 rounded-lg bg-green-50 border border-green-100">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">✓</span>
          </div>
          <div>
            <p className="text-sm font-medium text-green-900">Google Wallet — disponible</p>
            <p className="text-xs text-green-700 mt-0.5">
              Configurez <code className="bg-green-100 px-1 rounded">GOOGLE_WALLET_ISSUER_ID</code>,{' '}
              <code className="bg-green-100 px-1 rounded">GOOGLE_SERVICE_ACCOUNT_EMAIL</code> et{' '}
              <code className="bg-green-100 px-1 rounded">GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY</code> dans vos variables d&apos;environnement Vercel pour activer les passes Google Wallet.
            </p>
          </div>
        </div>

        {/* Apple Wallet */}
        <div className="flex items-start gap-4 p-4 rounded-lg bg-[#F7F6F3] border border-[#E8E8E3]">
          <div className="w-8 h-8 rounded-full bg-[#E8E8E3] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">⏳</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#1A1A1A]">Apple Wallet — en attente de configuration</p>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Nécessite un compte <strong>Apple Developer</strong> (99 $/an) avec un{' '}
              <strong>Pass Type ID</strong> et un certificat signé. Une fois le certificat obtenu,
              configurez <code className="bg-[#E8E8E3] px-1 rounded">APPLE_PASS_TYPE_ID</code>,{' '}
              <code className="bg-[#E8E8E3] px-1 rounded">APPLE_TEAM_ID</code> et{' '}
              <code className="bg-[#E8E8E3] px-1 rounded">APPLE_CERT_BASE64</code> dans Vercel.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
