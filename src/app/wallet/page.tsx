import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mon Wallet — VanCart',
}

export const revalidate = 30

function textColorFor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#1f2937' : '#ffffff'
}

interface LoyaltyCard {
  id: string
  stamps_count: number
  points: number
  rewards_unlocked: number
  merchants: {
    business_name: string
    primary_color: string
    loyalty_rule: string
    stamps_required: number
    loyalty_type: string | null
    points_required: number | null
    logo_url: string | null
  }
}

function CardThumbnail({ card }: { card: LoyaltyCard }) {
  const merchant = card.merchants
  const color = merchant.primary_color || '#6C47FF'
  const tc = textColorFor(color)
  const isPoints = merchant.loyalty_type === 'points'
  const count = isPoints ? (card.points ?? 0) : card.stamps_count
  const total = isPoints ? (merchant.points_required ?? 100) : merchant.stamps_required
  const isComplete = count >= total
  const pct = Math.min(100, Math.round((count / total) * 100))
  const initial = merchant.business_name.charAt(0).toUpperCase()

  return (
    <Link href={`/carte/${card.id}`} className="block">
      <div
        className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
      >
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3 mb-4">
            {merchant.logo_url ? (
              <Image
                src={merchant.logo_url}
                alt={merchant.business_name}
                width={40}
                height={40}
                className="rounded-xl object-contain"
                style={{ filter: tc === '#ffffff' ? 'brightness(0) invert(1)' : 'none' }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tc}20` }}>
                <span className="text-lg font-bold" style={{ color: tc }}>{initial}</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm truncate" style={{ color: tc }}>{merchant.business_name}</p>
              <p className="text-xs opacity-70 truncate" style={{ color: tc }}>{merchant.loyalty_rule}</p>
            </div>
            {isComplete && <span className="text-lg flex-shrink-0">🎁</span>}
          </div>

          <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
            {isPoints ? (
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-bold tabular-nums" style={{ color }}>{count}</span>
                  <span className="text-xs text-gray-400">/ {total} pts</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: Math.min(total, 12) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                      style={i < count
                        ? { backgroundColor: color, color: tc }
                        : { backgroundColor: '#f3f4f6', border: '1.5px dashed #e5e7eb' }}
                    >
                      {i < count ? '✓' : ''}
                    </div>
                  ))}
                  {total > 12 && (
                    <span className="text-xs text-gray-400 self-center">+{total - 12}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  <span className="font-bold text-gray-900">{count}</span> / {total} tampons
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default async function WalletPage() {
  const cookieStore = await cookies()
  const customerId = cookieStore.get('vancart_customer_id')?.value

  if (!customerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3] px-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-[#6C47FF]/10">
            <svg className="w-8 h-8 text-[#6C47FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              <rect x="14" y="3" width="7" height="7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              <rect x="3" y="14" width="7" height="7" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 14h3v3m0 4h4m-4 0v-4m4-4v4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Mon Wallet</h1>
            <p className="mt-2 text-sm text-[#6B6B6B] leading-relaxed">
              Scannez un QR code chez un commerçant VanCart pour voir vos cartes ici
            </p>
          </div>
        </div>
      </div>
    )
  }

  const service = createServiceClient()
  const { data: cards } = await service
    .from('loyalty_cards')
    .select('id, stamps_count, points, rewards_unlocked, merchants(business_name, primary_color, loyalty_rule, stamps_required, loyalty_type, points_required, logo_url)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  const normalised = (cards ?? []).map(c => ({
    ...c,
    merchants: (Array.isArray(c.merchants) ? c.merchants[0] : c.merchants) as LoyaltyCard['merchants'],
  }))

  return (
    <div className="min-h-screen bg-[#F7F6F3] px-4 py-8">
      <div className="max-w-sm mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Mon Wallet</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">{normalised.length} carte{normalised.length !== 1 ? 's' : ''} de fidélité</p>
        </div>

        {normalised.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E8E3] p-8 text-center space-y-3">
            <p className="text-2xl">🎴</p>
            <p className="text-sm text-[#6B6B6B]">Vous n&apos;avez pas encore de carte de fidélité.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {normalised.map(card => (
              <CardThumbnail key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
