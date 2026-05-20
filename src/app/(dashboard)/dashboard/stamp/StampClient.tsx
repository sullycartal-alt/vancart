'use client'

import { useCallback, useState } from 'react'
import QRScanner from './QRScanner'

interface Merchant {
  id: string
  business_name: string
  stamps_required: number
  primary_color: string
}

interface LoyaltyCard {
  id: string
  stamps_count: number
  rewards_unlocked: number
  customers: {
    first_name: string
    phone: string
  }
}

interface StampResult {
  card: LoyaltyCard
  reward_unlocked: boolean
}

interface Props {
  merchant: Merchant
}

function StampDots({ count, total, color }: { count: number; total: number; color: string }) {
  const dots = Math.min(total, 20)
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: dots }).map((_, i) => (
        <div
          key={i}
          className="w-9 h-9 rounded-full border-2 transition-colors"
          style={
            i < count
              ? { backgroundColor: color, borderColor: color }
              : { backgroundColor: 'white', borderColor: '#d1d5db' }
          }
        />
      ))}
      {total > 20 && (
        <span className="text-sm text-gray-500 self-center">+{total - 20}</span>
      )}
    </div>
  )
}

export default function StampClient({ merchant }: Props) {
  // QR scanner state
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  // Phone search state
  const [phone, setPhone] = useState('')
  const [searching, setSearching] = useState(false)
  const [card, setCard] = useState<LoyaltyCard | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [stamping, setStamping] = useState(false)

  // Shared result state
  const [result, setResult] = useState<StampResult | null>(null)

  const handleQRScan = useCallback(async (data: string) => {
    setScanning(false)
    setScanError(null)
    const uuid = data.trim()
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
      setScanError('QR code non reconnu. Assurez-vous de scanner la carte de fidélité.')
      return
    }

    setProcessing(true)
    const res = await fetch('/api/stamps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loyalty_card_id: uuid }),
    })
    const responseData = await res.json()

    if (res.ok) {
      setResult(responseData)
    } else {
      setScanError(responseData.error ?? 'Carte non reconnue ou invalide')
    }
    setProcessing(false)
  }, [])

  const handleQRError = useCallback((msg: string) => {
    setScanning(false)
    setScanError(msg)
  }, [])

  async function handlePhoneSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearching(true)
    setSearchError(null)
    setCard(null)

    const res = await fetch(`/api/loyalty-cards?phone=${encodeURIComponent(phone)}`)
    const data = await res.json()

    if (!res.ok) {
      setSearchError(data.error ?? 'Erreur lors de la recherche')
    } else {
      setCard(data)
    }
    setSearching(false)
  }

  async function handleStamp() {
    if (!card) return
    setStamping(true)

    const res = await fetch('/api/stamps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loyalty_card_id: card.id }),
    })
    const data = await res.json()

    if (res.ok) {
      setResult(data)
      setCard(null)
    }
    setStamping(false)
  }

  function handleReset() {
    setPhone('')
    setCard(null)
    setResult(null)
    setSearchError(null)
    setScanError(null)
    setScanning(false)
  }

  // Result screen (shared for both flows)
  if (result) {
    const { card: updatedCard, reward_unlocked } = result
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center space-y-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-white text-3xl"
          style={{ backgroundColor: reward_unlocked ? '#10b981' : merchant.primary_color }}
        >
          {reward_unlocked ? '🎉' : '✓'}
        </div>

        {reward_unlocked ? (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Récompense débloquée !</h2>
              <p className="text-gray-600 mt-1">
                {updatedCard.customers.first_name} a obtenu sa récompense.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium">
                Sa carte repart à zéro — {updatedCard.stamps_count} tampon(s) sur {merchant.stamps_required}
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900">
              Tampon ajouté ! {updatedCard.customers.first_name} : {updatedCard.stamps_count}/{merchant.stamps_required}
            </h2>
            <div className="flex justify-center">
              <StampDots
                count={updatedCard.stamps_count}
                total={merchant.stamps_required}
                color={merchant.primary_color}
              />
            </div>
            {merchant.stamps_required - updatedCard.stamps_count === 1 && (
              <p className="text-sm text-amber-600 font-medium">
                Plus qu&apos;1 tampon avant la récompense !
              </p>
            )}
          </>
        )}

        <button
          onClick={handleReset}
          className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Nouveau client
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* QR Scanner section */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-sm font-medium text-gray-700">Scanner la carte du client</h2>

        {scanning ? (
          <div className="space-y-3">
            <QRScanner onScan={handleQRScan} onError={handleQRError} />
            <button
              onClick={() => setScanning(false)}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setScanError(null); setScanning(true) }}
            disabled={processing}
            style={{ backgroundColor: merchant.primary_color }}
            className="w-full py-3 px-4 rounded-md text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {processing ? (
              'Enregistrement...'
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5V16M4.5 4.5h3v3h-3v-3zm10 0h3v3h-3v-3zm0 10h3v3h-3v-3zM4.5 14.5h3v3h-3v-3z" />
                </svg>
                Scanner un QR code
              </>
            )}
          </button>
        )}

        {scanError && (
          <p className="text-sm text-red-600 text-center">{scanError}</p>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-xs text-gray-400">ou rechercher par téléphone</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* Phone search section */}
      <form onSubmit={handlePhoneSearch} className="bg-white shadow rounded-lg p-6">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Numéro de téléphone du client
        </label>
        <div className="flex gap-3">
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setCard(null); setSearchError(null) }}
            placeholder="+33 6 12 34 56 78"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={searching || phone.length < 6}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searching ? '...' : 'Rechercher'}
          </button>
        </div>
        {searchError && (
          <p className="mt-2 text-sm text-red-600">{searchError}</p>
        )}
      </form>

      {/* Card preview (phone search result) */}
      {card && (
        <div className="bg-white shadow rounded-lg p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">{card.customers.first_name}</p>
              <p className="text-sm text-gray-500">{card.customers.phone}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold" style={{ color: merchant.primary_color }}>
                {card.stamps_count}
              </span>
              <span className="text-gray-400 text-lg"> / {merchant.stamps_required}</span>
              <p className="text-xs text-gray-500">tampons</p>
            </div>
          </div>

          <StampDots count={card.stamps_count} total={merchant.stamps_required} color={merchant.primary_color} />

          {card.rewards_unlocked > 0 && (
            <p className="text-xs text-gray-400">
              {card.rewards_unlocked} récompense(s) déjà obtenue(s) au total
            </p>
          )}

          <button
            onClick={handleStamp}
            disabled={stamping}
            style={{ backgroundColor: merchant.primary_color }}
            className="w-full py-3 px-4 rounded-md text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {stamping ? 'Enregistrement...' : `Tamponner la carte de ${card.customers.first_name}`}
          </button>
        </div>
      )}
    </div>
  )
}
