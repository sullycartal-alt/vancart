'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import QRCodeDisplay from './QRCodeDisplay'
import type { MerchantSharedConfig } from '@/types/merchant-config'
import Toast from '@/components/Toast'

const schema = z.object({
  business_name: z.string().min(2, 'Au moins 2 caractères').max(100),
  slug: z
    .string()
    .min(2, 'Au moins 2 caractères')
    .regex(/^[a-z0-9-]+$/, 'Uniquement des lettres minuscules, chiffres et tirets'),
  description: z.string().max(200).optional(),
  instagram_handle: z.string().max(30).optional(),
  city: z.string().max(60).optional(),
  owner_name: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(200).optional(),
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
  allow_multiple_stamps?: boolean | null
  stamps_per_visit?: number | null
  owner_name?: string | null
  phone?: string | null
  address?: string | null
}

interface Props {
  merchant: Merchant | null
  onConfigChange?: (updates: Partial<MerchantSharedConfig>) => void
  clientCount?: number
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

export default function MerchantForm({ merchant, onConfigChange, clientCount = 0 }: Props) {
  const router = useRouter()
  const [logoUrl, setLogoUrl] = useState<string | null>(merchant?.logo_url ?? null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [savedMerchant, setSavedMerchant] = useState<Merchant | null>(merchant)
  const [allowMultipleStamps, setAllowMultipleStamps] = useState(merchant?.allow_multiple_stamps ?? true)
  const [stampsPerVisit, setStampsPerVisit] = useState(merchant?.stamps_per_visit ?? 1)
  const [showToast, setShowToast] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetDone, setResetDone] = useState(false)
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
      owner_name: merchant?.owner_name ?? '',
      phone: merchant?.phone ?? '',
      address: merchant?.address ?? '',
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
    const res = await fetch('/api/merchants', {
      method: savedMerchant ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        logo_url: logoUrl,
        description: data.description || null,
        instagram_handle: data.instagram_handle || null,
        city: data.city || null,
        owner_name: data.owner_name || null,
        phone: data.phone || null,
        address: data.address || null,
        allow_multiple_stamps: allowMultipleStamps,
        // Only include once the column exists in the DB (migration applied)
        ...(merchant?.stamps_per_visit != null ? { stamps_per_visit: stampsPerVisit } : {}),
      }),
    })
    const result = await res.json()
    if (!res.ok) {
      setError('root', { message: typeof result.error === 'string' ? result.error : 'Ce slug est peut-être déjà utilisé.' })
      return
    }
    setSavedMerchant(result)
    setShowToast(true)
  }

  async function handleResetTestData() {
    setResetting(true)
    await fetch('/api/merchants/reset-test-data', { method: 'DELETE' })
    setResetting(false)
    setShowResetModal(false)
    setResetDone(true)
    router.refresh()
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

        {/* Nom du gérant */}
        <div>
          <label htmlFor="owner_name" className="block text-sm font-medium text-[#1A1A1A]">
            Nom complet du gérant <span className="text-[#6B6B6B] font-normal">(optionnel)</span>
          </label>
          <input {...register('owner_name')} type="text" id="owner_name" placeholder="Ex : Marie Dupont" maxLength={100} className={inputClass} />
          {errors.owner_name && <p className="mt-1 text-sm text-red-500">{errors.owner_name.message}</p>}
        </div>

        {/* Téléphone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-[#1A1A1A]">
            Téléphone <span className="text-[#6B6B6B] font-normal">(optionnel)</span>
          </label>
          <input {...register('phone')} type="tel" id="phone" placeholder="Ex : 06 12 34 56 78" maxLength={30} className={inputClass} />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
        </div>

        {/* Adresse */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-[#1A1A1A]">
            Adresse du commerce <span className="text-[#6B6B6B] font-normal">(optionnelle)</span>
          </label>
          <input {...register('address')} type="text" id="address" placeholder="Ex : 12 rue de la Paix, 75001 Paris" maxLength={200} className={inputClass} />
          {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
        </div>

        {/* Règles de tamponnage */}
        {merchant?.loyalty_type !== 'points' && (
          <div className="rounded-xl border border-[#E8E8E3] p-4 space-y-4">
            <p className="text-sm font-semibold text-[#1A1A1A]">Règles de tamponnage</p>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <button
                type="button"
                role="switch"
                aria-checked={allowMultipleStamps}
                onClick={() => setAllowMultipleStamps(v => !v)}
                className={`relative mt-0.5 w-10 h-6 rounded-full flex-shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/30 ${allowMultipleStamps ? 'bg-[#6C47FF]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${allowMultipleStamps ? 'left-5' : 'left-1'}`} />
              </button>
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">Tampons multiples par visite</p>
                <p className="text-xs text-[#6B6B6B] mt-0.5 leading-relaxed">
                  Permettre de donner plusieurs tampons en une seule visite (ex : 3 commandes = 3 tampons)
                </p>
              </div>
            </label>
            <div>
              <label htmlFor="stamps_per_visit" className="block text-sm font-medium text-[#1A1A1A]">
                Tampons par défaut par visite
              </label>
              <input
                id="stamps_per_visit"
                type="number"
                min={1}
                max={10}
                value={stampsPerVisit}
                onChange={e => setStampsPerVisit(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-[#6B6B6B]">Pré-rempli dans l&apos;interface de tamponnage.</p>
            </div>
          </div>
        )}

        {errors.root && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-3">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}
        {showToast && <Toast message="Informations enregistrées avec succès !" onHide={() => setShowToast(false)} />}
        {resetDone && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-3">
            <p className="text-sm text-green-700 font-medium">Données de test supprimées. Vous pouvez maintenant changer le mode de fidélité.</p>
          </div>
        )}

        {savedMerchant && clientCount < 5 && (
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-colors"
          >
            🗑️ Supprimer mes données de test
          </button>
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

      {/* Modal de confirmation reset */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowResetModal(false)}>
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-3xl text-center">⚠️</div>
            <h3 className="text-base font-bold text-[#1A1A1A] text-center">Supprimer les données de test ?</h3>
            <p className="text-sm text-[#6B6B6B] text-center leading-relaxed">
              Cette action supprimera tous vos clients et tampons. Votre carte et vos paramètres seront conservés. Continuer ?
            </p>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E8E3] text-sm font-medium text-[#6B6B6B] hover:bg-[#F7F6F3] transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleResetTestData}
                disabled={resetting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {resetting ? 'Suppression…' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
