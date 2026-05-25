'use client'

import { useState } from 'react'
import MerchantForm from './MerchantForm'
import CardDesignClient from '../ma-carte/CardDesignClient'

interface Merchant {
  id: string
  business_name: string
  slug: string
  logo_url: string | null
  primary_color: string
  loyalty_rule: string
  stamps_required: number
  loyalty_type?: string
  points_per_euro?: number | null
  points_required?: number | null
  description?: string | null
  instagram_handle?: string | null
  city?: string | null
}

interface Props {
  merchant: Merchant | null
  walletSection: React.ReactNode
}

export default function SettingsTabs({ merchant, walletSection }: Props) {
  const [tab, setTab] = useState<'settings' | 'card'>('settings')

  return (
    <div>
      <div className="flex gap-1 p-1 bg-[#F7F6F3] border border-[#E8E8E3] rounded-xl w-fit mb-6">
        <button
          type="button"
          onClick={() => setTab('settings')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'settings' ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'}`}
        >
          ⚙️ Paramètres
        </button>
        <button
          type="button"
          onClick={() => setTab('card')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'card' ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'}`}
        >
          🎨 Ma carte
        </button>
      </div>

      {tab === 'settings' ? (
        <div className="space-y-6">
          <MerchantForm merchant={merchant} />
          {walletSection}
        </div>
      ) : merchant ? (
        <CardDesignClient
          hideTitle
          merchant={{
            id: merchant.id,
            business_name: merchant.business_name ?? '',
            primary_color: merchant.primary_color ?? '#6C47FF',
            loyalty_rule: merchant.loyalty_rule ?? '',
            stamps_required: merchant.stamps_required ?? 10,
            logo_url: merchant.logo_url ?? null,
            description: merchant.description ?? '',
            loyalty_type: (merchant.loyalty_type ?? 'stamps') as 'stamps' | 'points',
          }}
        />
      ) : (
        <p className="text-sm text-[#6B6B6B]">Configurez d&apos;abord votre commerce pour personnaliser votre carte.</p>
      )}
    </div>
  )
}
