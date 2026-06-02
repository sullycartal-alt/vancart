'use client'

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 78 78" aria-hidden
         style={{ display: 'block', flexShrink: 0 }}>
      <g transform="translate(5,5)">
        <polygon points="12,12 52,12 60,22 60,62 20,62 12,52" fill="#15131A" />
      </g>
      <polygon points="20,22 12,12 12,52 20,62" fill="#fff" stroke="#15131A" strokeWidth={4.5} strokeLinejoin="round" />
      <polygon points="20,22 60,22 52,12 12,12" fill="#fff" stroke="#15131A" strokeWidth={4.5} strokeLinejoin="round" />
      <rect x="20" y="22" width="40" height="40" rx="3" fill="#fff" stroke="#15131A" strokeWidth={4.5} strokeLinejoin="round" />
      <path d="M29 40 L37.5 50 L53 30" fill="none" stroke="#6C47FF" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LogoLockup({ size = 32 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="font-extrabold tracking-[-0.04em] text-[#15131A]"
            style={{ fontSize: size * 0.66 }}>
        VanCart
      </span>
    </span>
  )
}
