interface LoyaltyDisplayProps {
  mode: 'stamps' | 'points'
  current: number
  target: number
  primaryColor: string
  dark?: boolean
  rewardLabel?: string
}

export default function LoyaltyDisplay({
  mode, current, target, primaryColor, dark = false, rewardLabel,
}: LoyaltyDisplayProps) {
  const pct = Math.min(100, target > 0 ? Math.round((current / target) * 100) : 0)

  if (mode === 'points') {
    const textColor = dark ? 'white' : '#1A1A1A'
    const mutedColor = dark ? 'rgba(255,255,255,0.55)' : '#9CA3AF'
    const trackBg = dark ? 'rgba(255,255,255,0.2)' : '#E5E7EB'
    const fill = dark ? 'white' : primaryColor
    const remaining = Math.max(0, target - current)

    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 'clamp(18px, 3.5vw, 26px)', fontWeight: 900, color: textColor, lineHeight: 1 }}>
            {current.toLocaleString('fr-FR')}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: mutedColor }}>pts</span>
          <span style={{ fontSize: 10, color: mutedColor, marginLeft: 'auto' }}>
            /{target.toLocaleString('fr-FR')}
          </span>
        </div>
        <div style={{ height: 5, borderRadius: 999, background: trackBg, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: fill, borderRadius: 999 }} />
        </div>
        <span style={{ fontSize: 10, color: remaining > 0 ? mutedColor : fill, fontWeight: 500 }}>
          {remaining > 0
            ? `Encore ${remaining.toLocaleString('fr-FR')} pts pour ${rewardLabel ?? 'votre récompense'}`
            : '🎉 Récompense débloquée !'}
        </span>
      </div>
    )
  }

  // Stamps — progress bar for >20
  if (target > 20) {
    const textColor = dark ? 'white' : '#1A1A1A'
    const mutedColor = dark ? 'rgba(255,255,255,0.55)' : '#9CA3AF'
    const trackBg = dark ? 'rgba(255,255,255,0.2)' : '#E5E7EB'
    const fill = dark ? 'white' : primaryColor

    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: textColor }}>{current} tampons</span>
          <span style={{ fontSize: 10, color: mutedColor }}>{target} requis</span>
        </div>
        <div style={{ height: 5, borderRadius: 999, background: trackBg, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: fill, borderRadius: 999 }} />
        </div>
      </div>
    )
  }

  // Stamps — circles ≤20
  const display = Math.min(target, 20)
  const size = target <= 6 ? 20 : target <= 10 ? 17 : target <= 15 ? 14 : 11
  const gap = size <= 11 ? 2 : size <= 14 ? 3 : 4

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap }}>
      {Array.from({ length: display }).map((_, i) => {
        const isFilled = i < current
        return (
          <div key={i} style={{
            width: size, height: size, borderRadius: '50%', flexShrink: 0,
            border: isFilled ? 'none' : dark ? '2px solid rgba(255,255,255,0.5)' : `2px solid ${primaryColor}`,
            background: isFilled ? (dark ? 'white' : primaryColor) : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isFilled && (
              <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke={dark ? primaryColor : 'white'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        )
      })}
    </div>
  )
}
