'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Store, Palette } from 'lucide-react'
import MerchantForm from './MerchantForm'
import CardDesignClient from '../ma-carte/CardDesignClient'
import type { MerchantSharedConfig } from '@/types/merchant-config'

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
  owner_name?: string | null
  phone?: string | null
  address?: string | null
  hero_image_url?: string | null
  wallet_message?: string | null
  card_expiry_months?: number | null
  show_instagram_on_card?: boolean
  banner_url?: string | null
}

interface Props {
  merchant: Merchant | null
  clientCount: number
}

function merchantToConfig(m: Merchant): MerchantSharedConfig {
  return {
    business_name: m.business_name ?? '',
    primary_color: m.primary_color ?? '#6C47FF',
    loyalty_rule: m.loyalty_rule ?? '',
    stamps_required: m.stamps_required ?? 10,
    loyalty_type: (m.loyalty_type ?? 'stamps') as 'stamps' | 'points',
    points_required: m.points_required ?? null,
    points_per_euro: m.points_per_euro ?? null,
    logo_url: m.logo_url ?? null,
    description: m.description ?? '',
    hero_image_url: m.hero_image_url ?? null,
    wallet_message: m.wallet_message ?? null,
    card_expiry_months: m.card_expiry_months ?? 12,
    show_instagram_on_card: m.show_instagram_on_card ?? false,
    instagram_handle: m.instagram_handle ?? null,
    banner_url: m.banner_url ?? null,
  }
}

export default function SettingsTabs({ merchant, clientCount }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [tab, setTab] = useState<'settings' | 'card'>(() => {
    if (typeof window === 'undefined') return 'settings'
    const fromUrl = searchParams.get('tab')
    if (fromUrl === 'settings' || fromUrl === 'card') return fromUrl
    const fromStorage = localStorage.getItem('moncommerce_tab')
    if (fromStorage === 'settings' || fromStorage === 'card') return fromStorage
    return 'settings'
  })
  const [cardInitVersion, setCardInitVersion] = useState(0)
  const [liveConfig, setLiveConfig] = useState<MerchantSharedConfig>(
    merchant ? merchantToConfig(merchant) : {
      business_name: '', primary_color: '#6C47FF', loyalty_rule: '',
      stamps_required: 10, loyalty_type: 'stamps',
      points_required: null, points_per_euro: null, logo_url: null, description: '',
      hero_image_url: null, wallet_message: null, card_expiry_months: 12,
      show_instagram_on_card: false, instagram_handle: null, banner_url: null,
    }
  )

  // Re-sync when server data refreshes (after save + router.refresh())
  useEffect(() => {
    if (!merchant) return
    setLiveConfig(merchantToConfig(merchant))
  }, [
    merchant?.id,
    merchant?.primary_color,
    merchant?.stamps_required,
    merchant?.loyalty_type,
    merchant?.points_required,
    merchant?.points_per_euro,
    merchant?.loyalty_rule,
    merchant?.logo_url,
    merchant?.description,
    merchant?.business_name,
    merchant?.hero_image_url,
    merchant?.wallet_message,
    merchant?.card_expiry_months,
    merchant?.show_instagram_on_card,
    merchant?.instagram_handle,
    merchant?.banner_url,
  ])

  const updateLiveConfig = useCallback((updates: Partial<MerchantSharedConfig>) => {
    setLiveConfig(prev => ({ ...prev, ...updates }))
  }, [])

  function handleTabChange(newTab: 'settings' | 'card') {
    if (newTab === 'card' && tab === 'settings') {
      setCardInitVersion(v => v + 1)
    }
    setTab(newTab)
    localStorage.setItem('moncommerce_tab', newTab)
    const params = new URLSearchParams(searchParams.toString())
    if (newTab === 'settings') {
      params.delete('tab')
    } else {
      params.set('tab', newTab)
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div>
      {(() => {
        const activeColor = /^#[0-9a-fA-F]{6}$/.test(merchant?.primary_color ?? '') ? merchant!.primary_color : '#6C47FF'
        return (
          <div className="flex gap-1 p-1 bg-[#F7F6F3] border border-[#E8E8E3] rounded-xl w-fit mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('settings')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'settings' ? 'shadow-sm text-white' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'}`}
              style={tab === 'settings' ? { backgroundColor: activeColor } : {}}
            >
              <Store size={16} strokeWidth={1.9} className="inline-block mr-1" />Infos commerce
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('card')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'card' ? 'shadow-sm text-white' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'}`}
              style={tab === 'card' ? { backgroundColor: activeColor } : {}}
            >
              <Palette size={16} strokeWidth={1.9} className="inline-block mr-1" />Ma carte
            </button>
          </div>
        )
      })()}

      {tab === 'settings' ? (
        <MerchantForm
          merchant={merchant}
          onConfigChange={updateLiveConfig}
          clientCount={clientCount}
        />
      ) : (merchant?.business_name?.trim()) ? (
        <CardDesignClient
          key={`${merchant.id}-v${cardInitVersion}`}
          merchant={{
            id: merchant.id,
            slug: merchant.slug,
            business_name: liveConfig.business_name,
            primary_color: liveConfig.primary_color,
            loyalty_rule: liveConfig.loyalty_rule,
            stamps_required: liveConfig.stamps_required,
            logo_url: liveConfig.logo_url,
            loyalty_type: liveConfig.loyalty_type,
            points_required: liveConfig.points_required,
            points_per_euro: liveConfig.points_per_euro,
            banner_url: liveConfig.banner_url ?? null,
          }}
        />
      ) : (
        <p className="text-sm text-[#6B6B6B]">Configurez d&apos;abord votre commerce pour personnaliser votre carte.</p>
      )}
    </div>
  )
}
