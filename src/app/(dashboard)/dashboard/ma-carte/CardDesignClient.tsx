'use client'

import { useState, useRef } from 'react'
import { CheckCircle, Circle, ImagePlus, Store, Camera, Check } from 'lucide-react'

const PRESET_COLORS = ['#6C47FF', '#FF6B35', '#10B981', '#F59E0B', '#EF4444', '#1A1A2E']

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
}

type ActiveZone = 'color' | 'logo' | 'banner' | 'loyalty' | 'reward' | null

function ZoneOverlay({ zoneId, label, activeZone, setActiveZone }: {
  zoneId: string
  label: string
  activeZone: ActiveZone
  setActiveZone: (z: ActiveZone) => void
}) {
  const isActive = activeZone === zoneId
  return (
    <div
      onClick={() => setActiveZone(zoneId as ActiveZone)}
      style={{
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: isActive ? 'rgba(108,71,255,0.15)' : 'transparent',
        border: isActive ? '2px solid #6C47FF' : '2px solid transparent',
        borderRadius: 'inherit',
        transition: 'all 0.15s ease',
        cursor: 'pointer',
      }}
      className="group hover:bg-[#6C47FF]/10 hover:border-[#6C47FF]"
    >
      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#6C47FF] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
        <span>+</span><span>{label}</span>
      </div>
    </div>
  )
}

function InlineQR() {
  return (
    <svg width="80" height="80" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="56" fill="white"/>
      <rect x="2" y="2" width="16" height="16" fill="#111" rx="1"/>
      <rect x="4" y="4" width="12" height="12" fill="white" rx="1"/>
      <rect x="7" y="7" width="6" height="6" fill="#111"/>
      <rect x="38" y="2" width="16" height="16" fill="#111" rx="1"/>
      <rect x="40" y="4" width="12" height="12" fill="white" rx="1"/>
      <rect x="43" y="7" width="6" height="6" fill="#111"/>
      <rect x="2" y="38" width="16" height="16" fill="#111" rx="1"/>
      <rect x="4" y="40" width="12" height="12" fill="white" rx="1"/>
      <rect x="7" y="43" width="6" height="6" fill="#111"/>
      <rect x="21" y="2" width="3" height="3" fill="#111"/>
      <rect x="26" y="2" width="3" height="3" fill="#111"/>
      <rect x="31" y="4" width="2" height="2" fill="#111"/>
      <rect x="21" y="7" width="2" height="2" fill="#111"/>
      <rect x="25" y="6" width="3" height="3" fill="#111"/>
      <rect x="30" y="8" width="3" height="2" fill="#111"/>
      <rect x="21" y="13" width="3" height="2" fill="#111"/>
      <rect x="27" y="12" width="2" height="3" fill="#111"/>
      <rect x="21" y="21" width="2" height="2" fill="#111"/>
      <rect x="25" y="21" width="3" height="3" fill="#111"/>
      <rect x="30" y="21" width="2" height="2" fill="#111"/>
      <rect x="34" y="22" width="3" height="2" fill="#111"/>
      <rect x="38" y="21" width="2" height="3" fill="#111"/>
      <rect x="43" y="21" width="3" height="2" fill="#111"/>
      <rect x="49" y="22" width="2" height="2" fill="#111"/>
      <rect x="21" y="26" width="3" height="2" fill="#111"/>
      <rect x="27" y="25" width="2" height="3" fill="#111"/>
      <rect x="32" y="26" width="3" height="2" fill="#111"/>
      <rect x="37" y="25" width="2" height="3" fill="#111"/>
      <rect x="41" y="26" width="3" height="2" fill="#111"/>
      <rect x="46" y="25" width="2" height="3" fill="#111"/>
      <rect x="21" y="32" width="2" height="3" fill="#111"/>
      <rect x="26" y="31" width="3" height="2" fill="#111"/>
      <rect x="31" y="32" width="2" height="3" fill="#111"/>
      <rect x="35" y="31" width="3" height="3" fill="#111"/>
      <rect x="41" y="32" width="2" height="2" fill="#111"/>
      <rect x="46" y="31" width="2" height="3" fill="#111"/>
      <rect x="21" y="38" width="3" height="2" fill="#111"/>
      <rect x="26" y="39" width="2" height="2" fill="#111"/>
      <rect x="31" y="38" width="3" height="3" fill="#111"/>
      <rect x="36" y="39" width="2" height="2" fill="#111"/>
      <rect x="41" y="38" width="3" height="2" fill="#111"/>
      <rect x="46" y="39" width="2" height="3" fill="#111"/>
      <rect x="21" y="44" width="2" height="3" fill="#111"/>
      <rect x="26" y="43" width="3" height="3" fill="#111"/>
      <rect x="32" y="44" width="2" height="2" fill="#111"/>
      <rect x="37" y="43" width="3" height="3" fill="#111"/>
      <rect x="43" y="44" width="2" height="2" fill="#111"/>
    </svg>
  )
}

export default function CardDesignClient({ merchant }: { merchant: Merchant }) {
  const [activeZone, setActiveZone] = useState<ActiveZone>(null)
  const [color, setColor] = useState(merchant.primary_color || '#6C47FF')
  const [businessName] = useState(merchant.business_name || '')
  const [logoUrl, setLogoUrl] = useState(merchant.logo_url || '')
  const [bannerUrl, setBannerUrl] = useState(merchant.banner_url || '')
  const [loyaltyType, setLoyaltyType] = useState<'stamps' | 'points'>(merchant.loyalty_type || 'stamps')
  const [stampsRequired, setStampsRequired] = useState(merchant.stamps_required || 9)
  const [pointsRequired, setPointsRequired] = useState(merchant.points_required || 100)
  const [pointsPerEuro, setPointsPerEuro] = useState(merchant.points_per_euro || 1)
  const [loyaltyRule, setLoyaltyRule] = useState(merchant.loyalty_rule || '')
  const [logoUploading, setLogoUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedZone, setSavedZone] = useState<string | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const steps = [
    { id: 'color', label: 'Couleur principale', done: !!color && color !== '#000000' },
    { id: 'logo', label: 'Logo de votre commerce', done: !!logoUrl },
    { id: 'banner', label: 'Photo de votre commerce', done: !!bannerUrl },
    { id: 'name', label: 'Nom du commerce', done: !!businessName },
    { id: 'loyalty', label: 'Règle de fidélité', done: stampsRequired > 0 || (pointsRequired ?? 0) > 0 },
    { id: 'reward', label: 'Nom de la récompense', done: !!loyaltyRule && loyaltyRule !== 'Achetez 10, le suivant est offert' },
  ]
  const doneCount = steps.filter(s => s.done).length
  const progressPct = Math.round((doneCount / steps.length) * 100)

  async function saveField(fields: Record<string, unknown>) {
    setSaving(true)
    await fetch('/api/merchants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    setSaving(false)
    setSavedZone(Object.keys(fields)[0])
    setTimeout(() => setSavedZone(null), 2000)
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
      await saveField({ banner_url: data.url })
    }
    setBannerUploading(false)
    if (bannerInputRef.current) bannerInputRef.current.value = ''
  }

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#6C47FF] focus:border-transparent outline-none'
  const btnSave = 'w-full mt-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors'

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto bg-[#F7F6F3] min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

        {/* ── Left column ── */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Construisez votre carte</h1>
          <p className="text-sm text-gray-500 mt-1">Cliquez sur chaque zone de la carte pour la personnaliser.</p>

          {/* Checklist */}
          <div className="mt-6 space-y-3">
            {steps.map(step => (
              <div key={step.id} className="flex items-center gap-3">
                {step.done
                  ? <CheckCircle className="w-5 h-5 text-[#6C47FF] flex-shrink-0" />
                  : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                }
                <span className="text-sm font-medium text-gray-700">{step.label}</span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-1.5">{doneCount} / 6 étapes complétées</p>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6C47FF] rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Contextual edit panel */}
          <div className="mt-6">
            {activeZone === null ? (
              <p className="text-sm text-gray-400 text-center py-8">
                👆 Cliquez sur une zone de la carte pour la modifier
              </p>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

                {/* Panel: color */}
                {activeZone === 'color' && (
                  <div className="space-y-4">
                    <p className="font-semibold text-gray-900">Couleur principale</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {PRESET_COLORS.map(hex => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setColor(hex)}
                          className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex-shrink-0"
                          style={{
                            backgroundColor: hex,
                            borderColor: color === hex ? '#1A1A1A' : 'transparent',
                            boxShadow: color === hex ? '0 0 0 2px white inset' : 'none',
                          }}
                        />
                      ))}
                      <input
                        type="color"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                        title="Couleur personnalisée"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => saveField({ primary_color: color })}
                      className={btnSave}
                      style={{ backgroundColor: color }}
                    >
                      Enregistrer
                    </button>
                  </div>
                )}

                {/* Panel: banner */}
                {activeZone === 'banner' && (
                  <div className="space-y-3">
                    <p className="font-semibold text-gray-900">Photo de votre commerce</p>
                    <p className="text-sm text-gray-500">Cette photo apparaît en arrière-plan de votre carte.</p>
                    <label className="block cursor-pointer">
                      <div className="bg-[#F7F6F3] border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#6C47FF] transition-colors">
                        {bannerUploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-[#6C47FF] border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-gray-500">Envoi en cours...</span>
                          </div>
                        ) : bannerUrl ? (
                          <div className="flex flex-col items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={bannerUrl} alt="" className="w-20 h-12 object-cover rounded-lg border border-gray-200" />
                            <span className="text-sm text-[#6C47FF] font-medium">Changer la photo</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <ImagePlus className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                            <span className="text-sm text-gray-500">Cliquez pour uploader</span>
                          </div>
                        )}
                      </div>
                      <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                    </label>
                  </div>
                )}

                {/* Panel: logo */}
                {activeZone === 'logo' && (
                  <div className="space-y-3">
                    <p className="font-semibold text-gray-900">Logo de votre commerce</p>
                    <p className="text-xs text-gray-400">Format carré recommandé, max 2 Mo</p>
                    <label className="block cursor-pointer">
                      <div className="bg-[#F7F6F3] border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#6C47FF] transition-colors">
                        {logoUploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-[#6C47FF] border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-gray-500">Envoi en cours...</span>
                          </div>
                        ) : logoUrl ? (
                          <div className="flex flex-col items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={logoUrl} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                            <span className="text-sm text-[#6C47FF] font-medium">Changer le logo</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <ImagePlus className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                            <span className="text-sm text-gray-500">Cliquez pour uploader</span>
                          </div>
                        )}
                      </div>
                      <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                )}

                {/* Panel: loyalty */}
                {activeZone === 'loyalty' && (
                  <div className="space-y-4">
                    <p className="font-semibold text-gray-900">Règle de fidélité</p>
                    <div className="flex rounded-xl border border-gray-200 bg-[#F7F6F3] p-1 gap-1">
                      {(['stamps', 'points'] as const).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setLoyaltyType(type)}
                          className="flex-1 py-1.5 rounded-lg text-sm font-medium transition-all"
                          style={loyaltyType === type
                            ? { backgroundColor: color, color: 'white' }
                            : { backgroundColor: 'transparent', color: '#6B7280' }
                          }
                        >
                          {type === 'stamps' ? 'Tampons' : 'Points'}
                        </button>
                      ))}
                    </div>
                    {loyaltyType === 'stamps' ? (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Tampons pour une récompense</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={stampsRequired}
                          onChange={e => setStampsRequired(Math.min(30, Math.max(1, Number(e.target.value))))}
                          className={inputClass}
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">Points par euro dépensé</label>
                          <input
                            type="number"
                            min={1}
                            value={pointsPerEuro}
                            onChange={e => setPointsPerEuro(Math.max(1, Number(e.target.value)))}
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">Points pour une récompense</label>
                          <input
                            type="number"
                            min={1}
                            value={pointsRequired}
                            onChange={e => setPointsRequired(Math.max(1, Number(e.target.value)))}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => saveField({ loyalty_type: loyaltyType, stamps_required: stampsRequired, points_required: pointsRequired, points_per_euro: pointsPerEuro })}
                      className={btnSave}
                      style={{ backgroundColor: color }}
                    >
                      Enregistrer
                    </button>
                  </div>
                )}

                {/* Panel: reward */}
                {activeZone === 'reward' && (
                  <div className="space-y-3">
                    <p className="font-semibold text-gray-900">Votre récompense</p>
                    <p className="text-sm text-gray-500">Ce texte apparaît sur la carte de vos clients.</p>
                    <input
                      type="text"
                      placeholder="Ex : 1 café offert, 10% de réduction..."
                      value={loyaltyRule}
                      onChange={e => setLoyaltyRule(e.target.value)}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => saveField({ loyalty_rule: loyaltyRule })}
                      className={btnSave}
                      style={{ backgroundColor: color }}
                    >
                      Enregistrer
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        {/* ── Right column: interactive card ── */}
        <div className="lg:sticky lg:top-8 flex flex-col items-center gap-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Aperçu en temps réel</p>

          <div
            style={{
              width: 340,
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
              position: 'relative',
              cursor: 'pointer',
              fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
              flexShrink: 0,
            }}
          >
            {/* Zone bannière */}
            <div
              style={{
                height: 180,
                position: 'relative',
                backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                background: bannerUrl ? undefined : `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
              }}
            >
              {/* Scrim */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)', zIndex: 1 }} />

              {/* Badge photo */}
              <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 5 }}
                className="bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
              >
                <Camera className="w-3 h-3" />
                Votre photo
              </div>

              {/* Logo + name */}
              <div style={{ position: 'absolute', bottom: 12, left: 16, zIndex: 5, display: 'flex', alignItems: 'center', gap: 10 }}>
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Store className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                )}
                <div>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>{businessName || 'Mon Commerce'}</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Programme de fidélité</p>
                </div>
              </div>

              <ZoneOverlay zoneId="banner" label="Changer la photo" activeZone={activeZone} setActiveZone={setActiveZone} />
            </div>

            {/* Zone couleur + fidélité */}
            <div style={{ backgroundColor: color, padding: '14px 16px', position: 'relative' }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                {loyaltyType === 'stamps' ? 'Tampons' : 'Points'}
              </p>
              <p style={{ color: 'white', fontWeight: 900, fontSize: 30, lineHeight: 1.1, marginTop: 2 }}>
                {loyaltyType === 'stamps' ? stampsRequired : pointsRequired}
              </p>
              {loyaltyType === 'stamps' && (
                <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
                  {Array.from({ length: Math.min(stampsRequired, 12) }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: i < 5 ? 'white' : 'transparent',
                        border: i < 5 ? 'none' : '2px solid rgba(255,255,255,0.3)',
                        flexShrink: 0,
                      }}
                    >
                      {i < 5 && <Check size={13} strokeWidth={3} style={{ color }} />}
                    </div>
                  ))}
                </div>
              )}
              <ZoneOverlay zoneId="loyalty" label="Modifier la règle" activeZone={activeZone} setActiveZone={setActiveZone} />
            </div>

            {/* Zone récompense */}
            <div style={{ backgroundColor: color, padding: '10px 16px', position: 'relative', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '6px 12px',
                  borderRadius: 20,
                }}
              >
                🎁 {loyaltyRule || 'Votre récompense'}
              </span>
              <ZoneOverlay zoneId="reward" label="Modifier la récompense" activeZone={activeZone} setActiveZone={setActiveZone} />
            </div>

            {/* Zone client */}
            <div style={{ backgroundColor: 'white', padding: '14px 16px' }}>
              <p style={{ color: '#9CA3AF', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Carte de</p>
              <p style={{ color: '#111827', fontWeight: 700, fontSize: 17, marginTop: 2 }}>Marie Laurent</p>
            </div>

            {/* Zone QR */}
            <div style={{ backgroundColor: 'white', padding: '14px 16px', borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', padding: 4 }}>
                <InlineQR />
              </div>
              <p style={{ color: '#6B7280', fontSize: 11, marginTop: 8, textAlign: 'center' }}>Présentez ce QR code en caisse</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center max-w-xs">Les données affichées sont des exemples.</p>
        </div>

      </div>

      {/* Save indicator */}
      {(saving || savedZone) && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}>
          {saving ? (
            <div className="bg-white border border-gray-200 shadow-lg text-gray-600 text-sm px-4 py-2 rounded-full flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Enregistrement...
            </div>
          ) : (
            <div className="bg-[#6C47FF] text-white text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Check size={14} strokeWidth={3} />
              Enregistré !
            </div>
          )}
        </div>
      )}
    </div>
  )
}
