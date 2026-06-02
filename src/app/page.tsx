import type { Metadata } from 'next'
import LandingNav from '@/components/landing/LandingNav'
import Hero from '@/components/landing/Hero'
import Marquee from '@/components/landing/Marquee'
import Steps from '@/components/landing/Steps'
import ProductSplit from '@/components/landing/ProductSplit'
import Stats from '@/components/landing/Stats'
import Pricing from '@/components/landing/Pricing'
import FinalCta from '@/components/landing/FinalCta'
import Footer from '@/components/landing/Footer'
import RevealObserver from '@/components/landing/RevealObserver'

export const metadata: Metadata = {
  title: 'VanCart — La fidélité qui ne finit pas à la poubelle',
  description: 'Créez votre programme de fidélité digital. QR code en caisse, carte sur smartphone dans Apple & Google Wallet. 1 mois gratuit, sans carte bancaire.',
}

export default function LandingPage() {
  return (
    <div className="relative grain-overlay min-h-screen" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      <RevealObserver />
      <LandingNav />
      <main>
        <Hero />
        <Marquee />
        <Steps />
        <ProductSplit />
        <Stats />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
