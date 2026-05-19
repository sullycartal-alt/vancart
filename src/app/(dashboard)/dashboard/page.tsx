import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!merchant) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">🎴</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Bienvenue sur VanCart !</h2>
          <p className="text-gray-500 mb-6">
            Commencez par configurer votre carte de fidélité pour obtenir votre QR code.
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            Configurer mon commerce →
          </Link>
        </div>
      </div>
    )
  }

  // Real stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [{ count: activeCards }, { count: stampsToday }, { data: rewardsData }] = await Promise.all([
    supabase
      .from('loyalty_cards')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant.id),
    supabase
      .from('stamps')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant.id)
      .gte('given_at', today.toISOString()),
    supabase
      .from('loyalty_cards')
      .select('rewards_unlocked')
      .eq('merchant_id', merchant.id),
  ])

  const totalRewards = rewardsData?.reduce((sum, c) => sum + c.rewards_unlocked, 0) ?? 0

  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${merchant.slug}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-gray-500">{merchant.business_name}</p>
        </div>
        <Link
          href="/dashboard/settings"
          className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
        >
          Modifier mon commerce →
        </Link>
      </div>

      {/* Primary action */}
      <Link
        href="/dashboard/stamp"
        className="flex items-center justify-between bg-indigo-600 hover:bg-indigo-700 text-white shadow rounded-lg p-6 transition-colors"
      >
        <div>
          <p className="text-lg font-bold">Donner un tampon</p>
          <p className="text-indigo-200 text-sm mt-0.5">Recherchez un client par téléphone</p>
        </div>
        <span className="text-4xl">🪙</span>
      </Link>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <p className="text-sm font-medium text-gray-500">Cartes actives</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{activeCards ?? 0}</p>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <p className="text-sm font-medium text-gray-500">Tampons aujourd'hui</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{stampsToday ?? 0}</p>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <p className="text-sm font-medium text-gray-500">Récompenses débloquées</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{totalRewards}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-1">Votre lien QR</h2>
        <p className="text-sm text-gray-500 mb-3">
          Partagez ce lien ou imprimez le QR code depuis{' '}
          <Link href="/dashboard/settings" className="text-indigo-600 hover:underline">
            Mon commerce
          </Link>.
        </p>
        <code className="block text-sm bg-gray-100 rounded px-3 py-2 text-gray-800 break-all">
          {qrUrl}
        </code>
      </div>
    </div>
  )
}
