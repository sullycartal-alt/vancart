'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import QRCodeDisplay from './QRCodeDisplay'

const schema = z.object({
  business_name: z.string().min(2, 'Au moins 2 caractères'),
  slug: z
    .string()
    .min(2, 'Au moins 2 caractères')
    .regex(/^[a-z0-9-]+$/, 'Uniquement des lettres minuscules, chiffres et tirets'),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Couleur invalide'),
  loyalty_rule: z.string().min(5, 'Décrivez votre règle de fidélité'),
  stamps_required: z.number().int().min(1).max(50),
})

type FormData = z.infer<typeof schema>

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
  merchant: Merchant | null
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
}

export default function MerchantForm({ merchant }: Props) {
  const [logoUrl, setLogoUrl] = useState<string | null>(merchant?.logo_url ?? null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [savedMerchant, setSavedMerchant] = useState<Merchant | null>(merchant)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      business_name: merchant?.business_name ?? '',
      slug: merchant?.slug ?? '',
      primary_color: merchant?.primary_color ?? '#6366f1',
      loyalty_rule: merchant?.loyalty_rule ?? '',
      stamps_required: merchant?.stamps_required ?? 10,
    },
  })

  const businessName = watch('business_name')
  const primaryColor = watch('primary_color')
  const slugValue = watch('slug')
  const slugTouched = useRef(!!merchant)

  // Auto-generate slug from business name (only if not manually edited)
  useEffect(() => {
    if (!slugTouched.current && businessName) {
      setValue('slug', generateSlug(businessName), { shouldValidate: true })
    }
  }, [businessName, setValue])

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoUploading(true)
    setLogoError(null)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload/logo', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setLogoError(data.error ?? 'Erreur lors de l\'upload')
    } else {
      setLogoUrl(data.url)
    }

    setLogoUploading(false)
  }

  async function onSubmit(data: FormData) {
    setSuccess(false)
    const isNew = !savedMerchant

    const res = await fetch('/api/merchants', {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, logo_url: logoUrl }),
    })

    const result = await res.json()

    if (!res.ok) {
      const msg = typeof result.error === 'string'
        ? result.error
        : 'Ce slug est peut-être déjà utilisé, essayez-en un autre.'
      setError('root', { message: msg })
      return
    }

    setSavedMerchant(result)
    setSuccess(true)
  }

  const qrUrl = savedMerchant ? `${appUrl}/${savedMerchant.slug}` : null

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">

        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo du commerce</label>
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-indigo-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-2xl text-gray-400">+</span>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={logoUploading}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium disabled:opacity-50"
              >
                {logoUploading ? 'Upload en cours...' : logoUrl ? 'Changer le logo' : 'Choisir un logo'}
              </button>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG — max 2 Mo</p>
              {logoError && <p className="text-xs text-red-600 mt-1">{logoError}</p>}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
        </div>

        {/* Nom du commerce */}
        <div>
          <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
            Nom du commerce
          </label>
          <input
            {...register('business_name')}
            type="text"
            id="business_name"
            placeholder="Ex : Café de la Paix"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.business_name && <p className="mt-1 text-sm text-red-600">{errors.business_name.message}</p>}
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Identifiant unique (slug)
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              {appUrl}/
            </span>
            <input
              {...register('slug', {
                onChange: () => { slugTouched.current = true },
              })}
              type="text"
              id="slug"
              className="flex-1 block w-full rounded-none rounded-r-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
          <p className="mt-1 text-xs text-gray-500">Généré automatiquement, modifiable si besoin.</p>
        </div>

        {/* Couleur principale */}
        <div>
          <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700">
            Couleur principale
          </label>
          <div className="mt-1 flex items-center gap-3">
            <input
              {...register('primary_color')}
              type="color"
              id="primary_color"
              className="h-10 w-16 cursor-pointer rounded border border-gray-300 p-0.5"
            />
            <span className="text-sm text-gray-600 font-mono">{primaryColor}</span>
            <div
              className="h-8 w-32 rounded-md flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              Aperçu
            </div>
          </div>
          {errors.primary_color && <p className="mt-1 text-sm text-red-600">{errors.primary_color.message}</p>}
        </div>

        {/* Règle de fidélité */}
        <div>
          <label htmlFor="loyalty_rule" className="block text-sm font-medium text-gray-700">
            Règle de fidélité
          </label>
          <textarea
            {...register('loyalty_rule')}
            id="loyalty_rule"
            rows={2}
            placeholder="Ex : Achetez 10 cafés, le 11ème est offert"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.loyalty_rule && <p className="mt-1 text-sm text-red-600">{errors.loyalty_rule.message}</p>}
        </div>

        {/* Nombre de tampons */}
        <div>
          <label htmlFor="stamps_required" className="block text-sm font-medium text-gray-700">
            Nombre de tampons pour la récompense
          </label>
          <div className="mt-1 flex items-center gap-3">
            <input
              {...register('stamps_required', { valueAsNumber: true })}
              type="number"
              id="stamps_required"
              min={1}
              max={50}
              className="w-24 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-500">tampons</span>
          </div>
          {errors.stamps_required && <p className="mt-1 text-sm text-red-600">{errors.stamps_required.message}</p>}
        </div>

        {errors.root && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-700">{errors.root.message}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-3">
            <p className="text-sm text-green-700">Configuration enregistrée avec succès !</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || logoUploading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {(isSubmitting || logoUploading) && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {logoUploading ? 'Upload du logo…' : isSubmitting ? 'Enregistrement…' : savedMerchant ? 'Mettre à jour' : 'Créer ma carte de fidélité'}
        </button>
      </form>

      {/* QR Code */}
      {qrUrl && savedMerchant && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-1">Votre QR code</h2>
          <p className="text-sm text-gray-500 mb-6">
            Lien client :{' '}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{qrUrl}</code>
          </p>
          <QRCodeDisplay url={qrUrl} businessName={savedMerchant.business_name} />
        </div>
      )}
    </div>
  )
}
