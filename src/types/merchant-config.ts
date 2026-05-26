export interface MerchantSharedConfig {
  business_name: string
  primary_color: string
  loyalty_rule: string
  stamps_required: number
  loyalty_type: 'stamps' | 'points'
  points_required: number | null
  points_per_euro: number | null
  logo_url: string | null
  description: string
  hero_image_url?: string | null
  wallet_message?: string | null
  card_expiry_months?: number | null
  show_instagram_on_card?: boolean
  instagram_handle?: string | null
}
