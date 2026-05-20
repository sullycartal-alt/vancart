'use client'

import { useEffect, useRef, useState } from 'react'

interface Merchant {
  business_name: string
  logo_url: string | null
  primary_color: string
  loyalty_rule: string
  stamps_required: number
}

interface CardData {
  id: string
  stamps_count: number
  rewards_unlocked: number
  merchants: Merchant
  customers: { first_name: string }
}

function StampDots({ count, total, color }: { count: number; total: number; color: string }) {
  const dots = Math.min(total, 20)
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {Array.from({ length: dots }).map((_, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-full border-2 transition-all"
          style={
            i < count
              ? { backgroundColor: color, borderColor: color }
              : { backgroundColor: 'transparent', borderColor: '#d1d5db' }
          }
        />
      ))}
      {total > 20 && <span className="text-sm text-gray-400 self-center">+{total - 20}</span>}
    </div>
  )
}

function QRCanvas({ value, color }: { value: string; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    import('qrcode').then((QRCode) => {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, value, {
          width: 240,
          margin: 2,
          color: { dark: '#111827', light: '#ffffff' },
        })
      }
    })
  }, [value, color])

  return <canvas ref={canvasRef} className="rounded-xl" />
}

export default function CardClient({ initialCard }: { initialCard: CardData }) {
  const [card, setCard] = useState(initialCard)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Poll for stamp count updates every 8 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/public/card?id=${card.id}`)
        if (res.ok) {
          const fresh = await res.json()
          setCard(fresh)
          setLastUpdated(new Date())
        }
      } catch {
        // silent fail
      }
    }, 8000)
    return () => clearInterval(interval)
  }, [card.id])

  const merchant = card.merchants
  const stampsLeft = merchant.stamps_required - card.stamps_count

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-4">
        {/* Header */}
        <div
          className="rounded-2xl p-6 text-white text-center"
          style={{ backgroundColor: merchant.primary_color }}
        >
          {merchant.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={merchant.logo_url}
              alt={merchant.business_name}
              className="h-12 w-auto mx-auto mb-3 object-contain brightness-0 invert"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl font-bold">
                {merchant.business_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-lg font-bold">{merchant.business_name}</h1>
          <p className="text-sm opacity-80 mt-1">{merchant.loyalty_rule}</p>
          <p className="text-xs opacity-60 mt-2">Carte de {card.customers.first_name}</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center space-y-4">
          <div>
            <span className="text-4xl font-bold" style={{ color: merchant.primary_color }}>
              {card.stamps_count}
            </span>
            <span className="text-2xl text-gray-400 font-light"> / {merchant.stamps_required}</span>
            <p className="text-sm text-gray-500 mt-1">tampons</p>
          </div>

          <StampDots
            count={card.stamps_count}
            total={merchant.stamps_required}
            color={merchant.primary_color}
          />

          {stampsLeft <= 0 ? (
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-green-700 font-medium text-sm">Récompense débloquée !</p>
            </div>
          ) : stampsLeft === 1 ? (
            <p className="text-amber-600 text-sm font-medium">Plus qu&apos;1 tampon !</p>
          ) : (
            <p className="text-gray-400 text-sm">Encore {stampsLeft} tampons pour votre récompense</p>
          )}

          {card.rewards_unlocked > 0 && (
            <p className="text-xs text-gray-400">
              {card.rewards_unlocked} récompense{card.rewards_unlocked > 1 ? 's' : ''} obtenue{card.rewards_unlocked > 1 ? 's' : ''} au total
            </p>
          )}
        </div>

        {/* QR code */}
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Présentez ce QR code au commerçant
          </p>
          <div className="flex justify-center">
            <QRCanvas value={card.id} color={merchant.primary_color} />
          </div>
          <p className="text-xs text-gray-400 break-all font-mono">{card.id}</p>
        </div>

        {/* Bookmark hint */}
        <div className="bg-indigo-50 rounded-2xl p-4 text-center">
          <p className="text-xs text-indigo-700 font-medium">
            Ajoutez cette page en favori pour retrouver votre carte
          </p>
          {lastUpdated && (
            <p className="text-xs text-indigo-400 mt-1">
              Mis à jour à {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Wallet buttons */}
        <div className="flex gap-3">
          <a
            href={`/api/wallet/google?card_id=${card.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
            Google Wallet
          </a>
          <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-sm font-medium text-gray-400 cursor-not-allowed">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.19 1.28-2.17 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.73M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple Wallet
          </div>
        </div>
      </div>
    </div>
  )
}
