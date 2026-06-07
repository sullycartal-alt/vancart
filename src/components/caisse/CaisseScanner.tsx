'use client'

import { useEffect, useRef } from 'react'

interface Props {
  onScan: (data: string) => void
  onError: (msg: string) => void
  paused?: boolean
}

/**
 * Scanner caméra continu basé sur jsqr (même approche que le scanner dashboard).
 * Appelle onScan dès qu'un QR est détecté. `paused` stoppe la détection
 * (sans couper la caméra) pendant l'affichage d'une confirmation.
 */
export default function CaisseScanner({ onScan, onError, paused = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const pausedRef = useRef(paused)
  const onScanRef = useRef(onScan)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])
  useEffect(() => {
    onScanRef.current = onScan
    onErrorRef.current = onError
  }, [onScan, onError])

  useEffect(() => {
    let stopped = false

    function scanFrame() {
      if (stopped) return
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA || pausedRef.current) {
        rafRef.current = requestAnimationFrame(scanFrame)
        return
      }
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        rafRef.current = requestAnimationFrame(scanFrame)
        return
      }
      ctx.drawImage(video, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      import('jsqr').then(({ default: jsQR }) => {
        if (stopped) return
        if (!pausedRef.current) {
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          })
          if (code && code.data) onScanRef.current(code.data)
        }
        rafRef.current = requestAnimationFrame(scanFrame)
      })
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          rafRef.current = requestAnimationFrame(scanFrame)
        }
      })
      .catch(() => onErrorRef.current("Impossible d'accéder à la caméra. Autorisez l'accès dans les réglages."))

    return () => {
      stopped = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black w-full" style={{ aspectRatio: '1 / 1' }}>
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-3/5 aspect-square border-4 border-white/80 rounded-2xl" />
      </div>
    </div>
  )
}
