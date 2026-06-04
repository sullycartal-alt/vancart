import { Check } from 'lucide-react'

function InlineQR() {
  return (
    <svg width="160" height="160" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="56" fill="white"/>
      {/* TL finder */}
      <rect x="2" y="2" width="16" height="16" fill="#111" rx="1"/>
      <rect x="4" y="4" width="12" height="12" fill="white" rx="1"/>
      <rect x="7" y="7" width="6" height="6" fill="#111"/>
      {/* TR finder */}
      <rect x="38" y="2" width="16" height="16" fill="#111" rx="1"/>
      <rect x="40" y="4" width="12" height="12" fill="white" rx="1"/>
      <rect x="43" y="7" width="6" height="6" fill="#111"/>
      {/* BL finder */}
      <rect x="2" y="38" width="16" height="16" fill="#111" rx="1"/>
      <rect x="4" y="40" width="12" height="12" fill="white" rx="1"/>
      <rect x="7" y="43" width="6" height="6" fill="#111"/>
      {/* Data dots */}
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

export default function LoyaltyCardMockup() {
  const filledStamps = 5
  const totalStamps = 9

  return (
    <div
      style={{
        width: 390,
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
        fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
        backgroundColor: '#6C47FF',
        flexShrink: 0,
      }}
    >
      {/* Header strip — logo left, stamp count right */}
      <div
        style={{
          padding: '20px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
              <line x1="6" x2="6" y1="2" y2="4"/>
              <line x1="10" x2="10" y1="2" y2="4"/>
              <line x1="14" x2="14" y1="2" y2="4"/>
            </svg>
          </div>
          <p style={{ color: 'white', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
            Café des Arts
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, letterSpacing: '0.12em', fontWeight: 600 }}>
            TAMPONS
          </p>
          <p style={{ color: 'white', fontWeight: 800, fontSize: 26, lineHeight: 1 }}>
            {filledStamps}
            <span style={{ fontWeight: 400, fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>/{totalStamps}</span>
          </p>
        </div>
      </div>

      {/* Full-width photo banner */}
      <div
        style={{
          height: 200,
          backgroundImage: "url('/hero-cafe.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          margin: '0 0',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.45))' }} />
        <div style={{ position: 'absolute', bottom: 12, left: 16, zIndex: 1 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(108,71,255,0.85)',
              backdropFilter: 'blur(6px)',
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 20,
            }}
          >
            🎁 1 café offert à {totalStamps} tampons
          </span>
        </div>
      </div>

      {/* Info row — client name left, progress right */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, letterSpacing: '0.12em', fontWeight: 600 }}>
            CARTE DE
          </p>
          <p style={{ color: 'white', fontWeight: 700, fontSize: 18, lineHeight: 1.2, marginTop: 2 }}>
            Marie Laurent
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, letterSpacing: '0.12em', fontWeight: 600 }}>
            PROGRESSION
          </p>
          <div style={{ display: 'flex', gap: 5, marginTop: 6, justifyContent: 'flex-end' }}>
            {Array.from({ length: totalStamps }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: i < filledStamps ? 'white' : 'transparent',
                  border: i < filledStamps ? 'none' : '1.5px solid rgba(255,255,255,0.3)',
                  flexShrink: 0,
                }}
              >
                {i < filledStamps && (
                  <Check size={12} strokeWidth={3} style={{ color: '#6C47FF' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR code zone — white card, centered */}
      <div
        style={{
          margin: '4px 20px 20px',
          background: 'white',
          borderRadius: 16,
          padding: '20px 0 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <InlineQR />
        <p style={{ color: '#9CA3AF', fontSize: 12, letterSpacing: '0.05em' }}>1a4f8c · e291 · 3b72</p>
        <p style={{ color: '#6B7280', fontSize: 11, marginTop: -4 }}>Présentez ce code en caisse</p>
      </div>
    </div>
  )
}
