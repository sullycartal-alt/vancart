import Link from 'next/link'

function CheckIcon({ color = '#6C47FF' }: { color?: string }) {
  return (
    <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
      <svg className="w-2.5 h-2.5" fill="none" stroke={color} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  )
}

function PhoneMockup() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Glow */}
      <div className="absolute inset-0 bg-[#6C47FF]/15 rounded-full blur-3xl scale-75" />

      <svg viewBox="0 0 280 480" className="relative w-64 h-auto drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        {/* Phone body */}
        <rect x="20" y="8" width="240" height="464" rx="36" fill="#1A1A1A" />
        <rect x="24" y="12" width="232" height="456" rx="33" fill="#111111" />

        {/* Screen */}
        <rect x="30" y="28" width="220" height="424" rx="26" fill="#F7F6F3" />

        {/* Notch */}
        <rect x="110" y="28" width="60" height="22" rx="11" fill="#1A1A1A" />

        {/* Status bar dots */}
        <circle cx="200" cy="42" r="3" fill="#1A1A1A" opacity="0.3" />
        <circle cx="213" cy="42" r="3" fill="#1A1A1A" opacity="0.3" />
        <circle cx="226" cy="42" r="3" fill="#1A1A1A" opacity="0.3" />

        {/* Wallet card */}
        <rect x="42" y="68" width="196" height="128" rx="16" fill="#6C47FF" />
        <rect x="42" y="68" width="196" height="128" rx="16" fill="url(#cardGrad)" />
        <defs>
          <linearGradient id="cardGrad" x1="42" y1="68" x2="238" y2="196" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B6BFF" />
            <stop offset="100%" stopColor="#5835E0" />
          </linearGradient>
        </defs>

        {/* Card logo area */}
        <rect x="56" y="82" width="32" height="32" rx="8" fill="white" fillOpacity="0.2" />
        <text x="72" y="103" textAnchor="middle" fontSize="16" fill="white">☕</text>

        {/* Card title */}
        <text x="100" y="98" fontSize="11" fontWeight="700" fill="white">Café des Arts</text>
        <text x="100" y="112" fontSize="9" fill="white" fillOpacity="0.75">Carte de fidélité</text>

        {/* Stamp dots */}
        {[0,1,2,3,4].map(i => (
          <g key={i}>
            <circle cx={58 + i * 36} cy={145} r={13} fill={i < 3 ? 'white' : 'none'} stroke="white" strokeWidth="1.5" fillOpacity={i < 3 ? 1 : 0.4} />
            {i < 3 && <text x={58 + i * 36} y={150} textAnchor="middle" fontSize="11" fill="#6C47FF">✓</text>}
          </g>
        ))}

        {/* Card progress */}
        <text x="56" y="178" fontSize="9" fill="white" fillOpacity="0.7">3/10 tampons · 7 restants</text>

        {/* Wallet buttons */}
        <rect x="42" y="206" width="90" height="22" rx="6" fill="#1A1A1A" fillOpacity="0.08" />
        <text x="52" y="221" fontSize="9" fill="#1A1A1A" fillOpacity="0.5">Google Wallet</text>
        <rect x="140" y="206" width="98" height="22" rx="6" fill="#1A1A1A" fillOpacity="0.08" />
        <text x="150" y="221" fontSize="9" fill="#1A1A1A" fillOpacity="0.5">Apple Wallet</text>

        {/* QR section */}
        <rect x="42" y="238" width="196" height="90" rx="12" fill="white" stroke="#E8E8E3" strokeWidth="1" />
        {[[0,0],[2,0],[4,0],[0,2],[4,2],[0,4],[2,4],[4,4],[1,1],[3,3],[2,2]].map(([cx, cy], i) => (
          <rect key={i} x={90 + cx * 8} y={255 + cy * 8} width="6" height="6" rx="1" fill="#1A1A1A" />
        ))}
        <rect x={90} y={255} width="22" height="22" rx="3" fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
        <rect x={112} y={255} width="22" height="22" rx="3" fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
        <rect x={90} y={277} width="22" height="22" rx="3" fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
        <text x="152" y="270" fontSize="8" fill="#1A1A1A" fontWeight="600">Scanner pour</text>
        <text x="152" y="281" fontSize="8" fill="#1A1A1A" fontWeight="600">rejoindre</text>
        <text x="152" y="300" fontSize="7" fill="#6B6B6B">Présentez ce QR</text>
        <text x="152" y="311" fontSize="7" fill="#6B6B6B">à votre caisse</text>

        {/* Notification badge */}
        <rect x="54" y="342" width="172" height="40" rx="10" fill="white" stroke="#E8E8E3" strokeWidth="1" />
        <circle cx="74" cy="362" r="10" fill="#6C47FF" />
        <text x="74" y="366" textAnchor="middle" fontSize="10" fill="white">🎉</text>
        <text x="92" y="357" fontSize="9" fontWeight="700" fill="#1A1A1A">Récompense débloquée !</text>
        <text x="92" y="370" fontSize="8" fill="#6B6B6B">Présentez votre carte</text>

        {/* Bottom nav bar */}
        <rect x="30" y="396" width="220" height="50" rx="0" fill="white" />
        <rect x="30" y="396" width="220" height="1" fill="#E8E8E3" />
        {['🏠','🎴','📊','⚙️'].map((icon, i) => (
          <text key={i} x={65 + i * 54} y="426" textAnchor="middle" fontSize="16" fill={i === 1 ? '#6C47FF' : '#6B6B6B'}>{icon}</text>
        ))}

        {/* Home indicator */}
        <rect x="110" y="456" width="60" height="4" rx="2" fill="#1A1A1A" fillOpacity="0.15" />
      </svg>

      {/* Floating badges — placeholders */}
      <div className="absolute top-6 -right-6 bg-[#F3F4F6] border border-dashed border-[#D1D5DB] rounded-xl px-3 py-2 shadow-sm text-xs italic text-[#9CA3AF] whitespace-nowrap">
        En attente de données
      </div>
      <div className="absolute bottom-20 -left-8 bg-[#F3F4F6] border border-dashed border-[#D1D5DB] rounded-xl px-3 py-2 shadow-sm text-xs italic text-[#9CA3AF] whitespace-nowrap">
        En attente de données
      </div>
      <div className="absolute top-1/2 -left-10 bg-[#F3F4F6] border border-dashed border-[#D1D5DB] rounded-xl px-3 py-2 shadow-sm text-xs italic text-[#9CA3AF] whitespace-nowrap">
        En attente de données
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <nav className="border-b border-[#E8E8E3] px-6 py-4 bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-[#6C47FF]">VanCart</span>
          <div className="hidden sm:flex items-center gap-6">
            <a href="#fonctionnalites" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-medium">Fonctionnalités</a>
            <a href="#comment-ca-marche" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-medium">Comment ça marche</a>
            <a href="#tarifs" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-medium">Tarifs</a>
            <a href="#faq" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-medium">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-medium">Connexion</Link>
            <Link href="/register" className="text-sm font-semibold text-white bg-[#6C47FF] hover:bg-[#5835e0] px-4 py-2 rounded-xl transition-colors">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#F7F6F3] px-6 py-16 sm:py-24">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#6C47FF]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: text */}
            <div className="space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#6C47FF]/10 text-[#6C47FF] text-xs font-semibold px-4 py-1.5 rounded-full border border-[#6C47FF]/15">
                🎴 La carte de fidélité sans plastique, sans app
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-[#1A1A1A] leading-tight">
                Fidélisez vos clients.<br />
                <span className="text-[#6C47FF]">Sans carte. Sans application.</span>
              </h1>
              <p className="text-lg text-[#6B6B6B] max-w-lg leading-relaxed">
                VanCart génère un QR code unique pour votre commerce. Vos clients scannent, collectent des tampons digitaux et reçoivent leurs récompenses — directement dans leur portefeuille mobile.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/register" className="w-full sm:w-auto px-8 py-3.5 bg-[#6C47FF] text-white font-bold rounded-xl hover:bg-[#5835e0] transition-colors shadow-sm text-sm text-center">
                  Créer mon compte gratuit →
                </Link>
                <Link href="/login" className="w-full sm:w-auto px-8 py-3.5 bg-white border border-[#E8E8E3] text-[#1A1A1A] font-semibold rounded-xl hover:bg-[#F7F6F3] transition-colors text-sm text-center">
                  J&apos;ai déjà un compte
                </Link>
              </div>

              {/* Social proof — placeholder */}
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="flex -space-x-2 flex-shrink-0">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="w-8 h-8 rounded-full border-2 border-white bg-[#E5E7EB] flex items-center justify-center text-sm flex-shrink-0">
                      👤
                    </div>
                  ))}
                </div>
                <p className="text-xs italic text-[#9CA3AF]">En attente de données</p>
              </div>

              {/* ── Réassurance bar ── */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1 text-xs text-[#6B6B6B]">
                <span>✓ Sans engagement</span>
                <span className="hidden sm:inline text-[#E8E8E3]">·</span>
                <span>✓ Installation en 5 minutes</span>
                <span className="hidden sm:inline text-[#E8E8E3]">·</span>
                <span>✓ Données hébergées en Europe 🇪🇺</span>
                <span className="hidden sm:inline text-[#E8E8E3]">·</span>
                <span>✓ Support réactif</span>
              </div>
            </div>

            {/* Right: phone mockup */}
            <div className="hidden lg:flex justify-center items-center">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Logos bar — placeholder ────────────────────────────────────────── */}
      <section className="px-6 py-12 bg-white border-b border-[#E8E8E3]">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-widest">
            Adoptés par des commerces de proximité
          </p>
          <div className="flex items-center justify-center px-10 py-6 bg-[#F3F4F6] rounded-2xl border border-dashed border-[#D1D5DB]">
            <p className="text-sm italic text-[#9CA3AF]">🏪 En attente de partenaires</p>
          </div>
        </div>
      </section>

      {/* ── Chiffres clés ──────────────────────────────────────────────────── */}
      <section className="px-6 py-16 bg-[#F7F6F3]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { stat: '67%', desc: "Un client fidèle dépense en moyenne 67 % de plus qu'un nouveau client" },
              { stat: '5×', desc: 'Acquérir un nouveau client coûte 5 fois plus cher que fidéliser un existant' },
              { stat: '10 min', desc: 'Temps moyen pour lancer votre programme de fidélité avec VanCart' },
              { stat: '0', desc: 'Application à télécharger pour vos clients' },
            ].map(({ stat, desc }) => (
              <div key={stat} className="bg-white rounded-2xl border border-[#E8E8E3] p-6 text-center space-y-2 hover:shadow-sm transition-shadow">
                <p className="text-4xl font-black text-[#6C47FF]">{stat}</p>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem ────────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Le problème</p>
          <h2 className="text-3xl font-bold text-[#1A1A1A]">Vos clients perdent leurs cartes de fidélité ?</h2>
          <p className="text-[#6B6B6B] text-lg max-w-xl mx-auto leading-relaxed">
            Les cartes en plastique s&apos;égarent, s&apos;oublient, se froissent. Résultat : vos clients repartent les mains vides, et vous perdez leur fidélité.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
            {[
              { icon: '🗑️', label: '73 % des cartes papier finissent à la poubelle dans le mois' },
              { icon: '😤', label: 'Un client sur deux abandonne quand il oublie sa carte' },
              { icon: '📊', label: 'Aucune donnée sur vos clients les plus fidèles' },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-[#F7F6F3] rounded-xl p-5 border border-[#E8E8E3] flex items-start gap-3">
                <span className="text-2xl">{icon}</span>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison block ───────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-[#F7F6F3]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">La différence</p>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">La fidélité réinventée pour les indépendants</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-red-100 rounded-2xl p-7 space-y-4 shadow-sm">
              <h3 className="font-bold text-[#1A1A1A] text-lg pb-2 border-b border-[#E8E8E3]">Avec les cartes papier</h3>
              {[
                'Cartes perdues ou oubliées à la maison',
                'Jamais utilisées après la 2ème visite',
                'Pas de données clients récupérables',
                'Coût d\'impression récurrent',
              ].map(item => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-red-400 text-base mt-0.5 flex-shrink-0">❌</span>
                  <p className="text-sm text-[#6B6B6B]">{item}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border border-[#6C47FF]/20 rounded-2xl p-7 space-y-4 shadow-sm">
              <h3 className="font-bold text-[#6C47FF] text-lg pb-2 border-b border-[#6C47FF]/15">Avec VanCart</h3>
              {[
                'Toujours dans le téléphone du client',
                'Utilisée à chaque visite automatiquement',
                'Clients fidèles et données temps réel',
                'Statistiques et export inclus',
              ].map(item => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-green-500 text-base mt-0.5 flex-shrink-0">✅</span>
                  <p className="text-sm text-[#1A1A1A]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ───────────────────────────────────────────────────────── */}
      <section id="fonctionnalites" className="px-6 py-20 bg-white" style={{ scrollMarginTop: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">La solution</p>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Une carte de fidélité toujours dans la poche de vos clients</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '📱', title: 'Dans Apple & Google Wallet', desc: 'La carte vit dans le portefeuille mobile du client — toujours accessible, impossible à perdre.' },
              { icon: '⚡', title: 'Sans application à télécharger', desc: "Le client scanne votre QR code avec l'appareil photo. Aucune friction, aucun téléchargement." },
              { icon: '🔄', title: 'Mise à jour en temps réel', desc: 'Chaque tampon donné met automatiquement à jour la carte dans le Wallet du client.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-[#E8E8E3] bg-[#F7F6F3] p-7 shadow-sm hover:shadow-md transition-shadow space-y-3">
                <div className="w-12 h-12 bg-[#6C47FF]/10 rounded-xl flex items-center justify-center text-2xl">{icon}</div>
                <h3 className="font-bold text-[#1A1A1A]">{title}</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="comment-ca-marche" className="px-6 py-20 bg-[#F7F6F3]" style={{ scrollMarginTop: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Comment ça marche</p>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Opérationnel en 5 minutes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                step: '01',
                icon: (<svg className="w-12 h-12 text-[#6C47FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 22V12h6v10" /></svg>),
                title: 'Créez votre compte',
                desc: "Inscrivez-vous en 2 minutes, configurez votre commerce aux couleurs de votre marque.",
              },
              {
                step: '02',
                icon: (<svg className="w-12 h-12 text-[#6C47FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><rect x="14" y="3" width="7" height="7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><rect x="3" y="14" width="7" height="7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 14h3v3m0 4h4m-4 0v-4m4-4v4" /></svg>),
                title: 'Posez votre QR code en caisse',
                desc: "Téléchargez et imprimez votre QR code unique, posez-le sur votre comptoir.",
              },
              {
                step: '03',
                icon: (<svg className="w-12 h-12 text-[#6C47FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h8M8 11h5" /><rect x="7" y="14" width="10" height="5" rx="1" strokeWidth={1.5} /></svg>),
                title: 'Vos clients scannent',
                desc: "Ils scannent, reçoivent leur carte dans Google ou Apple Wallet instantanément.",
              },
              {
                step: '04',
                icon: (<svg className="w-12 h-12 text-[#6C47FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><polyline points="16 7 22 7 22 13" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /></svg>),
                title: 'Fidélisez et analysez',
                desc: "Tamponnez en un clic, suivez vos stats et regardez votre clientèle fidèle grandir.",
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center bg-white rounded-2xl p-8 border border-[#E8E8E3] space-y-3">
                <span className="text-xs font-bold text-[#6C47FF] uppercase tracking-widest">Étape {step}</span>
                <div className="w-16 h-16 bg-[#6C47FF]/10 rounded-2xl flex items-center justify-center">{icon}</div>
                <h3 className="font-bold text-[#1A1A1A] text-base">{title}</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison table ───────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Pourquoi VanCart</p>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">La fidélité, enfin accessible à tous</h2>
          </div>

          {/* Mobile: 3 stacked column cards */}
          {(() => {
            const features = [
              { feature: 'Toujours dans la poche', paper: false, app: true, vancart: true },
              { feature: 'Sans téléchargement', paper: true, app: false, vancart: true },
              { feature: 'Mise à jour en temps réel', paper: false, app: true, vancart: true },
              { feature: 'Installation en 5 min', paper: true, app: false, vancart: true },
              { feature: 'Données hébergées en Europe 🇪🇺', paper: true, app: false, vancart: true },
              { feature: 'Prix accessible', paper: true, app: false, vancart: true },
            ];
            return (
              <>
                <div className="sm:hidden space-y-4">
                  {/* Carte papier card */}
                  <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-[#6B6B6B] text-center">Carte papier</h3>
                    {features.map(({ feature, paper }) => (
                      <div key={feature} className="flex items-center gap-3">
                        <span className="text-base flex-shrink-0">{paper ? '✅' : '❌'}</span>
                        <p className="text-sm text-[#1A1A1A]">{feature}</p>
                      </div>
                    ))}
                  </div>
                  {/* Application card */}
                  <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-[#6B6B6B] text-center">Application</h3>
                    {features.map(({ feature, app }) => (
                      <div key={feature} className="flex items-center gap-3">
                        <span className="text-base flex-shrink-0">{app ? '✅' : '❌'}</span>
                        <p className="text-sm text-[#1A1A1A]">{feature}</p>
                      </div>
                    ))}
                  </div>
                  {/* VanCart card */}
                  <div className="border-2 border-[#6C47FF]/30 rounded-2xl p-5 space-y-3" style={{ background: '#6C47FF0A' }}>
                    <h3 className="text-sm font-bold text-[#6C47FF] text-center">VanCart ✦</h3>
                    {features.map(({ feature, vancart }) => (
                      <div key={feature} className="flex items-center gap-3">
                        <span className="text-base flex-shrink-0">{vancart ? '✅' : '❌'}</span>
                        <p className="text-sm text-[#1A1A1A]">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop: existing table */}
                <div className="hidden sm:block bg-white rounded-2xl border border-[#E8E8E3] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E8E8E3]">
                        <th className="px-5 py-4 text-left text-sm font-semibold text-[#6B6B6B] w-2/5"></th>
                        <th className="px-4 py-4 text-center text-sm font-semibold text-[#6B6B6B]">Carte papier</th>
                        <th className="px-4 py-4 text-center text-sm font-semibold text-[#6B6B6B]">Application</th>
                        <th className="px-4 py-4 text-center rounded-t-none" style={{ background: '#6C47FF0D' }}>
                          <span className="text-sm font-bold text-[#6C47FF]">VanCart ✦</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map(({ feature, paper, app, vancart }, i) => (
                        <tr key={feature} className={`border-b border-[#E8E8E3] last:border-0 ${i % 2 === 0 ? '' : 'bg-[#F7F6F3]/40'}`}>
                          <td className="px-5 py-3.5 text-sm text-[#1A1A1A] font-medium">{feature}</td>
                          <td className="px-4 py-3.5 text-center text-lg">{paper ? '✅' : '❌'}</td>
                          <td className="px-4 py-3.5 text-center text-lg">{app ? '✅' : '❌'}</td>
                          <td className="px-4 py-3.5 text-center text-lg" style={{ background: '#6C47FF0D' }}>
                            {vancart ? '✅' : '❌'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="tarifs" className="px-6 py-20 bg-[#F7F6F3]" style={{ scrollMarginTop: '80px' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Tarifs</p>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Des tarifs simples et transparents</h2>
            <p className="text-[#6B6B6B] text-lg">Commencez gratuitement, payez quand vous voyez les résultats.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

            {/* Plan Découverte */}
            <div className="bg-white border border-[#E8E8E3] rounded-2xl p-7 flex flex-col transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(108,71,255,0.12)]">
              <div className="flex-1 space-y-6">
                <div>
                  <div className="inline-flex items-center bg-[#F7F6F3] text-[#6B6B6B] text-xs font-semibold px-3 py-1 rounded-full border border-[#E8E8E3] mb-3">Commencer</div>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">Découverte</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-[#1A1A1A]">0€</span>
                    <span className="text-[#6B6B6B] text-sm"> / 1 mois</span>
                  </div>
                  <p className="text-xs text-[#6B6B6B] mt-1">Aucune carte bancaire requise</p>
                </div>
                <ul className="space-y-2.5">
                  {["QR code + cartes digitales", "Jusqu'à 50 clients", 'Dashboard basique', 'Google Wallet', 'Personnalisation complète', 'RDV bilan offert à 30 jours'].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#1A1A1A]">
                      <CheckIcon color="#6B6B6B" />{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <Link href="/register" className="block w-full py-3 border border-[#E8E8E3] text-[#1A1A1A] font-semibold rounded-xl hover:bg-[#F7F6F3] transition-colors text-sm text-center">
                  Commencer gratuitement
                </Link>
              </div>
            </div>

            {/* Plan Essentiel */}
            <div className="bg-white border-2 border-[#6C47FF] rounded-2xl p-7 flex flex-col relative shadow-lg shadow-[#6C47FF]/10 transition-all duration-200 hover:scale-[1.05] hover:shadow-[0_12px_40px_rgba(108,71,255,0.22)]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <div className="bg-[#6C47FF] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">Le plus populaire</div>
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">Essentiel</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-[#1A1A1A]">29€</span>
                    <span className="text-[#6B6B6B] text-sm"> / mois</span>
                  </div>
                  <p className="text-xs text-[#6B6B6B] mt-1">Sans engagement</p>
                </div>
                <ul className="space-y-2.5">
                  {["Tout du plan Découverte", "Jusqu'à 500 clients", 'Stats avancées', 'Conseiller IA 🇫🇷', 'Apple Wallet', 'Export données clients'].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#1A1A1A]">
                      <CheckIcon />{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <Link href="/register" className="block w-full py-3 bg-[#6C47FF] text-white font-semibold rounded-xl hover:bg-[#5835e0] transition-colors text-sm text-center">
                  Choisir Essentiel
                </Link>
              </div>
            </div>

            {/* Plan Pro */}
            <div className="bg-white border border-[#E8E8E3] rounded-2xl p-7 flex flex-col transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(108,71,255,0.12)]">
              <div className="flex-1 space-y-6">
                <div>
                  <div className="inline-flex items-center bg-[#F7F6F3] text-[#6B6B6B] text-xs font-semibold px-3 py-1 rounded-full border border-[#E8E8E3] mb-3">Pour aller plus loin</div>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">Pro</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-[#1A1A1A]">59€</span>
                    <span className="text-[#6B6B6B] text-sm"> / mois</span>
                  </div>
                  <p className="text-xs text-[#6B6B6B] mt-1">Sans engagement</p>
                </div>
                <ul className="space-y-2.5">
                  {["Tout du plan Essentiel", 'Clients illimités', 'Notifications SMS', 'Multi-boutique', 'RDV mensuel inclus'].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#1A1A1A]">
                      <CheckIcon color="#6B6B6B" />{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <Link href="/register" className="block w-full py-3 border border-[#E8E8E3] text-[#1A1A1A] font-semibold rounded-xl hover:bg-[#F7F6F3] transition-colors text-sm text-center">
                  Choisir Pro
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Roadmap ────────────────────────────────────────────────────────── */}
      <section id="roadmap" className="px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Roadmap</p>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Bientôt disponible</h2>
            <p className="text-[#6B6B6B] text-lg max-w-xl mx-auto">Nous travaillons sur des fonctionnalités encore plus puissantes pour fidéliser encore mieux vos clients.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🏆',
                title: 'Cartes à paliers',
                desc: 'Récompensez vos clients les plus fidèles avec un système de paliers progressifs. Points cumulables, récompenses croissantes, comme les grandes enseignes.',
                badge: 'Plan Pro · Bientôt',
              },
              {
                icon: '🎯',
                title: 'Défis événementiels',
                desc: 'Créez des challenges limités dans le temps. Le client le plus fidèle du mois remporte une récompense exceptionnelle.',
                badge: 'Plan Pro · Bientôt',
              },
              {
                icon: '📱',
                title: 'Notifications SMS',
                desc: "Alertez vos clients quand leur récompense est débloquée ou lors d'une offre spéciale. Gardez le lien même après la visite.",
                badge: 'Plan Pro · Bientôt',
              },
            ].map(({ icon, title, desc, badge }) => (
              <div key={title} className="bg-[#F7F6F3] border border-[#E8E8E3] rounded-2xl p-6 space-y-4 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#6C47FF]/10 text-[#6C47FF] border border-[#6C47FF]/15">
                    {badge}
                  </span>
                </div>
                <div className="w-12 h-12 bg-[#6C47FF]/8 rounded-2xl flex items-center justify-center text-2xl">{icon}</div>
                <h3 className="font-bold text-[#1A1A1A] text-base pr-24">{title}</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial quote — placeholder ────────────────────────────────── */}
      <section className="px-6 py-20 bg-[#6C47FF]/5">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center gap-4 px-12 py-14 bg-[#F3F4F6] rounded-2xl border border-dashed border-[#D1D5DB]">
          <span className="text-4xl">💬</span>
          <p className="text-base italic text-[#9CA3AF]">En attente de témoignages clients</p>
        </div>
      </section>

      {/* ── Testimonials — placeholders ────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Témoignages</p>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Ils nous font confiance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#F3F4F6] border border-dashed border-[#D1D5DB] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 min-h-[180px]">
                <span className="text-3xl">💬</span>
                <p className="text-sm italic text-[#9CA3AF] text-center">En attente de témoignages clients</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="px-6 py-20 bg-[#F7F6F3]" style={{ scrollMarginTop: '80px' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">FAQ</p>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Mes clients doivent-ils télécharger une application ?', a: "Non. Vos clients scannent le QR code avec l'appareil photo de leur smartphone. La carte s'ajoute directement dans Apple Wallet ou Google Wallet, sans téléchargement." },
              { q: "Comment fonctionne la période d'essai ?", a: "Vous démarrez avec 30 jours gratuits, sans carte bancaire. Vous pouvez accueillir jusqu'à 50 clients et tester toutes les fonctionnalités du plan Découverte." },
              { q: 'Puis-je changer de plan à tout moment ?', a: "Oui. Vous pouvez passer à un plan supérieur ou résilier à tout moment, sans engagement ni frais de résiliation." },
              { q: "Comment tamponne-t-on la carte d'un client ?", a: "Depuis votre dashboard, cliquez sur « Tamponner », saisissez le numéro de téléphone du client ou scannez sa carte. Le tampon s'ajoute instantanément." },
              { q: 'Les données de mes clients sont-elles sécurisées ?', a: "Oui. Vos données sont hébergées en Europe et ne sont jamais revendues. Nous respectons le RGPD et vous restez propriétaire de vos données." },
            ].map(({ q, a }) => (
              <details key={q} className="group bg-white border border-[#E8E8E3] rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-[#1A1A1A] text-sm list-none">
                  {q}
                  <svg className="w-4 h-4 text-[#6B6B6B] transition-transform group-open:rotate-180 flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-[#6B6B6B] leading-relaxed border-t border-[#E8E8E3] pt-3">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard preview ──────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: text */}
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Tableau de bord</p>
                <h2 className="text-3xl font-bold text-[#1A1A1A]">Gardez le contrôle sur votre fidélité</h2>
                <p className="text-[#6B6B6B] leading-relaxed">Suivez la performance de votre programme en temps réel depuis un tableau de bord simple et puissant.</p>
              </div>
              <ul className="space-y-3">
                {[
                  'Nombre de clients et de visites',
                  'Taux de fidélisation',
                  'Récompenses utilisées',
                  'Export de données',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-[#1A1A1A]">
                    <CheckIcon />{item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6C47FF] hover:text-[#5835e0] transition-colors">
                Découvrir le tableau de bord →
              </Link>
            </div>
            {/* Right: dashboard mockup */}
            <div className="bg-[#F7F6F3] rounded-2xl border border-[#E8E8E3] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E3]">
                <span className="text-sm font-bold text-[#1A1A1A]">Tableau de bord</span>
                <span className="text-xs text-[#6B6B6B]">Derniers 30 jours</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Clients actifs', icon: '👥', color: '#6C47FF' },
                  { label: 'Visites', icon: '🏪', color: '#2563eb' },
                  { label: 'Fidélisation', icon: '🔄', color: '#16a34a' },
                  { label: 'Récompenses', icon: '🎁', color: '#d97706' },
                ].map(({ label, icon, color }) => (
                  <div key={label} className="bg-white rounded-xl p-4 space-y-1 border border-[#E8E8E3]">
                    <p className="text-lg">{icon}</p>
                    <div className="h-5 w-14 bg-[#F3F4F6] rounded-md border border-dashed border-[#D1D5DB]" style={{ borderColor: color + '44' }} />
                    <p className="text-xs text-[#6B6B6B]">{label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#E8E8E3]">
                <p className="text-xs font-semibold text-[#6B6B6B] mb-3">Activité des 7 derniers jours</p>
                <div className="flex items-end gap-1.5 h-14">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: '#6C47FF', opacity: 0.25 + (i / 7) * 0.75 }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-[#6C47FF] text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-5xl">🚀</div>
          <h2 className="text-3xl font-bold text-white">Prêt à fidéliser plus de clients ?</h2>
          <p className="text-white/80 text-lg leading-relaxed">Créez votre carte de fidélité gratuitement et soyez opérationnel en 5 minutes.</p>
          <Link href="/register" className="inline-block px-10 py-4 bg-white text-[#6C47FF] font-bold rounded-xl hover:bg-[#F7F6F3] transition-colors shadow-sm text-base">
            Commencer gratuitement →
          </Link>
          <p className="text-white/60 text-xs">Aucune carte bancaire requise · Sans engagement</p>
        </div>
      </section>

      {/* ── Footer complet ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E8E8E3] bg-white px-6 py-12">
        <div className="max-w-5xl mx-auto">

          {/* Reassurance icons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10 pb-10 border-b border-[#E8E8E3]">
            {[
              { icon: '🆓', title: 'Gratuit pour commencer', desc: 'Aucune carte bancaire requise' },
              { icon: '⚡', title: 'Mise en place en 5 minutes', desc: 'Simple, rapide, efficace' },
              { icon: '🔒', title: 'Sécurisé et conforme RGPD', desc: 'Vos données sont protégées' },
              { icon: '💬', title: 'Support réactif', desc: 'Une équipe à votre écoute' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

            {/* Col 1 — Brand */}
            <div className="space-y-3">
              <span className="text-xl font-bold text-[#6C47FF]">VanCart</span>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                La fidélité digitale pour les commerçants indépendants. Propulsé par une IA française 🇫🇷
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#6B6B6B] bg-[#F7F6F3] border border-[#E8E8E3] px-2.5 py-1 rounded-full">
                  🔒 Données hébergées en Europe 🇪🇺
                </span>
              </div>
            </div>

            {/* Col 2 — Produit */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#1A1A1A]">Produit</h4>
              <ul className="space-y-2 text-sm text-[#6B6B6B]">
                <li><a href="#fonctionnalites" className="hover:text-[#6C47FF] transition-colors">Fonctionnalités</a></li>
                <li><a href="#tarifs" className="hover:text-[#6C47FF] transition-colors">Tarifs</a></li>
                <li><a href="#faq" className="hover:text-[#6C47FF] transition-colors">FAQ</a></li>
                <li><a href="#roadmap" className="hover:text-[#6C47FF] transition-colors">Roadmap</a></li>
              </ul>
            </div>

            {/* Col 3 — Légal */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#1A1A1A]">Légal</h4>
              <ul className="space-y-2 text-sm text-[#6B6B6B]">
                <li><Link href="/politique-confidentialite" className="hover:text-[#6C47FF] transition-colors">Politique de confidentialité</Link></li>
                <li><Link href="/cgu" className="hover:text-[#6C47FF] transition-colors">CGU</Link></li>
                <li><Link href="/mentions-legales" className="hover:text-[#6C47FF] transition-colors">Mentions légales</Link></li>
              </ul>
            </div>

            {/* Col 4 — Contact */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#1A1A1A]">Contact</h4>
              <ul className="space-y-2 text-sm text-[#6B6B6B]">
                <li>
                  <a href="mailto:contact@vancart.fr" className="hover:text-[#6C47FF] transition-colors">
                    contact@vancart.fr
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#E8E8E3] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6B6B]">
            <span>© 2026 VanCart · Tous droits réservés</span>
            <span>Données hébergées en Europe 🇪🇺</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
