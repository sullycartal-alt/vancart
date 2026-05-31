'use client'

import { useEffect, useRef, useState } from 'react'
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
  createdAt: string
}

const STORAGE_KEY = 'vancart_campaigns'

function loadCampaigns(): Campaign[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveCampaigns(campaigns: Campaign[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns))
}

export default function ProspectionPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [name, setName] = useState('')
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const stored = loadCampaigns()
    setCampaigns(stored)
    if (stored.length > 0) setActiveCampaign(stored[0])
  }, [])

  useEffect(() => {
    if (!activeCampaign) {
      setQrDataUrl(null)
      return
    }
    const url = `${APP_URL}/demo/${activeCampaign.slug}`
    QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      color: { dark: '#1A1A1A', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    }).then(setQrDataUrl).catch(() => setQrDataUrl(null))
  }, [activeCampaign])

  function createCampaign() {
    if (!name.trim()) return
    const slug = generateSlug(name)
    const campaign: Campaign = {
      id: Date.now().toString(),
      name: name.trim(),
      slug,
      createdAt: new Date().toISOString(),
    }
    const updated = [campaign, ...campaigns]
    setCampaigns(updated)
    saveCampaigns(updated)
    setActiveCampaign(campaign)
    setName('')
  }

  function deleteCampaign(id: string) {
    const updated = campaigns.filter(c => c.id !== id)
    setCampaigns(updated)
    saveCampaigns(updated)
    if (activeCampaign?.id === id) {
      setActiveCampaign(updated[0] ?? null)
    }
  }

  function copyUrl() {
    if (!activeCampaign) return
    const url = `${APP_URL}/demo/${activeCampaign.slug}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function downloadQr() {
    if (!qrDataUrl || !activeCampaign) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `vancart-qr-${activeCampaign.slug}.png`
    a.click()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Prospection</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Créez des liens de démo personnalisés avec QR code pour vos campagnes terrain.
        </p>
      </div>

      {/* Create campaign */}
      <div className="bg-white border border-[#E8E8E3] rounded-2xl p-6">
        <h2 className="text-sm font-bold text-[#1A1A1A] mb-4">Nouvelle campagne</h2>
        <div className="flex gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createCampaign()}
            placeholder="Ex: Marché Aligre, Flyer Nov 2026…"
            className="flex-1 border border-[#E8E8E3] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6C47FF] transition-colors"
          />
          <button
            onClick={createCampaign}
            disabled={!name.trim()}
            className="px-5 py-3 bg-[#6C47FF] text-white text-sm font-bold rounded-xl hover:bg-[#5835e0] disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            Créer
          </button>
        </div>
        {name.trim() && (
          <p className="mt-2 text-xs text-[#9CA3AF]">
            URL : {APP_URL}/demo/{generateSlug(name)}
          </p>
        )}
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white border border-[#E8E8E3] rounded-2xl p-10 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-sm text-[#6B6B6B]">Créez votre première campagne pour générer un QR code de démo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign list */}
          <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5">
            <h2 className="text-sm font-bold text-[#1A1A1A] mb-4">Campagnes ({campaigns.length})</h2>
            <div className="divide-y divide-[#E8E8E3]">
              {campaigns.map(campaign => (
                <div
                  key={campaign.id}
                  className={`flex items-center justify-between py-3 cursor-pointer rounded-xl px-2 -mx-2 transition-colors ${
                    activeCampaign?.id === campaign.id ? 'bg-[#6C47FF]/8' : 'hover:bg-[#F7F6F3]'
                  }`}
                  onClick={() => setActiveCampaign(campaign)}
                >
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${activeCampaign?.id === campaign.id ? 'text-[#6C47FF]' : 'text-[#1A1A1A]'}`}>
                      {campaign.name}
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5 truncate">/demo/{campaign.slug}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteCampaign(campaign.id) }}
                    className="ml-3 w-7 h-7 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 transition-colors text-sm flex-shrink-0"
                    aria-label="Supprimer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* QR preview */}
          {activeCampaign && (
            <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5">
              <h2 className="text-sm font-bold text-[#1A1A1A] mb-4">QR Code — {activeCampaign.name}</h2>

              <div className="flex justify-center mb-4">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt={`QR code ${activeCampaign.name}`}
                    className="w-48 h-48 rounded-xl border border-[#E8E8E3]"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-xl bg-[#F7F6F3] animate-pulse" />
                )}
              </div>

              <div className="bg-[#F7F6F3] rounded-xl px-4 py-3 flex items-center gap-2 mb-4">
                <p className="text-xs text-[#6B6B6B] flex-1 truncate">
                  {APP_URL}/demo/{activeCampaign.slug}
                </p>
                <button
                  onClick={copyUrl}
                  className="text-xs font-semibold text-[#6C47FF] hover:text-[#5835e0] transition-colors whitespace-nowrap"
                >
                  {copied ? '✓ Copié !' : 'Copier'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={downloadQr}
                  disabled={!qrDataUrl}
                  className="py-3 bg-[#6C47FF] text-white text-sm font-bold rounded-xl hover:bg-[#5835e0] disabled:opacity-40 transition-colors"
                >
                  ↓ Télécharger PNG
                </button>
                <a
                  href={`${APP_URL}/demo/${activeCampaign.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 border border-[#E8E8E3] text-sm font-semibold text-[#6B6B6B] rounded-xl hover:border-[#6C47FF]/30 transition-colors text-center"
                >
                  Prévisualiser →
                </a>
              </div>

              <p className="mt-4 text-xs text-[#9CA3AF] text-center">
                Créée le {new Date(activeCampaign.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
