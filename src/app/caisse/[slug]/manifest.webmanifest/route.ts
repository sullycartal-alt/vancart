import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const scope = `/caisse/${slug}`

  return NextResponse.json(
    {
      name: 'VanCart Scanner',
      short_name: 'Scanner',
      description: 'Scanner de caisse VanCart pour valider les passages en boutique.',
      start_url: scope,
      scope,
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#6C47FF',
      theme_color: '#FFFFFF',
      lang: 'fr',
      icons: [
        { src: '/caisse-icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/caisse-icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    { headers: { 'Content-Type': 'application/manifest+json' } },
  )
}
