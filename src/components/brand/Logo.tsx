// src/components/brand/Logo.tsx
// Logo VanCart — cube 3D (type Notion) + « V » en coche violette.
// Palette stricte : noir #15131A · violet #6C47FF · blanc #fff.

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 78 78"
      aria-hidden
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* ombre portée */}
      <g transform="translate(5,5)">
        <polygon points="12,12 52,12 60,22 60,62 20,62 12,52" fill="#15131A" />
      </g>
      {/* face gauche */}
      <polygon points="20,22 12,12 12,52 20,62" fill="#fff" stroke="#15131A" strokeWidth={4.5} strokeLinejoin="round" />
      {/* face dessus */}
      <polygon points="20,22 60,22 52,12 12,12" fill="#fff" stroke="#15131A" strokeWidth={4.5} strokeLinejoin="round" />
      {/* face avant */}
      <rect x="20" y="22" width="40" height="40" rx="3" fill="#fff" stroke="#15131A" strokeWidth={4.5} strokeLinejoin="round" />
      {/* V / coche */}
      <path d="M29 40 L37.5 50 L53 30" fill="none" stroke="#6C47FF" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Lockup complet : cube + wordmark « VanCart ».
export function LogoLockup({ size = 32 }: { size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <span
        style={{
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: '#15131A',
          fontSize: Math.round(size * 0.66),
          lineHeight: 1,
        }}
      >
        VanCart
      </span>
    </span>
  )
}
