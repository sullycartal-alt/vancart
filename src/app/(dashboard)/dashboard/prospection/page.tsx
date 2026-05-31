'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vancart.vercel.app'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || 'campagne'
}

interface Campaign {
  id: string
  name: string
  slug: string
  url: string
  date: string
}

const STORAGE_KEY = 'vancart_campaigns'

function loadCampaigns(): Campaign[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') }
  catch { return [] }
}
function saveCampaigns(campaigns: Campaign[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns))
}

export default function ProspectionPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [name, setName] = useState('')
  const [active, setActive] = useState<Campaign | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const stored = loadCampaigns()
    setCampaigns(stored)
    if (stored.length > 0) setActive(stored[0])
  }, [])

  useEffect(() => {
    if (!active) { setQrDataUrl(null); return }
    QRCode.toDataURL(active.url, {
      width: 320,
      margin: 2,
      color: { dark: '#1A1A1A', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    }).then(setQrDataUrl).catch(() => setQrDataUrl(null))
  }, [active])

  function createCampaign() {
    const trimmed = name.trim()
    if (!trimmed) return
    const slug = generateSlug(trimmed)
    const url = `${APP_URL}/demo/${slug}`
    const campaign: Campaign = { id: Date.now().toString(), name: trimmed, slug, url, date: new Date().toISOString() }
    const updated = [campaign, ...campaigns]
    setCampaigns(updated)
    saveCampaigns(updated)
    setActive(campaign)
    setName('')
  }

  function deleteCampaign(id: string) {
    const updated = campaigns.filter(c => c.id !== id)
    setCampaigns(updated)
    saveCampaigns(updated)
    if (active?.id === id) setActive(updated[0] ?? null)
  }

  function copyUrl() {
    if (!active) return
    navigator.clipboard.writeText(active.url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function downloadQr() {
    if (!qrDataUrl || !active) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `vancart-qr-${active.slug}.png`
    a.click()
  }

  const previewSlug = name.trim() ? generateSlug(name) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Prospection</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Créez des liens de démo personnalisés avec QR code pour vos campagnes terrain.
        </p>
      </div>

      {/* Create campaign */}
      <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5">
        <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">Nouvelle campagne</h2>
        <div className="flex gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createCampaign()}
            placeholder="Ex: Marché Aligre, Flyer Nov 2026…"
            className="flex-1 border border-[#E8E8E3] rounded-xl px-4 text-base focus:outline-none focus:border-[#6C47FF] transition-colors"
            style={{ minHeight: 52, fontSize: 16 }}
          />
          <button
            onClick={createCampaign}
            disabled={!name.trim()}
            className="px-5 bg-[#6C47FF] text-white text-base font-bold rounded-xl hover:bg-[#5835e0] disabled:opacity-40 transition-colors whitespace-nowrap"
            style={{ minHeight: 52, fontSize: 16 }}
          >
            Générer
          </button>
        </div>
        {previewSlug && (
          <p className="mt-2 text-xs text-[#9CA3AF] break-all">
            → {APP_URL}/demo/{previewSlug}
          </p>
        )}
      </div>

      {/* Empty state */}
      {campaigns.length === 0 && (
        <div className="bg-white border border-[#E8E8E3] rounded-2xl p-10 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-sm text-[#6B6B6B]">
            Créez votre première campagne pour générer un QR code de démo personnalisé.
          </p>
        </div>
      )}

      {/* Campaigns + QR */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* List */}
          <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5">
            <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">
              Campagnes <span className="text-[#9CA3AF] font-normal">({campaigns.length})</span>
            </h2>
            <div className="space-y-1">
              {campaigns.map(c => (
                <div
                  key={c.id}
                  onClick={() => setActive(c)}
                  className={`flex items-center justify-between rounded-xl px-3 cursor-pointer transition-colors ${
                    active?.id === c.id ? 'bg-[#6C47FF]/8' : 'hover:bg-[#F7F6F3]'
                  }`}
                  style={{ minHeight: 56 }}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate ${active?.id === c.id ? 'text-[#6C47FF]' : 'text-[#1A1A1A]'}`}>
                      {c.name}
                    </p>
                    <p className="text-xs text-[#9CA3AF] truncate">/demo/{c.slug}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteCampaign(c.id) }}
                    className="ml-3 w-9 h-9 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 text-base"
                    aria-label="Supprimer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* QR panel */}
          {active && (
            <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5">
              <h2 className="text-sm font-bold text-[#1A1A1A] mb-4 truncate">
                QR Code — {active.name}
              </h2>

              {/* QR image */}
              <div className="flex justify-center mb-4">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt={`QR code ${active.name}`}
                    className="rounded-xl border border-[#E8E8E3]"
                    style={{ width: 220, height: 220 }}
                  />
                ) : (
                  <div className="rounded-xl bg-[#F7F6F3] animate-pulse" style={{ width: 220, height: 220 }} />
                )}
              </div>

              {/* URL display */}
              <div className="bg-[#F7F6F3] rounded-xl px-4 py-3 flex items-center gap-2 mb-4">
                <p className="text-sm text-[#6B6B6B] flex-1 truncate break-all">{active.url}</p>
                <button
                  onClick={copyUrl}
                  className="text-sm font-semibold text-[#6C47FF] hover:text-[#5835e0] transition-colors whitespace-nowrap"
                >
                  {copied ? '✓ Copié !' : 'Copier'}
                </button>
              </div>

              {/* Action buttons — stacked on mobile, side-by-side on desktop */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadQr}
                  disabled={!qrDataUrl}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#6C47FF] text-white font-bold rounded-xl hover:bg-[#5835e0] disabled:opacity-40 transition-colors"
                  style={{ minHeight: 52, fontSize: 16 }}
                >
                  ⬇️ Télécharger PNG
                </button>
                <a
                  href={active.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 border border-[#E8E8E3] text-[#6B6B6B] font-semibold rounded-xl hover:border-[#6C47FF]/40 transition-colors"
                  style={{ minHeight: 52, fontSize: 16 }}
                >
                  Prévisualiser →
                </a>
              </div>

              <p className="mt-4 text-xs text-[#9CA3AF] text-center">
                Créée le {new Date(active.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
