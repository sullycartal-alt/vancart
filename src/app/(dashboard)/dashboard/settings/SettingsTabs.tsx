'use client'

import { useCallback, useEffect, useState } from 'react'
import MerchantForm from './MerchantForm'
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

  return (
    <MerchantForm
      merchant={merchant}
      onConfigChange={updateLiveConfig}
      clientCount={clientCount}
    />
  )
}
