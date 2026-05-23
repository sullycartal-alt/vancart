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

// Darken a hex color by percent
function darken(hex: string, pct = 20): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, (n >> 16) - Math.round(2.55 * pct))
  const g = Math.max(0, ((n >> 8) & 0xff) - Math.round(2.55 * pct))
  const b = Math.max(0, (n & 0xff) - Math.round(2.55 * pct))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
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

// ── Google Wallet card preview ─────────────────────────────────────────────
function GoogleWalletCard({ businessName, primaryColor, logoUrl, loyaltyType, stampsRequired, loyaltyRule }: {
  businessName: string
  primaryColor: string
  logoUrl?: string | null
  loyaltyType: 'stamps' | 'points'
  stampsRequired: number
  loyaltyRule: string
}) {
  const current = Math.floor(stampsRequired * 0.4)
  const dark = darken(primaryColor, 25)

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${dark} 100%)`,
        aspectRatio: '1.586',
        maxWidth: 360,
        position: 'relative',
      }}
    >
      {/* Decorative circle */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

      <div className="relative h-full flex flex-col justify-between p-5">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-9 h-9 rounded-xl object-cover" style={{ background: 'rgba(255,255,255,0.2)' }} />
            ) : (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                {businessName.slice(0, 2).toUpperCase() || '??'}
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-white leading-none">{businessName || 'Mon Commerce'}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>Carte de fidélité</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span className="text-[10px] font-bold text-white">Wallet</span>
          </div>
        </div>

        {/* Middle: stamps */}
        {loyaltyType === 'stamps' ? (
          <div>
            <p className="text-xs mb-2.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {loyaltyRule || `${stampsRequired} tampons = 1 récompense`}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: Math.min(stampsRequired, 12) }, (_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: i < current ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)',
                    border: '1.5px solid rgba(255,255,255,0.4)',
                    color: i < current ? primaryColor : 'transparent',
                  }}
                >
                  {i < current ? '✓' : ''}
                </div>
              ))}
              {stampsRequired > 12 && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
                  +{stampsRequired - 12}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>{loyaltyRule || 'Programme de points'}</p>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-black text-white">240 pts</div>
              <div className="flex-1">
                <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.9)', width: '48%' }} />
                </div>
                <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>240 / 500 points</p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Propulsé par</span>
            <span className="text-[10px] font-black" style={{ color: 'rgba(255,255,255,0.8)' }}>VanCart</span>
          </div>
          <div className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {loyaltyType === 'stamps' && <><strong className="text-white">{current}</strong>/{stampsRequired} tampons</>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Apple Wallet card preview ──────────────────────────────────────────────
function AppleWalletCard({ businessName, primaryColor, logoUrl, loyaltyType, stampsRequired, loyaltyRule }: {
  businessName: string
  primaryColor: string
  logoUrl?: string | null
  loyaltyType: 'stamps' | 'points'
  stampsRequired: number
  loyaltyRule: string
}) {
  const current = Math.floor(stampsRequired * 0.4)

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-2xl bg-white"
      style={{ aspectRatio: '1.586', maxWidth: 360, position: 'relative', border: '1px solid #E8E8E3' }}
    >
      {/* Colored header band */}
      <div style={{ background: primaryColor, height: '38%', position: 'relative', padding: '16px 20px' }}>
        <div style={{ position: 'absolute', top: -50, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" style={{ background: 'rgba(255,255,255,0.2)' }} />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}>
                {businessName.slice(0, 2).toUpperCase() || '??'}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-white leading-none">{businessName || 'Mon Commerce'}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>Fidélité</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Carte</p>
            <p className="text-[11px] font-bold text-white">No.0042</p>
          </div>
        </div>
      </div>

      {/* White content area */}
      <div style={{ padding: '14px 20px', height: '62%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {loyaltyType === 'stamps' ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#6B6B6B]">{loyaltyRule || `${stampsRequired} tampons = 1 récompense`}</p>
              <span className="text-xs font-bold" style={{ color: primaryColor }}>{current}/{stampsRequired}</span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-[#F0F0F0] mb-2.5">
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${(current / stampsRequired) * 100}%`, background: primaryColor }} />
            </div>
            {/* Stamps dots — smaller for Apple style */}
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: Math.min(stampsRequired, 15) }, (_, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                  style={{
                    background: i < current ? primaryColor : '#F0F0F0',
                    color: i < current ? 'white' : '#C0C0C0',
                  }}
                >
                  {i < current ? '✓' : ''}
                </div>
              ))}
              {stampsRequired > 15 && <span className="text-[9px] text-[#6B6B6B] self-center">+{stampsRequired - 15}</span>}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-[#6B6B6B] mb-2">{loyaltyRule || 'Programme de points'}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black" style={{ color: primaryColor }}>240</span>
              <span className="text-xs text-[#6B6B6B]">points accumulés</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#F0F0F0] mt-2">
              <div className="h-1.5 rounded-full" style={{ width: '48%', background: primaryColor }} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-[9px] text-[#C0C0C0] font-medium uppercase tracking-wide">VanCart · Fidélité digitale</p>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full" style={{ background: primaryColor, opacity: 0.8 }} />
            <div className="w-4 h-4 rounded-full -ml-2" style={{ background: primaryColor, opacity: 0.5 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingClient({ existingMerchant, appUrl }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const [error, setError] = useState('')
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)
  const [walletStyle, setWalletStyle] = useState<'google' | 'apple'>('google')

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

  async function skipOnboarding() {
    setSkipping(true)
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

  const cardProps = {
    businessName,
    primaryColor,
    logoUrl,
    loyaltyType,
    stampsRequired,
    loyaltyRule: loyaltyRule || (loyaltyType === 'stamps' ? `${stampsRequired} tampons = 1 récompense` : `${pointsRequired} points = 1 récompense`),
  }

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
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Tampons requis pour une récompense</label>
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
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Description de la récompense (optionnel)</label>
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

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              {step > 1 && step < 3 ? (
                <button type="button" onClick={() => setStep(s => s - 1)} className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors">
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

            {/* Skip link — visible on every step */}
            <div className="text-center pt-1 border-t border-[#E8E8E3]">
              <button
                type="button"
                onClick={skipOnboarding}
                disabled={skipping}
                className="text-xs text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors disabled:opacity-50"
              >
                {skipping ? 'Redirection…' : 'Passer cette étape → Configurer plus tard depuis les paramètres'}
              </button>
            </div>
          </div>

          {/* Right: live preview */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Aperçu de votre carte</p>

            {/* Wallet style toggle */}
            <div className="flex items-center gap-1 bg-[#F7F6F3] border border-[#E8E8E3] rounded-xl p-1">
              <button
                type="button"
                onClick={() => setWalletStyle('google')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${walletStyle === 'google' ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'}`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google Wallet
              </button>
              <button
                type="button"
                onClick={() => setWalletStyle('apple')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${walletStyle === 'apple' ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'}`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                Apple Wallet
              </button>
            </div>

            <div className="w-full px-2">
              {walletStyle === 'google' ? (
                <GoogleWalletCard {...cardProps} />
              ) : (
                <AppleWalletCard {...cardProps} />
              )}
            </div>

            <p className="text-xs text-[#6B6B6B] text-center max-w-xs">
              Aperçu de la carte dans le portefeuille de vos clients. Les informations se mettent à jour en temps réel.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
