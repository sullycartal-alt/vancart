'use client'

import { useEffect, useRef, useState } from 'react'
import { Store, ImagePlus } from 'lucide-react'

export interface LoyaltyCardMockupProps {
  primaryColor?: string
  logoUrl?: string
  bannerUrl?: string
  businessName?: string
  loyaltyType?: 'stamps' | 'points'
  stampsRequired?: number
  pointsRequired?: number
  pointsPerEuro?: number
  loyaltyRule?: string
  clientName?: string
  currentStamps?: number
  currentPoints?: number
  cardId?: string
  width?: number | string
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

function CardQR({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    let cancelled = false
    import('qrcode').then((QRCode) => {
      if (!cancelled && canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, value, {
          width: 160,
          margin: 1,
          color: { dark: '#111827', light: '#ffffff' },
        })
      }
    })
    return () => { cancelled = true }
  }, [value])
  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={160}
      style={{ display: 'block', borderRadius: 4, width: 160, height: 160 }}
    />
  )
}

export default function LoyaltyCardMockup(props: LoyaltyCardMockupProps) {
  const {
    primaryColor = '#6C47FF',
    logoUrl,
    bannerUrl,
    businessName = 'Votre commerce',
    loyaltyType = 'stamps',
    stampsRequired = 9,
    pointsRequired = 100,
    loyaltyRule = '1 café offert',
    clientName = 'Marie Laurent',
    currentStamps = 5,
    currentPoints = 60,
    cardId,
    width = 360,
  } = props

  const [bannerError, setBannerError] = useState(false)
  useEffect(() => { setBannerError(false) }, [bannerUrl])

  const remaining = loyaltyType === 'stamps'
    ? stampsRequired - currentStamps
    : pointsRequired - currentPoints

  return (
    <div
      style={{
        width,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
        fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
        flexShrink: 0,
      }}
    >
      {/* ZONE 1 — Header */}
      <div
        style={{
          backgroundColor: primaryColor,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        {/* Logo */}
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', backgroundColor: 'white', flexShrink: 0 }} alt="" />
        ) : (
          <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Store className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
        )}

        {/* Business name */}
        <div style={{ color: 'white', fontWeight: 700, fontSize: 15, textAlign: 'center', flex: 1, padding: '0 12px' }}>
          {businessName}
        </div>

        {/* Counter */}
        {loyaltyType === 'stamps' ? (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>TAMPONS</div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 20, lineHeight: 1 }}>
              {currentStamps}<span style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>/{stampsRequired}</span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>POINTS</div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 20, lineHeight: 1 }}>{currentPoints}</div>
          </div>
        )}
      </div>

      {/* ZONE 2 — Banner */}
      <div style={{ position: 'relative', overflow: 'hidden', height: 200 }}>
        {bannerUrl && !bannerError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bannerUrl}
            alt=""
            onError={() => setBannerError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div
            style={{
              height: 200,
              background: `linear-gradient(160deg, ${primaryColor}CC 0%, ${primaryColor}44 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <ImagePlus style={{ width: 40, height: 40, color: 'rgba(255,255,255,0.3)' }} strokeWidth={1.5} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Votre photo</span>
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />
      </div>

      {/* ZONE 3 — Client info */}
      <div
        style={{
          backgroundColor: primaryColor,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>CARTE DE</div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{clientName}</div>
        </div>
        <div style={{ textAlign: 'right', maxWidth: 160 }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>PROCHAINE RÉCOMPENSE</div>
          {loyaltyType === 'stamps' ? (
            <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>
              {remaining} tampon{remaining > 1 ? 's' : ''} avant
            </div>
          ) : (
            <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>
              {remaining} points avant
            </div>
          )}
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontStyle: 'italic' }}>🎁 {loyaltyRule}</div>
        </div>
      </div>

      {/* ZONE 4 — QR code */}
      <div
        style={{
          backgroundColor: primaryColor,
          padding: 16,
          borderTop: '2px solid rgba(255,255,255,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ borderRadius: 16, backgroundColor: 'white', lineHeight: 0, width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            {cardId ? <CardQR value={cardId} /> : <InlineQR />}
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
          Présentez ce QR code en caisse
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textAlign: 'center' }}>
          {cardId ? `ID : ${cardId.slice(0, 8)}…` : 'ID : 1a4f8c · e291 · 3b72'}
        </div>
      </div>
    </div>
  )
}
