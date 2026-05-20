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

function QRCanvas({ value }: { value: string }) {
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
  }, [value])

  return <canvas ref={canvasRef} className="rounded-xl" />
}

function ProgressBar({
  count,
  total,
  color,
}: {
  count: number
  total: number
  color: string
}) {
  const pct = Math.min(100, Math.round((count / total) * 100))
  const stampsLeft = total - count

  let message: string
  let messageColor: string
  if (count >= total) {
    message = '🎉 Récompense débloquée !'
    messageColor = '#16a34a'
  } else if (stampsLeft === 1) {
    message = "⭐ Plus qu'1 tampon pour votre récompense !"
    messageColor = '#d97706'
  } else if (stampsLeft <= 3) {
    message = `🔥 Plus que ${stampsLeft} tampons pour votre récompense !`
    messageColor = '#d97706'
  } else if (pct >= 50) {
    message = `💪 ${stampsLeft} tampons encore — vous y êtes presque !`
    messageColor = color
  } else {
    message = `${stampsLeft} tampons pour votre prochaine récompense`
    messageColor = '#6b7280'
  }

  return (
    <div className="space-y-3">
      {/* Count display */}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-5xl font-bold tabular-nums" style={{ color }}>
            {count}
          </span>
          <span className="text-2xl text-gray-300 font-light"> / {total}</span>
        </div>
        <span className="text-sm text-gray-400 pb-2">tampons</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>

      {/* Motivating message */}
      <p className="text-sm font-medium" style={{ color: messageColor }}>
        {message}
      </p>
    </div>
  )
}

export default function CardClient({ initialCard }: { initialCard: CardData }) {
  const [card, setCard] = useState(initialCard)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/public/card?id=${card.id}`)
        if (res.ok) {
          const fresh = await res.json()
          // Normalise joined relations just like the server does
          setCard({
            ...fresh,
            merchants: Array.isArray(fresh.merchants) ? fresh.merchants[0] : fresh.merchants,
            customers: Array.isArray(fresh.customers) ? fresh.customers[0] : fresh.customers,
          })
          setLastUpdated(new Date())
        }
      } catch {
        // silent
      }
    }, 8000)
    return () => clearInterval(interval)
  }, [card.id])

  const merchant = card.merchants

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-4">

        {/* Brand header */}
        <div
          className="rounded-2xl px-6 pt-8 pb-6 text-white text-center space-y-2"
          style={{ backgroundColor: merchant.primary_color }}
        >
          {merchant.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={merchant.logo_url}
              alt={merchant.business_name}
              className="h-14 w-auto mx-auto mb-2 object-contain brightness-0 invert"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-2xl font-bold">
                {merchant.business_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-xl font-bold tracking-tight">{merchant.business_name}</h1>
          <p className="text-sm opacity-75">{merchant.loyalty_rule}</p>
          <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 mt-1">
            <span className="text-xs font-medium opacity-90">Carte de {card.customers.first_name}</span>
          </div>
        </div>

        {/* Progress card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <ProgressBar
            count={card.stamps_count}
            total={merchant.stamps_required}
            color={merchant.primary_color}
          />

          {card.rewards_unlocked > 0 && (
            <p className="text-xs text-gray-400 border-t pt-3">
              🏆 {card.rewards_unlocked} récompense{card.rewards_unlocked > 1 ? 's' : ''} obtenue{card.rewards_unlocked > 1 ? 's' : ''} au total
            </p>
          )}
        </div>

        {/* QR code card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center space-y-3">
          <p className="text-sm font-semibold text-gray-800">
            Présentez ce QR code au commerçant
          </p>
          <div className="flex justify-center">
            <QRCanvas value={card.id} />
          </div>
          <p className="text-xs text-gray-300 font-mono truncate">{card.id}</p>
        </div>

        {/* Bookmark + update hint */}
        <div
          className="rounded-2xl p-4 text-center"
          style={{ backgroundColor: `${merchant.primary_color}15` }}
        >
          <p className="text-xs font-medium" style={{ color: merchant.primary_color }}>
            📌 Ajoutez cette page en favori pour retrouver votre carte
          </p>
          {lastUpdated && (
            <p className="text-xs mt-1" style={{ color: `${merchant.primary_color}80` }}>
              Mis à jour à{' '}
              {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Wallet */}
        <div className="flex gap-3">
          <a
            href={`/api/wallet/google?card_id=${card.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Google Wallet
          </a>
          <div className="flex-1 flex items-center justify-center px-4 py-3 rounded-xl bg-gray-100 text-sm font-medium text-gray-400 cursor-not-allowed">
            Apple Wallet
          </div>
        </div>
      </div>
    </div>
  )
}
