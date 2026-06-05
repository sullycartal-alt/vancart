'use client'

import { useState, useRef } from 'react'
import { CheckCircle, Circle, ImagePlus, Store, X, ChevronRight, ChevronDown } from 'lucide-react'

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

function ZoneOverlay({ zoneId, label, activeZone, setActiveZone, hidden }: {
  zoneId: string
  label: string
  activeZone: ActiveZone
  setActiveZone: (z: ActiveZone) => void
  hidden?: boolean
}) {
  const isActive = activeZone === zoneId
  return (
    <div
      onClick={(e) => { if (hidden) return; e.stopPropagation(); setActiveZone(zoneId as ActiveZone) }}
      style={{
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: hidden ? 'transparent' : isActive ? 'rgba(108,71,255,0.15)' : 'transparent',
        border: hidden ? '2px solid transparent' : isActive ? '2px solid #6C47FF' : '2px solid transparent',
        borderRadius: 'inherit',
        transition: 'all 0.15s ease',
        cursor: hidden ? 'default' : 'pointer',
        pointerEvents: hidden ? 'none' : 'auto',
        opacity: hidden ? 0 : 1,
      }}
      className={hidden ? '' : 'group hover:bg-[#6C47FF]/10 hover:border-[#6C47FF]'}
    >
      {!hidden && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#6C47FF] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
          <span>+</span> <span>{label}</span>
        </div>
      )}
    </div>
  )
}

function InlineQR() {
  return (
    <svg width="90" height="90" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
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
  const [saveError, setSaveError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit')
  const [showRecap, setShowRecap] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const saveTimeout = useRef<NodeJS.Timeout | null>(null)

  // Demo values for the preview
  const previewStamps = Math.min(5, stampsRequired)
  const previewPoints = Math.round(pointsRequired * 0.6)
  const remaining = loyaltyType === 'stamps'
    ? stampsRequired - previewStamps
    : pointsRequired - previewPoints

  const steps = [
    { id: 'color' as const, label: 'Couleur principale', done: !!color && color !== '#000000' },
    { id: 'logo' as const, label: 'Logo de votre commerce', done: !!logoUrl },
    { id: 'banner' as const, label: 'Photo de votre commerce', done: !!bannerUrl },
    { id: 'name' as const, label: 'Nom du commerce', done: !!businessName },
    { id: 'loyalty' as const, label: 'Règle de fidélité', done: stampsRequired > 0 || (pointsRequired ?? 0) > 0 },
    { id: 'reward' as const, label: 'Nom de la récompense', done: !!loyaltyRule && loyaltyRule !== 'Achetez 10, le suivant est offert' },
  ]
  const completedCount = steps.filter(s => s.done).length
  const nextStep = steps.find(s => !s.done)

  async function saveField(fields: Record<string, unknown>) {
    setSaving(true)
    try {
      const res = await fetch('/api/merchants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const data = await res.json()
      if (!res.ok) {
        console.error('saveField error:', data)
        setSaveError(JSON.stringify(data))
      } else {
        setSaveError(null)
      }
    } catch (e) {
      console.error('saveField exception:', e)
    } finally {
      setSaving(false)
      setSavedZone(Object.keys(fields)[0])
      setTimeout(() => setSavedZone(null), 2000)
    }
  }

  function saveFieldDebounced(fields: Record<string, unknown>) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => saveField(fields), 800)
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
    <div className="h-screen overflow-hidden flex flex-col bg-[#F7F6F3]" style={{ maxHeight: '100vh' }}>
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-12 px-6 py-6 max-w-6xl mx-auto w-full">

        {/* ── Left column ── */}
        <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          <h1 className="text-2xl font-bold text-gray-900">Ma carte de fidélité</h1>
          <p className="text-sm text-gray-500 mt-1">Cliquez sur chaque zone de la carte pour la personnaliser.</p>

          <div className="mt-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#6C47FF]">
                {completedCount === 6 ? '🎉 Carte complète !' : `${completedCount} / 6 étapes`}
              </span>
              <span className="text-xs text-gray-400">{Math.round((completedCount / 6) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6C47FF] rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / 6) * 100}%` }}
              />
            </div>

            {nextStep && (
              <button
                onClick={() => setActiveZone(nextStep.id as typeof activeZone)}
                className="mt-4 w-full flex items-center justify-between bg-[#F0EDFF] hover:bg-[#E8E3FF] border border-[#6C47FF]/20 rounded-xl px-4 py-3 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6C47FF] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">→</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-[#6C47FF] font-semibold uppercase tracking-wide">Prochaine étape</div>
                    <div className="text-sm font-semibold text-gray-900">{nextStep.label}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#6C47FF] group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <div className="mt-4 space-y-2">
              {steps.map(step => (
                <button
                  key={step.id}
                  onClick={() => setActiveZone(step.id as typeof activeZone)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  {step.done
                    ? <CheckCircle className="w-4 h-4 text-[#6C47FF] flex-shrink-0" />
                    : <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  }
                  <span className={`text-sm ${step.done ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                    {step.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recap toggle when complete */}
          {completedCount === 6 && (
            <div className="mt-4">
              <button
                onClick={() => setShowRecap(prev => !prev)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-[#6C47FF]/30 bg-[#F0EDFF] hover:bg-[#E8E3FF] transition-colors"
              >
                <span className="text-sm font-semibold text-[#6C47FF]">🎉 Récapitulatif de votre carte</span>
                <ChevronDown className={`w-4 h-4 text-[#6C47FF] transition-transform ${showRecap ? 'rotate-180' : ''}`} />
              </button>

              {showRecap && (
                <div className="mt-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Commerce</span>
                      <span className="font-medium text-gray-900">{businessName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Programme</span>
                      <span className="font-medium text-gray-900">{loyaltyType === 'stamps' ? `${stampsRequired} tampons` : `${pointsRequired} points`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Récompense</span>
                      <span className="font-medium text-gray-900">{loyaltyRule}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Couleur</span>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
                        <span className="font-medium text-gray-900">{color}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-3 flex items-center gap-2 text-xs text-gray-400 border-t border-gray-100 pt-3">
                    <svg className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Chaque modification est enregistrée automatiquement
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contextual panel */}
          <div className="mt-6">
            {activeZone === null ? (
              <p className="text-sm text-gray-400 text-center py-8">
                👆 Cliquez sur une zone de la carte pour la modifier
              </p>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative">
                <button
                  onClick={() => setActiveZone(null)}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>

                {/* Panel: color */}
                {activeZone === 'color' && (
                  <div className="space-y-4">
                    <p className="font-semibold text-gray-900">Couleur principale</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {PRESET_COLORS.map(hex => (
                        <button
                          key={hex} type="button" onClick={() => { setColor(hex); saveFieldDebounced({ primary_color: hex }) }}
                          className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex-shrink-0"
                          style={{ backgroundColor: hex, borderColor: color === hex ? '#1A1A1A' : 'transparent', boxShadow: color === hex ? '0 0 0 2px white inset' : 'none' }}
                        />
                      ))}
                      <input type="color" value={color} onChange={e => { setColor(e.target.value); saveFieldDebounced({ primary_color: e.target.value }) }} className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5" title="Couleur personnalisée" />
                    </div>
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

                {/* Panel: loyalty */}
                {activeZone === 'loyalty' && (
                  <div className="space-y-4">
                    <p className="font-semibold text-gray-900">Règle de fidélité</p>
                    <div className="flex rounded-xl border border-gray-200 bg-[#F7F6F3] p-1 gap-1">
                      {(['stamps', 'points'] as const).map(type => (
                        <button key={type} type="button" onClick={() => { setLoyaltyType(type); saveFieldDebounced({ loyalty_type: type, stamps_required: stampsRequired, points_required: pointsRequired, points_per_euro: pointsPerEuro }) }}
                          className="flex-1 py-1.5 rounded-lg text-sm font-medium transition-all"
                          style={loyaltyType === type ? { backgroundColor: color, color: 'white' } : { backgroundColor: 'transparent', color: '#6B7280' }}
                        >
                          {type === 'stamps' ? 'Tampons' : 'Points'}
                        </button>
                      ))}
                    </div>
                    {loyaltyType === 'stamps' ? (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Tampons pour une récompense</label>
                        <input type="number" min={1} max={30} value={stampsRequired}
                          onChange={e => { const v = Math.min(30, Math.max(1, Number(e.target.value))); setStampsRequired(v); saveFieldDebounced({ loyalty_type: loyaltyType, stamps_required: v, points_required: pointsRequired, points_per_euro: pointsPerEuro }) }}
                          className={inputClass}
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">Points par euro dépensé</label>
                          <input type="number" min={1} value={pointsPerEuro}
                            onChange={e => { const v = Math.max(1, Number(e.target.value)); setPointsPerEuro(v); saveFieldDebounced({ loyalty_type: loyaltyType, stamps_required: stampsRequired, points_required: pointsRequired, points_per_euro: v }) }}
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">Points pour une récompense</label>
                          <input type="number" min={1} value={pointsRequired}
                            onChange={e => { const v = Math.max(1, Number(e.target.value)); setPointsRequired(v); saveFieldDebounced({ loyalty_type: loyaltyType, stamps_required: stampsRequired, points_required: v, points_per_euro: pointsPerEuro }) }}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Panel: reward */}
                {activeZone === 'reward' && (
                  <div className="space-y-3">
                    <p className="font-semibold text-gray-900">Votre récompense</p>
                    <p className="text-sm text-gray-500">Ce texte apparaît sur la carte de vos clients.</p>
                    <input type="text" placeholder="Ex : 1 café offert, 10% de réduction..."
                      value={loyaltyRule} onChange={e => { setLoyaltyRule(e.target.value); saveFieldDebounced({ loyalty_rule: e.target.value }) }}
                      className={inputClass}
                    />
                  </div>
                )}

                {saveError && (
                  <div className="mt-2 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
                    Erreur : {saveError}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        {/* ── Right column: interactive card ── */}
        <div className="flex flex-col items-center justify-start gap-4" style={{ position: 'sticky', top: 0, maxHeight: 'calc(100vh - 80px)', overflow: 'hidden' }}>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit mx-auto">
            <button
              onClick={() => setPreviewMode('edit')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${previewMode === 'edit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ✏️ Édition
            </button>
            <button
              onClick={() => setPreviewMode('preview')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${previewMode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              👁 Aperçu réel
            </button>
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Aperçu en temps réel</p>

          <div
            style={{
              width: 360,
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
              fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
              flexShrink: 0,
            }}
          >
            {/* Zone 1 — Header */}
            <div style={{ position: 'relative', borderRadius: '0' }}>
              <div
                style={{
                  backgroundColor: color,
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                }}
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', backgroundColor: 'white', flexShrink: 0 }} alt="" />
                ) : (
                  <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Store className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                )}
                <div style={{ color: 'white', fontWeight: 700, fontSize: 15, textAlign: 'center', flex: 1, padding: '0 12px' }}>
                  {businessName || 'Mon Commerce'}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {loyaltyType === 'stamps' ? 'TAMPONS' : 'POINTS'}
                  </div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: 20, lineHeight: 1 }}>
                    {loyaltyType === 'stamps'
                      ? <>{previewStamps}<span style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>/{stampsRequired}</span></>
                      : previewPoints
                    }
                  </div>
                </div>
              </div>
              <ZoneOverlay zoneId="logo" label="Changer le logo" activeZone={activeZone} setActiveZone={setActiveZone} hidden={previewMode === 'preview'} />
            </div>

            {/* Zone 2 — Banner */}
            <div style={{ position: 'relative', overflow: 'hidden', height: 200 }}>
              {bannerUrl ? (
                <div style={{ height: 200, backgroundImage: `url('${bannerUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              ) : (
                <div style={{
                  height: 200,
                  background: `linear-gradient(160deg, ${color}CC 0%, ${color}44 100%)`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <ImagePlus style={{ width: 40, height: 40, color: 'rgba(255,255,255,0.3)' }} strokeWidth={1.5} />
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Votre photo</span>
                </div>
              )}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />
              <ZoneOverlay zoneId="banner" label="Changer la photo" activeZone={activeZone} setActiveZone={setActiveZone} hidden={previewMode === 'preview'} />
            </div>

            {/* Zone 3 — Client info: split into left (loyalty) + right (reward) */}
            <div style={{ backgroundColor: color, display: 'flex' }}>
              {/* Left: loyalty info */}
              <div style={{ position: 'relative', flex: 1, padding: '14px 0 14px 16px' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>CARTE DE</div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Marie Laurent</div>
                <ZoneOverlay zoneId="loyalty" label="Modifier la fidélité" activeZone={activeZone} setActiveZone={setActiveZone} hidden={previewMode === 'preview'} />
              </div>
              {/* Right: reward info */}
              <div style={{ position: 'relative', flex: 1, padding: '14px 16px 14px 8px', textAlign: 'right' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>PROCHAINE RÉCOMPENSE</div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>
                  {remaining} {loyaltyType === 'stamps' ? `tampon${remaining > 1 ? 's' : ''}` : 'points'} avant
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontStyle: 'italic' }}>
                  🎁 {loyaltyRule || 'Votre récompense'}
                </div>
                <ZoneOverlay zoneId="reward" label="Modifier la récompense" activeZone={activeZone} setActiveZone={setActiveZone} hidden={previewMode === 'preview'} />
              </div>
            </div>

            {/* Zone 4 — QR */}
            <div style={{ position: 'relative', backgroundColor: color, padding: 16, borderTop: '2px solid rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ borderRadius: 12, padding: 10, backgroundColor: 'white', lineHeight: 0 }}>
                <InlineQR />
              </div>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
                Présentez ce QR code en caisse
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textAlign: 'center' }}>
                ID : 1a4f8c · e291 · 3b72
              </div>
              {previewMode === 'edit' && (
                <div
                  style={{
                    position: 'absolute', bottom: 8, right: 8,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: 8, padding: '4px 8px',
                    color: 'white', fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', zIndex: 10,
                  }}
                  onClick={() => setActiveZone('color')}
                >
                  🎨 Couleur
                </div>
              )}
              <ZoneOverlay zoneId="color" label="Couleur" activeZone={activeZone} setActiveZone={setActiveZone} hidden={previewMode === 'preview'} />
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center max-w-xs">Les données affichées sont des exemples.</p>
        </div>

      </div>

    </div>
  )
}
