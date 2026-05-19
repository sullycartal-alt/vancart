import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de bord
        </h1>
        {merchant && (
          <p className="mt-1 text-sm text-gray-500">
            {merchant.business_name}
          </p>
        )}
      </div>

      {!merchant && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Votre profil marchand n&apos;est pas encore configuré.
          </p>
        </div>
      )}

      {merchant && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <p className="text-sm font-medium text-gray-500 truncate">
                Cartes actives
              </p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">—</p>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <p className="text-sm font-medium text-gray-500 truncate">
                Tampons ce mois
              </p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">—</p>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <p className="text-sm font-medium text-gray-500 truncate">
                Récompenses débloquées
              </p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">—</p>
            </div>
          </div>
        </div>
      )}

      {merchant && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Votre lien QR
          </h2>
          <p className="text-sm text-gray-600">
            Partagez ce lien avec vos clients :
          </p>
          <code className="mt-2 block text-sm bg-gray-100 rounded px-3 py-2 text-gray-800">
            {process.env.NEXT_PUBLIC_APP_URL}/{merchant.slug}
          </code>
        </div>
      )}
    </div>
  )
}
