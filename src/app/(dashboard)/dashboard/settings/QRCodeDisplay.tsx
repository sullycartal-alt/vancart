'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface Props {
  url: string
  businessName: string
}

export default function QRCodeDisplay({ url, businessName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, url, {
      width: 200,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
  }, [url])

  async function handleDownload() {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 600,
      margin: 3,
      color: { dark: '#000000', light: '#ffffff' },
    })
    const link = document.createElement('a')
    link.download = `qr-${businessName.toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = dataUrl
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="rounded-lg border border-gray-200 p-2" />
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Imprimez ce QR code et posez-le en caisse. Vos clients le scannent pour obtenir leur carte.
      </p>
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
      >
        Télécharger le QR code (PNG)
      </button>
    </div>
  )
}
