'use client'

import { useEffect, useRef } from 'react'

interface Props {
  url: string
  businessName: string
  color: string
}

export default function DashboardQR({ url, businessName, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    import('qrcode').then((QRCode) => {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, url, {
          width: 180,
          margin: 2,
          color: { dark: '#1A1A1A', light: '#ffffff' },
        })
      }
    })
  }, [url])

  async function handleDownload() {
    const QRCode = await import('qrcode')
    const dataUrl = await QRCode.toDataURL(url, {
      width: 800,
      margin: 3,
      color: { dark: '#1A1A1A', light: '#ffffff' },
    })
    const link = document.createElement('a')
    link.download = `qr-${businessName.toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = dataUrl
    link.click()
  }

  return (
    <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
        {/* QR canvas */}
        <div
          className="flex-shrink-0 p-3 rounded-xl"
          style={{ backgroundColor: `${color}10`, border: `2px solid ${color}25` }}
        >
          <canvas ref={canvasRef} className="rounded-lg block" />
        </div>

        {/* Info + actions */}
        <div className="flex-1 min-w-0 space-y-3 w-full">
          <div className="text-center sm:text-left">
            <h2 className="text-base font-semibold text-[#1A1A1A]">Votre QR code client</h2>
            <p className="text-sm text-[#6B6B6B] mt-0.5 leading-relaxed">
              Posez-le en caisse ou partagez le lien — vos clients le scannent pour créer leur carte.
            </p>
          </div>

          <code className="block text-xs bg-[#F7F6F3] border border-[#E8E8E3] rounded-xl px-3 py-2 text-[#6B6B6B] break-all">
            {url}
          </code>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-1.5 text-sm sm:text-xs font-medium rounded-xl border transition-colors hover:opacity-80 min-h-[44px] sm:min-h-0"
              style={{ borderColor: color, color }}
            >
              <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger PNG
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(url)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-1.5 text-sm sm:text-xs font-medium rounded-xl border border-[#E8E8E3] text-[#6B6B6B] hover:bg-[#F7F6F3] transition-colors min-h-[44px] sm:min-h-0"
            >
              <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copier le lien
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
