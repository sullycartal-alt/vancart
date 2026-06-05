import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Trash2, Frown, BarChart3, Smartphone, RefreshCw, BadgeCheck, Zap, ShieldCheck, MessageCircle, Check, X, Rocket } from 'lucide-react'
import PWARedirect from '@/components/pwa/PWARedirect'
import LandingNav from '@/components/landing/LandingNav'
import PricingCards from '@/components/landing/PricingCards'
import { LogoLockup } from '@/components/brand/Logo'
import LandingHero from '@/components/landing/LandingHero'
import DemoCarousel from '@/components/landing/DemoCarousel'

const ScrollingCarousel = dynamic(() => import('@/components/landing/ScrollingCarousel'))
const DashboardDemo = dynamic(() => import('@/components/landing/DashboardDemo'))



export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col">
      <PWARedirect />

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <LandingNav />

      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <LandingHero />

      {/* ── 2. Scrolling merchants bar ───────────────────────────────────── */}
      <ScrollingCarousel />

      {/* ── 3. Demo carousel / Comment ça marche ─────────────────────────── */}
      <div id="comment-ca-marche" style={{ scrollMarginTop: '80px' }}>
        <DemoCarousel />
      </div>

      {/* ── 4. Stats ─────────────────────────────────────────────────────── */}
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
        <div className="max-w-6xl mx-auto">
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
