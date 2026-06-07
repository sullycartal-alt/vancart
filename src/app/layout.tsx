import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google'
import './globals.css'
import ProgressBar from '@/components/ProgressBar'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ServiceWorkerManager from '@/components/pwa/ServiceWorkerManager'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
})

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-grotesk',
  display: 'swap',
})

const SITE_URL = 'https://vancart.vercel.app'

export const metadata: Metadata = {
  title: {
    default: 'VanCart — Carte de fidélité digitale pour commerçants indépendants',
    template: '%s — VanCart',
  },
  description: "Créez votre carte de fidélité en 5 minutes. Vos clients la reçoivent dans Google Wallet et Apple Wallet, sans télécharger d'app. Gratuit pour démarrer.",
  keywords: ['carte de fidélité digitale', 'fidélité commerçant', 'Google Wallet', 'Apple Wallet', 'QR code fidélité', 'SaaS fidélité'],
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'VanCart — Carte de fidélité digitale pour commerçants indépendants',
    description: "Créez votre carte de fidélité en 5 minutes. Vos clients la reçoivent dans Google Wallet et Apple Wallet, sans télécharger d'app. Gratuit pour démarrer.",
    url: SITE_URL,
    siteName: 'VanCart',
    type: 'website',
    images: [
      { url: `${SITE_URL}/icons/icon-512.png`, width: 512, height: 512, alt: 'VanCart' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VanCart — Carte de fidélité digitale pour commerçants indépendants',
    description: "Créez votre carte de fidélité en 5 minutes. Vos clients la reçoivent dans Google Wallet et Apple Wallet, sans télécharger d'app. Gratuit pour démarrer.",
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VanCart',
    startupImage: [
      { url: '/icons/splash-2048x2732.png', media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)' },
      { url: '/icons/splash-1668x2388.png', media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)' },
      { url: '/icons/splash-1536x2048.png', media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)' },
      { url: '/icons/splash-1125x2436.png', media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)' },
      { url: '/icons/splash-1242x2208.png', media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)' },
      { url: '/icons/splash-750x1334.png', media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)' },
      { url: '/icons/splash-640x1136.png', media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#6C47FF',
    'msapplication-tap-highlight': 'no',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${grotesk.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72.png" />
        <meta name="theme-color" content="#6C47FF" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'VanCart',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description: "Créez votre carte de fidélité en 5 minutes. Vos clients la reçoivent dans Google Wallet et Apple Wallet, sans télécharger d'app.",
              url: SITE_URL,
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'EUR',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ServiceWorkerManager>
          <ProgressBar />
          {children}
          <SpeedInsights />
        </ServiceWorkerManager>
      </body>
    </html>
  )
}
