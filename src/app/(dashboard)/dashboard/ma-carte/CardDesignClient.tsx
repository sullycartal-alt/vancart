'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoyaltyDisplay from '@/components/LoyaltyDisplay'
import type { MerchantSharedConfig } from '@/types/merchant-config'
import Toast from '@/components/Toast'

function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) / 255
  const g = ((n >> 8) & 0xff) / 255
  const b = (n & 0xff) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360
  const sn = s / 100, ln = l / 100
  const a = sn * Math.min(ln, 1 - ln)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = ln - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(255 * c).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function harmonicColors(hex: string): string[] {
  const [h, s, l] = hexToHsl(hex)
  return [
    hslToHex(h + 30, s, l),
    hslToHex(h - 30, s, l),
    hslToHex(h + 180, s, l),
  ]
}


const PRESET_COLORS = [
  '#6C47FF', '#2563eb', '#16a34a', '#dc2626',
  '#d97706', '#0891b2', '#7c3aed', '#be185d',
  '#0f766e', '#92400e',
]

const WALLET_PRESET_COLORS = [
  '#6C47FF', '#1a1a2e', '#0f4c81', '#2d6a4f', '#c9184a', '#e76f51',
]

function darken(hex: string, pct = 22): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, (n >> 16) - Math.round(2.55 * pct))
  const g = Math.max(0, ((n >> 8) & 0xff) - Math.round(2.55 * pct))
  const b = Math.max(0, (n & 0xff) - Math.round(2.55 * pct))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function QRPlaceholder({ color, size = 64 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ flexShrink: 0, minWidth: size, minHeight: size }}>
      {/* corners */}
      <rect x="2" y="2" width="18" height="18" rx="2" stroke={color} strokeWidth="3" fill="none"/>
      <rect x="44" y="2" width="18" height="18" rx="2" stroke={color} strokeWidth="3" fill="none"/>
      <rect x="2" y="44" width="18" height="18" rx="2" stroke={color} strokeWidth="3" fill="none"/>
      <rect x="7" y="7" width="8" height="8" fill={color}/>
      <rect x="49" y="7" width="8" height="8" fill={color}/>
      <rect x="7" y="49" width="8" height="8" fill={color}/>
      {/* data dots */}
      <rect x="26" y="2" width="4" height="4" fill={color}/>
      <rect x="32" y="2" width="4" height="4" fill={color}/>
      <rect x="26" y="8" width="4" height="4" fill={color}/>
      <rect x="38" y="8" width="4" height="4" fill={color}/>
      <rect x="2" y="26" width="4" height="4" fill={color}/>
      <rect x="8" y="32" width="4" height="4" fill={color}/>
      <rect x="2" y="38" width="4" height="4" fill={color}/>
      <rect x="26" y="26" width="4" height="4" fill={color}/>
      <rect x="32" y="26" width="4" height="4" fill={color}/>
      <rect x="38" y="26" width="4" height="4" fill={color}/>
      <rect x="26" y="32" width="4" height="4" fill={color}/>
      <rect x="32" y="38" width="4" height="4" fill={color}/>
      <rect x="44" y="26" width="4" height="4" fill={color}/>
      <rect x="50" y="32" width="4" height="4" fill={color}/>
      <rect x="56" y="26" width="4" height="4" fill={color}/>
      <rect x="44" y="38" width="4" height="4" fill={color}/>
      <rect x="26" y="44" width="4" height="4" fill={color}/>
      <rect x="32" y="50" width="4" height="4" fill={color}/>
      <rect x="38" y="44" width="4" height="4" fill={color}/>
      <rect x="44" y="50" width="4" height="4" fill={color}/>
      <rect x="50" y="56" width="4" height="4" fill={color}/>
    </svg>
  )
}

function GoogleWalletPreview({ businessName, primaryColor, walletColor, logoUrl, stampsRequired, loyaltyRule, loyaltyType, pointsRequired, heroImageUrl, walletMessage, cardExpiryMonths }: {
  businessName: string; primaryColor: string; walletColor?: string | null; logoUrl: string | null
  stampsRequired: number; loyaltyRule: string
  loyaltyType: 'stamps' | 'points'; pointsRequired?: number | null
  heroImageUrl?: string | null; walletMessage?: string | null; cardExpiryMonths?: number | null
}) {
  const cardColor = walletColor ?? primaryColor
  const dark = darken(cardColor, 28)
  const isPoints = loyaltyType === 'points'
  const target = isPoints ? (pointsRequired ?? 100) : stampsRequired
  const current = Math.floor(target * 0.4)

  const expiryDate = cardExpiryMonths
    ? new Date(Date.now() + cardExpiryMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : null

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-2xl select-none"
      style={{ background: `linear-gradient(145deg, ${cardColor} 0%, ${dark} 100%)` }}
    >
      {/* Hero image */}
      {heroImageUrl && (
        <div className="w-full overflow-hidden" style={{ height: 80 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImageUrl} alt="" className="w-full h-full object-cover opacity-80" loading="lazy" />
        </div>
      )}

      <div className="relative flex flex-col justify-between p-5" style={{ aspectRatio: heroImageUrl ? undefined : '1.586', minHeight: heroImageUrl ? 200 : undefined }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -50, right: -30, width: 170, height: 170, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -20, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        {/* Top row */}
        <div className="relative flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30 flex-shrink-0" loading="lazy" />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0" style={{ background: 'rgba(255,255,255,0.22)', color: 'white' }}>
              {businessName.slice(0, 2).toUpperCase() || '?'}
            </div>
          )}
          <div>
            <p className="text-[10px] font-medium leading-none" style={{ color: 'rgba(255,255,255,0.55)' }}>[TESTS UNIQUEMENT]</p>
            <p className="text-xs font-bold text-white mt-0.5 leading-tight">{businessName || 'Mon Commerce'}</p>
          </div>
        </div>

        {/* Middle: loyalty rule + display */}
        <div className="relative mt-3">
          <p className="text-white font-bold leading-tight" style={{ fontSize: 'clamp(11px, 2.2vw, 18px)' }}>
            {loyaltyRule || (isPoints ? `${target} points = 1 récompense` : `${stampsRequired} tampons = 1 récompense`)}
          </p>
          {walletMessage && (
            <p className="text-white/70 text-[11px] mt-1 leading-snug">{walletMessage}</p>
          )}
          <div className="mt-2">
            <LoyaltyDisplay
              mode={loyaltyType}
              current={current}
              target={target}
              primaryColor={primaryColor}
              dark
              rewardLabel="votre récompense"
            />
          </div>
        </div>

        {/* Bottom row: QR + member ID + expiry */}
        <div className="relative flex items-end justify-between mt-3">
          <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: 'rgba(255,255,255,0.92)' }}>
            <QRPlaceholder color={primaryColor} size={48} />
          </div>
          <div className="text-right">
            <p className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>MEMBRE • VC-0001042</p>
            {expiryDate && (
              <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Expire {expiryDate}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AppleWalletPreview({ businessName, primaryColor, logoUrl, stampsRequired, loyaltyRule, loyaltyType, pointsRequired }: {
  businessName: string; primaryColor: string; logoUrl: string | null
  stampsRequired: number; loyaltyRule: string
  loyaltyType: 'stamps' | 'points'; pointsRequired?: number | null
}) {
  const isPoints = loyaltyType === 'points'
  const target = isPoints ? (pointsRequired ?? 100) : stampsRequired
  const current = Math.floor(target * 0.4)

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-2xl select-none bg-white"
      style={{ aspectRatio: '1.586', border: '1px solid rgba(0,0,0,0.08)' }}
    >
      {/* Header band */}
      <div style={{ background: primaryColor, height: '36%', padding: '12px 16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div className="flex items-center justify-between h-full relative">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} loading="lazy" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0" style={{ background: 'rgba(255,255,255,0.22)', color: 'white' }}>
                {businessName.slice(0, 2).toUpperCase() || '?'}
              </div>
            )}
            <p className="text-sm font-bold text-white leading-tight">{businessName || 'Mon Commerce'}</p>
          </div>
          <p className="text-[10px] font-semibold text-white/70 text-right">Fidélité</p>
        </div>
      </div>

      {/* Body */}
      <div style={{ height: '64%', padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#FAFAF9' }}>
        {/* Fields row */}
        <div className="flex gap-6">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-[#9CA3AF]">{isPoints ? 'Points' : 'Tampons'}</p>
            <p className="text-xl font-black text-[#1A1A1A] leading-tight">{current}<span className="text-sm font-medium text-[#9CA3AF]">/{target}</span></p>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Programme</p>
            <p className="text-xs font-semibold text-[#1A1A1A] leading-tight truncate">{loyaltyRule || (isPoints ? `${target} points = 1 récompense` : `${stampsRequired} tampons = 1 récompense`)}</p>
          </div>
        </div>

        {/* Loyalty display */}
        <LoyaltyDisplay
          mode={loyaltyType}
          current={current}
          target={target}
          primaryColor={primaryColor}
          dark={false}
          rewardLabel="votre récompense"
        />

        {/* QR + footer */}
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <QRPlaceholder color="#1A1A1A" size={40} />
          </div>
          <p className="text-[8px] font-medium text-[#9CA3AF] text-right">VanCart · Fidélité digitale<br/>VC-0001042</p>
        </div>
      </div>
    </div>
  )
}

function PWAWalletPreview({
  businessName,
  primaryColor,
  logoUrl,
  bannerUrl,
  stampsRequired,
  loyaltyType,
  pointsRequired,
}: {
  businessName: string
  primaryColor: string
  logoUrl: string | null
  bannerUrl: string | null
  stampsRequired: number
  loyaltyType: 'stamps' | 'points'
  pointsRequired: number | null
}) {
  const color = primaryColor || '#6C47FF'
  const isPoints = loyaltyType === 'points'
  const total = isPoints ? (pointsRequired ?? 100) : stampsRequired
  const current = Math.floor(total * 0.4)
  const pct = Math.min(100, Math.round((current / total) * 100))

  return (
    <div className="rounded-[18px] overflow-hidden select-none w-full" style={{ backgroundColor: color }}>
      {/* Header 72px */}
      <div className="flex items-center justify-between px-4" style={{ height: 72 }}>
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} loading="lazy" />
            ) : (
              <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
                {businessName.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>
          <span className="font-semibold text-sm truncate" style={{ color: 'white' }}>
            {businessName || 'Mon Commerce'}
          </span>
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          <p style={{ fontSize: 10, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', lineHeight: 1.3 }}>
            {isPoints ? 'Points' : 'Tampons'}
          </p>
          <p style={{ fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1 }}>
            {current}
          </p>
        </div>
      </div>

      {/* Banner 90px */}
      <div
        className="mx-3 flex items-center justify-center overflow-hidden"
        style={{ height: 90, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.12)' }}
      >
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
        ) : (
          <span className="font-bold text-center px-4 leading-tight" style={{ color: 'white', fontSize: 24 }}>
            {businessName || 'Mon Commerce'}
          </span>
        )}
      </div>

      {/* Card holder */}
      <p style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em', margin: '10px 16px 6px' }}>
        Carte de Jean
      </p>

      {/* Stamps or points */}
      <div className="px-4 space-y-2 mb-3">
        {isPoints ? (
          <>
            <div className="w-full rounded-full" style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <div className="rounded-full bg-white" style={{ height: 4, width: `${pct}%` }} />
            </div>
            <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{current} / {total} pts</p>
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {Array.from({ length: Math.min(total, 12) }).map((_, i) => {
                const filled = i < current
                return (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={filled ? { backgroundColor: 'white' } : { border: '2px solid rgba(255,255,255,0.35)' }}
                  >
                    {filled && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6.5L4.5 9L10 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                )
              })}
              {total > 12 && <span className="text-xs self-center" style={{ color: 'rgba(255,255,255,0.5)' }}>+{total - 12}</span>}
            </div>
            <div className="w-full rounded-full" style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <div className="rounded-full bg-white" style={{ height: 3, width: `${pct}%` }} />
            </div>
            <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{current} / {total} tampons</p>
          </>
        )}
      </div>

      {/* QR placeholder */}
      <div className="flex flex-col items-center gap-2 px-4 pb-5">
        <div className="bg-white inline-flex items-center justify-center" style={{ borderRadius: 12, padding: 12 }}>
          <QRPlaceholder color={color} size={80} />
        </div>
        <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>••••••••—••••</p>
      </div>
    </div>
  )
}

interface Merchant {
  id: string
  business_name: string
  primary_color: string
  wallet_color?: string | null
  loyalty_rule: string
  stamps_required: number
  logo_url: string | null
  description: string
  loyalty_type: 'stamps' | 'points'
  points_required?: number | null
  points_per_euro?: number | null
  hero_image_url?: string | null
  wallet_message?: string | null
  card_expiry_months?: number | null
  show_instagram_on_card?: boolean
  instagram_handle?: string | null
  banner_url?: string | null
}

export default function CardDesignClient({
  merchant, hideTitle, onConfigChange, hasClients = false,
}: {
  merchant: Merchant
  hideTitle?: boolean
  onConfigChange?: (updates: Partial<MerchantSharedConfig>) => void
  hasClients?: boolean
}) {
  const router = useRouter()
  const onConfigChangeRef = useRef(onConfigChange)
  onConfigChangeRef.current = onConfigChange

  const [color, setColor] = useState(merchant.primary_color)
  const [walletColor, setWalletColor] = useState(merchant.wallet_color ?? merchant.primary_color)
  const [logoUrl, setLogoUrl] = useState<string | null>(merchant.logo_url)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [loyaltyRule, setLoyaltyRule] = useState(merchant.loyalty_rule)
  const [stampsRequired, setStampsRequired] = useState(merchant.stamps_required)
  const [loyaltyType, setLoyaltyType] = useState<'stamps' | 'points'>(merchant.loyalty_type)
  const [pointsRequired, setPointsRequired] = useState(merchant.points_required ?? 100)
  const [pointsPerEuro, setPointsPerEuro] = useState(merchant.points_per_euro ?? 1)
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(merchant.hero_image_url ?? null)
  const [heroUploading, setHeroUploading] = useState(false)
  const [heroError, setHeroError] = useState<string | null>(null)
  const [bannerUrl, setBannerUrl] = useState<string | null>(merchant.banner_url ?? null)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [bannerError, setBannerError] = useState<string | null>(null)
  const [walletMessage, setWalletMessage] = useState(merchant.wallet_message ?? '')
  const [cardExpiryMonths, setCardExpiryMonths] = useState<number>(merchant.card_expiry_months ?? 12)
  const [showInstagram, setShowInstagram] = useState(merchant.show_instagram_on_card ?? false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const heroInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  function handleColorChange(newColor: string) {
    setColor(newColor)
    onConfigChangeRef.current?.({ primary_color: newColor })
  }

  function handleWalletColorChange(newColor: string) {
    setWalletColor(newColor)
  }
  function handleLoyaltyRuleChange(rule: string) {
    setLoyaltyRule(rule)
    onConfigChangeRef.current?.({ loyalty_rule: rule })
  }
  function handleStampsRequiredChange(n: number) {
    setStampsRequired(n)
    onConfigChangeRef.current?.({ stamps_required: n })
  }
  function handleLoyaltyTypeChange(type: 'stamps' | 'points') {
    setLoyaltyType(type)
    onConfigChangeRef.current?.({ loyalty_type: type })
  }
  function handlePointsRequiredChange(n: number) {
    setPointsRequired(n)
    onConfigChangeRef.current?.({ points_required: n })
  }
  function handlePointsPerEuroChange(n: number) {
    setPointsPerEuro(n)
    onConfigChangeRef.current?.({ points_per_euro: n })
  }

  async function handleHeroImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setHeroUploading(true)
    setHeroError(null)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload/hero-image', { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok) {
      setHeroError(data.error ?? "Erreur lors de l'upload")
    } else {
      setHeroImageUrl(data.url)
      onConfigChangeRef.current?.({ hero_image_url: data.url })
    }
    setHeroUploading(false)
    if (heroInputRef.current) heroInputRef.current.value = ''
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerUploading(true)
    setBannerError(null)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload/banner', { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok) {
      setBannerError(data.error ?? "Erreur lors de l'upload")
    } else {
      setBannerUrl(data.url)
      onConfigChangeRef.current?.({ banner_url: data.url })
    }
    setBannerUploading(false)
    if (bannerInputRef.current) bannerInputRef.current.value = ''
  }

  const [walletTab, setWalletTab] = useState<'google' | 'apple' | 'pwa'>('google')
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [suggestedColors, setSuggestedColors] = useState<string[]>([])
  const [extracting, setExtracting] = useState(false)

  const extractColors = useCallback(async () => {
    if (!logoUrl) return
    setExtracting(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ColorThief = (await import('colorthief') as any).default ?? (await import('colorthief') as any)
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
        img.src = logoUrl!
      })
      const thief = new ColorThief()
      const palette = thief.getPalette(img, 3) as [number, number, number][]
      const hex = palette.map(([r, g, b]) =>
        `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '00')}${b.toString(16).padStart(2, '00')}`
      )
      setSuggestedColors(hex)
    } catch (err) {
      console.error('[ColorThief] logo color extraction failed:', err)
      setSuggestedColors(harmonicColors(merchant.primary_color))
    }
    setExtracting(false)
  }, [logoUrl, merchant.primary_color])

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/merchants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logo_url: logoUrl,
        primary_color: color,
        wallet_color: walletColor,
        loyalty_rule: loyaltyRule,
        stamps_required: stampsRequired,
        loyalty_type: loyaltyType,
        points_required: pointsRequired,
        points_per_euro: pointsPerEuro,
        hero_image_url: heroImageUrl,
        banner_url: bannerUrl,
        wallet_message: walletMessage || null,
        card_expiry_months: cardExpiryMonths,
        show_instagram_on_card: showInstagram,
      }),
    })
    setSaving(false)
    if (res.ok) {
      setShowToast(true)
      document.documentElement.style.setProperty('--merchant-color', color)
      router.refresh()
    }
  }

  const isPoints = loyaltyType === 'points'
  const previewProps = {
    businessName: merchant.business_name,
    primaryColor: color,
    walletColor,
    logoUrl,
    stampsRequired,
    loyaltyRule: loyaltyRule || (isPoints ? `${pointsRequired} pts = 1 récompense` : `${stampsRequired} tampons = 1 récompense`),
    loyaltyType,
    pointsRequired,
    heroImageUrl,
    walletMessage: walletMessage || null,
    cardExpiryMonths,
    bannerUrl,
  }

  const inputClass = 'block w-full rounded-xl border border-[#E8E8E3] px-4 py-3 text-sm text-[#1A1A1A] bg-white focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/15 transition-all'

  return (
    <div className="space-y-6">
      {showToast && <Toast message="Modifications enregistrées" onHide={() => setShowToast(false)} />}
      {!hideTitle && (
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Ma carte de fidélité</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">Personnalisez l&apos;apparence de votre carte et prévisualisez-la en temps réel.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* ── Left: form ─────────────────────────────────── */}
        <div className="bg-white border border-[#E8E8E3] rounded-2xl p-6 space-y-6">

          {/* Logo upload */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#1A1A1A]">Logo</label>
            <p className="text-xs text-[#6B6B6B]">JPG, PNG ou WebP — max 2 Mo. Affiché sur toutes les cartes de fidélité.</p>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full border-2 border-dashed border-[#E8E8E3] flex items-center justify-center bg-[#F7F6F3] cursor-pointer hover:border-[#6C47FF] transition-colors flex-shrink-0 overflow-hidden"
                onClick={() => !logoUrl && logoInputRef.current?.click()}
                title={logoUrl ? undefined : 'Choisir un logo'}
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <svg className="w-6 h-6 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploading}
                  className="text-sm text-[#6C47FF] hover:text-[#5835e0] font-medium disabled:opacity-50 transition-colors"
                >
                  {logoUploading ? 'Upload en cours…' : logoUrl ? 'Changer le logo' : 'Choisir un logo'}
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => { setLogoUrl(null); onConfigChangeRef.current?.({ logo_url: null }) }}
                    className="block text-xs text-[#9CA3AF] hover:text-red-500 transition-colors"
                  >
                    Supprimer
                  </button>
                )}
                {logoError && <p className="text-xs text-red-600">{logoError}</p>}
              </div>
            </div>
            <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoUpload} />
          </div>

          {/* Wallet color (Google Wallet card background) */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#1A1A1A]">Couleur de fond de la carte</label>
            <p className="text-xs text-[#6B6B6B]">Couleur de fond utilisée sur la carte Google Wallet.</p>
            <div className="flex flex-wrap gap-2">
              {WALLET_PRESET_COLORS.map(hex => (
                <button
                  key={hex}
                  type="button"
                  title={hex}
                  onClick={() => handleWalletColorChange(hex)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${walletColor === hex ? 'ring-2 ring-offset-2 ring-[#1A1A1A] border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: hex }}
                />
              ))}
              <input
                type="color"
                value={walletColor}
                onChange={e => handleWalletColorChange(e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer border-0 p-0 overflow-hidden"
                title="Couleur personnalisée"
              />
            </div>
          </div>

          {/* Color */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#1A1A1A]">Couleur principale</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(hex => (
                <button
                  key={hex}
                  type="button"
                  title={hex}
                  onClick={() => handleColorChange(hex)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === hex ? 'ring-2 ring-offset-2 ring-[#1A1A1A] border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: hex }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={e => handleColorChange(e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer border-0 p-0 overflow-hidden"
                title="Couleur personnalisée"
              />
            </div>

            {/* Suggested from logo */}
            {logoUrl && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={extractColors}
                  disabled={extracting}
                  className="flex items-center gap-2 text-xs text-[#6C47FF] font-medium hover:text-[#5835e0] disabled:opacity-50 transition-colors"
                >
                  <span>🎨</span>
                  {extracting ? 'Extraction en cours…' : 'Couleurs suggérées depuis votre logo'}
                </button>
                {suggestedColors.length > 0 && (
                  <div className="flex items-center gap-2">
                    {suggestedColors.map(hex => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => handleColorChange(hex)}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${color === hex ? 'ring-2 ring-offset-2 ring-[#1A1A1A] border-white' : 'border-[#E8E8E3]'}`}
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                    <span className="text-xs text-[#6B6B6B]">du logo</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mode fidélité */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-semibold text-[#1A1A1A]">Mode de fidélité</label>
              {hasClients && (
                <span
                  title="Le mode de fidélité ne peut plus être modifié une fois vos premiers clients inscrits"
                  className="cursor-help text-base leading-none"
                >
                  🔒
                </span>
              )}
            </div>
            <div
              className="inline-flex rounded-xl border border-[#E8E8E3] bg-[#F7F6F3] p-1 gap-1"
              title={hasClients ? "Le mode de fidélité ne peut plus être modifié une fois vos premiers clients inscrits" : undefined}
            >
              {(['stamps', 'points'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => !hasClients && handleLoyaltyTypeChange(type)}
                  disabled={hasClients}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${hasClients ? 'cursor-not-allowed opacity-60' : ''}`}
                  style={loyaltyType === type
                    ? { backgroundColor: hasClients ? '#9CA3AF' : color, color: '#fff' }
                    : { backgroundColor: 'transparent', color: '#6B6B6B' }
                  }
                >
                  {type === 'stamps' ? '🎴 Tampons' : '🏆 Points'}
                </button>
              ))}
            </div>
            {!hasClients && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-[#FFFBEB] px-4 py-3 mt-2">
                <span className="text-base leading-none flex-shrink-0 mt-0.5">⚠️</span>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Choisissez bien votre mode de fidélité — il ne pourra plus être modifié une fois vos premiers clients inscrits. Les tampons sont recommandés pour les bars et restaurants, les points pour les commerces avec des achats de montants variables.
                </p>
              </div>
            )}
          </div>

          {/* Stamps required (mode tampons) */}
          {!isPoints && (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#1A1A1A]">
                Nombre de tampons requis
                <span className="ml-2 text-[#6C47FF] font-bold">{stampsRequired}</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={stampsRequired}
                  onChange={e => handleStampsRequiredChange(Number(e.target.value))}
                  className="flex-1 cursor-pointer"
                  style={{ accentColor: color }}
                />
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={stampsRequired}
                  onChange={e => handleStampsRequiredChange(Math.min(50, Math.max(1, Number(e.target.value))))}
                  className="w-16 rounded-xl border border-[#E8E8E3] px-2 py-2 text-sm text-center focus:border-[#6C47FF] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Points fields (mode points) */}
          {isPoints && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1A1A1A]">
                  Seuil de points pour la récompense
                  <span className="ml-2 text-[#6C47FF] font-bold">{pointsRequired} pts</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={50}
                    max={2000}
                    step={50}
                    value={pointsRequired}
                    onChange={e => handlePointsRequiredChange(Number(e.target.value))}
                    className="flex-1 cursor-pointer"
                    style={{ accentColor: color }}
                  />
                  <input
                    type="number"
                    min={1}
                    value={pointsRequired}
                    onChange={e => handlePointsRequiredChange(Math.max(1, Number(e.target.value)))}
                    className="w-20 rounded-xl border border-[#E8E8E3] px-2 py-2 text-sm text-center focus:border-[#6C47FF] focus:outline-none"
                  />
                </div>
                <p className="text-xs text-[#6B6B6B]">Ex : 500, 1 000, 2 000 points pour obtenir la récompense</p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1A1A1A]">
                  Points par euro dépensé
                  <span className="ml-2 text-[#6C47FF] font-bold">{pointsPerEuro} pt/€</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={pointsPerEuro}
                    onChange={e => handlePointsPerEuroChange(Math.max(1, Number(e.target.value)))}
                    className="w-20 rounded-xl border border-[#E8E8E3] px-2 py-2 text-sm text-center focus:border-[#6C47FF] focus:outline-none"
                  />
                  <span className="text-sm text-[#6B6B6B]">point(s) par euro</span>
                </div>
              </div>
            </div>
          )}

          {/* Loyalty rule */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#1A1A1A]">Règle de fidélité</label>
            <input
              value={loyaltyRule}
              onChange={e => handleLoyaltyRuleChange(e.target.value)}
              placeholder={isPoints ? `${pointsRequired} points = 1 récompense` : `${stampsRequired} tampons = 1 récompense`}
              className={inputClass}
              style={{ fontSize: 16 }}
            />
          </div>

          {/* Banner image */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#1A1A1A]">Image bannière</label>
            <p className="text-xs text-[#6B6B6B]">Visible en bannière centrale dans le Wallet PWA. JPG/PNG/WebP, max 4 Mo.</p>
            <div className="flex items-start gap-4">
              {bannerUrl ? (
                <div className="relative w-32 h-16 rounded-xl overflow-hidden border border-[#E8E8E3] flex-shrink-0 bg-[#F7F6F3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bannerUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                  <button
                    type="button"
                    onClick={() => { setBannerUrl(null); onConfigChangeRef.current?.({ banner_url: null }) }}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    title="Supprimer"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              ) : (
                <div
                  className="w-32 h-16 rounded-xl border-2 border-dashed border-[#E8E8E3] flex items-center justify-center bg-[#F7F6F3] cursor-pointer hover:border-[#6C47FF] transition-colors flex-shrink-0 text-xs text-[#9CA3AF]"
                  onClick={() => bannerInputRef.current?.click()}
                >
                  Ajouter
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={bannerUploading}
                  className="text-sm text-[#6C47FF] hover:text-[#5835e0] font-medium disabled:opacity-50 transition-colors"
                >
                  {bannerUploading ? 'Upload en cours…' : bannerUrl ? "Changer l'image" : 'Choisir une image'}
                </button>
                {bannerError && <p className="text-xs text-red-600 mt-1">{bannerError}</p>}
              </div>
            </div>
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
          </div>

          {/* ── Personnalisation avancée ─────────────────── */}
          <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-between py-2 text-sm font-semibold text-[#1A1A1A] select-none">
              <span>Personnalisation avancée</span>
              <svg className="w-4 h-4 text-[#6B6B6B] transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </summary>

            <div className="pt-4 space-y-5">
              {/* Hero image */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#1A1A1A]">Image de fond (hero)</label>
                <p className="text-xs text-[#6B6B6B]">Visible en haut de votre carte Google Wallet. JPG/PNG, max 4 Mo.</p>
                <div className="flex items-start gap-4">
                  {heroImageUrl ? (
                    <div className="relative w-32 h-16 rounded-xl overflow-hidden border border-[#E8E8E3] flex-shrink-0 bg-[#F7F6F3]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={heroImageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                      <button
                        type="button"
                        onClick={() => { setHeroImageUrl(null); onConfigChangeRef.current?.({ hero_image_url: null }) }}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  ) : (
                    <div
                      className="w-32 h-16 rounded-xl border-2 border-dashed border-[#E8E8E3] flex items-center justify-center bg-[#F7F6F3] cursor-pointer hover:border-[#6C47FF] transition-colors flex-shrink-0 text-xs text-[#9CA3AF]"
                      onClick={() => heroInputRef.current?.click()}
                    >
                      Ajouter
                    </div>
                  )}
                  <div>
                    <button
                      type="button"
                      onClick={() => heroInputRef.current?.click()}
                      disabled={heroUploading}
                      className="text-sm text-[#6C47FF] hover:text-[#5835e0] font-medium disabled:opacity-50 transition-colors"
                    >
                      {heroUploading ? 'Upload en cours…' : heroImageUrl ? 'Changer l\'image' : 'Choisir une image'}
                    </button>
                    {heroError && <p className="text-xs text-red-600 mt-1">{heroError}</p>}
                  </div>
                </div>
                <input ref={heroInputRef} type="file" accept="image/*" className="hidden" onChange={handleHeroImageChange} />
              </div>

              {/* Wallet message */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1A1A1A]">
                  Message personnalisé
                  <span className="ml-2 text-xs font-normal text-[#6B6B6B]">{walletMessage.length}/100</span>
                </label>
                <textarea
                  value={walletMessage}
                  onChange={e => {
                    const v = e.target.value.slice(0, 100)
                    setWalletMessage(v)
                    onConfigChangeRef.current?.({ wallet_message: v || null })
                  }}
                  placeholder="Ex : Merci de votre fidélité ! Présentez cette carte en caisse."
                  maxLength={100}
                  rows={2}
                  className={inputClass + ' resize-none'}
                />
                <p className="text-xs text-[#6B6B6B]">Affiché sur votre carte Google Wallet sous la règle de fidélité.</p>
              </div>

              {/* Expiry */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#1A1A1A]">Validité de la carte</label>
                <select
                  value={cardExpiryMonths}
                  onChange={e => setCardExpiryMonths(Number(e.target.value))}
                  className={inputClass}
                >
                  <option value={3}>3 mois</option>
                  <option value={6}>6 mois</option>
                  <option value={12}>12 mois (recommandé)</option>
                  <option value={24}>24 mois</option>
                  <option value={0}>Pas de date d&apos;expiration</option>
                </select>
                <p className="text-xs text-[#6B6B6B]">La date d&apos;expiration apparaît sur la carte Google Wallet.</p>
              </div>

              {/* Show Instagram on card */}
              {merchant.instagram_handle && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInstagram}
                    onChange={e => { setShowInstagram(e.target.checked); onConfigChangeRef.current?.({ show_instagram_on_card: e.target.checked }) }}
                    className="w-4 h-4 rounded border-[#E8E8E3] accent-[#6C47FF]"
                  />
                  <span className="text-sm text-[#1A1A1A]">
                    Afficher <strong>@{merchant.instagram_handle}</strong> sur la carte Wallet
                  </span>
                </label>
              )}
            </div>
          </details>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || logoUploading || heroUploading || bannerUploading}
            className="w-full py-3 text-sm font-semibold rounded-xl text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: color }}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>

        {/* ── Right: live preview ─────────────────────────── */}
        <div className="flex flex-col items-center gap-4 lg:sticky lg:top-6">
          <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Aperçu en temps réel</p>

          {/* Wallet toggle */}
          <div className="flex items-center gap-1 bg-[#F7F6F3] border border-[#E8E8E3] rounded-xl p-1 w-full max-w-xs">
            <button
              type="button"
              onClick={() => setWalletTab('google')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold transition-all ${walletTab === 'google' ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'}`}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => setWalletTab('apple')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold transition-all ${walletTab === 'apple' ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'}`}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple
            </button>
            <button
              type="button"
              onClick={() => setWalletTab('pwa')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-semibold transition-all ${walletTab === 'pwa' ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'}`}
            >
              <span className="text-sm leading-none flex-shrink-0">📱</span>
              VanCart
            </button>
          </div>

          <div className="w-full px-1">
            {walletTab === 'google' && <GoogleWalletPreview {...previewProps} />}
            {walletTab === 'apple' && <AppleWalletPreview {...previewProps} />}
            {walletTab === 'pwa' && (
              <PWAWalletPreview
                businessName={merchant.business_name}
                primaryColor={color}
                logoUrl={logoUrl}
                bannerUrl={bannerUrl}
                stampsRequired={stampsRequired}
                loyaltyType={loyaltyType}
                pointsRequired={pointsRequired}
              />
            )}
          </div>

          <p className="text-xs text-[#9CA3AF] text-center max-w-xs">
            Les données affichées sont des exemples de démonstration.
          </p>
        </div>
      </div>
    </div>
  )
}
