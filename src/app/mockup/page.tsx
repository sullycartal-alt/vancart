import LoyaltyCardMockup from '@/components/loyalty/LoyaltyCardMockup'

export const dynamic = 'force-dynamic'

export default function MockupPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-8">
      <LoyaltyCardMockup
        primaryColor="#6C47FF"
        businessName="Café des Arts"
        loyaltyType="stamps"
        stampsRequired={9}
        currentStamps={5}
        loyaltyRule="1 café offert"
        clientName="Marie Laurent"
      />
    </div>
  )
}
