import Link from 'next/link'
import dynamic from 'next/dynamic'
import { WalletCards, Trash2, Frown, BarChart3, Smartphone, RefreshCw, BadgeCheck, Zap, ShieldCheck, MessageCircle, Check, X, Gift, Rocket } from 'lucide-react'
import PWARedirect from '@/components/pwa/PWARedirect'
import LandingNav from '@/components/landing/LandingNav'
import PricingCards from '@/components/landing/PricingCards'
import { LogoLockup } from '@/components/brand/Logo'

const ScrollingCarousel = dynamic(() => import('@/components/landing/ScrollingCarousel'))
const DashboardDemo = dynamic(() => import('@/components/landing/DashboardDemo'))


function DashboardPreview() {
  return (
    <div className="relative select-none w-full max-w-md mx-auto lg:mx-0">
      <div className="absolute -inset-6 bg-[#6C47FF]/6 rounded-3xl blur-2xl pointer-events-none" />
      <div className="relative bg-white rounded-2xl border border-[#E8E8E3] overflow-hidden shadow-md">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E8E8E3] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6C47FF] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">CA</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">Café des Arts</p>
              <p className="text-xs text-[#6B6B6B]">Dashboard fidélité</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100">En ligne</span>
        </div>

        {/* KPI grid */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            { label: 'Clients fidèles', value: '124', sub: '+8 ce mois', color: '#6C47FF' },
            { label: 'Taux de retour', value: '68%', sub: '+5 pts vs mois dernier', color: '#10B981' },
            { label: 'Récompenses', value: '23', sub: 'distribuées ce mois', color: '#F59E0B' },
            { label: 'Tampons cette sem.', value: '47', sub: 'vs 39 la semaine passée', color: '#6C47FF' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-[#F7F6F3] rounded-xl p-3.5 border border-[#E8E8E3]">
              <p className="text-[10px] text-[#6B6B6B] mb-1">{label}</p>
              <p className="text-2xl font-bold leading-none" style={{ color }}>{value}</p>
              <p className="text-[10px] text-[#6B6B6B] mt-1 leading-snug">{sub}</p>
            </div>
          ))}
        </div>

        {/* Quick stamp row */}
        <div className="px-4 pb-4">
          <div className="bg-[#F7F6F3] rounded-xl p-3.5 border border-[#E8E8E3] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-[#6C47FF] rounded-lg flex items-center justify-center flex-shrink-0">
                <Check size={14} strokeWidth={2.5} color="white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1A1A1A]">Tamponner un client</p>
                <p className="text-[10px] text-[#6B6B6B]">Saisir n° ou scanner le QR code</p>
              </div>
            </div>
            <div className="w-7 h-7 bg-[#6C47FF] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Loyalty card preview strip */}
        <div className="px-4 pb-4">
          <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #7C5CFC 0%, #5835E0 100%)' }}>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-white/70">Carte active · Marie L.</p>
                <p className="text-sm font-bold text-white mt-0.5">5 / 9 tampons</p>
              </div>
              <div className="flex gap-1.5">
                {[0,1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: i < 5 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.22)',
                    border: i < 5 ? 'none' : '1px solid rgba(255,255,255,0.35)',
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col">
      <PWARedirect />

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <LandingNav />

      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#F7F6F3] px-4 sm:px-6 py-16 sm:py-24">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#6C47FF]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#6C47FF]/10 text-[#6C47FF] text-xs font-semibold px-4 py-1.5 rounded-full border border-[#6C47FF]/15">
                <WalletCards size={14} strokeWidth={1.9} className="flex-shrink-0" /> La carte de fidélité sans plastique, sans app
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
                <Link href="/login" className="w-full sm:w-auto text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors text-center py-3.5">
                  J&apos;ai déjà un compte
                </Link>
              </div>

              {/* Trust line */}
              <div className="flex flex-col items-center lg:items-start gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2 flex-shrink-0">
                    {[
                      { initials: 'JD', bg: '#6C47FF' },
                      { initials: 'ML', bg: '#10B981' },
                      { initials: 'SC', bg: '#F59E0B' },
                      { initials: 'AR', bg: '#EF4444' },
                    ].map(({ initials, bg }) => (
                      <div
                        key={initials}
                        className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: bg }}
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">+124 commerçants nous font confiance</p>
                </div>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1 text-xs text-[#6B6B6B]">
                  <span>✓ Sans engagement</span>
                  <span className="hidden sm:inline text-[#D1D5DB]">·</span>
                  <span>✓ 5 minutes pour démarrer</span>
                  <span className="hidden sm:inline text-[#D1D5DB]">·</span>
                  <span>✓ Données hébergées en Europe 🇪🇺</span>
                </div>
              </div>
            </div>

            {/* Right: dashboard preview */}
            <div className="hidden lg:block">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Stats ─────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-16 bg-[#F7F6F3]">
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

      {/* ── 3. Scrolling carousel ─────────────────────────────────────────── */}
      <ScrollingCarousel />

      {/* ── 4. Problem ───────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Le problème</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">Vos clients perdent leurs cartes de fidélité ?</h2>
          <p className="text-[#6B6B6B] text-lg max-w-xl mx-auto leading-relaxed">
            Les cartes en plastique s&apos;égarent, s&apos;oublient, se froissent. Résultat : vos clients repartent les mains vides, et vous perdez leur fidélité.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
            {([
              { Icon: Trash2, label: '73 % des cartes papier finissent à la poubelle dans le mois' },
              { Icon: Frown, label: 'Un client sur deux abandonne quand il oublie sa carte' },
              { Icon: BarChart3, label: 'Aucune donnée sur vos clients les plus fidèles' },
            ] as { Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; label: string }[]).map(({ Icon, label }) => (
              <div key={label} className="bg-[#F7F6F3] rounded-xl p-5 border border-[#E8E8E3] flex items-start gap-3">
                <Icon size={24} strokeWidth={1.9} className="text-[#6C47FF] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Comment ça marche ─────────────────────────────────────────── */}
      <section id="comment-ca-marche" className="px-4 sm:px-6 py-20 bg-[#F7F6F3]" style={{ scrollMarginTop: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Comment ça marche</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">Opérationnel en 5 minutes</h2>
          </div>

          {/* Mobile: horizontal scroll snapping */}
          <div
            className="md:hidden overflow-x-auto pb-4"
            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
          >
            <div className="flex gap-4" style={{ width: 'max-content', paddingLeft: 4, paddingRight: 4 }}>
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
                <div
                  key={step}
                  className="flex flex-col items-center text-center bg-white rounded-2xl p-8 border border-[#E8E8E3] space-y-3 flex-shrink-0"
                  style={{ width: 280, scrollSnapAlign: 'center' }}
                >
                  <span className="text-xs font-bold text-[#6C47FF] uppercase tracking-widest">Étape {step}</span>
                  <div className="w-16 h-16 bg-[#6C47FF]/10 rounded-2xl flex items-center justify-center">{icon}</div>
                  <h3 className="font-bold text-[#1A1A1A] text-base">{title}</h3>
                  <p className="text-sm text-[#6B6B6B] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="md:hidden text-center text-xs text-gray-400 mt-2">← Faites défiler →</p>

          {/* Desktop: 2×2 grid */}
          <div className="hidden md:grid grid-cols-2 gap-6">
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

      {/* ── 6. Pourquoi VanCart — features + comparison merged ───────────── */}
      <section id="fonctionnalites" className="px-4 sm:px-6 py-20 bg-white" style={{ scrollMarginTop: '80px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Pourquoi VanCart</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">La fidélité, enfin accessible à tous</h2>
            <p className="text-[#6B6B6B] text-base max-w-lg mx-auto leading-relaxed">
              Une carte toujours dans la poche de vos clients, sans plastique ni application à installer.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {([
              {
                Icon: Smartphone,
                title: 'Dans Apple & Google Wallet, sans installation',
                desc: 'Le client scanne le QR code en caisse, la carte apparaît dans son portefeuille mobile. Aucun téléchargement, aucune friction.',
              },
              {
                Icon: RefreshCw,
                title: 'Mise à jour en temps réel',
                desc: 'Chaque tampon donné met automatiquement à jour la carte dans le Wallet du client.',
              },
              {
                Icon: BarChart3,
                title: 'Statistiques et données clients',
                desc: "Suivez vos clients les plus fidèles, votre taux de retour et l'efficacité de votre programme depuis votre dashboard.",
              },
            ] as { Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; title: string; desc: string }[]).map(({ Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-[#E8E8E3] bg-[#F7F6F3] p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
                <div className="w-11 h-11 bg-[#6C47FF]/10 rounded-xl flex items-center justify-center">
                  <Icon size={22} strokeWidth={1.9} className="text-[#6C47FF]" />
                </div>
                <h3 className="font-bold text-[#1A1A1A] text-sm leading-snug">{title}</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison */}
          {(() => {
            const features = [
              { feature: 'Toujours dans la poche', paper: false, app: true, vancart: true },
              { feature: 'Sans téléchargement', paper: true, app: false, vancart: true },
              { feature: 'Mise à jour en temps réel', paper: false, app: true, vancart: true },
              { feature: 'Installation en 5 min', paper: true, app: false, vancart: true },
              { feature: 'Prix accessible', paper: true, app: false, vancart: true },
            ]
            return (
              <>
                {/* Mobile stacked cards */}
                <div className="sm:hidden space-y-3">
                  <div className="bg-[#F7F6F3] border border-[#E8E8E3] rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-[#6B6B6B] text-center">Carte papier</h3>
                    {features.map(({ feature, paper }) => (
                      <div key={feature} className="flex items-center gap-3">
                        {paper ? <Check size={16} strokeWidth={1.9} className="text-green-500 flex-shrink-0" /> : <X size={16} strokeWidth={1.9} className="text-red-400 flex-shrink-0" />}
                        <p className="text-sm text-[#1A1A1A]">{feature}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#F7F6F3] border border-[#E8E8E3] rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-[#6B6B6B] text-center">Application mobile</h3>
                    {features.map(({ feature, app }) => (
                      <div key={feature} className="flex items-center gap-3">
                        {app ? <Check size={16} strokeWidth={1.9} className="text-green-500 flex-shrink-0" /> : <X size={16} strokeWidth={1.9} className="text-red-400 flex-shrink-0" />}
                        <p className="text-sm text-[#1A1A1A]">{feature}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-2 border-[#6C47FF]/25 rounded-2xl p-5 space-y-3" style={{ background: '#6C47FF0A' }}>
                    <h3 className="text-sm font-bold text-[#6C47FF] text-center">VanCart ✦</h3>
                    {features.map(({ feature, vancart }) => (
                      <div key={feature} className="flex items-center gap-3">
                        {vancart ? <Check size={16} strokeWidth={1.9} className="text-green-500 flex-shrink-0" /> : <X size={16} strokeWidth={1.9} className="text-red-400 flex-shrink-0" />}
                        <p className="text-sm text-[#1A1A1A]">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block bg-[#F7F6F3] rounded-2xl border border-[#E8E8E3] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E8E8E3]">
                        <th className="px-5 py-4 text-left text-sm font-semibold text-[#6B6B6B] w-2/5"></th>
                        <th className="px-4 py-4 text-center text-sm font-semibold text-[#6B6B6B]">Carte papier</th>
                        <th className="px-4 py-4 text-center text-sm font-semibold text-[#6B6B6B]">Application</th>
                        <th className="px-4 py-4 text-center" style={{ background: '#6C47FF0D' }}>
                          <span className="text-sm font-bold text-[#6C47FF]">VanCart ✦</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map(({ feature, paper, app, vancart }, i) => (
                        <tr key={feature} className={`border-b border-[#E8E8E3] last:border-0 ${i % 2 === 0 ? 'bg-white' : ''}`}>
                          <td className="px-5 py-3.5 text-sm text-[#1A1A1A] font-medium">{feature}</td>
                          <td className="px-4 py-3.5 text-center">{paper ? <Check size={16} strokeWidth={1.9} className="text-green-500 mx-auto" /> : <X size={16} strokeWidth={1.9} className="text-red-400 mx-auto" />}</td>
                          <td className="px-4 py-3.5 text-center">{app ? <Check size={16} strokeWidth={1.9} className="text-green-500 mx-auto" /> : <X size={16} strokeWidth={1.9} className="text-red-400 mx-auto" />}</td>
                          <td className="px-4 py-3.5 text-center" style={{ background: '#6C47FF0D' }}>
                            {vancart ? <Check size={16} strokeWidth={1.9} className="text-green-500 mx-auto" /> : <X size={16} strokeWidth={1.9} className="text-red-400 mx-auto" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )
          })()}
        </div>
      </section>

      {/* ── 7. Dashboard demo (interactive) ──────────────────────────────── */}
      <DashboardDemo />

      {/* ── 8. Pricing ───────────────────────────────────────────────────── */}
      <section id="tarifs" className="px-4 sm:px-6 py-20 bg-[#F7F6F3]" style={{ scrollMarginTop: '80px' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Tarifs</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">Des tarifs simples et transparents</h2>
            <p className="text-[#6B6B6B] text-lg">1 mois gratuit pour tester, puis on échange ensemble.</p>
          </div>
          <PricingCards />
        </div>
      </section>

      {/* ── 9. FAQ ───────────────────────────────────────────────────────── */}
      <section id="faq" className="px-4 sm:px-6 py-20 bg-white" style={{ scrollMarginTop: '80px' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">FAQ</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Mes clients doivent-ils télécharger une application ?', a: "Non. Vos clients scannent le QR code avec l'appareil photo de leur smartphone. La carte s'ajoute directement dans Apple Wallet ou Google Wallet, sans téléchargement." },
              { q: "Comment fonctionne la période d'essai ?", a: "Vous démarrez avec 1 mois gratuit, sans carte bancaire. Vous pouvez accueillir jusqu'à 50 clients et tester toutes les fonctionnalités du plan Découverte. À la fin du mois, on échange ensemble sur votre expérience — sans engagement." },
              { q: 'Puis-je changer de plan à tout moment ?', a: "Oui. Vous pouvez passer à un plan supérieur ou résilier à tout moment, sans engagement ni frais de résiliation." },
              { q: "Comment tamponne-t-on la carte d'un client ?", a: "Depuis votre dashboard, cliquez sur « Tamponner », saisissez le numéro de téléphone du client ou scannez sa carte. Le tampon s'ajoute instantanément." },
              { q: 'Les données de mes clients sont-elles sécurisées ?', a: "Oui. Vos données sont hébergées en Europe et ne sont jamais revendues. Nous respectons le RGPD et vous restez propriétaire de vos données." },
            ].map(({ q, a }) => (
              <details key={q} className="group bg-[#F7F6F3] border border-[#E8E8E3] rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-[#1A1A1A] text-sm list-none">
                  {q}
                  <svg className="w-4 h-4 text-[#6B6B6B] transition-transform group-open:rotate-180 flex-shrink-0 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-[#6B6B6B] leading-relaxed border-t border-[#E8E8E3] pt-3 bg-white">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. Final CTA ────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-20 bg-[#6C47FF] text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex justify-center"><Rocket size={48} strokeWidth={1.9} className="text-white" /></div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Prêt à fidéliser plus de clients ?</h2>
          <p className="text-white/80 text-lg leading-relaxed">Créez votre carte de fidélité gratuitement et soyez opérationnel en 5 minutes.</p>
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-full border border-white/20">
            Places limitées — RDV bilan offert à 30 jours
          </div>
          <div>
            <Link href="/register" className="inline-block px-10 py-4 bg-white text-[#6C47FF] font-bold rounded-xl hover:bg-[#F7F6F3] transition-colors shadow-sm text-base">
              Commencer gratuitement →
            </Link>
          </div>
          <p className="text-white/60 text-xs">Aucune carte bancaire requise · Sans engagement</p>
        </div>
      </section>

      {/* ── 11. Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E8E8E3] bg-white px-4 sm:px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10 pb-10 border-b border-[#E8E8E3]">
            {([
              { Icon: BadgeCheck, title: 'Gratuit pour commencer', desc: 'Aucune carte bancaire requise' },
              { Icon: Zap, title: 'Mise en place en 5 minutes', desc: 'Simple, rapide, efficace' },
              { Icon: ShieldCheck, title: 'Sécurisé et conforme RGPD', desc: 'Vos données sont protégées' },
              { Icon: MessageCircle, title: 'Support réactif', desc: 'Une équipe à votre écoute' },
            ] as { Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; title: string; desc: string }[]).map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <Icon size={24} strokeWidth={1.9} className="text-[#6C47FF] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3">
              <LogoLockup size={28} />
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                La fidélité digitale pour les commerçants indépendants. Propulsé par une IA française 🇫🇷
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#6B6B6B] bg-[#F7F6F3] border border-[#E8E8E3] px-2.5 py-1 rounded-full">
                  <ShieldCheck size={12} strokeWidth={1.9} className="inline-block mr-1" />Données hébergées en Europe 🇪🇺
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#1A1A1A]">Produit</h4>
              <ul className="space-y-2 text-sm text-[#6B6B6B]">
                <li><a href="#fonctionnalites" className="hover:text-[#6C47FF] transition-colors">Fonctionnalités</a></li>
                <li><a href="#tarifs" className="hover:text-[#6C47FF] transition-colors">Tarifs</a></li>
                <li><a href="#faq" className="hover:text-[#6C47FF] transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#1A1A1A]">Légal</h4>
              <ul className="space-y-2 text-sm text-[#6B6B6B]">
                <li><Link href="/politique-confidentialite" className="hover:text-[#6C47FF] transition-colors">Politique de confidentialité</Link></li>
                <li><Link href="/cgu" className="hover:text-[#6C47FF] transition-colors">CGU</Link></li>
                <li><Link href="/mentions-legales" className="hover:text-[#6C47FF] transition-colors">Mentions légales</Link></li>
              </ul>
            </div>
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
