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
  description: z.string().max(200).optional(),
  instagram_handle: z.string().max(30).optional(),
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
  description?: string | null
  instagram_handle?: string | null
}

interface Props {
  merchant: Merchant | null
}

const PRESET_COLORS = [
  { hex: '#6366f1', label: 'Violet' },
  { hex: '#2563eb', label: 'Bleu' },
  { hex: '#1e3a5f', label: 'Marine' },
  { hex: '#0891b2', label: 'Cyan' },
  { hex: '#059669', label: 'Émeraude' },
  { hex: '#65a30d', label: 'Vert' },
  { hex: '#d97706', label: 'Orange' },
  { hex: '#dc2626', label: 'Rouge' },
  { hex: '#9f1239', label: 'Bordeaux' },
  { hex: '#1f2937', label: 'Ardoise' },
]

function textColorFor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#1f2937' : '#ffffff'
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

// Live preview card
interface PreviewProps {
  businessName: string
  primaryColor: string
  loyaltyRule: string
  stampsRequired: number
  logoUrl: string | null
  description?: string
  instagramHandle?: string
}

function CardPreview({ businessName, primaryColor, loyaltyRule, stampsRequired, logoUrl, description, instagramHandle }: PreviewProps) {
  const color = /^#[0-9a-f]{6}$/i.test(primaryColor) ? primaryColor : '#6366f1'
  const tc = textColorFor(color)
  const name = businessName.trim() || 'Mon commerce'
  const [imgErr, setImgErr] = useState(false)
  useEffect(() => { setImgErr(false) }, [logoUrl])

  const total = Math.min(Math.max(stampsRequired || 10, 1), 12)
  const filled = Math.floor(total * 0.4)

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 max-w-xs mx-auto select-none">
      <div className="px-5 pt-6 pb-5 text-center" style={{ backgroundColor: color }}>
        {logoUrl && !imgErr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={name} className="h-10 w-auto mx-auto mb-2 object-contain" onError={() => setImgErr(true)} />
        ) : (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${tc}22` }}>
            <span className="text-lg font-bold" style={{ color: tc }}>{name.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <p className="text-sm font-bold" style={{ color: tc }}>{name}</p>
        {description && <p className="text-xs mt-0.5 opacity-80 leading-snug" style={{ color: tc }}>{description}</p>}
        <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${tc}22`, color: tc }}>
          🎴 {stampsRequired || 10} tampons = 1 récompense
        </div>
      </div>

      <div className="bg-white px-5 py-4 space-y-2.5">
        <p className="text-xs font-medium text-gray-500 text-center line-clamp-2">{loyaltyRule || 'Votre règle de fidélité'}</p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs"
              style={i < filled
                ? { backgroundColor: color, borderColor: color, color: tc }
                : { borderColor: '#e5e7eb', color: 'transparent' }
              }
            >
              {i < filled ? '✓' : '·'}
            </div>
          ))}
        </div>
        <p className="text-xs text-center text-gray-400">{filled}/{stampsRequired || 10} tampons</p>
        {instagramHandle && (
          <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-gray-100">
            <span className="text-gray-400 text-xs">📸</span>
            <span className="text-xs text-gray-500">@{instagramHandle.replace(/^@/, '')}</span>
          </div>
        )}
      </div>

      <div className="bg-gray-50 px-5 py-1.5 text-center">
        <span className="text-xs text-gray-300">Aperçu · carte client</span>
      </div>
    </div>
  )
}

export default function MerchantForm({ merchant }: Props) {
  const [logoUrl, setLogoUrl] = useState<string | null>(merchant?.logo_url ?? null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [savedMerchant, setSavedMerchant] = useState<Merchant | null>(merchant)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      business_name: merchant?.business_name ?? '',
      slug: merchant?.slug ?? '',
      primary_color: merchant?.primary_color ?? '#6366f1',
      loyalty_rule: merchant?.loyalty_rule ?? '',
      stamps_required: merchant?.stamps_required ?? 10,
      description: merchant?.description ?? '',
      instagram_handle: merchant?.instagram_handle ?? '',
    },
  })

  const businessName = watch('business_name')
  const primaryColor = watch('primary_color')
  const loyaltyRule = watch('loyalty_rule')
  const stampsRequired = watch('stamps_required')
  const description = watch('description')
  const instagramHandle = watch('instagram_handle')
  const slugTouched = useRef(!!merchant)

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
    if (!res.ok) { setLogoError(data.error ?? "Erreur lors de l'upload") } else { setLogoUrl(data.url) }
    setLogoUploading(false)
  }

  async function onSubmit(data: FormData) {
    setSuccess(false)
    const res = await fetch('/api/merchants', {
      method: savedMerchant ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, logo_url: logoUrl, description: data.description || null, instagram_handle: data.instagram_handle || null }),
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
  const inputClass = 'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo du commerce</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-indigo-400 transition-colors" onClick={() => fileInputRef.current?.click()}>
                {logoUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  : <span className="text-2xl text-gray-400">+</span>
                }
              </div>
              <div>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={logoUploading} className="text-sm text-indigo-600 hover:text-indigo-500 font-medium disabled:opacity-50">
                  {logoUploading ? 'Upload en cours...' : logoUrl ? 'Changer le logo' : 'Choisir un logo'}
                </button>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG — max 2 Mo</p>
                {logoError && <p className="text-xs text-red-600 mt-1">{logoError}</p>}
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </div>

          {/* Nom */}
          <div>
            <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">Nom du commerce</label>
            <input {...register('business_name')} type="text" id="business_name" placeholder="Ex : Café de la Paix" className={inputClass} />
            {errors.business_name && <p className="mt-1 text-sm text-red-600">{errors.business_name.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description courte <span className="text-gray-400 font-normal">(optionnelle)</span>
            </label>
            <input {...register('description')} type="text" id="description" placeholder="Ex : Bar à cocktails au cœur de Paris" maxLength={200} className={inputClass} />
            <p className="mt-1 text-xs text-gray-400">Affichée sous votre nom sur la page client. Max 200 caractères.</p>
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Identifiant unique (slug)</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">{appUrl}/</span>
              <input {...register('slug', { onChange: () => { slugTouched.current = true } })} type="text" id="slug" className="flex-1 block w-full rounded-none rounded-r-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
            <p className="mt-1 text-xs text-gray-500">Généré automatiquement, modifiable si besoin.</p>
          </div>

          {/* Couleur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur principale</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {PRESET_COLORS.map(({ hex, label }) => (
                <button
                  key={hex}
                  type="button"
                  title={label}
                  onClick={() => setValue('primary_color', hex, { shouldValidate: true })}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-105 focus:outline-none"
                  style={{
                    backgroundColor: hex,
                    transform: primaryColor === hex ? 'scale(1.1)' : undefined,
                    outline: primaryColor === hex ? `2px solid ${hex}` : 'none',
                    outlineOffset: '2px',
                    boxShadow: primaryColor === hex ? undefined : '0 0 0 1px #e5e7eb',
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input {...register('primary_color')} type="color" id="primary_color" className="h-9 w-14 cursor-pointer rounded border border-gray-300 p-0.5" />
              <span className="text-sm text-gray-600 font-mono">{primaryColor}</span>
              <div className="h-8 w-24 rounded-md flex items-center justify-center text-xs font-medium" style={{ backgroundColor: primaryColor, color: textColorFor(primaryColor) }}>Aperçu</div>
            </div>
            {errors.primary_color && <p className="mt-1 text-sm text-red-600">{errors.primary_color.message}</p>}
          </div>

          {/* Règle de fidélité */}
          <div>
            <label htmlFor="loyalty_rule" className="block text-sm font-medium text-gray-700">Règle de fidélité</label>
            <textarea {...register('loyalty_rule')} id="loyalty_rule" rows={2} placeholder="Ex : Achetez 10 cafés, le 11ème est offert" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            {errors.loyalty_rule && <p className="mt-1 text-sm text-red-600">{errors.loyalty_rule.message}</p>}
          </div>

          {/* Tampons */}
          <div>
            <label htmlFor="stamps_required" className="block text-sm font-medium text-gray-700">Nombre de tampons pour la récompense</label>
            <div className="mt-1 flex items-center gap-3">
              <input {...register('stamps_required', { valueAsNumber: true })} type="number" id="stamps_required" min={1} max={50} className="w-24 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              <span className="text-sm text-gray-500">tampons</span>
            </div>
            {errors.stamps_required && <p className="mt-1 text-sm text-red-600">{errors.stamps_required.message}</p>}
          </div>

          {/* Instagram */}
          <div>
            <label htmlFor="instagram_handle" className="block text-sm font-medium text-gray-700">
              Instagram <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">@</span>
              <input {...register('instagram_handle')} type="text" id="instagram_handle" placeholder="votre_compte" maxLength={30} className="flex-1 block w-full rounded-none rounded-r-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <p className="mt-1 text-xs text-gray-400">Affiché sur la page client avec un lien vers votre profil.</p>
            {errors.instagram_handle && <p className="mt-1 text-sm text-red-600">{errors.instagram_handle.message}</p>}
          </div>

          {errors.root && <div className="rounded-md bg-red-50 p-3"><p className="text-sm text-red-700">{errors.root.message}</p></div>}
          {success && <div className="rounded-md bg-green-50 p-3"><p className="text-sm text-green-700">Configuration enregistrée avec succès !</p></div>}

          <button
            type="submit"
            disabled={isSubmitting || logoUploading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            style={{ transition: 'opacity 0ms, transform 150ms' }}
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

        {/* Live preview */}
        <div className="xl:sticky xl:top-6 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Aperçu en direct</p>
          <CardPreview
            businessName={businessName}
            primaryColor={primaryColor}
            loyaltyRule={loyaltyRule}
            stampsRequired={stampsRequired || 10}
            logoUrl={logoUrl}
            description={description}
            instagramHandle={instagramHandle}
          />
          <p className="text-xs text-gray-400 text-center">Ce que vos clients verront sur leur carte</p>
        </div>
      </div>

      {/* QR Code */}
      {qrUrl && savedMerchant && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-1">Votre QR code</h2>
          <p className="text-sm text-gray-500 mb-6">Lien client : <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{qrUrl}</code></p>
          <QRCodeDisplay url={qrUrl} businessName={savedMerchant.business_name} />
        </div>
      )}
    </div>
  )
}
