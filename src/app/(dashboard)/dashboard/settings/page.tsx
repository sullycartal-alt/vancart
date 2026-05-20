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

      {/* Wallet status */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Intégrations Wallet</h2>

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
        <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">⏳</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Apple Wallet — en attente de configuration</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Nécessite un compte <strong>Apple Developer</strong> (99 $/an) avec un{' '}
              <strong>Pass Type ID</strong> et un certificat signé. Une fois le certificat obtenu,
              configurez <code className="bg-gray-200 px-1 rounded">APPLE_PASS_TYPE_ID</code>,{' '}
              <code className="bg-gray-200 px-1 rounded">APPLE_TEAM_ID</code> et{' '}
              <code className="bg-gray-200 px-1 rounded">APPLE_CERT_BASE64</code> dans Vercel.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
