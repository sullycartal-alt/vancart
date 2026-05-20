'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  stamps_count: number
  rewards_unlocked: number
  last_stamp_at: string | null
  customers: {
    first_name: string
    phone: string
  }
  stampsRequired: number
  primaryColor: string
}

interface Props {
  clients: Client[]
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function ClientsTable({ clients }: Props) {
  const router = useRouter()

  // Auto-refresh data every 30 seconds silently
  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 30000)
    return () => clearInterval(interval)
  }, [router])

  if (clients.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-12 text-center">
        <div className="text-4xl mb-3">👥</div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun client encore</h3>
        <p className="text-sm text-gray-500">
          Vos clients apparaîtront ici après leur premier scan de votre QR code.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progression
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
              Dernier tampon
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
              Statut
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => {
            const pct = Math.round((client.stamps_count / client.stampsRequired) * 100)
            const isAlmostFull = client.stamps_count === client.stampsRequired - 1
            return (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {client.customers.first_name}
                    </p>
                    <p className="text-xs text-gray-500">{client.customers.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {client.stamps_count}/{client.stampsRequired}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: client.primaryColor }}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                  {formatDate(client.last_stamp_at)}
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  {isAlmostFull ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      🔥 Presque !
                    </span>
                  ) : client.rewards_unlocked > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🎉 {client.rewards_unlocked} récompense{client.rewards_unlocked > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      En cours
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          {clients.length} client{clients.length > 1 ? 's' : ''} · actualisation automatique toutes les 30 secondes
        </p>
      </div>
    </div>
  )
}
