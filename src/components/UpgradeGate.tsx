import Link from 'next/link'
import { canAccess, type Plan, PLAN_FEATURES } from '@/lib/plan-features'

const PLAN_LABELS: Record<'essential' | 'pro', string> = {
  essential: 'Essentiel',
  pro: 'Pro',
}

const PLAN_PRICES: Record<'essential' | 'pro', string> = {
  essential: '29€/mois',
  pro: '59€/mois',
}

const FEATURE_META: Record<string, { label: string; description: string; benefits: string[] }> = {
  aiAdvisor: {
    label: 'Conseiller IA fidélité',
    description: 'Obtenez des recommandations personnalisées pour optimiser votre programme de fidélité grâce à une IA française.',
    benefits: [
      'Analyse votre commerce et votre programme actuel',
      'Recommande la règle de fidélité idéale',
      'Génère des textes prêts à copier-coller',
      'Disponible 24h/24, 7j/7',
    ],
  },
  advancedStats: {
    label: 'Statistiques avancées',
    description: 'Visualisez en détail les performances de votre programme de fidélité avec des graphiques et indicateurs clés.',
    benefits: [
      'Évolution du nombre de clients semaine par semaine',
      'Tampons distribués par jour et par jour de semaine',
      'Taux de retour et top 5 clients fidèles',
      'Export des données clients',
    ],
  },
  exportData: {
    label: 'Export des données',
    description: 'Exportez la liste de vos clients fidèles pour vos campagnes marketing.',
    benefits: [
      'Export CSV de tous vos clients',
      'Données de contact et historique de visites',
      'Compatible avec tous les outils marketing',
    ],
  },
  appleWallet: {
    label: 'Apple Wallet',
    description: "Proposez à vos clients d'ajouter leur carte de fidélité directement dans Apple Wallet.",
    benefits: [
      'Carte toujours accessible sur iPhone',
      'Mise à jour automatique des tampons',
      'Notifications push lors des récompenses',
    ],
  },
  smsNotifications: {
    label: 'Notifications SMS',
    description: 'Envoyez des SMS automatiques à vos clients lors des récompenses ou pour les relancer.',
    benefits: [
      'SMS automatique à chaque récompense débloquée',
      'Relance des clients inactifs',
      'Personnalisation des messages',
    ],
  },
  multiStore: {
    label: 'Multi-boutique',
    description: 'Gérez plusieurs commerces depuis un seul compte VanCart.',
    benefits: [
      'Tableau de bord centralisé',
      'Programme de fidélité par enseigne',
      'Statistiques consolidées',
    ],
  },
}

interface Props {
  plan: Plan
  feature: keyof typeof PLAN_FEATURES['free']
  requiredPlan: 'essential' | 'pro'
  children: React.ReactNode
}

export default function UpgradeGate({ plan, feature, requiredPlan, children }: Props) {
  if (canAccess(plan, feature)) return <>{children}</>

  const meta = FEATURE_META[feature as string] ?? {
    label: String(feature),
    description: 'Cette fonctionnalité est disponible sur un plan supérieur.',
    benefits: [],
  }
  const planLabel = PLAN_LABELS[requiredPlan]
  const price = PLAN_PRICES[requiredPlan]

  return (
    <div className="relative min-h-[420px]">
      {/* Blurred preview of actual content */}
      <div
        className="pointer-events-none select-none overflow-hidden max-h-[420px]"
        style={{ filter: 'blur(5px)', opacity: 0.45 }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Absolute overlay — covers only the gated feature area */}
      <div className="absolute inset-0 z-20 flex items-center justify-center px-4 rounded-2xl overflow-auto" style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(4px)' }}>
        <div className="bg-white border border-[#E8E8E3] rounded-2xl p-8 text-center space-y-5 w-full max-w-md shadow-2xl">
          <div className="w-14 h-14 bg-[#6C47FF]/10 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-[#6C47FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-[#6C47FF]/10 text-[#6C47FF] text-xs font-semibold px-3 py-1 rounded-full">
              Plan {planLabel}
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">{meta.label}</h2>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">{meta.description}</p>
          </div>

          {meta.benefits.length > 0 && (
            <ul className="text-left space-y-2">
              {meta.benefits.map(b => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-[#1A1A1A]">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-[#6C47FF]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-[#6C47FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-3">
            <div className="text-2xl font-bold text-[#1A1A1A]">{price}</div>
            <Link
              href="/dashboard/upgrade"
              className="block w-full py-3 bg-[#6C47FF] text-white font-semibold rounded-xl hover:bg-[#5835e0] transition-colors text-sm"
            >
              Passer au plan {planLabel} — {price} →
            </Link>
            <Link
              href="/dashboard/upgrade"
              className="block text-xs text-[#6B6B6B] hover:text-[#6C47FF] transition-colors"
            >
              En savoir plus sur les tarifs
            </Link>
            <p className="text-xs text-[#6B6B6B]">Sans engagement · Résiliable à tout moment</p>
          </div>
        </div>
      </div>
    </div>
  )
}
