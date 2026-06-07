'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Delete, LogOut, ScanLine, Check, PartyPopper, X } from 'lucide-react'
import { LogoLockup } from '@/components/brand/Logo'
import CaisseScanner from '@/components/caisse/CaisseScanner'
import InstallTutorial from '@/components/caisse/InstallTutorial'

interface Props {
  slug: string
  merchantName: string
  pinConfigured: boolean
}

type View = 'loading' | 'login' | 'scanner'

interface StampResult {
  type: 'stamp' | 'reward' | 'error'
  customerName?: string
  newCount?: number
  total?: number
  rewardDescription?: string
  message?: string
  qrCode?: string
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function CaisseClient({ slug, merchantName, pinConfigured }: Props) {
  const [view, setView] = useState<View>('loading')
  const [serveurName, setServeurName] = useState('')
  const [shopName, setShopName] = useState(merchantName)
  const [expiresAt, setExpiresAt] = useState('')

  // Login state
  const [nameInput, setNameInput] = useState('')
  const [pin, setPin] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  // Scanner state
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [result, setResult] = useState<StampResult | null>(null)
  const [redeeming, setRedeeming] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const processingRef = useRef(false)
  const returnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Check existing session on mount ──────────────────────────────────────
  useEffect(() => {
    fetch(`/api/caisse/session?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.valid) {
          setServeurName(data.serveurName)
          setShopName(data.merchantName || merchantName)
          setExpiresAt(data.expiresAt)
          setView('scanner')
        } else {
          setView('login')
        }
      })
      .catch(() => setView('login'))
  }, [slug, merchantName])

  // ── Detect standalone (already installed) mode ───────────────────────────
  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)
  }, [])

  // ── Login ────────────────────────────────────────────────────────────────
  async function handleLogin() {
    if (nameInput.trim().length === 0 || pin.length !== 4 || loggingIn) return
    setLoggingIn(true)
    setLoginError(null)
    try {
      const res = await fetch('/api/caisse/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, pin, serveur_name: nameInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoginError(data?.error ?? 'Connexion impossible.')
        setPin('')
        return
      }
      // Récupère expiresAt depuis la session fraîchement créée.
      const sess = await fetch(`/api/caisse/session?slug=${encodeURIComponent(slug)}`).then((r) =>
        r.ok ? r.json() : null,
      )
      setServeurName(nameInput.trim())
      setShopName(data.merchantName || merchantName)
      setExpiresAt(sess?.expiresAt ?? '')
      setPin('')
      setView('scanner')
    } catch {
      setLoginError('Erreur réseau. Réessayez.')
    } finally {
      setLoggingIn(false)
    }
  }

  function pushDigit(d: string) {
    setLoginError(null)
    setPin((p) => (p.length < 4 ? p + d : p))
  }
  function popDigit() {
    setPin((p) => p.slice(0, -1))
  }

  // ── Logout ───────────────────────────────────────────────────────────────
  async function handleLogout() {
    await fetch('/api/caisse/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {})
    setView('login')
    setServeurName('')
    setScanning(false)
    setResult(null)
  }

  // ── Scan handling ────────────────────────────────────────────────────────
  const handleScan = useCallback(
    async (qr: string) => {
      if (processingRef.current) return
      processingRef.current = true
      try {
        const res = await fetch('/api/caisse/stamp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qr_code: qr, slug }),
        })
        const data = await res.json()
        if (!res.ok) {
          setResult({ type: 'error', message: data?.error ?? 'QR code invalide' })
        } else if (data.rewardReached) {
          setResult({
            type: 'reward',
            customerName: data.customerName,
            newCount: data.newCount,
            total: data.total,
            rewardDescription: data.rewardDescription,
            qrCode: qr,
          })
        } else {
          setResult({
            type: 'stamp',
            customerName: data.customerName,
            newCount: data.newCount,
            total: data.total,
          })
        }
      } catch {
        setResult({ type: 'error', message: 'Erreur réseau' })
      }
    },
    [slug],
  )

  // Auto-return after showing result (except reward, which needs confirmation).
  useEffect(() => {
    if (!result) return
    if (result.type === 'reward') return
    const delay = 10000
    returnTimerRef.current = setTimeout(() => backToScanner(), delay)
    return () => {
      if (returnTimerRef.current) clearTimeout(returnTimerRef.current)
    }
  }, [result])

  function backToScanner() {
    if (returnTimerRef.current) clearTimeout(returnTimerRef.current)
    setResult(null)
    processingRef.current = false
    setScanning(false)
  }

  function scanAnother() {
    if (returnTimerRef.current) clearTimeout(returnTimerRef.current)
    setResult(null)
    processingRef.current = false
    setScanning(true)
  }

  async function handleRedeem() {
    if (!result?.qrCode || redeeming) return
    setRedeeming(true)
    try {
      await fetch('/api/caisse/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: result.qrCode, slug }),
      })
    } catch {
      // ignore
    } finally {
      setRedeeming(false)
      backToScanner()
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (view === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3]">
        <div className="w-8 h-8 border-2 border-[#6C47FF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (view === 'login') {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex flex-col items-center px-6 py-10" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
        <div className="w-full max-w-xs flex flex-col items-center gap-6">
          <LogoLockup size={32} />
          <div className="text-center">
            <h1 className="text-xl font-bold text-[#1A1A1A]">{shopName}</h1>
            <p className="text-sm text-[#6B6B6B] mt-1">Connexion caisse</p>
          </div>

          {!pinConfigured && (
            <div className="w-full text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
              La caisse n&apos;est pas encore activée par le commerçant.
            </div>
          )}

          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={30}
            placeholder="Lucas"
            className="w-full border border-[#E8E8E3] rounded-xl px-4 py-3 text-center text-base focus:ring-2 focus:ring-[#6C47FF]/20 focus:border-[#6C47FF] outline-none bg-white"
            aria-label="Ton prénom"
          />
          <p className="text-xs text-[#6B6B6B] -mt-4">Ton prénom</p>

          {/* PIN dots */}
          <div className="flex items-center gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border-2 transition-colors"
                style={{
                  borderColor: '#6C47FF',
                  backgroundColor: i < pin.length ? '#6C47FF' : 'transparent',
                }}
              />
            ))}
          </div>

          {loginError && <p className="text-sm text-red-600 -mt-2">{loginError}</p>}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3 w-full">
            {keys.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => pushDigit(k)}
                className="aspect-square rounded-2xl bg-white border border-[#E8E8E3] text-2xl font-semibold text-[#1A1A1A] active:bg-[#F0EEFF] active:scale-95 transition-all"
              >
                {k}
              </button>
            ))}
            <div />
            <button
              type="button"
              onClick={() => pushDigit('0')}
              className="aspect-square rounded-2xl bg-white border border-[#E8E8E3] text-2xl font-semibold text-[#1A1A1A] active:bg-[#F0EEFF] active:scale-95 transition-all"
            >
              0
            </button>
            <button
              type="button"
              onClick={popDigit}
              className="aspect-square rounded-2xl flex items-center justify-center text-[#6B6B6B] active:scale-95 transition-all"
              aria-label="Effacer"
            >
              <Delete size={24} strokeWidth={1.9} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={nameInput.trim().length === 0 || pin.length !== 4 || loggingIn}
            className="w-full py-4 bg-[#6C47FF] text-white font-bold rounded-xl disabled:opacity-40 transition-opacity"
          >
            {loggingIn ? 'Connexion…' : 'Accéder à la caisse'}
          </button>
        </div>
      </div>
    )
  }

  // ── Scanner view ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#6C47FF] flex flex-col px-5 py-6 text-white" style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
      {/* Result overlay */}
      {result && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8 text-center text-white"
          style={{
            backgroundColor:
              result.type === 'stamp' ? '#22c55e' : result.type === 'reward' ? '#6C47FF' : '#ef4444',
          }}
        >
          {result.type === 'stamp' && (
            <>
              <Check size={72} strokeWidth={2.2} />
              <p className="text-2xl font-bold mt-4">+1 tampon — {result.customerName}</p>
              <p className="text-lg mt-1 text-white/90">
                Carte : {result.newCount}/{result.total} tampons
              </p>
              <ProgressBar duration={10000} />
              <button onClick={scanAnother} className="mt-6 px-6 py-3 bg-white/20 rounded-xl font-semibold">
                Scanner un autre
              </button>
            </>
          )}
          {result.type === 'reward' && (
            <>
              <PartyPopper size={72} strokeWidth={2.2} />
              <p className="text-2xl font-bold mt-4">Récompense débloquée</p>
              <p className="text-lg text-white/90">{result.customerName}</p>
              {result.rewardDescription && (
                <p className="text-base mt-2 text-white/80 italic">{result.rewardDescription}</p>
              )}
              <button
                onClick={handleRedeem}
                disabled={redeeming}
                className="mt-8 w-full max-w-xs py-4 bg-white text-[#6C47FF] font-bold rounded-xl disabled:opacity-50"
              >
                {redeeming ? 'Validation…' : 'Récompense remise ✓'}
              </button>
            </>
          )}
          {result.type === 'error' && (
            <>
              <X size={72} strokeWidth={2.2} />
              <p className="text-2xl font-bold mt-4">{result.message || 'QR code invalide'}</p>
              <ProgressBar duration={10000} />
              <button onClick={backToScanner} className="mt-6 px-6 py-3 bg-white/20 rounded-xl font-semibold">
                Continuer
              </button>
            </>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-base">
            {serveurName} · {shopName}
          </p>
          {expiresAt && <p className="text-xs text-white/60">Session active jusqu&apos;à {formatTime(expiresAt)}</p>}
        </div>
        <button onClick={handleLogout} className="p-2 rounded-xl bg-white/15" aria-label="Se déconnecter">
          <LogOut size={20} strokeWidth={1.9} />
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
        {scanning ? (
          <div className="w-full max-w-sm space-y-4">
            <CaisseScanner onScan={handleScan} onError={setScanError} paused={!!result} />
            {scanError && <p className="text-center text-sm text-white/90">{scanError}</p>}
            <button
              onClick={() => setScanning(false)}
              className="w-full py-3 bg-white/15 rounded-xl font-semibold"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setScanError(null)
              setScanning(true)
            }}
            className="w-full max-w-sm aspect-square bg-white rounded-3xl flex flex-col items-center justify-center gap-4 text-[#6C47FF] active:scale-95 transition-transform shadow-2xl"
          >
            <ScanLine size={72} strokeWidth={1.9} />
            <span className="text-2xl font-bold">Scanner un client</span>
          </button>
        )}
      </div>

      {/* Install tutorial */}
      {!isStandalone && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-sm text-white">
            <p className="font-semibold">⚠️ Navigation privée</p>
            <p className="mt-1 text-white/80">
              L&apos;installation sur l&apos;écran d&apos;accueil n&apos;est pas disponible en navigation privée. Ouvre cette
              page dans Safari (iOS) ou Chrome (Android) en mode normal.
            </p>
          </div>
          <InstallTutorial variant="onColor" />
        </div>
      )}
    </div>
  )
}

function ProgressBar({ duration }: { duration: number }) {
  return (
    <div className="w-full max-w-xs h-1.5 bg-white/30 rounded-full overflow-hidden mt-6">
      <div
        className="h-full bg-white rounded-full"
        style={{ animation: `caisseShrink ${duration}ms linear forwards` }}
      />
      <style>{`@keyframes caisseShrink { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  )
}
