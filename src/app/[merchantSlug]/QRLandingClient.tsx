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
  description?: string | null
  instagram_handle?: string | null
}

interface Props {
  merchant: Merchant
}

// Derive a readable contrasting text color (white vs black) for any hex bg
function textColorFor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  // WCAG relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#1f2937' : '#ffffff'
}

export default function QRLandingClient({ merchant }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [cardId, setCardId] = useState<string | null>(null)
  const [logoError, setLogoError] = useState(false)

  const color = /^#[0-9a-f]{6}$/i.test(merchant.primary_color)
    ? merchant.primary_color
    : '#4f46e5'
  const textColor = textColorFor(color)

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
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: `${color}10` }}>
        {/* Colored top band */}
        <div className="px-4 pt-10 pb-8 text-center" style={{ backgroundColor: color }}>
          {merchant.logo_url && !logoError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={merchant.logo_url}
              alt={merchant.business_name}
              width={128}
              height={56}
              className="h-14 w-auto mx-auto mb-3 object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: `${textColor}20` }}
            >
              <span className="text-2xl font-bold" style={{ color: textColor }}>
                {merchant.business_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-xl font-bold" style={{ color: textColor }}>
            {merchant.business_name}
          </h1>
          <div
            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${textColor}20`, color: textColor }}
          >
            ✓ Carte créée avec succès
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-4">
          {/* Bookmark CTA */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4 text-center">
            <div className="text-3xl">📌</div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Enregistrez votre carte</h2>
              <p className="text-sm text-gray-500 mt-1">
                Ce lien est votre carte permanente. Mettez-le en favori pour retrouver votre QR code à tout moment.
              </p>
            </div>
            <a
              href={cardUrl}
              className="block w-full py-3 px-4 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: color, color: textColor }}
            >
              Voir ma carte →
            </a>
            <p className="text-xs text-gray-400 break-all font-mono">
              {typeof window !== 'undefined' ? window.location.origin : ''}{cardUrl}
            </p>
          </div>

          {/* Wallet row */}
          <div className="flex gap-3">
            <div className="flex-1 flex items-center justify-center px-3 py-3 rounded-xl bg-gray-100 text-xs font-medium text-gray-400 cursor-not-allowed">
              Apple Wallet (bientôt)
            </div>
            <a
              href={`/api/wallet/google?card_id=${cardId}`}
              className="flex-1 flex items-center justify-center px-3 py-3 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Google Wallet
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero with merchant branding */}
      <div
        className="px-6 pt-14 pb-10 text-center"
        style={{ backgroundColor: color }}
      >
        {merchant.logo_url && !logoError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={merchant.logo_url}
            alt={merchant.business_name}
            width={160}
            height={64}
            className="h-16 w-auto mx-auto mb-4 object-contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ backgroundColor: `${textColor}20` }}
          >
            <span className="text-4xl font-bold" style={{ color: textColor }}>
              {merchant.business_name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <h1 className="text-2xl font-bold tracking-tight" style={{ color: textColor }}>
          {merchant.business_name}
        </h1>
        {merchant.description && (
          <p className="text-sm mt-1 opacity-75" style={{ color: textColor }}>{merchant.description}</p>
        )}
        <p className="text-sm mt-2 opacity-80" style={{ color: textColor }}>
          {merchant.loyalty_rule}
        </p>
        {merchant.instagram_handle && (
          <a
            href={`https://instagram.com/${merchant.instagram_handle.replace(/^@/, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-xs opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: textColor }}
          >
            📸 @{merchant.instagram_handle.replace(/^@/, '')}
          </a>
        )}
        <div
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-xs font-semibold"
          style={{ backgroundColor: `${textColor}20`, color: textColor }}
        >
          🎴 {merchant.stamps_required} tampons = 1 récompense
        </div>
      </div>

      {/* White card with form */}
      <div className="flex-1 bg-gray-50 flex items-start justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm w-full max-w-sm p-6 space-y-5 -mt-6">
          <div className="text-center">
            <h2 className="text-base font-semibold text-gray-900">Créez votre carte de fidélité</h2>
            <p className="text-sm text-gray-500 mt-0.5">Gratuit · 30 secondes</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                {...register('first_name')}
                type="text"
                id="first_name"
                placeholder="Jean-Baptiste"
                autoComplete="given-name"
                className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
              />
              {errors.first_name && (
                <p className="mt-1 text-xs text-red-500">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                placeholder="+33 6 12 34 56 78"
                autoComplete="tel"
                className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                style={{ color: '#111827', backgroundColor: '#ffffff' }}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {errors.root && (
              <div className="rounded-xl bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              style={{ backgroundColor: color, color: textColor }}
            >
              {isSubmitting ? 'Création en cours…' : 'Obtenir ma carte gratuite →'}
            </button>
          </form>

          <p className="text-xs text-center text-gray-400">
            En continuant, vous acceptez que vos données soient utilisées pour ce programme de fidélité.{' '}
            <a href="/politique-confidentialite" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
              Politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
