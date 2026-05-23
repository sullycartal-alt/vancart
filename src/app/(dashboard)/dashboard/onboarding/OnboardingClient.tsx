'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const PRESET_COLORS = [
  { hex: '#6C47FF', label: 'Violet' },
  { hex: '#2563eb', label: 'Bleu' },
  { hex: '#16a34a', label: 'Vert' },
  { hex: '#dc2626', label: 'Rouge' },
  { hex: '#d97706', label: 'Ambre' },
  { hex: '#0891b2', label: 'Cyan' },
  { hex: '#7c3aed', label: 'Pourpre' },
  { hex: '#be185d', label: 'Rose' },
]

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || 'mon-commerce'
}

interface ExistingMerchant {
  id: string
  business_name: string
  slug: string
  logo_url: string | null
  primary_color: string
  loyalty_type?: string | null
  stamps_required?: number | null
  points_per_euro?: number | null
  points_required?: number | null
  loyalty_rule?: string | null
}

interface Props {
  existingMerchant: ExistingMerchant | null
  appUrl: string
}

function CardPreview({ businessName, primaryColor, logoUrl, loyaltyType, stampsRequired, stampsCurrent }: {
  businessName: string
  primaryColor: string
  logoUrl?: string | null
  loyaltyType: 'stamps' | 'points'
  stampsRequired: number
  stampsCurrent?: number
}) {
  const current = stampsCurrent ?? Math.floor(stampsRequired * 0.4)
  const stamps = Array.from({ length: stampsRequired }, (_, i) => i < current)

  return (
    <div
      className="w-full max-w-sm rounded-2xl p-5 text-white shadow-xl"
      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
    >
      <div className="flex items-center justify-between mb-4">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover bg-white/20" />
        ) : (
          <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-bold">
            {businessName.slice(0, 2).toUpperCase() || '??'}
          </div>
        )}
        <span className="text-xs font-semibold opacity-75">Carte de fidélité</span>
      </div>

      <h3 className="text-base font-bold mb-1">{businessName || 'Mon Commerce'}</h3>
      <p className="text-xs opacity-75 mb-4">
        {loyaltyType === 'stamps'
          ? `${current}/${stampsRequired} tampons`
          : 'Programme de points'}
      </p>

      {loyaltyType === 'stamps' && (
        <div className="flex flex-wrap gap-2">
          {stamps.map((filled, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all ${
                filled ? 'bg-white border-white' : 'border-white/40'
              }`}
              style={{ color: filled ? primaryColor : 'transparent' }}
            >
              {filled && '✓'}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
        <span className="text-xs opacity-60">VanCart</span>
        <span className="text-xs opacity-60">🎴</span>
      </div>
    </div>
  )
}

export default function OnboardingClient({ existingMerchant, appUrl }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  // Step 1 state
  const [businessName, setBusinessName] = useState(existingMerchant?.business_name ?? '')
  const [primaryColor, setPrimaryColor] = useState(existingMerchant?.primary_color ?? '#6C47FF')
  const [logoUrl, setLogoUrl] = useState<string | null>(existingMerchant?.logo_url ?? null)
  const [logoUploading, setLogoUploading] = useState(false)

  // Step 2 state
  const [loyaltyType, setLoyaltyType] = useState<'stamps' | 'points'>(
    (existingMerchant?.loyalty_type as 'stamps' | 'points') ?? 'stamps'
  )
  const [stampsRequired, setStampsRequired] = useState(existingMerchant?.stamps_required ?? 10)
  const [pointsPerEuro, setPointsPerEuro] = useState(existingMerchant?.points_per_euro ?? 1)
  const [pointsRequired, setPointsRequired] = useState(existingMerchant?.points_required ?? 100)
  const [loyaltyRule, setLoyaltyRule] = useState(existingMerchant?.loyalty_rule ?? '')

  // Step 3 state
  const [savedSlug, setSavedSlug] = useState(existingMerchant?.slug ?? '')
  const qrUrl = savedSlug ? `${appUrl}/${savedSlug}` : ''

  useEffect(() => {
    if (step === 3 && qrUrl && qrCanvasRef.current) {
      import('qrcode').then((QRCode) => {
        if (qrCanvasRef.current) {
          QRCode.toCanvas(qrCanvasRef.current, qrUrl, { width: 200, margin: 2, color: { dark: '#1A1A1A', light: '#ffffff' } })
        }
      })
    }
  }, [step, qrUrl])

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload/logo', { method: 'POST', body: formData })
    const json = await res.json()
    if (json.url) setLogoUrl(json.url)
    setLogoUploading(false)
  }

  async function saveAndAdvanceToStep3() {
    if (!businessName.trim()) { setError('Le nom du commerce est requis.'); return }
    setSaving(true)
    setError('')

    const slug = slugify(businessName)
    const payload = {
      business_name: businessName.trim(),
      slug,
      primary_color: primaryColor,
      logo_url: logoUrl ?? null,
      loyalty_type: loyaltyType,
      stamps_required: stampsRequired,
      points_per_euro: loyaltyType === 'points' ? pointsPerEuro : null,
      points_required: loyaltyType === 'points' ? pointsRequired : null,
      loyalty_rule: loyaltyRule || (loyaltyType === 'stamps'
        ? `${stampsRequired} tampons = 1 récompense`
        : `${pointsRequired} points = 1 récompense`),
    }

    const method = existingMerchant ? 'PATCH' : 'POST'
    const res = await fetch('/api/merchants', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error?.message ?? 'Erreur lors de la sauvegarde.')
      setSaving(false)
      return
    }

    setSavedSlug(data.slug ?? slug)
    setSaving(false)
    setStep(3)
  }

  async function finishOnboarding() {
    setSaving(true)
    await fetch('/api/merchants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboarding_completed: true }),
    })
    router.push('/dashboard')
    router.refresh()
  }

  async function handleDownloadQR() {
    const QRCode = await import('qrcode')
    const dataUrl = await QRCode.toDataURL(qrUrl, { width: 800, margin: 3, color: { dark: '#1A1A1A', light: '#ffffff' } })
    const link = document.createElement('a')
    link.download = `qr-${savedSlug}.png`
    link.href = dataUrl
    link.click()
  }

  const inputClass = 'block w-full rounded-xl border border-[#E8E8E3] px-4 py-3 text-sm text-[#1A1A1A] bg-white focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/15 transition-all'

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Configurez votre commerce</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">Quelques étapes pour lancer votre programme de fidélité</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-10 max-w-sm mx-auto">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                  s < step ? 'bg-[#6C47FF] text-white' :
                  s === step ? 'bg-[#6C47FF] text-white ring-4 ring-[#6C47FF]/20' :
                  'bg-[#E8E8E3] text-[#6B6B6B]'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`h-1 flex-1 rounded-full transition-all ${s < step ? 'bg-[#6C47FF]' : 'bg-[#E8E8E3]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left: form */}
          <div className="bg-white border border-[#E8E8E3] rounded-2xl p-6 space-y-5">

            {step === 1 && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A1A]">Identité de votre commerce</h2>
                  <p className="text-sm text-[#6B6B6B] mt-0.5">Ces infos apparaîtront sur la carte de vos clients.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Nom du commerce *</label>
                  <input
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="Le Café du Coin"
                    className={inputClass}
                    style={{ fontSize: 16 }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Couleur principale</label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(({ hex, label }) => (
                      <button
                        key={hex}
                        type="button"
                        title={label}
                        onClick={() => setPrimaryColor(hex)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${primaryColor === hex ? 'ring-2 ring-offset-2 ring-[#1A1A1A] border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-full cursor-pointer border-0 p-0 overflow-hidden"
                      title="Couleur personnalisée"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Logo (optionnel)</label>
                  {logoUrl ? (
                    <div className="flex items-center gap-3">
                      <img src={logoUrl} alt="Logo" className="h-12 w-12 rounded-xl object-cover border border-[#E8E8E3]" />
                      <button onClick={() => setLogoUrl(null)} className="text-xs text-red-500 hover:text-red-700">Supprimer</button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#E8E8E3] rounded-xl cursor-pointer hover:bg-[#F7F6F3] transition-colors text-sm text-[#6B6B6B]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-8-8l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {logoUploading ? 'Envoi en cours…' : 'Choisir une image'}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
                    </label>
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A1A]">Votre programme de fidélité</h2>
                  <p className="text-sm text-[#6B6B6B] mt-0.5">Définissez comment vos clients gagnent des récompenses.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Type de programme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['stamps', 'points'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setLoyaltyType(t)}
                        className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                          loyaltyType === t
                            ? 'border-[#6C47FF] bg-[#6C47FF]/5 text-[#6C47FF]'
                            : 'border-[#E8E8E3] text-[#6B6B6B] hover:border-[#6C47FF]/30'
                        }`}
                      >
                        {t === 'stamps' ? '🪙 Tampons' : '⭐ Points'}
                      </button>
                    ))}
                  </div>
                </div>

                {loyaltyType === 'stamps' ? (
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                      Tampons requis pour une récompense
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={stampsRequired}
                      onChange={e => setStampsRequired(Number(e.target.value))}
                      className={inputClass}
                      style={{ fontSize: 16 }}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Points gagnés par euro dépensé</label>
                      <input type="number" min={1} value={pointsPerEuro} onChange={e => setPointsPerEuro(Number(e.target.value))} className={inputClass} style={{ fontSize: 16 }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Points nécessaires pour une récompense</label>
                      <input type="number" min={1} value={pointsRequired} onChange={e => setPointsRequired(Number(e.target.value))} className={inputClass} style={{ fontSize: 16 }} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                    Description de la récompense (optionnel)
                  </label>
                  <input
                    value={loyaltyRule}
                    onChange={e => setLoyaltyRule(e.target.value)}
                    placeholder={loyaltyType === 'stamps' ? 'Ex : 1 café offert' : 'Ex : 10€ de réduction'}
                    className={inputClass}
                    style={{ fontSize: 16 }}
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <h2 className="text-lg font-bold text-[#1A1A1A]">🎉 Votre QR code est prêt !</h2>
                  <p className="text-sm text-[#6B6B6B] mt-0.5">Posez-le en caisse ou partagez le lien avec vos clients.</p>
                </div>

                <div className="flex justify-center py-2">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${primaryColor}10`, border: `2px solid ${primaryColor}25` }}>
                    <canvas ref={qrCanvasRef} className="rounded-lg block" />
                  </div>
                </div>

                <code className="block text-xs bg-[#F7F6F3] border border-[#E8E8E3] rounded-xl px-3 py-2 text-[#6B6B6B] break-all">
                  {qrUrl}
                </code>

                <div className="space-y-2">
                  <button
                    onClick={handleDownloadQR}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl border-2 transition-colors hover:opacity-80"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Télécharger PNG
                  </button>
                  <button
                    onClick={() => navigator.clipboard?.writeText(qrUrl)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl border border-[#E8E8E3] text-[#6B6B6B] hover:bg-[#F7F6F3] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copier le lien client
                  </button>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              {step > 1 && step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors"
                >
                  ← Précédent
                </button>
              ) : <div />}

              {step === 1 && (
                <button
                  type="button"
                  onClick={() => { if (!businessName.trim()) { setError('Le nom du commerce est requis.'); return } setError(''); setStep(2) }}
                  className="px-6 py-2.5 bg-[#6C47FF] text-white text-sm font-semibold rounded-xl hover:bg-[#5835e0] transition-colors"
                >
                  Suivant →
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  onClick={saveAndAdvanceToStep3}
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#6C47FF] text-white text-sm font-semibold rounded-xl hover:bg-[#5835e0] transition-colors disabled:opacity-60"
                >
                  {saving ? 'Enregistrement…' : 'Terminer la config →'}
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  onClick={finishOnboarding}
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#6C47FF] text-white text-sm font-semibold rounded-xl hover:bg-[#5835e0] transition-colors disabled:opacity-60 ml-auto"
                >
                  {saving ? 'Chargement…' : 'Accéder à mon dashboard →'}
                </button>
              )}
            </div>
          </div>

          {/* Right: live preview */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Aperçu de votre carte</p>
            <CardPreview
              businessName={businessName}
              primaryColor={primaryColor}
              logoUrl={logoUrl}
              loyaltyType={loyaltyType}
              stampsRequired={stampsRequired}
            />
            <p className="text-xs text-[#6B6B6B] text-center max-w-xs">
              Voilà à quoi ressemblera la carte dans le portefeuille de vos clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
