'use client'

import { useState } from 'react'
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
      // Create or find customer
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

      // Create loyalty card
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white shadow rounded-lg p-8 max-w-md w-full text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: merchant.primary_color }}
          >
            <span className="text-white text-2xl">✓</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Carte créée !
          </h1>
          <p className="text-gray-600 mb-4">
            Votre carte de fidélité chez{' '}
            <strong>{merchant.business_name}</strong> est prête.
          </p>
          <p className="text-sm text-gray-500 mb-6">{merchant.loyalty_rule}</p>

          <div className="flex gap-3 justify-center">
            <a
              href={`/api/wallet/apple?card_id=${cardId}`}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-black text-white text-sm font-medium"
            >
              Apple Wallet
            </a>
            <a
              href={`/api/wallet/google?card_id=${cardId}`}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 text-sm font-medium"
            >
              Google Wallet
            </a>
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
