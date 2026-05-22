import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <nav className="border-b border-[#E8E8E3] px-6 py-4 bg-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-[#6C47FF]">VanCart</span>
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
      <section className="px-6 py-20 bg-[#F7F6F3]">
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
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Comment ça marche</p>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Opérationnel en 5 minutes</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                step: '01',
                title: 'Créez votre carte de fidélité',
                desc: 'Configurez le nom de votre commerce, votre couleur, votre règle de fidélité (ex : 10 cafés = 1 offert). VanCart génère votre QR code instantanément.',
              },
              {
                step: '02',
                title: 'Vos clients scannent le QR code',
                desc: "Ils entrent leur prénom et numéro de téléphone. Leur carte est créée et ajoutée à leur Apple ou Google Wallet — en 30 secondes.",
              },
              {
                step: '03',
                title: 'Tamponnez en un scan',
                desc: "Depuis votre dashboard, scannez la carte du client. Le compteur s'incrémente. Quand il est plein, la récompense se débloque automatiquement.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5 items-start bg-[#F7F6F3] rounded-2xl p-6 border border-[#E8E8E3]">
                <div className="w-11 h-11 bg-[#6C47FF] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-xs">{step}</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A1A] mb-1">{title}</h3>
                  <p className="text-sm text-[#6B6B6B] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-[#F7F6F3]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-[#6C47FF] font-semibold text-sm uppercase tracking-wide">Tarifs</p>
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Des tarifs simples et transparents</h2>
            <p className="text-[#6B6B6B] text-lg">Commencez gratuitement, payez quand vous voyez les résultats.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* Plan Découverte */}
            <div className="bg-white border border-[#E8E8E3] rounded-2xl p-7 space-y-6">
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
              <Link
                href="/register"
                className="block w-full py-3 border border-[#E8E8E3] text-[#1A1A1A] font-semibold rounded-xl hover:bg-[#F7F6F3] transition-colors text-sm text-center"
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* Plan Essentiel — mis en avant */}
            <div className="bg-white border-2 border-[#6C47FF] rounded-2xl p-7 space-y-6 relative shadow-lg shadow-[#6C47FF]/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <div className="bg-[#6C47FF] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  Le plus populaire
                </div>
              </div>
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
              <Link
                href="/register"
                className="block w-full py-3 bg-[#6C47FF] text-white font-semibold rounded-xl hover:bg-[#5835e0] transition-colors text-sm text-center"
              >
                Choisir Essentiel
              </Link>
            </div>

            {/* Plan Pro */}
            <div className="bg-white border border-[#E8E8E3] rounded-2xl p-7 space-y-6">
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
              <Link
                href="/register"
                className="block w-full py-3 border border-[#E8E8E3] text-[#1A1A1A] font-semibold rounded-xl hover:bg-[#F7F6F3] transition-colors text-sm text-center"
              >
                Choisir Pro
              </Link>
            </div>

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
      <footer className="border-t border-[#E8E8E3] px-6 py-8 text-center text-xs text-[#6B6B6B] space-x-4 bg-white">
        <span>© 2025 VanCart · Cartes de fidélité dématérialisées</span>
        <Link href="/politique-confidentialite" className="hover:text-[#1A1A1A] underline underline-offset-2">
          Politique de confidentialité
        </Link>
      </footer>
    </div>
  )
}
