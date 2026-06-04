import LoyaltyCardMockup from '@/components/loyalty/LoyaltyCardMockup'

export const dynamic = 'force-dynamic'

export default function MockupPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-8">
      <LoyaltyCardMockup />
    </div>
  )
}
