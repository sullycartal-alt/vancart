'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, QrCode, Delete, TriangleAlert, X } from 'lucide-react'
import InstallTutorial from '@/components/caisse/InstallTutorial'

interface Props {
  slug: string
  hasPin: boolean
  todayScans: { name: string; count: number }[]
}

export default function CaisseDashboardClient({ slug, hasPin: initialHasPin, todayScans }: Props) {
  const router = useRouter()
  const [hasPin, setHasPin] = useState(initialHasPin)
  const [origin, setOrigin] = useState('')
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  // PIN config
  const [editingPin, setEditingPin] = useState(!initialHasPin)
  const [pin, setPin] = useState('')
  const [savingPin, setSavingPin] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)
  const [pinSaved, setPinSaved] = useState(false)

  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setOrigin(window.location.origin))
    return () => cancelAnimationFrame(id)
  }, [])

  const url = `${origin || 'https://vancart.vercel.app'}/caisse/${slug}`

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function savePin() {
    if (pin.length !== 4 || savingPin) return
    setSavingPin(true)
    setPinError(null)
    try {
      const res = await fetch('/api/caisse/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPinError(data?.error ?? 'Erreur lors de la sauvegarde.')
        return
      }
      setHasPin(true)
      setEditingPin(false)
      setPin('')
      setPinSaved(true)
      setTimeout(() => setPinSaved(false), 2500)
      router.refresh()
    } catch {
      setPinError('Erreur réseau. Réessayez.')
    } finally {
      setSavingPin(false)
    }
  }

  async function disconnectAll() {
    if (!confirm('Êtes-vous sûr ? Tous les serveurs connectés seront déconnectés.')) return
    setDisconnecting(true)
    try {
      await fetch('/api/caisse/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
    } finally {
      setDisconnecting(false)
    }
  }

  const card = 'bg-white border border-[#E8E8E3] rounded-2xl p-5 sm:p-6'

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Caisse</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Donnez l&apos;accès caisse à vos serveurs : ils scannent les clients depuis leur téléphone.
        </p>
      </div>

      {/* Section 1 — Lien d'accès */}
      <div className={`${card} space-y-4`}>
        <h2 className="font-bold text-[#1A1A1A]">Lien d&apos;accès caisse</h2>

        {!hasPin && (
          <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <TriangleAlert size={18} strokeWidth={1.9} className="flex-shrink-0 mt-0.5" />
            Configurez votre PIN pour activer l&apos;accès caisse.
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 bg-[#F7F6F3] border border-[#E8E8E3] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] font-mono truncate">
            {origin ? url.replace(/^https?:\/\//, '') : `…/caisse/${slug}`}
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-4 py-3 bg-[#6C47FF] text-white text-sm font-semibold rounded-xl hover:bg-[#5835e0] transition-colors flex-shrink-0"
          >
            {copied ? <Check size={16} strokeWidth={2} /> : <Copy size={16} strokeWidth={1.9} />}
            {copied ? 'Copié' : 'Copier'}
          </button>
        </div>

        <button
          onClick={() => setShowQR(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8E8E3] text-sm font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#F7F6F3] transition-colors"
        >
          <QrCode size={16} strokeWidth={1.9} />
          Afficher le QR code
        </button>
      </div>

      {/* Section 2 — PIN */}
      <div className={`${card} space-y-4`}>
        <h2 className="font-bold text-[#1A1A1A]">Code PIN caisse</h2>

        {hasPin && !editingPin ? (
          <div className="space-y-3">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
              <Check size={16} strokeWidth={2} /> PIN configuré
            </p>
            {pinSaved && <p className="text-sm text-green-600">Enregistré ✓</p>}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setEditingPin(true)
                  setPin('')
                }}
                className="px-4 py-2.5 bg-white border border-[#E8E8E3] text-sm font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#F7F6F3] transition-colors"
              >
                Changer le PIN
              </button>
              <button
                onClick={disconnectAll}
                disabled={disconnecting}
                className="px-4 py-2.5 bg-white border border-red-200 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {disconnecting ? 'Déconnexion…' : 'Déconnecter toutes les sessions actives'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[#6B6B6B]">
              Choisissez un code à 4 chiffres. Vos serveurs l&apos;utiliseront pour se connecter à la caisse.
            </p>
            <PinPad pin={pin} setPin={setPin} onError={() => setPinError(null)} />
            {pinError && <p className="text-sm text-red-600">{pinError}</p>}
            <div className="flex gap-2">
              <button
                onClick={savePin}
                disabled={pin.length !== 4 || savingPin}
                className="px-5 py-2.5 bg-[#6C47FF] text-white text-sm font-bold rounded-xl disabled:opacity-40 transition-opacity"
              >
                {savingPin ? 'Enregistrement…' : 'Enregistrer le PIN'}
              </button>
              {hasPin && (
                <button
                  onClick={() => {
                    setEditingPin(false)
                    setPin('')
                    setPinError(null)
                  }}
                  className="px-5 py-2.5 bg-white border border-[#E8E8E3] text-sm font-semibold text-[#1A1A1A] rounded-xl hover:bg-[#F7F6F3] transition-colors"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section 3 — Scans du jour */}
      <div className={`${card} space-y-3`}>
        <h2 className="font-bold text-[#1A1A1A]">Scans du jour</h2>
        {todayScans.length === 0 ? (
          <p className="text-sm text-[#6B6B6B]">Aucun scan aujourd&apos;hui</p>
        ) : (
          <p className="text-sm text-[#1A1A1A]">
            {todayScans.map((s, i) => (
              <span key={s.name}>
                <span className="font-semibold">{s.name}</span> — {s.count} scan{s.count > 1 ? 's' : ''}
                {i < todayScans.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </p>
        )}
      </div>

      {/* Section 4 — Tuto installation */}
      <div className={`${card} space-y-3`}>
        <h2 className="font-bold text-[#1A1A1A]">Installer la caisse sur le téléphone d&apos;un serveur</h2>
        <InstallTutorial alwaysOpen />
      </div>

      {/* QR modal */}
      {showQR && <QRModal url={url} onClose={() => setShowQR(false)} />}
    </div>
  )
}

// ── PIN pad ──────────────────────────────────────────────────────────────────
function PinPad({
  pin,
  setPin,
  onError,
}: {
  pin: string
  setPin: (fn: (p: string) => string) => void
  onError: () => void
}) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  return (
    <div className="w-full max-w-xs mx-auto space-y-4">
      <div className="flex items-center justify-center gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full border-2"
            style={{ borderColor: '#6C47FF', backgroundColor: i < pin.length ? '#6C47FF' : 'transparent' }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              onError()
              setPin((p) => (p.length < 4 ? p + k : p))
            }}
            className="aspect-square rounded-xl bg-white border border-[#E8E8E3] text-xl font-semibold text-[#1A1A1A] active:bg-[#F0EEFF] active:scale-95 transition-all"
          >
            {k}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => {
            onError()
            setPin((p) => (p.length < 4 ? p + '0' : p))
          }}
          className="aspect-square rounded-xl bg-white border border-[#E8E8E3] text-xl font-semibold text-[#1A1A1A] active:bg-[#F0EEFF] active:scale-95 transition-all"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => setPin((p) => p.slice(0, -1))}
          className="aspect-square rounded-xl flex items-center justify-center text-[#6B6B6B] active:scale-95 transition-all"
          aria-label="Effacer"
        >
          <Delete size={22} strokeWidth={1.9} />
        </button>
      </div>
    </div>
  )
}

// ── QR modal ───────────────────────────────────────────────────────────────
function QRModal({ url, onClose }: { url: string; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    let cancelled = false
    import('qrcode').then((QRCode) => {
      if (!cancelled && canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, url, {
          width: 250,
          margin: 2,
          color: { dark: '#6C47FF', light: '#ffffff' },
        })
      }
    })
    return () => {
      cancelled = true
    }
  }, [url])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 space-y-4 text-center max-w-xs w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#1A1A1A]">QR code caisse</h3>
          <button onClick={onClose} aria-label="Fermer" className="text-[#6B6B6B]">
            <X size={20} strokeWidth={1.9} />
          </button>
        </div>
        <canvas ref={canvasRef} className="mx-auto rounded-xl" width={250} height={250} />
        <p className="text-xs text-[#6B6B6B] break-all">{url.replace(/^https?:\/\//, '')}</p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#6C47FF] text-white font-semibold rounded-xl hover:bg-[#5835e0] transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  )
}
