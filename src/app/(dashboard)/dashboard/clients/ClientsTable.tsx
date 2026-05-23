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

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 30000)
    return () => clearInterval(interval)
  }, [router])

  if (clients.length === 0) {
    return (
      <div className="bg-white border border-[#E8E8E3] rounded-2xl p-12 text-center">
        <div className="text-4xl mb-3">👥</div>
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">Aucun client encore</h3>
        <p className="text-sm text-[#6B6B6B]">
          Vos clients apparaîtront ici après leur premier scan de votre QR code.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E8E8E3] rounded-2xl overflow-hidden">
      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-[#E8E8E3]">
        {clients.map((client) => {
          const pct = Math.round((client.stamps_count / client.stampsRequired) * 100)
          const isAlmostFull = client.stamps_count === client.stampsRequired - 1
          return (
            <div key={client.id} className="px-4 py-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{client.customers.first_name}</p>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">{client.customers.phone}</p>
                </div>
                <div className="flex-shrink-0">
                  {isAlmostFull ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      🔥 Presque !
                    </span>
                  ) : client.rewards_unlocked > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      🎉 {client.rewards_unlocked}
                    </span>
                  ) : (
                    <span className="text-xs text-[#6B6B6B]">{formatDate(client.last_stamp_at)}</span>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold" style={{ color: client.primaryColor }}>
                    {client.stamps_count}/{client.stampsRequired} tampons
                  </span>
                  <span className="text-xs text-[#6B6B6B]">{pct}%</span>
                </div>
                <div className="w-full bg-[#F7F6F3] rounded-full h-2.5">
                  <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: client.primaryColor }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop table */}
      <table className="hidden sm:table min-w-full divide-y divide-[#E8E8E3]">
        <thead className="bg-[#F7F6F3]">
          <tr>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Client</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Progression</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Dernier tampon</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Statut</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#E8E8E3]">
          {clients.map((client) => {
            const pct = Math.round((client.stamps_count / client.stampsRequired) * 100)
            const isAlmostFull = client.stamps_count === client.stampsRequired - 1
            return (
              <tr key={client.id} className="hover:bg-[#F7F6F3] transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{client.customers.first_name}</p>
                  <p className="text-xs text-[#6B6B6B]">{client.customers.phone}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-[#1A1A1A]">{client.stamps_count}/{client.stampsRequired}</span>
                    <div className="w-full bg-[#F7F6F3] rounded-full h-1.5 mt-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: client.primaryColor }} />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#6B6B6B]">{formatDate(client.last_stamp_at)}</td>
                <td className="px-6 py-4">
                  {isAlmostFull ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">🔥 Presque !</span>
                  ) : client.rewards_unlocked > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">🎉 {client.rewards_unlocked} récompense{client.rewards_unlocked > 1 ? 's' : ''}</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F7F6F3] text-[#6B6B6B] border border-[#E8E8E3]">En cours</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="px-5 py-3 bg-[#F7F6F3] border-t border-[#E8E8E3]">
        <p className="text-xs text-[#6B6B6B]">
          {clients.length} client{clients.length > 1 ? 's' : ''} · actualisation auto toutes les 30s
        </p>
      </div>
    </div>
  )
}
