// Floating loyalty card stack for the Hero section — static, no client JS

const CARDS = [
  {
    name: 'Café des Arts',
    initials: 'CA',
    color1: '#6C47FF',
    color2: '#9B7FFF',
    client: 'Marie L.',
    mode: 'stamps' as const,
    current: 5,
    target: 9,
    reward: '1 café offert',
    shortId: '1a4f8c…e291',
    layer: 3,
    style: { top: 0, right: 16, transform: 'rotate(3deg)', zIndex: 3, opacity: 1, animationName: 'float' },
  },
  {
    name: 'Brunch & Co',
    initials: 'BC',
    color1: '#FF6B35',
    color2: '#FF9A6C',
    client: 'Thomas R.',
    mode: 'points' as const,
    current: 320,
    target: 500,
    reward: 'Brunch offert',
    shortId: '230a68…581a',
    layer: 2,
    style: { top: 16, right: 8, transform: 'rotate(-2deg)', zIndex: 2, opacity: 0.85 },
  },
  {
    name: 'Le Zinc',
    initials: 'LZ',
    color1: '#1A1A2E',
    color2: '#16213E',
    client: 'Sophie M.',
    mode: 'stamps' as const,
    current: 3,
    target: 8,
    reward: 'Verre offert',
    shortId: 'b7e2a1…49c3',
    layer: 1,
    style: { top: 32, right: 0, transform: 'rotate(-5deg)', zIndex: 1, opacity: 0.7 },
  },
] as const

function FakeQR() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="white" />
      {/* TL finder */}
      <rect x="2" y="2" width="14" height="14" fill="#111" rx="1" />
      <rect x="4" y="4" width="10" height="10" fill="white" rx="1" />
      <rect x="6" y="6" width="6" height="6" fill="#111" />
      {/* TR finder */}
      <rect x="32" y="2" width="14" height="14" fill="#111" rx="1" />
      <rect x="34" y="4" width="10" height="10" fill="white" rx="1" />
      <rect x="36" y="6" width="6" height="6" fill="#111" />
      {/* BL finder */}
      <rect x="2" y="32" width="14" height="14" fill="#111" rx="1" />
      <rect x="4" y="34" width="10" height="10" fill="white" rx="1" />
      <rect x="6" y="36" width="6" height="6" fill="#111" />
      {/* Data pattern */}
      <rect x="18" y="2" width="3" height="3" fill="#111" />
      <rect x="23" y="2" width="2" height="3" fill="#111" />
      <rect x="27" y="3" width="3" height="2" fill="#111" />
      <rect x="18" y="7" width="2" height="2" fill="#111" />
      <rect x="22" y="6" width="3" height="3" fill="#111" />
      <rect x="27" y="7" width="2" height="3" fill="#111" />
      <rect x="19" y="12" width="3" height="2" fill="#111" />
      <rect x="24" y="11" width="2" height="3" fill="#111" />
      <rect x="18" y="18" width="2" height="2" fill="#111" />
      <rect x="22" y="18" width="3" height="3" fill="#111" />
      <rect x="27" y="18" width="2" height="2" fill="#111" />
      <rect x="31" y="19" width="3" height="2" fill="#111" />
      <rect x="35" y="18" width="2" height="3" fill="#111" />
      <rect x="39" y="18" width="3" height="2" fill="#111" />
      <rect x="44" y="19" width="2" height="2" fill="#111" />
      <rect x="19" y="23" width="2" height="2" fill="#111" />
      <rect x="24" y="22" width="3" height="3" fill="#111" />
      <rect x="29" y="23" width="2" height="2" fill="#111" />
      <rect x="33" y="22" width="3" height="2" fill="#111" />
      <rect x="38" y="23" width="2" height="3" fill="#111" />
      <rect x="43" y="22" width="3" height="3" fill="#111" />
      <rect x="18" y="28" width="3" height="2" fill="#111" />
      <rect x="23" y="27" width="2" height="3" fill="#111" />
      <rect x="28" y="28" width="3" height="2" fill="#111" />
      <rect x="32" y="27" width="2" height="3" fill="#111" />
      <rect x="37" y="28" width="3" height="2" fill="#111" />
      <rect x="42" y="27" width="2" height="3" fill="#111" />
      <rect x="19" y="33" width="2" height="3" fill="#111" />
      <rect x="23" y="32" width="3" height="2" fill="#111" />
      <rect x="28" y="33" width="2" height="3" fill="#111" />
      <rect x="33" y="32" width="3" height="3" fill="#111" />
      <rect x="38" y="33" width="2" height="2" fill="#111" />
      <rect x="43" y="32" width="2" height="3" fill="#111" />
      <rect x="18" y="38" width="3" height="2" fill="#111" />
      <rect x="23" y="39" width="2" height="2" fill="#111" />
      <rect x="28" y="38" width="3" height="3" fill="#111" />
      <rect x="32" y="39" width="2" height="2" fill="#111" />
      <rect x="37" y="38" width="3" height="2" fill="#111" />
      <rect x="41" y="39" width="2" height="3" fill="#111" />
      <rect x="45" y="38" width="2" height="2" fill="#111" />
      <rect x="19" y="43" width="2" height="3" fill="#111" />
      <rect x="24" y="44" width="3" height="2" fill="#111" />
      <rect x="29" y="43" width="2" height="3" fill="#111" />
      <rect x="34" y="44" width="3" height="2" fill="#111" />
      <rect x="38" y="43" width="2" height="3" fill="#111" />
      <rect x="43" y="44" width="3" height="2" fill="#111" />
    </svg>
  )
}

type CardDef = typeof CARDS[number]

function LoyaltyCardPreview({ card }: { card: CardDef }) {
  const { name, initials, color1, color2, client, mode, current, target, reward, shortId } = card
  const pct = Math.min(100, Math.round((current / target) * 100))
  const isPoints = mode === 'points'

  return (
    <div
      style={{
        width: 320,
        borderRadius: 20,
        background: '#15131A',
        overflow: 'hidden',
        boxShadow: card.layer === 3
          ? '0 28px 60px -10px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.22)'
          : card.layer === 2
            ? '0 16px 40px -8px rgba(0,0,0,0.35)'
            : '0 8px 24px -4px rgba(0,0,0,0.25)',
      }}
    >
      {/* Gradient zone */}
      <div
        style={{
          height: 120,
          background: `linear-gradient(135deg, ${color1}, ${color2})`,
          position: 'relative',
        }}
      >
        {/* "Votre photo" badge */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'rgba(0,0,0,0.32)',
            backdropFilter: 'blur(6px)',
            borderRadius: 999,
            padding: '4px 10px',
          }}
        >
          <svg width="11" height="11" fill="none" stroke="white" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'white' }}>Votre photo</span>
        </div>

        {/* Logo + name */}
        <div
          style={{
            position: 'absolute',
            left: 14,
            bottom: 12,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
              {initials}
            </span>
          </div>
          <div style={{ paddingBottom: 2 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {name}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.72)', marginTop: 2 }}>
              Carte de {client}
            </div>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '14px 16px 16px' }}>
        {/* Balance row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#6B6570', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>
              {isPoints ? 'Points' : 'Tampons'}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'white', lineHeight: 1, letterSpacing: '-0.03em' }}>
              {current.toLocaleString('fr-FR')}
              <span style={{ fontSize: 13, fontWeight: 500, color: '#5C5866', marginLeft: 2 }}>
                / {target}
              </span>
            </div>
          </div>
          <div
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: `${color1}28`,
              border: `1px solid ${color1}40`,
              borderRadius: 999,
              padding: '5px 10px',
              marginTop: 4,
            }}
          >
            <svg width="12" height="12" fill="none" stroke={color1} strokeWidth={1.9} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: color1 }}>{reward}</span>
          </div>
        </div>

        {/* Progress / stamps */}
        {isPoints ? (
          <div
            style={{
              width: '100%',
              height: 6,
              borderRadius: 999,
              background: '#2a2730',
              overflow: 'hidden',
              marginBottom: 12,
            }}
          >
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: color1 }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {Array.from({ length: target }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: i < current ? color1 : 'rgba(255,255,255,0.1)',
                  border: i < current ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i < current && (
                  <svg width="8" height="8" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 12 12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        )}

        {/* QR + scan */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            paddingTop: 12,
            borderTop: '1px solid #2a2730',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 8,
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FakeQR />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'white', marginBottom: 2 }}>
              Scanner pour cumuler
            </div>
            <div style={{ fontSize: 10, color: '#6B6570' }}>ID {shortId}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingHeroCards() {
  return (
    <div className="hidden lg:block">
      <style>{`
        @keyframes float {
          0%, 100% { transform: rotate(3deg) translateY(0); }
          50%       { transform: rotate(3deg) translateY(-8px); }
        }
      `}</style>

      <div style={{ position: 'relative', width: 380, height: 500 }}>
        {/* Render in reverse order so card 1 (top) is last in DOM */}
        {[...CARDS].reverse().map((card) => (
          <div
            key={card.name}
            style={{
              position: 'absolute',
              ...card.style,
              animation: card.layer === 3 ? 'float 4s ease-in-out infinite' : undefined,
            }}
          >
            <LoyaltyCardPreview card={card} />
          </div>
        ))}
      </div>
    </div>
  )
}
