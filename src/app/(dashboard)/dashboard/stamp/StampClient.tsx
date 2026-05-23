'use client'

import { useCallback, useState } from 'react'
import QRScanner from './QRScanner'

interface Merchant {
  id: string
  business_name: string
  stamps_required: number
  primary_color: string
  loyalty_type: string
  points_per_euro: number | null
  points_required: number | null
}

interface LoyaltyCard {
  id: string
  stamps_count: number
  points: number
  rewards_unlocked: number
  customers: { first_name: string; phone: string }
}

interface StampResult {
  card: LoyaltyCard
  reward_unlocked: boolean
  mode: string
  points_added?: number
}

interface Props { merchant: Merchant }

function StampDots({ count, total, color }: { count: number; total: number; color: string }) {
  const dots = Math.min(total, 20)
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: dots }).map((_, i) => (
        <div key={i} className="w-9 h-9 rounded-full border-2 transition-colors"
          style={i < count
            ? { backgroundColor: color, borderColor: color }
            : { backgroundColor: '#F7F6F3', borderColor: '#E8E8E3' }}
        />
      ))}
      {total > 20 && <span className="text-sm text-[#6B6B6B] self-center">+{total - 20}</span>}
    </div>
  )
}

function PointsBar({ points, required, color }: { points: number; required: number; color: string }) {
  const pct = Math.min(100, Math.round((points / required) * 100))
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-semibold" style={{ color }}>{points} pts</span>
        <span className="text-[#6B6B6B]">/{required} pts</span>
      </div>
      <div className="w-full bg-[#F7F6F3] rounded-full h-3 overflow-hidden">
        <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

const inputClass = 'block w-full rounded-xl border border-[#E8E8E3] px-4 py-3 text-[#1A1A1A] bg-[#F7F6F3] focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/15 transition-all'

export default function StampClient({ merchant }: Props) {
  const isPoints = merchant.loyalty_type === 'points'
  const pointsPerEuro = merchant.points_per_euro ?? 1
  const pointsRequired = merchant.points_required ?? 100

  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const [pendingCardId, setPendingCardId] = useState<string | null>(null)
  const [purchaseAmount, setPurchaseAmount] = useState('')

  const [phone, setPhone] = useState('')
  const [searching, setSearching] = useState(false)
  const [card, setCard] = useState<LoyaltyCard | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [stamping, setStamping] = useState(false)

  const [result, setResult] = useState<StampResult | null>(null)

  async function submitStamp(cardId: string, amount?: number) {
    const res = await fetch('/api/stamps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loyalty_card_id: cardId, ...(amount !== undefined ? { amount } : {}) }),
    })
    const data = await res.json()
    if (res.ok) { setResult(data) } else { setScanError(data.error ?? 'Erreur') }
  }

  const handleQRScan = useCallback(async (data: string) => {
    setScanning(false)
    setScanError(null)
    const uuid = data.trim()
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
      setScanError('QR code non reconnu. Assurez-vous de scanner la carte de fidélité.')
      return
    }
    if (isPoints) {
      setPendingCardId(uuid)
      setPurchaseAmount('')
    } else {
      setProcessing(true)
      await submitStamp(uuid)
      setProcessing(false)
    }
  }, [isPoints]) // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!res.ok) { setSearchError(data.error ?? 'Erreur lors de la recherche') } else { setCard(data) }
    setSearching(false)
  }

  async function handleStamp(amount?: number) {
    if (!card) return
    setStamping(true)
    const res = await fetch('/api/stamps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loyalty_card_id: card.id, ...(amount !== undefined ? { amount } : {}) }),
    })
    const data = await res.json()
    if (res.ok) { setResult(data); setCard(null) }
    setStamping(false)
  }

  function handleReset() {
    setPhone(''); setCard(null); setResult(null); setSearchError(null)
    setScanError(null); setScanning(false); setPendingCardId(null); setPurchaseAmount('')
  }

  if (result) {
    const { card: c, reward_unlocked, mode, points_added } = result
    const displayCount = mode === 'points' ? (c.points ?? 0) : c.stamps_count
    const displayTotal = mode === 'points' ? pointsRequired : merchant.stamps_required
    const unit = mode === 'points' ? 'pts' : 'tampon(s)'
    return (
      <div className="bg-white border border-[#E8E8E3] rounded-2xl p-6 sm:p-8 text-center space-y-6">
        <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto text-4xl sm:text-3xl"
          style={{ backgroundColor: reward_unlocked ? '#10b981' : merchant.primary_color, color: 'white' }}>
          {reward_unlocked ? '🎉' : '✓'}
        </div>
        {reward_unlocked ? (
          <div>
            <h2 className="text-2xl sm:text-xl font-bold text-[#1A1A1A]">Récompense débloquée !</h2>
            <p className="text-[#6B6B6B] mt-1 text-base sm:text-sm">{c.customers.first_name} a obtenu sa récompense.</p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
              <p className="text-base sm:text-sm text-green-800 font-medium">
                Sa carte repart à zéro — {displayCount} {unit} sur {displayTotal}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-xl font-bold text-[#1A1A1A]">
              {mode === 'points'
                ? `+${points_added} pts ! ${c.customers.first_name} : ${c.points}/${pointsRequired} pts`
                : `Tampon ajouté ! ${c.customers.first_name} : ${c.stamps_count}/${merchant.stamps_required}`
              }
            </h2>
            {mode === 'points'
              ? <PointsBar points={c.points ?? 0} required={pointsRequired} color={merchant.primary_color} />
              : <div className="flex justify-center"><StampDots count={c.stamps_count} total={merchant.stamps_required} color={merchant.primary_color} /></div>
            }
            {mode !== 'points' && merchant.stamps_required - c.stamps_count === 1 && (
              <p className="text-sm text-amber-600 font-medium">Plus qu&apos;1 tampon avant la récompense !</p>
            )}
            {mode === 'points' && pointsRequired - (c.points ?? 0) <= Math.round(pointsRequired * 0.1) && (
              <p className="text-sm text-amber-600 font-medium">Presque ! Plus que {pointsRequired - (c.points ?? 0)} pts !</p>
            )}
          </div>
        )}
        <button onClick={handleReset} className="w-full py-2.5 px-4 border border-[#E8E8E3] rounded-xl text-sm font-medium text-[#1A1A1A] hover:bg-[#F7F6F3] transition-colors">
          Nouveau client
        </button>
      </div>
    )
  }

  if (isPoints && pendingCardId) {
    const pts = purchaseAmount ? Math.round(parseFloat(purchaseAmount) * pointsPerEuro) : 0
    return (
      <div className="bg-white border border-[#E8E8E3] rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A1A]">QR scanné ✓</h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">Entrez le montant de l&apos;achat pour calculer les points.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Montant de l&apos;achat (€)</label>
          <input
            type="number" min="0" step="0.01" value={purchaseAmount}
            onChange={e => setPurchaseAmount(e.target.value)}
            placeholder="Ex : 25.50"
            className={`${inputClass} text-lg font-mono`}
            autoFocus
          />
        </div>
        {pts > 0 && (
          <div className="rounded-xl p-3 text-center" style={{ backgroundColor: `${merchant.primary_color}12` }}>
            <p className="text-sm font-semibold" style={{ color: merchant.primary_color }}>
              +{pts} points ({pointsPerEuro} pt/€)
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => { setPendingCardId(null); setPurchaseAmount('') }}
            className="flex-1 py-2.5 px-4 border border-[#E8E8E3] rounded-xl text-sm font-medium text-[#1A1A1A] hover:bg-[#F7F6F3] transition-colors">
            Annuler
          </button>
          <button
            onClick={async () => { setProcessing(true); await submitStamp(pendingCardId, parseFloat(purchaseAmount)); setPendingCardId(null); setProcessing(false) }}
            disabled={!purchaseAmount || parseFloat(purchaseAmount) <= 0 || processing}
            style={{ backgroundColor: merchant.primary_color }}
            className="flex-1 py-2.5 px-4 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
            {processing ? 'Enregistrement...' : `Valider (+${pts} pts)`}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* QR Scanner */}
      <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[#1A1A1A]">Scanner la carte du client</h2>
        {scanning ? (
          <div className="space-y-3">
            <QRScanner onScan={handleQRScan} onError={handleQRError} />
            <button onClick={() => setScanning(false)} className="w-full py-3 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">Annuler</button>
          </div>
        ) : (
          <button
            onClick={() => { setScanError(null); setScanning(true) }}
            disabled={processing}
            style={{ backgroundColor: merchant.primary_color }}
            className="w-full py-5 sm:py-4 px-4 rounded-2xl text-white font-bold text-lg sm:text-base hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-3 min-h-[72px] sm:min-h-0"
          >
            {processing ? 'Enregistrement...' : (
              <>
                <svg className="w-7 h-7 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5V16M4.5 4.5h3v3h-3v-3zm10 0h3v3h-3v-3zm0 10h3v3h-3v-3zM4.5 14.5h3v3h-3v-3z" />
                </svg>
                Scanner un QR code
              </>
            )}
          </button>
        )}
        {scanError && <p className="text-sm text-red-500 text-center">{scanError}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-[#E8E8E3]" />
        <span className="text-xs text-[#6B6B6B]">ou rechercher par téléphone</span>
        <div className="flex-1 border-t border-[#E8E8E3]" />
      </div>

      {/* Phone search */}
      <form onSubmit={handlePhoneSearch} className="bg-white border border-[#E8E8E3] rounded-2xl p-5 sm:p-6">
        <label htmlFor="phone" className="block text-sm font-semibold text-[#1A1A1A] mb-2">Numéro de téléphone</label>
        <div className="flex gap-3">
          <input id="phone" type="tel" value={phone}
            onChange={e => { setPhone(e.target.value); setCard(null); setSearchError(null) }}
            placeholder="+33 6 12 34 56 78"
            className={`${inputClass} text-base`}
            style={{ fontSize: '16px' }}
          />
          <button type="submit" disabled={searching || phone.length < 6}
            className="px-4 py-2.5 bg-[#6C47FF] text-white text-sm font-semibold rounded-xl hover:bg-[#5835e0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]">
            {searching ? '...' : 'Chercher'}
          </button>
        </div>
        {searchError && <p className="mt-2 text-sm text-red-500">{searchError}</p>}
      </form>

      {/* Card preview */}
      {card && (
        <div className="bg-white border border-[#E8E8E3] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-[#1A1A1A]">{card.customers.first_name}</p>
              <p className="text-sm text-[#6B6B6B]">{card.customers.phone}</p>
            </div>
            <div className="text-right">
              {isPoints ? (
                <>
                  <span className="text-2xl font-bold" style={{ color: merchant.primary_color }}>{card.points ?? 0}</span>
                  <span className="text-[#6B6B6B] text-lg"> / {pointsRequired}</span>
                  <p className="text-xs text-[#6B6B6B]">points</p>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold" style={{ color: merchant.primary_color }}>{card.stamps_count}</span>
                  <span className="text-[#6B6B6B] text-lg"> / {merchant.stamps_required}</span>
                  <p className="text-xs text-[#6B6B6B]">tampons</p>
                </>
              )}
            </div>
          </div>

          {isPoints
            ? <PointsBar points={card.points ?? 0} required={pointsRequired} color={merchant.primary_color} />
            : <StampDots count={card.stamps_count} total={merchant.stamps_required} color={merchant.primary_color} />
          }

          {isPoints ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Montant de l&apos;achat (€)</label>
                <input type="number" min="0" step="0.01" value={purchaseAmount}
                  onChange={e => setPurchaseAmount(e.target.value)}
                  placeholder="Ex : 25.50"
                  className={`${inputClass} font-mono`}
                />
              </div>
              {purchaseAmount && parseFloat(purchaseAmount) > 0 && (
                <div className="rounded-xl p-2.5 text-center text-sm font-semibold" style={{ backgroundColor: `${merchant.primary_color}12`, color: merchant.primary_color }}>
                  +{Math.round(parseFloat(purchaseAmount) * pointsPerEuro)} points
                </div>
              )}
              <button onClick={() => handleStamp(parseFloat(purchaseAmount))}
                disabled={stamping || !purchaseAmount || parseFloat(purchaseAmount) <= 0}
                style={{ backgroundColor: merchant.primary_color }}
                className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                {stamping ? 'Enregistrement...' : `Valider l'achat de ${card.customers.first_name}`}
              </button>
            </div>
          ) : (
            <button onClick={() => handleStamp()} disabled={stamping}
              style={{ backgroundColor: merchant.primary_color }}
              className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
              {stamping ? 'Enregistrement...' : `Tamponner la carte de ${card.customers.first_name}`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
