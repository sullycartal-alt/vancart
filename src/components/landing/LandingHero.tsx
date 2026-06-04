import Link from 'next/link'
import { Check, Clock, Lock, ShieldCheck, Headphones } from 'lucide-react'

// ── Hero section — single floating loyalty card + handwritten annotation ──────

const BULLETS = [
  'Vos clients scannent votre QR code',
  'Ils collectent des tampons à chaque visite',
  'Ils reçoivent leurs récompenses directement dans leur téléphone',
  'Plus de cartes perdues, plus de clients fidélisés',
]

const AVATARS = [
  { initials: 'JD', color: '#6C47FF' },
  { initials: 'ML', color: '#F97316' },
  { initials: 'SC', color: '#10B981' },
  { initials: 'AR', color: '#F59E0B' },
  { initials: 'PB', color: '#EF4444' },
]

const TRUST = [
  { Icon: Clock, label: '5 minutes', sub: 'pour démarrer' },
  { Icon: Lock, label: 'Sans engagement', sub: 'Annulez quand vous voulez' },
  { Icon: ShieldCheck, label: 'Données hébergées', sub: 'en Europe' },
  { Icon: Headphones, label: 'Support disponible', sub: '7j/7' },
]

function HeroCard() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        zIndex: 2,
        width: 320,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 32px 64px rgba(0,0,0,0.25)',
        animation: 'heroFloat 4s ease-in-out infinite',
      }}
    >
      {/* ── Photo zone ── */}
      <div
        style={{
          position: 'relative',
          height: 200,
          backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Cafe_de_Flore_Paris_2008.jpg/800px-Cafe_de_Flore_Paris_2008.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Scrim for text legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65) 100%)',
          }}
        />

        {/* "Votre photo" badge */}
        <div
          className="absolute top-3 right-3 inline-flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 1 }}
        >
          📷 Votre photo
        </div>

        {/* Logo + merchant name */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2.5" style={{ zIndex: 1 }}>
          <div style={{ width: 46, height: 46, borderRadius: 10, border: '2px solid white', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
              <line x1="6" x2="6" y1="2" y2="4"/>
              <line x1="10" x2="10" y1="2" y2="4"/>
              <line x1="14" x2="14" y1="2" y2="4"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-base leading-tight">Café des Arts</span>
            <span className="text-white/70 text-xs">Carte de Marie L.</span>
          </div>
        </div>
      </div>

      {/* ── Card body ── */}
      <div style={{ background: '#15131A', padding: 16 }}>
        <p className="text-xs text-white/50 tracking-widest">TAMPONS</p>
        <div className="flex items-center justify-between mt-1">
          <p className="leading-none">
            <span className="text-4xl font-black text-white">5</span>
            <span className="text-xl text-white/50">/9</span>
          </p>
          <span className="bg-[#F97316]/20 text-[#F97316] text-xs font-medium px-3 py-1 rounded-full">
            🎁 1 café offert
          </span>
        </div>

        {/* Stamps row */}
        <div className="flex gap-1.5 mt-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className={
                i < 5
                  ? 'flex items-center justify-center rounded-full bg-[#F97316]'
                  : 'flex items-center justify-center rounded-full border-2 border-white/20 bg-transparent'
              }
              style={{ width: 24, height: 24 }}
            >
              {i < 5 && <Check size={13} strokeWidth={3} className="text-white" />}
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 my-3" />

        {/* QR + text */}
        <div className="flex items-center gap-3">
          <div style={{ width: 64, height: 64, borderRadius: 8, background: 'white', padding: 4, flexShrink: 0 }}>
            <svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
              <rect width="56" height="56" fill="white"/>
              {/* TL finder */}
              <rect x="2" y="2" width="16" height="16" fill="#111" rx="1"/><rect x="4" y="4" width="12" height="12" fill="white" rx="1"/><rect x="7" y="7" width="6" height="6" fill="#111"/>
              {/* TR finder */}
              <rect x="38" y="2" width="16" height="16" fill="#111" rx="1"/><rect x="40" y="4" width="12" height="12" fill="white" rx="1"/><rect x="43" y="7" width="6" height="6" fill="#111"/>
              {/* BL finder */}
              <rect x="2" y="38" width="16" height="16" fill="#111" rx="1"/><rect x="4" y="40" width="12" height="12" fill="white" rx="1"/><rect x="7" y="43" width="6" height="6" fill="#111"/>
              {/* Data */}
              <rect x="21" y="2" width="3" height="3" fill="#111"/><rect x="26" y="2" width="3" height="3" fill="#111"/><rect x="31" y="4" width="2" height="2" fill="#111"/>
              <rect x="21" y="7" width="2" height="2" fill="#111"/><rect x="25" y="6" width="3" height="3" fill="#111"/><rect x="30" y="8" width="3" height="2" fill="#111"/>
              <rect x="21" y="13" width="3" height="2" fill="#111"/><rect x="27" y="12" width="2" height="3" fill="#111"/>
              <rect x="21" y="21" width="2" height="2" fill="#111"/><rect x="25" y="21" width="3" height="3" fill="#111"/><rect x="30" y="21" width="2" height="2" fill="#111"/><rect x="34" y="22" width="3" height="2" fill="#111"/><rect x="38" y="21" width="2" height="3" fill="#111"/><rect x="43" y="21" width="3" height="2" fill="#111"/><rect x="49" y="22" width="2" height="2" fill="#111"/>
              <rect x="21" y="26" width="3" height="2" fill="#111"/><rect x="27" y="25" width="2" height="3" fill="#111"/><rect x="32" y="26" width="3" height="2" fill="#111"/><rect x="37" y="25" width="2" height="3" fill="#111"/><rect x="41" y="26" width="3" height="2" fill="#111"/><rect x="46" y="25" width="2" height="3" fill="#111"/>
              <rect x="21" y="32" width="2" height="3" fill="#111"/><rect x="26" y="31" width="3" height="2" fill="#111"/><rect x="31" y="32" width="2" height="3" fill="#111"/><rect x="35" y="31" width="3" height="3" fill="#111"/><rect x="41" y="32" width="2" height="2" fill="#111"/><rect x="46" y="31" width="2" height="3" fill="#111"/>
              <rect x="21" y="38" width="3" height="2" fill="#111"/><rect x="26" y="39" width="2" height="2" fill="#111"/><rect x="31" y="38" width="3" height="3" fill="#111"/><rect x="36" y="39" width="2" height="2" fill="#111"/><rect x="41" y="38" width="3" height="2" fill="#111"/><rect x="46" y="39" width="2" height="3" fill="#111"/>
              <rect x="21" y="44" width="2" height="3" fill="#111"/><rect x="26" y="43" width="3" height="3" fill="#111"/><rect x="32" y="44" width="2" height="2" fill="#111"/><rect x="37" y="43" width="3" height="3" fill="#111"/><rect x="43" y="44" width="2" height="2" fill="#111"/>
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-white font-semibold text-sm">Présentez ce QR code</span>
            <span className="text-white/50 text-xs">à chaque passage en caisse</span>
            <span className="text-white/30 text-xs">ID : 1a4f8c...e291</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F6F3] px-4 sm:px-6 py-20">
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateX(-50%) rotate(8deg) translateY(0px); }
          50%      { transform: translateX(-50%) rotate(8deg) translateY(-12px); }
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Left column ── */}
          <div className="space-y-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#F0EDFF] text-[#6C47FF] text-sm font-medium px-4 py-2 rounded-full border border-[#6C47FF]/20">
              <span>✉</span> La carte de fidélité nouvelle génération
            </div>

            <h1 className="text-5xl font-black text-gray-900 leading-tight">
              La fidélité qui ne finit
              <br />
              <span style={{ color: '#F97316', textDecoration: 'line-through', textDecorationColor: '#F97316' }}>
                pas à la poubelle.
              </span>
            </h1>

            <p className="text-gray-600 text-lg max-w-lg mx-auto lg:mx-0">
              VanCart remplace votre carte papier par une carte digitale dans Apple Wallet et Google Wallet.
            </p>

            {/* Bullets */}
            <ul className="space-y-3 text-left max-w-lg mx-auto lg:mx-0">
              {BULLETS.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span
                    className="flex items-center justify-center rounded-full bg-[#6C47FF] flex-shrink-0 mt-0.5"
                    style={{ width: 22, height: 22 }}
                  >
                    <Check size={13} strokeWidth={3} className="text-white" />
                  </span>
                  <span className="text-gray-700 text-base">{b}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                href="/register"
                className="bg-[#6C47FF] hover:bg-[#5835FF] text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors text-center"
              >
                Créer mon compte gratuit →
              </Link>
              <span className="text-gray-500 text-sm">
                Déjà un compte ?{' '}
                <Link href="/login" className="text-[#6C47FF] font-medium">Se connecter</Link>
              </span>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="flex flex-shrink-0" style={{ gap: 0 }}>
                {AVATARS.map(({ initials, color }, i) => (
                  <div
                    key={initials}
                    className="flex items-center justify-center rounded-full border-2 border-white text-white text-xs font-bold flex-shrink-0"
                    style={{ width: 36, height: 36, backgroundColor: color, marginLeft: i === 0 ? 0 : -8 }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 max-w-xs text-left">
                Déjà rejoint par les premiers commerçants — Rejoignez-vous aussi les pionniers.
              </p>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 pt-2">
              {TRUST.map(({ Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-[#6C47FF] mt-0.5 flex-shrink-0" strokeWidth={1.9} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{label}</p>
                    <p className="text-xs text-gray-500 whitespace-nowrap">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="hidden lg:flex justify-center">
            <div style={{ position: 'relative', width: 520, height: 620 }}>
              {/* Decorative blob */}
              <div
                style={{
                  position: 'absolute',
                  width: 420,
                  height: 420,
                  borderRadius: '50%',
                  background: '#EDE9FF',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 0,
                }}
              />

              {/* Floating card */}
              <HeroCard />

              {/* Handwritten annotation */}
              <div style={{ position: 'absolute', bottom: 16, right: -16, textAlign: 'right', zIndex: 10 }}>
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: 'auto', display: 'block' }}>
                  <path d="M 40 8 C 30 8, 10 20, 8 42" stroke="#6C47FF" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <path d="M 4 40 L 8 42 L 10 38" stroke="#6C47FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#6C47FF', fontSize: 13, lineHeight: 1.4, maxWidth: 160 }}>
                  Toujours dans le<br/>téléphone de vos clients !
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
