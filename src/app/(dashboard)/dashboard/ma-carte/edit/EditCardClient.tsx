'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ImagePlus, Check, Target, Star } from 'lucide-react'
import LoyaltyCardMockup from '@/components/loyalty/LoyaltyCardMockup'
import LogoDominantColors from '@/components/loyalty/LogoDominantColors'
import BannerPicker from '@/components/loyalty/BannerPicker'
import type { BannerPattern } from '@/lib/banner-patterns'

const PRESET_COLORS = [
  { name: 'VanCart',     hex: '#6C47FF' },
  { name: 'Minuit',      hex: '#1A1A2E' },
  { name: 'Marine',      hex: '#0D2137' },
  { name: 'Forêt',       hex: '#1B4332' },
  { name: 'Bordeaux',    hex: '#6B1A2A' },
  { name: 'Ardoise',     hex: '#2D3A3A' },
  { name: 'Terracotta',  hex: '#C1440E' },
  { name: 'Ocre',        hex: '#B5860D' },
  { name: 'Indigo',      hex: '#3730A3' },
  { name: 'Prune',       hex: '#4A1942' },
  { name: 'Anthracite',  hex: '#1C1C1E' },
]

interface Merchant {
  id: string
  slug: string
  business_name: string
  primary_color: string
  loyalty_rule: string
  stamps_required: number
  loyalty_type: 'stamps' | 'points'
  points_required: number | null
  points_per_euro: number | null
  logo_url: string | null
  banner_url: string | null
  banner_pattern: string | null
  stamp_color: string | null
}

export default function EditCardClient({ merchant }: { merchant: Merchant }) {
  const [color, setColor] = useState(merchant.primary_color || '#6C47FF')
  const colorRef = useRef(merchant.primary_color || '#6C47FF')
  const [businessName, setBusinessName] = useState(merchant.business_name || '')
  const [loyaltyType, setLoyaltyType] = useState<'stamps' | 'points'>(merchant.loyalty_type || 'stamps')
  const [stampsRequired, setStampsRequired] = useState(merchant.stamps_required || 9)
  const [pointsRequired, setPointsRequired] = useState(merchant.points_required || 100)
  const [loyaltyRule, setLoyaltyRule] = useState(merchant.loyalty_rule || '')
  const [logoUrl, setLogoUrl] = useState(merchant.logo_url || '')
  const [bannerUrl, setBannerUrl] = useState(merchant.banner_url || '')
  const [bannerPattern, setBannerPattern] = useState<string | null>(merchant.banner_pattern || null)
  const [bannerGenerating, setBannerGenerating] = useState(false)
  const [stampColor, setStampColor] = useState(merchant.stamp_color || '#FFFFFF')
  const [bannerRegenLoading, setBannerRegenLoading] = useState(false)

  const [logoUploading, setLogoUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const saveTimeout = useRef<NodeJS.Timeout | null>(null)
  const [previewStamps, setPreviewStamps] = useState(0)
  const stampsRegenTimeout = useRef<NodeJS.Timeout | null>(null)
  const isFirstStampsRender = useRef(true)

  function triggerSave(overrides?: Record<string, unknown>) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => performSave(overrides), 800)
  }

  async function performSave(overrides?: Record<string, unknown>) {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/merchants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loyalty_type: loyaltyType,
          stamps_required: stampsRequired,
          points_required: pointsRequired,
          loyalty_rule: loyaltyRule,
          primary_color: colorRef.current,
          logo_url: logoUrl || null,
          banner_url: bannerUrl || null,
          business_name: businessName,
          ...overrides,
        }),
      })
      if (res.ok) {
        setToast(true)
        setTimeout(() => setToast(false), 2500)
      } else {
        const data = await res.json()
        setSaveError(data?.error ?? 'Erreur de sauvegarde')
      }
    } catch {
      setSaveError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload/logo', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) {
      setLogoUrl(data.url)
      await performSave({ logo_url: data.url })
    }
    setLogoUploading(false)
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload/banner', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) {
      setBannerUrl(data.url)
      setBannerPattern(null)
      // Clearing banner_pattern switches back to photo mode so stamps no longer
      // regenerate (and overwrite) the uploaded photo.
      await performSave({ banner_url: data.url, banner_pattern: null })
    }
    setBannerUploading(false)
    if (bannerInputRef.current) bannerInputRef.current.value = ''
  }

  async function handleSelectPattern(pattern: BannerPattern) {
    setBannerGenerating(true)
    setSaveError(null)
    setBannerPattern(pattern)
    try {
      const res = await fetch('/api/merchant/generate-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryColor: colorRef.current, bannerPattern: pattern }),
      })
      const data = await res.json()
      if (res.ok && data.banner_url) {
        setBannerUrl(data.banner_url)
        await performSave({ banner_url: data.banner_url, banner_pattern: pattern })
      } else {
        setSaveError(data?.error ?? 'Génération de la bannière échouée')
      }
    } catch {
      setSaveError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setBannerGenerating(false)
    }
  }

  async function handleSelectStampColor(hex: string) {
    setStampColor(hex)
    setBannerGenerating(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/merchant/generate-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryColor: colorRef.current, bannerPattern, stampsCount: previewStamps, stampsRequired, stampColor: hex }),
      })
      const data = await res.json()
      if (res.ok && data.banner_url) {
        setBannerUrl(data.banner_url)
        await performSave({ banner_url: data.banner_url, stamp_color: hex })
      } else {
        setSaveError(data?.error ?? 'Génération de la bannière échouée')
      }
    } catch {
      setSaveError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setBannerGenerating(false)
    }
  }

  // Régénère la bannière avec le nouveau nombre de tampons à chaque changement
  // du contrôle d'aperçu (debounced, désactivé tant qu'aucune bannière interactive).
  useEffect(() => {
    if (!bannerPattern) return
    if (isFirstStampsRender.current) {
      isFirstStampsRender.current = false
      return
    }
    if (stampsRegenTimeout.current) clearTimeout(stampsRegenTimeout.current)
    stampsRegenTimeout.current = setTimeout(async () => {
      setBannerRegenLoading(true)
      try {
        const res = await fetch('/api/merchant/generate-banner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ primaryColor: colorRef.current, bannerPattern, stampsCount: previewStamps, stampsRequired, stampColor }),
        })
        const data = await res.json()
        if (res.ok && data.banner_url) setBannerUrl(data.banner_url)
      } catch {
        // l'aperçu reste sur l'image précédente
      } finally {
        setBannerRegenLoading(false)
      }
    }, 500)
    return () => { if (stampsRegenTimeout.current) clearTimeout(stampsRegenTimeout.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewStamps])

  const inputClass = 'w-full border border-[#E8E8E3] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C47FF]/20 focus:border-[#6C47FF] outline-none bg-white transition-all'
  const labelClass = 'text-sm font-medium text-[#1A1A1A] block mb-1.5'

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-2">
        <Link
          href="/dashboard/ma-carte"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors mb-6"
        >
          ← Retour à ma carte
        </Link>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Modifier ma carte</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">Les modifications sont sauvegardées automatiquement.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* Left column: form */}
        <div className="order-last lg:order-first space-y-5">

          {/* Color */}
          <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5 space-y-4">
            <label className={labelClass}>Couleur principale</label>
            <LogoDominantColors
              logoUrl={logoUrl || null}
              selectedColor={color}
              onSelect={(hex) => { colorRef.current = hex; setColor(hex); triggerSave({ primary_color: hex }) }}
            />
            <div>
              <p className="text-xs text-gray-500 mb-2">Couleurs suggérées</p>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map(({ name, hex }) => (
                  <button
                    key={hex} type="button" title={name}
                    onClick={() => { colorRef.current = hex; setColor(hex); triggerSave({ primary_color: hex }) }}
                    className="w-9 h-9 flex-shrink-0 transition-all hover:scale-110"
                    style={{
                      backgroundColor: hex,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      outline: color === hex ? '3px solid #6C47FF' : 'none',
                      outlineOffset: '2px',
                    }}
                    aria-label={name}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Couleur personnalisée</p>
              <div className="flex items-center gap-3">
                <input
                  type="color" value={color}
                  onChange={e => { colorRef.current = e.target.value; setColor(e.target.value); triggerSave({ primary_color: e.target.value }) }}
                  className="w-9 h-9 rounded-xl border border-[#E8E8E3] cursor-pointer p-0.5"
                />
                <span className="text-sm text-[#6B6B6B]">
                  Sélectionnée : <span className="font-semibold" style={{ color }}>{color}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Business name */}
          <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5 space-y-1.5">
            <label className={labelClass}>Nom du commerce</label>
            <input
              type="text" value={businessName} maxLength={60}
              onChange={e => { setBusinessName(e.target.value); triggerSave({ business_name: e.target.value }) }}
              className={inputClass}
              placeholder="Ex : Café des Arts"
            />
          </div>

          {/* Loyalty rule */}
          <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5 space-y-3">
            <label className={labelClass}>Règle de fidélité</label>
            <div className="flex rounded-xl border border-[#E8E8E3] bg-[#F7F6F3] p-1 gap-1">
              {(['stamps', 'points'] as const).map(type => (
                <button
                  key={type} type="button"
                  onClick={() => { setLoyaltyType(type); triggerSave({ loyalty_type: type }) }}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                  style={loyaltyType === type ? { backgroundColor: color, color: 'white' } : { color: '#6B7280' }}
                >
                  {type === 'stamps' ? <span className="inline-flex items-center gap-1.5"><Target className="size-4" strokeWidth={1.9} />Tampons</span> : <span className="inline-flex items-center gap-1.5"><Star className="size-4" strokeWidth={1.9} />Points</span>}
                </button>
              ))}
            </div>
            {loyaltyType === 'stamps' ? (
              <div className="space-y-1.5">
                <label className="text-xs text-[#6B6B6B]">Tampons pour une récompense</label>
                <input
                  type="number" min={1} max={30} value={stampsRequired}
                  onChange={e => {
                    const v = Math.min(30, Math.max(1, Number(e.target.value)))
                    setStampsRequired(v)
                    triggerSave({ stamps_required: v })
                  }}
                  className={inputClass}
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs text-[#6B6B6B]">Points pour une récompense</label>
                <input
                  type="number" min={1} value={pointsRequired}
                  onChange={e => {
                    const v = Math.max(1, Number(e.target.value))
                    setPointsRequired(v)
                    triggerSave({ points_required: v })
                  }}
                  className={inputClass}
                />
              </div>
            )}
          </div>

          {/* Reward name */}
          <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5 space-y-1.5">
            <label className={labelClass}>Nom de la récompense</label>
            <input
              type="text" value={loyaltyRule}
              onChange={e => { setLoyaltyRule(e.target.value); triggerSave({ loyalty_rule: e.target.value }) }}
              className={inputClass}
              placeholder="Ex : 1 café offert, 10% de réduction…"
            />
            <p className="text-xs text-[#6B6B6B]">Ce texte apparaît sur la carte de vos clients.</p>
          </div>

          {/* Logo */}
          <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5 space-y-3">
            <label className={labelClass}>Logo</label>
            <label className="block cursor-pointer">
              <div className="bg-[#F7F6F3] border-2 border-dashed border-[#E8E8E3] rounded-xl p-6 text-center hover:border-[#6C47FF] transition-colors">
                {logoUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#6C47FF] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-[#6B6B6B]">Envoi en cours…</span>
                  </div>
                ) : logoUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="" className="w-14 h-14 object-cover rounded-xl border border-[#E8E8E3]" />
                    <span className="text-sm text-[#6C47FF] font-medium">Changer le logo</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImagePlus className="w-7 h-7 text-[#6B6B6B]" strokeWidth={1.5} />
                    <span className="text-sm text-[#6B6B6B]">Cliquez pour uploader</span>
                  </div>
                )}
              </div>
              <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>

          {/* Banner */}
          <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5 space-y-3">
            <label className={labelClass}>Bannière</label>
            <BannerPicker
              primaryColor={color}
              bannerPattern={bannerPattern}
              generating={bannerGenerating}
              onSelectPattern={handleSelectPattern}
              stampColor={stampColor}
              onSelectStampColor={handleSelectStampColor}
              photoSlot={
                <label className="block cursor-pointer">
                  <div className="bg-[#F7F6F3] border-2 border-dashed border-[#E8E8E3] rounded-xl p-6 text-center hover:border-[#6C47FF] transition-colors">
                    {bannerUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-[#6C47FF] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-[#6B6B6B]">Envoi en cours…</span>
                      </div>
                    ) : bannerUrl && !bannerPattern ? (
                      <div className="flex flex-col items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={bannerUrl} alt="" className="w-full max-w-xs h-16 object-cover rounded-xl border border-[#E8E8E3]" />
                        <span className="text-sm text-[#6C47FF] font-medium">Changer la photo</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <ImagePlus className="w-7 h-7 text-[#6B6B6B]" strokeWidth={1.5} />
                        <span className="text-sm text-[#6B6B6B]">Cliquez pour uploader</span>
                      </div>
                    )}
                  </div>
                  <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                </label>
              }
            />
          </div>

          {saveError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{saveError}</div>
          )}
        </div>

        {/* Right column: live preview */}
        <div className="order-first lg:order-last flex flex-col items-center gap-3 lg:sticky lg:top-6">
          <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Aperçu en temps réel</p>
          <div className={`relative transition-opacity ${bannerRegenLoading ? 'opacity-60' : ''}`}>
            <LoyaltyCardMockup
              primaryColor={color}
              businessName={businessName || 'Mon Commerce'}
              loyaltyType={loyaltyType}
              stampsRequired={stampsRequired}
              pointsRequired={pointsRequired || 100}
              loyaltyRule={loyaltyRule || 'Votre récompense'}
              logoUrl={logoUrl || undefined}
              bannerUrl={bannerUrl || undefined}
              currentStamps={previewStamps}
              currentPoints={Math.round((pointsRequired || 100) * 0.6)}
              cardId={merchant.id}
              width="min(320px, 100%)"
            />
            {bannerRegenLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#6C47FF] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6B6B6B]">Aperçu tampons</span>
            <button
              type="button"
              onClick={() => setPreviewStamps(s => Math.max(0, s - 1))}
              className="w-7 h-7 rounded-full bg-[#F0EFEC] text-[#6B6B6B] text-sm font-semibold flex items-center justify-center hover:bg-[#E8E8E3] transition-colors"
              aria-label="Retirer un tampon"
            >
              −
            </button>
            <span className="text-sm font-medium text-[#6B6B6B] tabular-nums min-w-[3.5rem] text-center">
              {previewStamps} / {stampsRequired}
            </span>
            <button
              type="button"
              onClick={() => setPreviewStamps(s => Math.min(stampsRequired, s + 1))}
              className="w-7 h-7 rounded-full bg-[#F0EFEC] text-[#6B6B6B] text-sm font-semibold flex items-center justify-center hover:bg-[#E8E8E3] transition-colors"
              aria-label="Ajouter un tampon"
            >
              +
            </button>
          </div>
          {saving && (
            <p className="text-xs text-[#6B6B6B]">Enregistrement…</p>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
          <Check size={16} strokeWidth={2.5} className="text-green-400" />
          Sauvegardé
        </div>
      )}
    </div>
  )
}
