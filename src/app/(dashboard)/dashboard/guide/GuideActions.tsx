'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  clientUrl: string
  primaryColor: string
  copyOnly?: boolean
}

export default function GuideActions({ clientUrl, primaryColor, copyOnly }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (copyOnly) return
    import('qrcode').then((QRCode) => {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, clientUrl, {
          width: 1, margin: 2, // hidden canvas, only used for download
          color: { dark: '#111827', light: '#ffffff' },
        })
      }
    })
  }, [clientUrl, copyOnly])

  async function handleDownload() {
    const QRCode = await import('qrcode')
    const dataUrl = await QRCode.toDataURL(clientUrl, {
      width: 800, margin: 3,
      color: { dark: '#111827', light: '#ffffff' },
    })
    const link = document.createElement('a')
    link.download = 'qr-code-fidelite.png'
    link.href = dataUrl
    link.click()
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(clientUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-wrap gap-3">
      {!copyOnly && (
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          ⬇ Télécharger le QR code (PNG)
        </button>
      )}
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
      >
        {copied ? '✓ Lien copié !' : '📋 Copier le lien client'}
      </button>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
