'use client'

import { useEffect, useState } from 'react'
import ChatClient from './ChatClient'
import UpgradeGate from '@/components/UpgradeGate'
import { type Plan } from '@/lib/plan-features'
import { MessageCircle, Target, BarChart3, Gift, Rocket, Smartphone, Sparkles, HelpCircle } from 'lucide-react'

interface MerchantContext {
  business_name?: string
  loyalty_rule?: string
  stamps_required?: number
  points_required?: number | null
  loyalty_type?: string
}

interface AiStats {
  total_clients: number
  clients_actifs: number
  clients_churn_risk: number
  taux_completion: number
  meilleur_jour: string | null
  ca_estime: number | null
}

type TopicIcon = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>

interface Topic {
  id: string
  Icon: TopicIcon
  label: string
  getWelcome: (ctx: MerchantContext, stats: AiStats | null) => string
  getSystemPrompt: (ctx: MerchantContext, stats: AiStats | null) => string
}

interface TopicGroup {
  label: string
  topics: Topic[]
}

const BASE_SYSTEM = `Tu es un expert en fidélisation client pour petits commerces indépendants (bars, restaurants, coffee shops). Tu conseilles les commerçants de façon chaleureuse, concrète et adaptée à leur réalité terrain. Tu parles toujours en français, de façon simple et directe.

Données clés :
- Un client fidèle dépense en moyenne 67% de plus qu'un nouveau client
- Acquérir un nouveau client coûte 5 à 7 fois plus cher que fidéliser un existant
- Les programmes de fidélité augmentent la fréquence de visite de 20 à 30%`

function merchantCtxBlock(ctx: MerchantContext): string {
  if (!ctx.business_name) return ''
  const isPoints = ctx.loyalty_type === 'points'
  return `\n\nCommerce : **${ctx.business_name}**
Règle actuelle : ${ctx.loyalty_rule || 'non définie'}
Programme : ${isPoints ? 'Points' : 'Tampons'} (${isPoints ? ctx.points_required ?? '?' : ctx.stamps_required ?? '?'} requis pour une récompense)`
}

function statsBlock(stats: AiStats): string {
  const lines = [
    `Clients inscrits : ${stats.total_clients}`,
    `Clients actifs (90j) : ${stats.clients_actifs}`,
    `Clients à risque : ${stats.clients_churn_risk}`,
    `Taux de complétion : ${stats.taux_completion}%`,
  ]
  if (stats.meilleur_jour) lines.push(`Meilleur jour : ${stats.meilleur_jour}`)
  if (stats.ca_estime) lines.push(`CA mensuel estimé : ${stats.ca_estime} €`)
  return '\n\nDonnées du programme :\n' + lines.map(l => `- ${l}`).join('\n')
}

const TOPIC_GROUPS: TopicGroup[] = [
  {
    label: 'Mon programme',
    topics: [
      {
        id: 'programme',
        Icon: Target,
        label: 'Mon programme',
        getWelcome: (ctx) =>
          ctx.business_name
            ? `Parlons de votre programme chez **${ctx.business_name}** ! Je peux vous aider à choisir entre tampons et points, ajuster le nombre requis, rédiger votre règle, ou optimiser vos récompenses.`
            : "Parlons de votre programme de fidélité ! Je peux vous aider à choisir entre tampons et points, définir le bon nombre, rédiger votre règle, ou optimiser vos récompenses.",
        getSystemPrompt: (ctx) =>
          `${BASE_SYSTEM}${merchantCtxBlock(ctx)}\n\nSpécialité : optimisation des programmes de fidélité. Utilise du Markdown pour structurer tes réponses (gras, listes, ##).`,
      },
      {
        id: 'recompenses',
        Icon: Gift,
        label: 'Mes récompenses',
        getWelcome: () =>
          "Optimisons vos récompenses ! La bonne récompense peut doubler votre taux de fidélisation. Dites-moi ce que vous proposez actuellement et je vous suggèrerai des améliorations.",
        getSystemPrompt: (ctx) =>
          `${BASE_SYSTEM}${merchantCtxBlock(ctx)}\n\nSpécialité : stratégies de récompenses pour petits commerces. Propose des idées concrètes et économiquement viables. Markdown ok pour les listes.`,
      },
    ],
  },
  {
    label: 'Mes clients',
    topics: [
      {
        id: 'attirer',
        Icon: Rocket,
        label: 'Attirer des clients',
        getWelcome: () =>
          "Parlons acquisition ! Je vais vous aider à trouver des stratégies concrètes pour attirer de nouveaux clients et les inciter à rejoindre votre programme — sans budget publicitaire énorme.",
        getSystemPrompt: (ctx) =>
          `${BASE_SYSTEM}${merchantCtxBlock(ctx)}\n\nSpécialité : acquisition client pour petits commerces, stratégies à faible coût. Markdown ok.`,
      },
      {
        id: 'digital',
        Icon: Smartphone,
        label: 'Fidélité digitale',
        getWelcome: () =>
          "La fidélité digitale, c'est votre avantage concurrentiel ! Je peux vous expliquer comment utiliser votre carte VanCart, les wallets Google et Apple, et comment communiquer avec vos clients.",
        getSystemPrompt: (ctx) =>
          `${BASE_SYSTEM}${merchantCtxBlock(ctx)}\n\nSpécialité : fidélité digitale, wallets mobiles (Google Pay, Apple Wallet), cartes NFC, communication client. Markdown ok.`,
      },
    ],
  },
  {
    label: 'Mes résultats',
    topics: [
      {
        id: 'stats',
        Icon: BarChart3,
        label: 'Comprendre mes stats',
        getWelcome: (ctx, stats) => {
          if (!stats || stats.total_clients === 0) {
            return "Analysons vos résultats ! Partagez-moi vos chiffres — nombre de clients, taux de retour, tampons distribués — et je vous aide à les interpréter et identifier des axes d'amélioration."
          }
          const lines = [
            `Voici un aperçu de votre programme **${ctx.business_name ?? 'VanCart'}** :`,
            '',
            `- **${stats.total_clients} clients** inscrits au total`,
            `- **${stats.clients_actifs} actifs** ces 90 derniers jours`,
            `- **${stats.taux_completion}%** ont déjà complété une carte`,
          ]
          if (stats.meilleur_jour) lines.push(`- Meilleur jour de fréquentation : **${stats.meilleur_jour}**`)
          if (stats.clients_churn_risk > 0) lines.push(`- **${stats.clients_churn_risk} clients** à risque de churn`)
          lines.push('', 'Que voulez-vous analyser ?')
          return lines.join('\n')
        },
        getSystemPrompt: (ctx, stats) =>
          `${BASE_SYSTEM}${merchantCtxBlock(ctx)}${stats ? statsBlock(stats) : ''}\n\nSpécialité : analyse de données de fidélité, interprétation de métriques. Utilise du Markdown (##, gras, listes) pour structurer tes analyses.`,
      },
      {
        id: 'conseils',
        Icon: Sparkles,
        label: 'Conseils cette semaine',
        getWelcome: (ctx, stats) => {
          if (!stats || stats.total_clients === 0) {
            return "Bonjour ! Je suis prêt à vous donner des conseils actionnables pour cette semaine. Parlez-moi de vos défis actuels et je vous proposerai des actions concrètes."
          }
          const advice: string[] = []
          if (stats.clients_churn_risk > 0) {
            advice.push(`**1. Réactiver ${stats.clients_churn_risk} client${stats.clients_churn_risk > 1 ? 's' : ''} à risque** — proposez une offre spéciale`)
          }
          if (stats.meilleur_jour) {
            advice.push(`**${advice.length + 1}. Capitaliser sur le ${stats.meilleur_jour}** — votre meilleur jour, préparez une animation`)
          }
          if (stats.taux_completion < 30) {
            advice.push(`**${advice.length + 1}. Booster le taux de complétion (${stats.taux_completion}%)** — réduisez le nombre de tampons requis ou communiquez sur la récompense`)
          } else if (stats.taux_completion > 60) {
            advice.push(`**${advice.length + 1}. Excellents résultats (${stats.taux_completion}% de complétion)** — pensez à augmenter la valeur de la récompense`)
          }
          if (advice.length === 0) {
            advice.push('**1. Continuez sur votre lancée !** Vos métriques sont solides')
          }
          return `Voici vos priorités pour cette semaine chez **${ctx.business_name ?? 'votre commerce'}** :\n\n${advice.join('\n')}\n\nPar quelle priorité voulez-vous commencer ?`
        },
        getSystemPrompt: (ctx, stats) =>
          `${BASE_SYSTEM}${merchantCtxBlock(ctx)}${stats ? statsBlock(stats) : ''}\n\nSpécialité : conseils hebdomadaires actionnables pour petits commerces. Donne 3 à 5 actions concrètes pour la semaine. Utilise du Markdown (listes numérotées, gras pour les titres d'actions).`,
      },
    ],
  },
  {
    label: 'Aide VanCart',
    topics: [
      {
        id: 'faq',
        Icon: HelpCircle,
        label: 'Questions sur VanCart',
        getWelcome: () =>
          "Une question sur VanCart ? Je suis là pour vous aider à configurer votre carte, utiliser les wallets, gérer vos clients ou comprendre les fonctionnalités. Posez votre question !",
        getSystemPrompt: () =>
          `Tu es le support technique et commercial de VanCart, une app de cartes de fidélité digitales. Tu réponds aux questions sur les fonctionnalités (tampons, points, wallets Google/Apple, QR codes, statistiques), la configuration du programme, et les plans tarifaires (Découverte gratuit, Essentiel à tarif à définir, Pro à tarif à définir). Tu parles en français, de façon claire et bienveillante. Réponses en texte simple sans Markdown.`,
      },
      {
        id: 'general',
        Icon: MessageCircle,
        label: 'Discuter librement',
        getWelcome: () =>
          "Bonjour ! Je suis votre conseiller fidélité VanCart. Posez-moi n'importe quelle question sur votre programme, vos clients ou votre stratégie de fidélisation.",
        getSystemPrompt: (ctx) =>
          `${BASE_SYSTEM}${merchantCtxBlock(ctx)}\n\nMode conversation libre. Réponds en texte naturel et simple.`,
      },
    ],
  },
]

// Flat list for mobile tabs and lookup
const ALL_TOPICS: Topic[] = TOPIC_GROUPS.flatMap(g => g.topics)

interface Props {
  plan: Plan
  merchantContext: MerchantContext
  businessName?: string
}

export default function AccompagnementLayout({ plan, merchantContext, businessName }: Props) {
  const [activeTopicId, setActiveTopicId] = useState(ALL_TOPICS[0].id)
  const [aiStats, setAiStats] = useState<AiStats | null>(null)

  useEffect(() => {
    fetch('/api/ai-context')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.stats) setAiStats(data.stats) })
      .catch(() => {})
  }, [])

  const activeTopic = ALL_TOPICS.find(t => t.id === activeTopicId) ?? ALL_TOPICS[0]
  const welcome = activeTopic.getWelcome(merchantContext, aiStats)
  const systemPrompt = activeTopic.getSystemPrompt(merchantContext, aiStats)

  return (
    <div className="-my-6 -mx-4 sm:-mx-6 lg:-mx-8 flex h-[calc(100dvh-64px)]">

      {/* Sidebar — desktop only */}
      <aside className="hidden sm:flex flex-col w-56 border-r border-[#E8E8E3] bg-white flex-shrink-0">
        <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-4 space-y-4">
          {TOPIC_GROUPS.map(group => (
            <div key={group.label}>
              <p className="px-2 mb-1 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.topics.map(topic => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setActiveTopicId(topic.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                      activeTopicId === topic.id
                        ? 'bg-[#6C47FF]/10 text-[#6C47FF]'
                        : 'text-[#6B6B6B] hover:bg-[#F7F6F3] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <topic.Icon size={15} strokeWidth={1.9} className="flex-shrink-0" />
                    <span className="leading-tight text-[13px]">{topic.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-[#E8E8E3]">
          <div className="flex items-center gap-1.5 text-[10px] text-[#9CA3AF]">
            <span>🇫🇷</span>
            <span>IA française — données en Europe</span>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Mobile horizontal tabs */}
        <div className="sm:hidden flex items-center gap-1 px-3 py-2 border-b border-[#E8E8E3] bg-white overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
          {ALL_TOPICS.map(topic => (
            <button
              key={topic.id}
              type="button"
              onClick={() => setActiveTopicId(topic.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTopicId === topic.id
                  ? 'bg-[#6C47FF] text-white'
                  : 'bg-[#F7F6F3] text-[#6B6B6B]'
              }`}
            >
              <topic.Icon size={14} strokeWidth={1.9} className="flex-shrink-0" />
              <span>{topic.label}</span>
            </button>
          ))}
        </div>

        {/* Chat */}
        <div className="flex-1 min-h-0 p-4 sm:p-5 flex flex-col gap-3">
          {businessName && (
            <div className="bg-[#6C47FF]/8 border border-[#6C47FF]/20 rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-shrink-0">
              <Sparkles size={16} strokeWidth={1.9} className="text-[#6C47FF] flex-shrink-0" />
              <p className="text-sm text-[#6C47FF] font-medium">
                L&apos;IA connaît votre commerce <strong>{businessName}</strong> et votre programme actuel.
              </p>
            </div>
          )}

          <UpgradeGate plan={plan} feature="aiAdvisor" requiredPlan="pro">
            <ChatClient
              key={`${activeTopicId}-${aiStats ? 'loaded' : 'loading'}`}
              merchantContext={merchantContext}
              initialWelcome={welcome}
              systemPrompt={systemPrompt}
            />
          </UpgradeGate>
        </div>
      </div>
    </div>
  )
}
