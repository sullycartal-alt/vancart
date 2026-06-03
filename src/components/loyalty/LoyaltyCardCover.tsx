'use client'

// Design handoff: carte Cover VanCart
// Photo de devanture en bannière + panneau sombre #15131A + QR compact intégré.
// Remplace le composant carte actuel dans CardClient.tsx.

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Gift, Target, BellRing, Camera } from 'lucide-react'

export interface LoyaltyCardCoverProps {
  merchantName: string
  merchantSubtitle?: string
  merchantColor: string
  merchantColor2?: string | null
  merchantCoverUrl?: string | null
  merchantLogoUrl?: string | null
  merchantInitials: string
  loyaltyMode: 'stamps' | 'points'
  currentValue: number
  targetValue: number
  rewardLabel: string
  cardId: string
  notificationsEnabled?: boolean
  isComplete?: boolean
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function darkenHex(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex)
  const d = (v: number) => Math.max(0, Math.round(v * (1 - factor)))
  return `#${[d(r), d(g), d(b)].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

function themeGradient(c1: string, c2?: string | null) {
  return `linear-gradient(135deg, ${c1}, ${c2 || darkenHex(c1, 0.22)})`
}

// ── Compact canvas QR ─────────────────────────────────────────────────────────

function CardQR({ value, size }: { value: string; size: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    let cancelled = false
    import('qrcode').then((QRCode) => {
      if (!cancelled && canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 1,
          color: { dark: '#15131A', light: '#ffffff' },
        })
      }
    })
    return () => { cancelled = true }
  }, [value, size])
  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size, display: 'block', borderRadius: 6 }}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function LoyaltyCardCover({
  merchantName,
  merchantSubtitle = 'Carte de fidélité',
  merchantColor,
  merchantColor2,
  merchantCoverUrl,
  merchantLogoUrl,
  merchantInitials,
  loyaltyMode,
  currentValue,
  targetValue,
  rewardLabel,
  cardId,
  notificationsEnabled = false,
  isComplete = false,
}: LoyaltyCardCoverProps) {
  const isPoints = loyaltyMode === 'points'
  const pct = Math.max(2, Math.min(100, (currentValue / targetValue) * 100))
  const left = Math.max(0, targetValue - currentValue)
  const unit = isPoints ? 'pt' : 'tampon'
  const unitPlural = isPoints ? 'pts' : 'tampons'

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        borderRadius: 24,
        background: '#15131A',
        color: '#fff',
        boxShadow: '0 24px 56px -18px rgba(21,19,26,.7)',
      }}
    >
      {/* ── Photo zone ── */}
      <div className="relative" style={{ height: 182 }}>
        {/* Gradient background (always rendered; cover photo sits on top) */}
        <div
          className="absolute inset-0"
          style={{ background: themeGradient(merchantColor, merchantColor2), zIndex: 0 }}
        />

        {merchantCoverUrl && (
          <Image
            src={merchantCoverUrl}
            alt={merchantName}
            fill
            className="object-cover"
            style={{ zIndex: 1 }}
            sizes="360px"
            priority
          />
        )}

        {/* Scrim for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.62) 100%)',
            zIndex: 2,
          }}
        />

        {/* "Add photo" nudge when no cover */}
        {!merchantCoverUrl && (
          <div
            className="absolute flex items-center gap-1.5 text-white text-[11px] font-semibold"
            style={{
              top: 12, right: 12, zIndex: 3,
              background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(6px)',
              borderRadius: 999, padding: '4px 10px',
            }}
          >
            <Camera size={11} />
            Ajouter une photo
          </div>
        )}

        {/* Logo badge + merchant name */}
        <div className="absolute flex items-end gap-3" style={{ left: 16, bottom: 12, zIndex: 3 }}>
          <div
            style={{
              width: 46, height: 46, borderRadius: 14,
              background: merchantLogoUrl ? 'transparent' : 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              display: 'grid', placeItems: 'center',
              border: '1.5px solid rgba(255,255,255,0.3)',
              overflow: 'hidden', flexShrink: 0,
            }}
          >
            {merchantLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={merchantLogoUrl} alt="" style={{ width: 46, height: 46, objectFit: 'cover' }} />
            ) : (
              <span
                className="font-bold text-white"
                style={{ fontFamily: 'var(--font-grotesk, "Space Grotesk", sans-serif)', fontSize: 15 }}
              >
                {merchantInitials.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="pb-0.5">
            <div
              className="font-bold text-white"
              style={{
                fontFamily: 'var(--font-grotesk, "Space Grotesk", sans-serif)',
                fontSize: 16, letterSpacing: '-0.025em', lineHeight: 1.1,
              }}
            >
              {merchantName}
            </div>
            <div className="text-[10px] mt-0.5" style={{ opacity: 0.8 }}>
              {merchantSubtitle}
            </div>
          </div>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col gap-3.5" style={{ padding: '18px 20px' }}>

        {/* Balance + reward chip */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: '#79747F' }}
            >
              Solde
            </div>
            <div
              style={{
                fontFamily: 'var(--font-grotesk, "Space Grotesk", sans-serif)',
                fontWeight: 700, fontSize: 28,
                letterSpacing: '-0.04em', lineHeight: 1,
              }}
            >
              {currentValue.toLocaleString('fr-FR')}
              <span className="text-[13px] font-medium" style={{ color: '#5C5866' }}>
                {' '}/ {targetValue} {isPoints ? 'pts' : 'tamp.'}
              </span>
            </div>
          </div>

          <div
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold"
            style={{
              background: `${merchantColor}28`,
              padding: '6px 11px',
              borderRadius: 999,
              color: merchantColor,
              border: `1px solid ${merchantColor}40`,
              marginTop: 2,
            }}
          >
            <Gift size={13} color={merchantColor} strokeWidth={1.9} />
            {rewardLabel}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1.5">
          <div
            style={{
              width: '100%', height: 6,
              borderRadius: 999, background: '#2a2730', overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%', borderRadius: 999, width: `${pct}%`,
                background: merchantColor,
                transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
              }}
            />
          </div>
          <div
            className="flex items-center gap-1.5 text-[11px]"
            style={{ color: '#79747F' }}
          >
            {isComplete ? (
              <>
                <Gift size={12} color={merchantColor} strokeWidth={1.9} />
                Récompense prête — montrez au commerçant
              </>
            ) : (
              <>
                <Target size={12} color="#79747F" strokeWidth={1.9} />
                Plus que {left} {left === 1 ? unit : unitPlural} pour {rewardLabel}
              </>
            )}
          </div>
        </div>

        {/* QR + scan info */}
        <div
          className="flex items-center gap-3.5 pt-3.5"
          style={{ borderTop: '1px solid #2a2730' }}
        >
          <div
            style={{
              width: 72, height: 72, borderRadius: 12,
              background: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0,
            }}
          >
            <CardQR value={cardId} size={60} />
          </div>

          <div className="flex-1 flex flex-col gap-1" style={{ fontSize: 11, color: '#79747F' }}>
            <div
              style={{
                fontFamily: 'var(--font-grotesk, "Space Grotesk", sans-serif)',
                fontSize: 12, fontWeight: 600, color: '#fff',
              }}
            >
              Scanner en caisse
            </div>
            <div>ID {cardId.slice(0, 8)}…</div>
            {notificationsEnabled && (
              <div
                className="inline-flex items-center gap-1.5 mt-1 font-semibold text-[11px]"
                style={{ color: merchantColor }}
              >
                <BellRing size={12} color={merchantColor} strokeWidth={1.9} />
                Notifications activées
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
