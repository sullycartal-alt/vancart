'use client'

import { useState } from 'react'
import ChatClient from './ChatClient'
import UpgradeGate from '@/components/UpgradeGate'
import { type Plan } from '@/lib/plan-features'

interface MerchantContext {
  business_name?: string
  loyalty_rule?: string
  stamps_required?: number
  points_required?: number | null
  loyalty_type?: string
}

interface Topic {
  id: string
  icon: string
  label: string
  welcome: string
}

const TOPICS: Topic[] = [
  {
    id: 'general',
    icon: '💬',
    label: 'Discuter librement',
    welcome: "Bonjour ! Je suis votre conseiller fidélité VanCart 👋 Posez-moi n'importe quelle question sur votre programme, vos clients ou votre stratégie de fidélisation.",
  },
  {
    id: 'programme',
    icon: '🎯',
    label: 'Mon programme',
    welcome: "Parlons de votre programme de fidélité ! Je peux vous aider à choisir entre tampons et points, définir le bon nombre de tampons, rédiger votre règle de fidélité, ou optimiser vos récompenses.",
  },
  {
    id: 'resultats',
    icon: '📊',
    label: 'Mes résultats',
    welcome: "Analysons vos résultats ! Partagez-moi vos chiffres — nombre de clients, taux de retour, tampons distribués — et je vous aide à les interpréter et à identifier des axes d'amélioration.",
  },
  {
    id: 'recompenses',
    icon: '🎁',
    label: 'Récompenses',
    welcome: "Optimisons vos récompenses ! La bonne récompense peut doubler votre taux de fidélisation. Dites-moi ce que vous proposez actuellement et je vous suggèrerai des améliorations adaptées à votre commerce.",
  },
  {
    id: 'attirer',
    icon: '🚀',
    label: 'Attirer des clients',
    welcome: "Parlons acquisition ! Je vais vous aider à trouver des stratégies concrètes pour attirer de nouveaux clients et les inciter à rejoindre votre programme de fidélité — sans budget publicitaire énorme.",
  },
  {
    id: 'digital',
    icon: '📱',
    label: 'Fidélité digitale',
    welcome: "La fidélité digitale, c'est votre avantage concurrentiel ! Je peux vous expliquer comment utiliser votre carte VanCart, les wallets Google et Apple, et comment communiquer efficacement avec vos clients.",
  },
]

interface Props {
  plan: Plan
  merchantContext: MerchantContext
  businessName?: string
}

export default function AccompagnementLayout({ plan, merchantContext, businessName }: Props) {
  const [activeTopicId, setActiveTopicId] = useState(TOPICS[0].id)
  const activeTopic = TOPICS.find(t => t.id === activeTopicId) ?? TOPICS[0]

  return (
    <div className="-my-6 -mx-4 sm:-mx-6 lg:-mx-8 flex h-[calc(100dvh-64px)]">

      {/* Sidebar — desktop only */}
      <aside className="hidden sm:flex flex-col w-52 border-r border-[#E8E8E3] bg-white flex-shrink-0">
        <div className="px-4 pt-5 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Sujets</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-4">
          {TOPICS.map(topic => (
            <button
              key={topic.id}
              type="button"
              onClick={() => setActiveTopicId(topic.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                activeTopicId === topic.id
                  ? 'bg-[#6C47FF]/10 text-[#6C47FF]'
                  : 'text-[#6B6B6B] hover:bg-[#F7F6F3] hover:text-[#1A1A1A]'
              }`}
            >
              <span className="text-base leading-none">{topic.icon}</span>
              <span className="leading-tight">{topic.label}</span>
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-[#E8E8E3]">
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
          {TOPICS.map(topic => (
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
              <span>{topic.icon}</span>
              <span>{topic.label}</span>
            </button>
          ))}
        </div>

        {/* Chat */}
        <div className="flex-1 min-h-0 p-4 sm:p-5 flex flex-col gap-3">
          {businessName && (
            <div className="bg-[#6C47FF]/8 border border-[#6C47FF]/20 rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-shrink-0">
              <span className="text-[#6C47FF] text-base">✨</span>
              <p className="text-sm text-[#6C47FF] font-medium">
                L&apos;IA connaît votre commerce <strong>{businessName}</strong> et votre programme actuel.
              </p>
            </div>
          )}

          <UpgradeGate plan={plan} feature="aiAdvisor" requiredPlan="pro">
            <ChatClient
              key={activeTopicId}
              merchantContext={merchantContext}
              initialWelcome={activeTopic.welcome}
            />
          </UpgradeGate>
        </div>
      </div>
    </div>
  )
}
