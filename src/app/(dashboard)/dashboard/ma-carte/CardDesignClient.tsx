'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, ChevronLeft, Target, Star, Check, PartyPopper } from 'lucide-react'
import LoyaltyCardMockup from '@/components/loyalty/LoyaltyCardMockup'
import LogoDominantColors from '@/components/loyalty/LogoDominantColors'
import WelcomeModal from '@/components/loyalty/WelcomeModal'
import BannerPicker from '@/components/loyalty/BannerPicker'
import type { BannerPattern } from '@/lib/banner-patterns'

const PRESET_COLORS = ['#6C47FF', '#FF6B35', '#10B981', '#F59E0B', '#EF4444', '#1A1A2E']

const ONBOARDING_PRESETS = [
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
  stamp_icon: string | null
}

const STEPS = [
  { id: 1, title: 'Votre règle de fidélité', subtitle: 'Combien de tampons ou de points pour obtenir une récompense ?' },
  { id: 2, title: 'Votre récompense', subtitle: 'Quel avantage recevront vos clients fidèles ?' },
  { id: 3, title: 'Logo de votre commerce', subtitle: 'Ajoutez votre logo pour une carte reconnaissable.' },
  { id: 4, title: 'Couleur principale', subtitle: 'Choisissez la couleur qui représente votre commerce.' },
  { id: 5, title: 'Photo de votre commerce', subtitle: 'Une belle photo qui donne envie de revenir.' },
  { id: 6, title: 'Nom de votre commerce', subtitle: 'Le nom qui apparaîtra sur la carte de vos clients.' },
]

function isOnboardingComplete(m: Merchant): boolean {
  return !!(
    m.primary_color?.trim() &&
    m.logo_url?.trim() &&
    m.banner_url?.trim() &&
    m.business_name?.trim() &&
    m.loyalty_rule?.trim()
  )
}

export default function CardDesignClient({ merchant }: { merchant: Merchant }) {
  const router = useRouter()

  const [loyaltyType, setLoyaltyType] = useState<'stamps' | 'points'>(merchant.loyalty_type || 'stamps')
  const [stampsRequired, setStampsRequired] = useState(merchant.stamps_required || 9)
  const [pointsRequired, setPointsRequired] = useState(merchant.points_required || 100)
  const [loyaltyRule, setLoyaltyRule] = useState(merchant.loyalty_rule || '')
  const initialColor = (!merchant.primary_color || merchant.primary_color === '#000000')
    ? '#6C47FF'
    : merchant.primary_color

  const [color, setColor] = useState(initialColor)
  const colorRef = useRef(initialColor)
  const [logoUrl, setLogoUrl] = useState(merchant.logo_url || '')
  const [bannerUrl, setBannerUrl] = useState(merchant.banner_url || '')
  const [bannerPattern, setBannerPattern] = useState<string | null>(merchant.banner_pattern || null)
  const [bannerGenerating, setBannerGenerating] = useState(false)
  const [stampColor, setStampColor] = useState(merchant.stamp_color || '#FFFFFF')
  const [stampIcon, setStampIcon] = useState<'check' | 'star'>(merchant.stamp_icon === 'star' ? 'star' : 'check')
  const [bannerRegenLoading, setBannerRegenLoading] = useState(false)
  const [businessName, setBusinessName] = useState(merchant.business_name || '')

  const [logoUploading, setLogoUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingComplete(merchant))
  const [currentStep, setCurrentStep] = useState(1)
  const [showRecap, setShowRecap] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [previewStamps, setPreviewStamps] = useState(0)
  const stampsRegenTimeout = useRef<NodeJS.Timeout | null>(null)
  const isFirstStampsRender = useRef(true)

  async function saveField(fields: Record<string, unknown>): Promise<boolean> {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/merchants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveError(data?.error ?? 'Erreur de sauvegarde')
        return false
      }
      return true
    } catch {
      setSaveError('Erreur réseau. Veuillez réessayer.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function handleNextStep() {
    let fields: Record<string, unknown> = {}

    if (currentStep === 1) {
      fields = { loyalty_type: loyaltyType, stamps_required: stampsRequired, points_required: pointsRequired }
    } else if (currentStep === 2) {
      if (!loyaltyRule.trim()) return
      fields = { loyalty_rule: loyaltyRule }
    } else if (currentStep === 3) {
      if (!logoUrl) return
    } else if (currentStep === 4) {
      fields = { primary_color: colorRef.current }
    } else if (currentStep === 5) {
      if (!bannerUrl) return
    } else if (currentStep === 6) {
      if (!businessName.trim()) return
      fields = { business_name: businessName }
    }

    if (Object.keys(fields).length > 0) {
      const ok = await saveField(fields)
      if (!ok) return
    }

    if (currentStep === 6) {
      setShowRecap(true)
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  async function handleFinalSave() {
    const ok = await saveField({
      loyalty_type: loyaltyType,
      stamps_required: stampsRequired,
      points_required: pointsRequired,
      loyalty_rule: loyaltyRule,
      primary_color: colorRef.current,
      logo_url: logoUrl,
      banner_url: bannerUrl,
      business_name: businessName,
    })
    if (ok) {
      // Revalide les données serveur (primary_color en base) avant de naviguer,
      // pour que la confirmation puis le dashboard lisent la couleur fraîchement
      // sauvegardée et ne redéclenchent pas la redirection vers "Ma carte".
      router.refresh()
      router.push('/dashboard/ma-carte/confirmation')
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
      await saveField({ logo_url: data.url })
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
      await saveField({ banner_url: data.url, banner_pattern: null })
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
        await saveField({ banner_url: data.banner_url, banner_pattern: pattern })
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
        body: JSON.stringify({ primaryColor: colorRef.current, bannerPattern, stampsCount: previewStamps, stampsRequired, stampColor: hex, stampIcon }),
      })
      const data = await res.json()
      if (res.ok && data.banner_url) {
        setBannerUrl(data.banner_url)
        await saveField({ banner_url: data.banner_url, stamp_color: hex })
      } else {
        setSaveError(data?.error ?? 'Génération de la bannière échouée')
      }
    } catch {
      setSaveError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setBannerGenerating(false)
    }
  }

  async function handleSelectStampIcon(icon: 'check' | 'star') {
    setStampIcon(icon)
    setBannerGenerating(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/merchant/generate-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryColor: colorRef.current, bannerPattern, stampsCount: previewStamps, stampsRequired, stampColor, stampIcon: icon }),
      })
      const data = await res.json()
      if (res.ok && data.banner_url) {
        setBannerUrl(data.banner_url)
        await saveField({ banner_url: data.banner_url, stamp_icon: icon })
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
          body: JSON.stringify({ primaryColor: colorRef.current, bannerPattern, stampsCount: previewStamps, stampsRequired, stampColor, stampIcon }),
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

  function isStepValid(): boolean {
    if (currentStep === 1) return loyaltyType === 'stamps' ? stampsRequired > 0 : pointsRequired > 0
    if (currentStep === 2) return loyaltyRule.trim().length > 0
    if (currentStep === 3) return !!logoUrl
    if (currentStep === 4) return !!color && color !== '#000000'
    if (currentStep === 5) return !!bannerUrl
    if (currentStep === 6) return businessName.trim().length >= 2
    return true
  }

  const inputClass = 'w-full border border-[#E8E8E3] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6C47FF]/20 focus:border-[#6C47FF] outline-none bg-white transition-all'

  const cardPreview = (
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
  )

  const stampsPreviewControl = (
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
  )

  // ── Completed card view ──────────────────────────────────────────────────
  if (!showOnboarding) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Ma carte de fidélité</h1>
            <p className="text-sm text-[#6B6B6B] mt-1">Votre carte est active. Vos clients peuvent scanner votre QR code.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="flex flex-col items-center gap-4">
              <LoyaltyCardMockup
                primaryColor={color}
                businessName={businessName}
                loyaltyType={loyaltyType}
                stampsRequired={stampsRequired}
                pointsRequired={pointsRequired || 100}
                loyaltyRule={loyaltyRule}
                logoUrl={logoUrl || undefined}
                bannerUrl={bannerUrl || undefined}
                currentStamps={5}
                currentPoints={Math.round((pointsRequired || 100) * 0.6)}
                cardId={merchant.id}
                width="min(340px, 100%)"
              />
              <a
                href="/dashboard/ma-carte/edit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E8E8E3] rounded-xl text-sm font-semibold text-[#1A1A1A] hover:bg-[#F7F6F3] transition-colors shadow-sm"
              >
                Modifier ma carte
              </a>
            </div>
            <div className="bg-white border border-[#E8E8E3] rounded-2xl p-6 space-y-1">
              <h2 className="text-base font-bold text-[#1A1A1A] mb-4">Récapitulatif</h2>
              {[
                { label: 'Commerce', value: businessName },
                { label: 'Programme', value: loyaltyType === 'stamps' ? `${stampsRequired} tampons` : `${pointsRequired} points` },
                { label: 'Récompense', value: loyaltyRule },
                { label: 'Logo', value: logoUrl ? 'Importé' : '—' },
                { label: 'Bannière', value: bannerUrl ? 'Importée' : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-[#F7F6F3] last:border-0 text-sm">
                  <span className="text-[#6B6B6B]">{label}</span>
                  <span className="font-semibold text-[#1A1A1A]">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-[#6B6B6B]">Couleur</span>
                <span className="flex items-center gap-2 font-semibold text-[#1A1A1A]">
                  <span className="inline-block w-4 h-4 rounded-full border border-[#E8E8E3]" style={{ backgroundColor: color }} />
                  {color}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Recap screen (after step 6) ──────────────────────────────────────────
  if (showRecap) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex flex-col">
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="order-last lg:order-first space-y-6">
            <div>
              <button onClick={() => setShowRecap(false)} className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] flex items-center gap-1 mb-5">
                <ChevronLeft size={16} /> Modifier
              </button>
              <h2 className="text-2xl font-bold text-[#1A1A1A]">Récapitulatif</h2>
              <p className="text-sm text-[#6B6B6B] mt-1">Vérifiez vos informations avant de créer votre carte.</p>
            </div>
            <div className="bg-white border border-[#E8E8E3] rounded-2xl p-6 space-y-1 text-sm">
              {[
                { label: 'Programme', value: loyaltyType === 'stamps' ? `${stampsRequired} tampons` : `${pointsRequired} points` },
                { label: 'Récompense', value: loyaltyRule },
                { label: 'Logo', value: logoUrl ? 'Importé' : '—' },
                { label: 'Bannière', value: bannerUrl ? 'Importée' : '—' },
                { label: 'Commerce', value: businessName },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-[#F7F6F3] last:border-0">
                  <span className="text-[#6B6B6B]">{label}</span>
                  <span className="font-semibold text-[#1A1A1A]">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-[#6B6B6B]">Couleur</span>
                <span className="flex items-center gap-2 font-semibold text-[#1A1A1A]">
                  <span className="inline-block w-4 h-4 rounded-full border border-[#E8E8E3]" style={{ backgroundColor: color }} />
                  {color}
                </span>
              </div>
            </div>
            {saveError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{saveError}</div>
            )}
            <button
              onClick={handleFinalSave}
              disabled={saving}
              className="w-full py-4 bg-[#6C47FF] hover:bg-[#5835e0] text-white font-bold text-base rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Enregistrement…' : <span className="inline-flex items-center gap-2">Enregistrer ma carte <PartyPopper className="size-4" strokeWidth={1.9} /></span>}
            </button>
          </div>
          <div className="order-first lg:order-last flex flex-col items-center gap-3">
            {cardPreview}
            {stampsPreviewControl}
          </div>
        </div>
      </div>
    )
  }

  // ── Onboarding steps ─────────────────────────────────────────────────────
  const stepData = STEPS[currentStep - 1]

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col">
      <WelcomeModal show={showOnboarding} onDismiss={() => {}} />
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* Left column */}
        <div className="order-last lg:order-first space-y-6">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Retour
            </button>
          )}

          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">{stepData.title}</h2>
            <p className="text-sm text-[#6B6B6B] mt-1">{stepData.subtitle}</p>
          </div>

          <div className="bg-white border border-[#E8E8E3] rounded-2xl p-6">

            {/* Step 1 — Loyalty rule */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex rounded-xl border border-[#E8E8E3] bg-[#F7F6F3] p-1 gap-1">
                  {(['stamps', 'points'] as const).map(type => (
                    <button
                      key={type} type="button" onClick={() => setLoyaltyType(type)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                      style={loyaltyType === type ? { backgroundColor: color, color: 'white' } : { color: '#6B7280' }}
                    >
                      {type === 'stamps' ? <span className="inline-flex items-center gap-1.5"><Target className="size-4" strokeWidth={1.9} />Tampons</span> : <span className="inline-flex items-center gap-1.5"><Star className="size-4" strokeWidth={1.9} />Points</span>}
                    </button>
                  ))}
                </div>
                {loyaltyType === 'stamps' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1A1A1A]">Tampons pour une récompense</label>
                    <input
                      type="number" min={1} max={30} value={stampsRequired}
                      onChange={e => setStampsRequired(Math.min(30, Math.max(1, Number(e.target.value))))}
                      className={inputClass}
                    />
                    <p className="text-xs text-[#6B6B6B]">En général entre 5 et 10 tampons.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1A1A1A]">Points pour une récompense</label>
                    <input
                      type="number" min={1} value={pointsRequired}
                      onChange={e => setPointsRequired(Math.max(1, Number(e.target.value)))}
                      className={inputClass}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 2 — Reward */}
            {currentStep === 2 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1A1A1A]">Nom de la récompense</label>
                <input
                  type="text" placeholder="Ex : 1 café offert, 10% de réduction…"
                  value={loyaltyRule} onChange={e => setLoyaltyRule(e.target.value)}
                  className={inputClass} autoFocus
                />
                <p className="text-xs text-[#6B6B6B]">Ce texte apparaît sur la carte de vos clients.</p>
              </div>
            )}

            {/* Step 3 — Logo */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <p className="text-xs text-[#6B6B6B]">Format carré recommandé, max 2 Mo</p>
                <label className="block cursor-pointer">
                  <div className="bg-[#F7F6F3] border-2 border-dashed border-[#E8E8E3] rounded-xl p-8 text-center hover:border-[#6C47FF] transition-colors">
                    {logoUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-[#6C47FF] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-[#6B6B6B]">Envoi en cours…</span>
                      </div>
                    ) : logoUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoUrl} alt="" className="w-16 h-16 object-cover rounded-xl border border-[#E8E8E3]" />
                        <span className="text-sm text-[#6C47FF] font-medium">Changer le logo</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <ImagePlus className="w-8 h-8 text-[#6B6B6B]" strokeWidth={1.5} />
                        <span className="text-sm text-[#6B6B6B]">Cliquez pour uploader</span>
                      </div>
                    )}
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoUpload} className="hidden" />
                </label>
                {logoUrl && <p className="text-xs text-green-600 font-medium flex items-center gap-1"><Check className="size-3" strokeWidth={2} /> Logo enregistré</p>}
              </div>
            )}

            {/* Step 4 — Color */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <LogoDominantColors logoUrl={logoUrl} selectedColor={color} onSelect={(hex) => { colorRef.current = hex; setColor(hex) }} />

                {/* Preset grid */}
                <div>
                  <label className="text-sm font-medium text-[#1A1A1A] block mb-3">Couleurs recommandées</label>
                  <div className="grid grid-cols-6 gap-3">
                    {ONBOARDING_PRESETS.map(({ name, hex }) => (
                      <button
                        key={hex} type="button" title={name}
                        onClick={() => { colorRef.current = hex; setColor(hex) }}
                        className={`w-9 h-9 rounded-full transition-all hover:scale-110 flex-shrink-0 ${color === hex ? 'ring-2 ring-offset-2 ring-[#6C47FF]' : ''}`}
                        style={{ backgroundColor: hex }}
                        aria-label={name}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom color picker */}
                <div>
                  <label className="text-sm font-medium text-[#1A1A1A] block mb-2">Couleur personnalisée</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color" value={color} onChange={e => { colorRef.current = e.target.value; setColor(e.target.value) }}
                      className="w-10 h-10 rounded-xl border border-[#E8E8E3] cursor-pointer p-0.5"
                    />
                    <span className="text-sm text-[#6B6B6B]">
                      Sélectionnée : <span className="font-semibold" style={{ color }}>{color}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5 — Banner */}
            {currentStep === 5 && (
              <div className="space-y-3">
                <BannerPicker
                  primaryColor={color}
                  bannerPattern={bannerPattern}
                  generating={bannerGenerating}
                  onSelectPattern={handleSelectPattern}
                  stampColor={stampColor}
                  onSelectStampColor={handleSelectStampColor}
                  stampIcon={stampIcon}
                  onSelectStampIcon={handleSelectStampIcon}
                  photoSlot={
                    <div className="space-y-3">
                      <p className="text-xs text-[#6B6B6B]">Photo de votre commerce (intérieur, vitrine, produits…)</p>
                      <label className="block cursor-pointer">
                        <div className="bg-[#F7F6F3] border-2 border-dashed border-[#E8E8E3] rounded-xl p-8 text-center hover:border-[#6C47FF] transition-colors">
                          {bannerUploading ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-6 h-6 border-2 border-[#6C47FF] border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm text-[#6B6B6B]">Envoi en cours…</span>
                            </div>
                          ) : bannerUrl && !bannerPattern ? (
                            <div className="flex flex-col items-center gap-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={bannerUrl} alt="" className="w-full max-w-xs h-20 object-cover rounded-xl border border-[#E8E8E3]" />
                              <span className="text-sm text-[#6C47FF] font-medium">Changer la photo</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <ImagePlus className="w-8 h-8 text-[#6B6B6B]" strokeWidth={1.5} />
                              <span className="text-sm text-[#6B6B6B]">Cliquez pour uploader</span>
                            </div>
                          )}
                        </div>
                        <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                      </label>
                    </div>
                  }
                />
                {bannerUrl && <p className="text-xs text-green-600 font-medium flex items-center gap-1"><Check className="size-3" strokeWidth={2} /> Bannière enregistrée</p>}
              </div>
            )}

            {/* Step 6 — Business name */}
            {currentStep === 6 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1A1A1A]">Nom de votre commerce</label>
                <input
                  type="text" placeholder="Ex : Café des Arts, Boulangerie Martin…"
                  value={businessName} onChange={e => setBusinessName(e.target.value)}
                  className={inputClass} autoFocus maxLength={60}
                />
              </div>
            )}

            {saveError && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{saveError}</div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNextStep}
              disabled={!isStepValid() || saving || logoUploading || bannerUploading || bannerGenerating}
              className="px-8 py-3 bg-[#6C47FF] hover:bg-[#5835e0] text-white font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Enregistrement…' : currentStep === 6 ? 'Voir le récapitulatif →' : 'Étape suivante →'}
            </button>
          </div>
        </div>

        {/* Right column: card preview */}
        <div className="order-first lg:order-last flex justify-center">
          {cardPreview}
        </div>
      </div>

      {/* Sticky progress bar */}
      <div className="sticky bottom-0 bg-white border-t border-[#E8E8E3] px-4 py-3 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <span className="text-sm font-medium text-[#6B6B6B] flex-shrink-0">Étape {currentStep}/6</span>
          <div className="flex-1 h-1.5 bg-[#E8E8E3] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6C47FF] rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
