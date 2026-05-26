'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import QRCodeDisplay from './QRCodeDisplay'
import type { MerchantSharedConfig } from '@/types/merchant-config'

const schema = z.object({
  business_name: z.string().min(2, 'Au moins 2 caractères').max(100),
  slug: z
    .string()
    .min(2, 'Au moins 2 caractères')
    .regex(/^[a-z0-9-]+$/, 'Uniquement des lettres minuscules, chiffres et tirets'),
  description: z.string().max(200).optional(),
  instagram_handle: z.string().max(30).optional(),
  city: z.string().max(60).optional(),
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
  loyalty_type?: string
  points_per_euro?: number | null
  points_required?: number | null
  description?: string | null
  instagram_handle?: string | null
  city?: string | null
}

interface Props {
  merchant: Merchant | null
  onConfigChange?: (updates: Partial<MerchantSharedConfig>) => void
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

export default function MerchantForm({ merchant, onConfigChange }: Props) {
  const [logoUrl, setLogoUrl] = useState<string | null>(merchant?.logo_url ?? null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [savedMerchant, setSavedMerchant] = useState<Merchant | null>(merchant)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const onConfigChangeRef = useRef(onConfigChange)
  onConfigChangeRef.current = onConfigChange

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      business_name: merchant?.business_name ?? '',
      slug: merchant?.slug ?? '',
      description: merchant?.description ?? '',
      instagram_handle: merchant?.instagram_handle ?? '',
      city: merchant?.city ?? '',
    },
  })

  const businessName = watch('business_name')
  const description = watch('description')
  const slugTouched = useRef(!!merchant)

  useEffect(() => {
    if (!slugTouched.current && businessName) {
      setValue('slug', generateSlug(businessName), { shouldValidate: true })
    }
  }, [businessName, setValue])

  // Report live changes to parent for cross-tab preview sync
  useEffect(() => {
    onConfigChangeRef.current?.({
      business_name: businessName,
      description: description ?? '',
    })
  }, [businessName, description])

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
      setLogoError(data.error ?? "Erreur lors de l'upload")
    } else {
      setLogoUrl(data.url)
      onConfigChangeRef.current?.({ logo_url: data.url })
    }
    setLogoUploading(false)
  }

  async function onSubmit(data: FormData) {
    setSuccess(false)
    const res = await fetch('/api/merchants', {
      method: savedMerchant ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        logo_url: logoUrl,
        description: data.description || null,
        instagram_handle: data.instagram_handle || null,
        city: data.city || null,
      }),
    })
    const result = await res.json()
    if (!res.ok) {
      setError('root', { message: typeof result.error === 'string' ? result.error : 'Ce slug est peut-être déjà utilisé.' })
      return
    }
    setSavedMerchant(result)
    setSuccess(true)
  }

  const qrUrl = savedMerchant ? `${appUrl}/${savedMerchant.slug}` : null
  const inputClass = 'mt-1 block w-full rounded-xl border border-[#E8E8E3] px-4 py-3 text-[#1A1A1A] bg-[#F7F6F3] text-base sm:text-sm focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/15 transition-all min-h-[44px]'

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-[#E8E8E3] rounded-2xl p-6 space-y-6">

        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Logo du commerce</label>
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-xl border-2 border-dashed border-[#E8E8E3] flex items-center justify-center overflow-hidden bg-[#F7F6F3] cursor-pointer hover:border-[#6C47FF] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {logoUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                : <span className="text-2xl text-[#6B6B6B]">+</span>
              }
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={logoUploading}
                className="text-sm text-[#6C47FF] hover:text-[#5835e0] font-medium disabled:opacity-50 transition-colors"
              >
                {logoUploading ? 'Upload en cours...' : logoUrl ? 'Changer le logo' : 'Choisir un logo'}
              </button>
              <p className="text-xs text-[#6B6B6B] mt-1">PNG, JPG, SVG — max 2 Mo</p>
              {logoError && <p className="text-xs text-red-600 mt-1">{logoError}</p>}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
        </div>

        {/* Nom */}
        <div>
          <label htmlFor="business_name" className="block text-sm font-medium text-[#1A1A1A]">Nom du commerce</label>
          <input {...register('business_name')} type="text" id="business_name" placeholder="Ex : Café de la Paix" className={inputClass} />
          {errors.business_name && <p className="mt-1 text-sm text-red-500">{errors.business_name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[#1A1A1A]">
            Description courte <span className="text-[#6B6B6B] font-normal">(optionnelle)</span>
          </label>
          <input
            {...register('description')}
            type="text"
            id="description"
            placeholder="Ex : Bar à cocktails au cœur de Paris"
            maxLength={200}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-[#6B6B6B]">Affichée sous votre nom sur la page client.</p>
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-[#1A1A1A]">Identifiant unique (slug)</label>
          <div className="mt-1 flex rounded-xl overflow-hidden border border-[#E8E8E3]">
            <span className="inline-flex items-center px-3 bg-[#F7F6F3] text-[#6B6B6B] text-sm border-r border-[#E8E8E3] whitespace-nowrap">{appUrl}/</span>
            <input
              {...register('slug', { onChange: () => { slugTouched.current = true } })}
              type="text"
              id="slug"
              className="flex-1 block w-full px-3 py-2.5 text-sm text-[#1A1A1A] bg-[#F7F6F3] focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/15 transition-all"
            />
          </div>
          {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>}
          <p className="mt-1 text-xs text-[#6B6B6B]">Généré automatiquement, modifiable si besoin.</p>
        </div>

        {/* Instagram */}
        <div>
          <label htmlFor="instagram_handle" className="block text-sm font-medium text-[#1A1A1A]">
            Instagram <span className="text-[#6B6B6B] font-normal">(optionnel)</span>
          </label>
          <div className="mt-1 flex rounded-xl overflow-hidden border border-[#E8E8E3]">
            <span className="inline-flex items-center px-3 bg-[#F7F6F3] text-[#6B6B6B] text-sm border-r border-[#E8E8E3]">@</span>
            <input
              {...register('instagram_handle')}
              type="text"
              id="instagram_handle"
              placeholder="votre_compte"
              maxLength={30}
              className="flex-1 block w-full px-3 py-2.5 text-sm text-[#1A1A1A] bg-[#F7F6F3] focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/15 transition-all"
            />
          </div>
          {errors.instagram_handle && <p className="mt-1 text-sm text-red-500">{errors.instagram_handle.message}</p>}
        </div>

        {/* Ville */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-[#1A1A1A]">
            Ville <span className="text-[#6B6B6B] font-normal">(optionnelle)</span>
          </label>
          <input {...register('city')} type="text" id="city" placeholder="Ex : Paris, Lyon, Marseille…" maxLength={60} className={inputClass} />
          {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>}
        </div>

        {errors.root && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-3">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-3">
            <p className="text-sm text-green-700 font-medium">Informations enregistrées avec succès !</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || logoUploading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
          style={{ backgroundColor: 'var(--merchant-color, #6C47FF)' }}
        >
          {(isSubmitting || logoUploading) && (
            <svg className="animate-spin h-4 w-4 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {logoUploading ? 'Upload du logo…' : isSubmitting ? 'Enregistrement…' : savedMerchant ? 'Mettre à jour' : 'Créer ma carte de fidélité'}
        </button>
      </form>

      {/* QR Code */}
      {qrUrl && savedMerchant && (
        <div className="bg-white border border-[#E8E8E3] rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-1">Votre QR code</h2>
          <p className="text-sm text-[#6B6B6B] mb-6">
            Lien client : <code className="bg-[#F7F6F3] border border-[#E8E8E3] px-1.5 py-0.5 rounded-lg text-xs">{qrUrl}</code>
          </p>
          <QRCodeDisplay url={qrUrl} businessName={savedMerchant.business_name} />
        </div>
      )}
    </div>
  )
}
