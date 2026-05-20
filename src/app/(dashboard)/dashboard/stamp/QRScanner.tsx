'use client'

import { useCallback, useEffect, useRef } from 'react'

interface Props {
  onScan: (data: string) => void
  onError: (msg: string) => void
}

export default function QRScanner({ onScan, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const foundRef = useRef(false)

  const tick = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    import('jsqr').then(({ default: jsQR }) => {
      if (foundRef.current) return
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })
      if (code) {
        foundRef.current = true
        streamRef.current?.getTracks().forEach((t) => t.stop())
        cancelAnimationFrame(rafRef.current)
        onScan(code.data)
      } else {
        rafRef.current = requestAnimationFrame(tick)
      }
    })
  }, [onScan])

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          rafRef.current = requestAnimationFrame(tick)
        }
      })
      .catch(() => onError("Impossible d'accéder à la caméra"))

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      cancelAnimationFrame(rafRef.current)
    }
  }, [tick, onError])

  return (
    <div className="relative rounded-lg overflow-hidden bg-black">
      <video ref={videoRef} className="w-full" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
      {/* Viewfinder overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-56 h-56 border-2 border-white rounded-lg opacity-60" />
      </div>
      <p className="absolute bottom-3 left-0 right-0 text-center text-white text-xs opacity-80">
        Pointez la caméra vers le QR code du client
      </p>
    </div>
  )
}
