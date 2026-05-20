'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const customerSchema = z.object({
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  first_name: z.string().min(1, 'Le prénom est requis'),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface Merchant {
  id: string
  business_name: string
  slug: string
  logo_url: string | null
  primary_color: string
  loyalty_rule: string
  stamps_required: number
}

interface Props {
  merchant: Merchant
}

function LoyaltyQRCode({ cardId, color }: { cardId: string; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    import('qrcode').then((QRCode) => {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, cardId, {
          width: 220,
          margin: 2,
          color: { dark: '#111827', light: '#ffffff' },
        })
      }
    })
  }, [cardId, color])

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} className="rounded-lg" />
    </div>
  )
}

export default function QRLandingClient({ merchant }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [cardId, setCardId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  })

  async function onSubmit(data: CustomerFormData) {
    try {
      const customerRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: data.phone, first_name: data.first_name }),
      })

      if (!customerRes.ok) {
        const err = await customerRes.json()
        setError('root', { message: err.error ?? 'Une erreur est survenue' })
        return
      }

      const customer = await customerRes.json()

      const cardRes = await fetch('/api/loyalty-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchant_id: merchant.id, customer_id: customer.id }),
      })

      if (!cardRes.ok) {
        const err = await cardRes.json()
        setError('root', { message: err.error ?? 'Une erreur est survenue' })
        return
      }

      const card = await cardRes.json()
      setCardId(card.id)
      setSubmitted(true)
    } catch {
      setError('root', { message: 'Une erreur réseau est survenue' })
    }
  }

  if (submitted && cardId) {
    const cardUrl = `/carte/${cardId}`
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white shadow rounded-lg p-8 max-w-md w-full text-center space-y-6">
          <div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: merchant.primary_color }}
            >
              <span className="text-white text-xl">✓</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Carte créée !</h1>
            <p className="text-gray-600 text-sm mt-1">
              Votre carte de fidélité chez <strong>{merchant.business_name}</strong> est prête.
            </p>
          </div>

          {/* Bookmarkable link — primary CTA */}
          <div className="bg-indigo-50 rounded-xl p-5 space-y-3">
            <p className="text-sm font-semibold text-indigo-900">
              Enregistrez votre carte en favori
            </p>
            <p className="text-xs text-indigo-700">
              Ce lien est votre carte permanente — accédez-y depuis votre navigateur à tout moment pour présenter votre QR code.
            </p>
            <a
              href={cardUrl}
              className="block w-full py-3 px-4 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: merchant.primary_color }}
            >
              Voir ma carte →
            </a>
            <p className="text-xs text-indigo-500 break-all font-mono">
              {typeof window !== 'undefined' ? window.location.origin : ''}{cardUrl}
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 mb-3">Ou sauvegardez dans votre Wallet</p>
            <div className="flex gap-3 justify-center">
              <div className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg bg-gray-100 text-xs font-medium text-gray-400 cursor-not-allowed">
                Apple Wallet (bientôt)
              </div>
              <a
                href={`/api/wallet/google?card_id=${cardId}`}
                className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 text-xs font-medium hover:bg-gray-50"
              >
                Google Wallet
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          {merchant.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={merchant.logo_url}
              alt={merchant.business_name}
              className="h-16 w-auto mx-auto mb-3 object-contain"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: merchant.primary_color }}
            >
              <span className="text-white text-2xl font-bold">
                {merchant.business_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900">{merchant.business_name}</h1>
          <p className="text-sm text-gray-500 mt-1">{merchant.loyalty_rule}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
              Prénom
            </label>
            <input
              {...register('first_name')}
              type="text"
              id="first_name"
              placeholder="Votre prénom"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Téléphone
            </label>
            <input
              {...register('phone')}
              type="tel"
              id="phone"
              placeholder="+33 6 12 34 56 78"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {errors.root && (
            <p className="text-sm text-red-600">{errors.root.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: merchant.primary_color }}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? 'Création...' : 'Obtenir ma carte'}
          </button>
        </form>
      </div>
    </div>
  )
}
