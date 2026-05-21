import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-600">VanCart</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 px-6 py-24 text-center">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="relative max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
            🎴 La carte de fidélité sans plastique, sans app
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Fidélisez vos clients.<br className="hidden sm:block" />
            <span className="text-indigo-200">Sans carte. Sans application.</span>
          </h1>
          <p className="text-lg text-indigo-100 max-w-xl mx-auto">
            VanCart génère un QR code unique pour votre commerce. Vos clients scannent, collectent des tampons digitaux et reçoivent leurs récompenses — directement dans leur portefeuille mobile.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg text-sm"
            >
              Créer mon compte gratuit →
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>
          <p className="text-indigo-200 text-xs">Gratuit · Aucune carte bancaire requise</p>
        </div>
      </section>

      {/* ── Problem ────────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Le problème</p>
          <h2 className="text-3xl font-bold text-gray-900">
            Vos clients perdent leurs cartes de fidélité ?
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Les cartes en plastique s&apos;égarent, s&apos;oublient, se froissent. Résultat : vos clients repartent les mains vides, et vous perdez leur fidélité.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
            {[
              { icon: '🗑️', label: '73 % des cartes papier finissent à la poubelle dans le mois' },
              { icon: '😤', label: 'Un client sur deux abandonne quand il oublie sa carte' },
              { icon: '📊', label: 'Aucune donnée sur vos clients les plus fidèles' },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-3">
                <span className="text-2xl">{icon}</span>
                <p className="text-sm text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">La solution</p>
            <h2 className="text-3xl font-bold text-gray-900">
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
                className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl">
                  {icon}
                </div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide">Comment ça marche</p>
            <h2 className="text-3xl font-bold text-gray-900">Opérationnel en 5 minutes</h2>
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
              <div key={step} className="flex gap-5 items-start bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-xs">{step}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-gradient-to-br from-indigo-600 to-violet-600 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-3xl font-extrabold text-white">Prêt à fidéliser vos clients ?</h2>
          <p className="text-indigo-200 text-lg">
            Rejoignez les commerçants qui ont dit adieu aux cartes en plastique.
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg text-base"
          >
            Commencer gratuitement →
          </Link>
          <p className="text-indigo-300 text-xs">Gratuit · Sans engagement · Aucune carte bancaire</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-xs text-gray-400 space-x-4">
        <span>© 2025 VanCart · Cartes de fidélité dématérialisées</span>
        <Link href="/politique-confidentialite" className="hover:text-gray-600 underline underline-offset-2">
          Politique de confidentialité
        </Link>
      </footer>
    </div>
  )
}
