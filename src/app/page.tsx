import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <nav className="border-b border-[#E8E8E3] px-6 py-4 bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-[#6C47FF]">VanCart</span>
          <div className="hidden sm:flex items-center gap-6">
            <a href="#fonctionnalites" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-medium">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-medium">
              Tarifs
            </a>
            <a href="#faq" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-medium">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-medium">
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-white bg-[#6C47FF] hover:bg-[#5835e0] px-4 py-2 rounded-xl transition-colors"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#F7F6F3] px-6 py-28 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#6C47FF]/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto space-y-7">
          <div className="inline-flex items-center gap-2 bg-[#6C47FF]/10 text-[#6C47FF] text-xs font-semibold px-4 py-1.5 rounded-full border border-[#6C47FF]/15">
            🎴 La carte de fidélité sans plastique, sans app
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-[#1A1A1A] leading-tight">
            Fidélisez vos clients.<br className="hidden sm:block" />
            <span className="text-[#6C47FF]">Sans carte. Sans application.</span>
          </h1>
          <p className="text-lg text-[#6B6B6B] max-w-xl mx-auto leading-relaxed">
            VanCart génère un QR code unique pour votre commerce. Vos clients scannent, collectent des tampons digitaux et reçoivent leurs récompenses — directement dans leur portefeuille mobile.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-[#6C47FF] text-white font-bold rounded-xl hover:bg-[#5835e0] transition-colors shadow-sm text-sm"
            >
              Créer mon compte gratuit →
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 bg-white border border-[#E8E8E3] text-[#1A1A1A] font-semibold rounded-xl hover:bg-[#F7F6F3] transition-colors text-sm"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>
          <p className="text-[#6B6B6B] text-xs">Gratuit · Aucune carte bancaire requise</p>
        </div>
      </section>

      {/* ── Problem ────────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Le problème</p>
          <h2 className="text-3xl font-bold text-[#1A1A1A]">
            Vos clients perdent leurs cartes de fidélité ?
          </h2>
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

      {/* ── Benefits ───────────────────────────────────────────────────────── */}
      <section id="fonctionnalites" className="px-6 py-20 bg-[#F7F6F3]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">La solution</p>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">
              Une carte de fidélité toujours dans la poche de vos clients
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: '📱',
                title: 'Dans Apple & Google Wallet',
                desc: 'La carte vit dans le portefeuille mobile du client — toujours accessible, impossible à perdre.',
              },
              {
                icon: '⚡',
                title: 'Sans application à télécharger',
                desc: "Le client scanne votre QR code avec l'appareil photo. Aucune friction, aucun téléchargement.",
              },
              {
                icon: '🔄',
                title: 'Mise à jour en temps réel',
                desc: 'Chaque tampon donné met automatiquement à jour la carte dans le Wallet du client.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#E8E8E3] bg-white p-7 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className="w-12 h-12 bg-[#6C47FF]/10 rounded-xl flex items-center justify-center text-2xl">
                  {icon}
                </div>
                <h3 className="font-bold text-[#1A1A1A]">{title}</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Comment ça marche</p>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Opérationnel en 5 minutes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                step: '01',
                icon: (
                  <svg className="w-12 h-12 text-[#6C47FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 22V12h6v10" />
                  </svg>
                ),
                title: 'Créez votre compte',
                desc: "Inscrivez-vous en 2 minutes, configurez votre commerce aux couleurs de votre marque.",
              },
              {
                step: '02',
                icon: (
                  <svg className="w-12 h-12 text-[#6C47FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="14" y="3" width="7" height="7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="3" y="14" width="7" height="7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 14h3v3m0 4h4m-4 0v-4m4-4v4" />
                  </svg>
                ),
                title: 'Posez votre QR code en caisse',
                desc: "Téléchargez et imprimez votre QR code unique, posez-le sur votre comptoir.",
              },
              {
                step: '03',
                icon: (
                  <svg className="w-12 h-12 text-[#6C47FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h8M8 11h5" />
                    <rect x="7" y="14" width="10" height="5" rx="1" strokeWidth={1.5} />
                  </svg>
                ),
                title: 'Vos clients scannent',
                desc: "Ils scannent, reçoivent leur carte dans Google ou Apple Wallet instantanément.",
              },
              {
                step: '04',
                icon: (
                  <svg className="w-12 h-12 text-[#6C47FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="16 7 22 7 22 13" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'Fidélisez et analysez',
                desc: "Tamponnez en un clic, suivez vos stats et regardez votre clientèle fidèle grandir.",
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center bg-[#F7F6F3] rounded-2xl p-8 border border-[#E8E8E3] space-y-3">
                <span className="text-xs font-bold text-[#6C47FF] uppercase tracking-widest">Étape {step}</span>
                <div className="w-16 h-16 bg-[#6C47FF]/10 rounded-2xl flex items-center justify-center">
                  {icon}
                </div>
                <h3 className="font-bold text-[#1A1A1A] text-base">{title}</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="tarifs" className="px-6 py-20 bg-[#F7F6F3]">
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
                  <div className="inline-flex items-center bg-[#F7F6F3] text-[#6B6B6B] text-xs font-semibold px-3 py-1 rounded-full border border-[#E8E8E3] mb-3">
                    Commencer
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">Découverte</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-[#1A1A1A]">0€</span>
                    <span className="text-[#6B6B6B] text-sm"> / 1 mois</span>
                  </div>
                  <p className="text-xs text-[#6B6B6B] mt-1">Aucune carte bancaire requise</p>
                </div>
                <ul className="space-y-2.5">
                  {[
                    'QR code + cartes digitales',
                    "Jusqu'à 50 clients",
                    'Dashboard basique',
                    'Google Wallet',
                    'Personnalisation complète',
                    'RDV bilan offert à 30 jours',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#1A1A1A]">
                      <span className="w-4 h-4 rounded-full bg-[#F7F6F3] border border-[#E8E8E3] flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <Link
                  href="/register"
                  className="block w-full py-3 border border-[#E8E8E3] text-[#1A1A1A] font-semibold rounded-xl hover:bg-[#F7F6F3] transition-colors text-sm text-center"
                >
                  Commencer gratuitement
                </Link>
              </div>
            </div>

            {/* Plan Essentiel — mis en avant */}
            <div className="bg-white border-2 border-[#6C47FF] rounded-2xl p-7 flex flex-col relative shadow-lg shadow-[#6C47FF]/10 transition-all duration-200 hover:scale-[1.05] hover:shadow-[0_12px_40px_rgba(108,71,255,0.22)]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <div className="bg-[#6C47FF] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  Le plus populaire
                </div>
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
                  {[
                    'Tout du plan Découverte',
                    "Jusqu'à 500 clients",
                    'Stats avancées',
                    'Conseiller IA 🇫🇷',
                    'Apple Wallet',
                    'Export données clients',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#1A1A1A]">
                      <span className="w-4 h-4 rounded-full bg-[#6C47FF]/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-[#6C47FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <Link
                  href="/register"
                  className="block w-full py-3 bg-[#6C47FF] text-white font-semibold rounded-xl hover:bg-[#5835e0] transition-colors text-sm text-center"
                >
                  Choisir Essentiel
                </Link>
              </div>
            </div>

            {/* Plan Pro */}
            <div className="bg-white border border-[#E8E8E3] rounded-2xl p-7 flex flex-col transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(108,71,255,0.12)]">
              <div className="flex-1 space-y-6">
                <div>
                  <div className="inline-flex items-center bg-[#F7F6F3] text-[#6B6B6B] text-xs font-semibold px-3 py-1 rounded-full border border-[#E8E8E3] mb-3">
                    Pour aller plus loin
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">Pro</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-[#1A1A1A]">49€</span>
                    <span className="text-[#6B6B6B] text-sm"> / mois</span>
                  </div>
                  <p className="text-xs text-[#6B6B6B] mt-1">Sans engagement</p>
                </div>
                <ul className="space-y-2.5">
                  {[
                    'Tout du plan Essentiel',
                    'Clients illimités',
                    'Notifications SMS',
                    'Multi-boutique',
                    'RDV mensuel inclus',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#1A1A1A]">
                      <span className="w-4 h-4 rounded-full bg-[#F7F6F3] border border-[#E8E8E3] flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <Link
                  href="/register"
                  className="block w-full py-3 border border-[#E8E8E3] text-[#1A1A1A] font-semibold rounded-xl hover:bg-[#F7F6F3] transition-colors text-sm text-center"
                >
                  Choisir Pro
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Témoignages</p>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Ils nous font confiance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                initials: 'ML',
                color: '#6C47FF',
                name: 'Marie L.',
                business: 'Café des Arts, Lyon',
                quote: 'Depuis VanCart, mes clients reviennent beaucoup plus régulièrement. La carte dans le téléphone c\'est vraiment pratique, ils ne l\'oublient jamais !',
              },
              {
                initials: 'TB',
                color: '#2563eb',
                name: 'Thomas B.',
                business: 'Bar Le Central, Bordeaux',
                quote: 'Installation en 10 minutes, mes clients adorent. Le QR code sur le comptoir fait toujours son effet.',
              },
              {
                initials: 'SM',
                color: '#16a34a',
                name: 'Sophie M.',
                business: 'The Coffee Lab, Paris',
                quote: 'Le conseiller IA m\'a aidé à trouver la bonne règle de fidélité pour mon coffee shop. Vraiment utile !',
              },
            ].map(({ initials, color, name, business, quote }) => (
              <div key={name} className="bg-[#F7F6F3] border border-[#E8E8E3] rounded-2xl p-6 space-y-4 flex flex-col">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-[#1A1A1A] leading-relaxed italic flex-1">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2 border-t border-[#E8E8E3]">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A]">{name}</p>
                    <p className="text-xs text-[#6B6B6B]">{business}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="px-6 py-20 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">FAQ</p>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'Mes clients doivent-ils télécharger une application ?',
                a: "Non. Vos clients scannent le QR code avec l'appareil photo de leur smartphone. La carte s'ajoute directement dans Apple Wallet ou Google Wallet, sans téléchargement.",
              },
              {
                q: 'Comment fonctionne la période d\'essai ?',
                a: "Vous démarrez avec 30 jours gratuits, sans carte bancaire. Vous pouvez accueillir jusqu'à 50 clients et tester toutes les fonctionnalités du plan Découverte.",
              },
              {
                q: 'Puis-je changer de plan à tout moment ?',
                a: "Oui. Vous pouvez passer à un plan supérieur ou résilier à tout moment, sans engagement ni frais de résiliation.",
              },
              {
                q: 'Comment tamponne-t-on la carte d\'un client ?',
                a: "Depuis votre dashboard, cliquez sur « Tamponner », saisissez le numéro de téléphone du client ou scannez sa carte. Le tampon s'ajoute instantanément.",
              },
              {
                q: 'Les données de mes clients sont-elles sécurisées ?',
                a: "Oui. Vos données sont hébergées en Europe et ne sont jamais revendues. Nous respectons le RGPD et vous restez propriétaire de vos données.",
              },
            ].map(({ q, a }) => (
              <details key={q} className="group bg-[#F7F6F3] border border-[#E8E8E3] rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-[#1A1A1A] text-sm list-none">
                  {q}
                  <svg
                    className="w-4 h-4 text-[#6B6B6B] transition-transform group-open:rotate-180 flex-shrink-0 ml-3"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-[#6B6B6B] leading-relaxed border-t border-[#E8E8E3] pt-3">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-[#F7F6F3] text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-[#1A1A1A]">Prêt à fidéliser vos clients ?</h2>
          <p className="text-[#6B6B6B] text-lg leading-relaxed">
            Rejoignez les commerçants qui ont dit adieu aux cartes en plastique.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-[#6C47FF] text-white font-bold rounded-xl hover:bg-[#5835e0] transition-colors shadow-sm text-base"
          >
            Commencer gratuitement →
          </Link>
          <p className="text-[#6B6B6B] text-xs">Gratuit · Sans engagement · Aucune carte bancaire</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E8E8E3] px-6 py-8 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[#6B6B6B]">© 2026 VanCart · Cartes de fidélité dématérialisées · Projet ESSCA</span>
          <div className="flex items-center gap-4 text-xs text-[#6B6B6B]">
            <Link href="/politique-confidentialite" className="hover:text-[#1A1A1A] underline underline-offset-2">
              Politique de confidentialité
            </Link>
            <Link href="/cgu" className="hover:text-[#1A1A1A] underline underline-offset-2">
              CGU
            </Link>
            <Link href="/mentions-legales" className="hover:text-[#1A1A1A] underline underline-offset-2">
              Mentions légales
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
