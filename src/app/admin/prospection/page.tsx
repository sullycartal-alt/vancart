'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  admin_user_id: string
  admin_name: string
  nom: string
  slug: string
  url: string
  created_at: string
  leads_count: number
}

function adminBadge(adminName: string) {
  if (adminName.toLowerCase().includes('sullivan')) {
    return { bg: '#6C47FF', label: adminName.split('@')[0] }
  }
  if (adminName.toLowerCase().includes('audrey')) {
    return { bg: '#0D9488', label: adminName.split('@')[0] }
  }
  return { bg: '#6B6B6B', label: adminName.split('@')[0] }
}

function leadsBadge(count: number) {
  if (count === 0) return { label: 'Aucun lead', bg: '#F7F6F3', color: '#6B6B6B' }
  if (count <= 3) return { label: `🟡 ${count} lead${count > 1 ? 's' : ''}`, bg: '#FEF9C3', color: '#854D0E' }
  return { label: `🟢 ${count} leads`, bg: '#DCFCE7', color: '#166534' }
}

function QRModal({ url, nom, onClose }: { url: string; nom: string; onClose: () => void }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: '#1A1A1A', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    }).then(setDataUrl).catch(() => setDataUrl(null))
  }, [url])

  function download() {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `vancart-qr-${nom.toLowerCase().replace(/\s+/g, '-')}.png`
    a.click()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#1A1A1A] text-sm truncate pr-4">{nom}</h3>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#1A1A1A] text-xl leading-none flex-shrink-0">×</button>
        </div>

        <div className="flex justify-center">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="QR Code" className="w-56 h-56 rounded-xl border border-[#E8E8E3]" />
          ) : (
            <div className="w-56 h-56 rounded-xl bg-[#F7F6F3] animate-pulse" />
          )}
        </div>

        <div className="bg-[#F7F6F3] rounded-xl px-3 py-2">
          <p className="text-xs text-[#6B6B6B] break-all">{url}</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={download}
            disabled={!dataUrl}
            className="w-full py-3 bg-[#6C47FF] text-white text-sm font-bold rounded-xl hover:bg-[#5835e0] disabled:opacity-40 transition-colors"
          >
            ⬇️ Télécharger PNG
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 border border-[#E8E8E3] text-[#6B6B6B] text-sm font-semibold rounded-xl hover:bg-[#F7F6F3] transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProspectionPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [qrModal, setQrModal] = useState<Campaign | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        setUserEmail(user.email ?? '')
      }
      await loadCampaigns()
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadCampaigns() {
    setLoading(true)
    const { data } = await supabase
      .from('prospection_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    setCampaigns(data ?? [])
    setLoading(false)
  }

  async function createCampaign() {
    const trimmed = name.trim()
    if (!trimmed || !userId) return
    setCreating(true)
    const slug = generateSlug(trimmed)
    const url = `${APP_URL}/demo/${slug}`
    const { error } = await supabase
      .from('prospection_campaigns')
      .insert({
        admin_user_id: userId,
        admin_name: userEmail,
        nom: trimmed,
        slug,
        url,
      })
    if (!error) {
      setName('')
      await loadCampaigns()
    }
    setCreating(false)
  }

  async function deleteCampaign(id: string) {
    await supabase
      .from('prospection_campaigns')
      .delete()
      .eq('id', id)
      .eq('admin_user_id', userId ?? '')
    setCampaigns(prev => prev.filter(c => c.id !== id))
  }

  function copyUrl(url: string, id: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const previewSlug = name.trim() ? generateSlug(name) : null

  return (
    <>
      {qrModal && (
        <QRModal url={qrModal.url} nom={qrModal.nom} onClose={() => setQrModal(null)} />
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Prospection</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            Créez des liens de démo personnalisés pour vos campagnes terrain.
          </p>
        </div>

        {/* Create */}
        <div className="bg-white border border-[#E8E8E3] rounded-2xl p-5">
          <h2 className="text-sm font-bold text-[#1A1A1A] mb-3">Nouvelle campagne</h2>
          <div className="flex gap-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createCampaign()}
              placeholder="Ex: Marché Aligre, Flyer juin 2026…"
              className="flex-1 border border-[#E8E8E3] rounded-xl px-4 text-base focus:outline-none focus:border-[#6C47FF] transition-colors"
              style={{ minHeight: 52, fontSize: 16 }}
            />
            <button
              onClick={createCampaign}
              disabled={!name.trim() || creating}
              className="px-5 bg-[#6C47FF] text-white text-sm font-bold rounded-xl hover:bg-[#5835e0] disabled:opacity-40 transition-colors whitespace-nowrap"
              style={{ minHeight: 52 }}
            >
              {creating ? '…' : 'Générer'}
            </button>
          </div>
          {previewSlug && (
            <p className="mt-2 text-xs text-[#9CA3AF] break-all">
              → {APP_URL}/demo/{previewSlug}
            </p>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white border border-[#E8E8E3] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white border border-[#E8E8E3] rounded-2xl p-10 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-sm text-[#6B6B6B]">
              Aucune campagne. Créez votre première ci-dessus.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[#9CA3AF] font-semibold uppercase tracking-wide">
              {campaigns.length} campagne{campaigns.length > 1 ? 's' : ''}
            </p>
            {campaigns.map(campaign => {
              const badge = adminBadge(campaign.admin_name)
              const leads = leadsBadge(campaign.leads_count)
              const isOwn = campaign.admin_user_id === userId

              return (
                <div
                  key={campaign.id}
                  className="bg-white border border-[#E8E8E3] rounded-2xl p-4 sm:p-5"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#1A1A1A] text-base leading-tight">{campaign.nom}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {/* Admin badge */}
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-white font-semibold"
                          style={{ backgroundColor: badge.bg, fontSize: 11 }}
                        >
                          {badge.label}
                        </span>
                        {/* Date */}
                        <span className="text-xs text-[#9CA3AF]">
                          {new Date(campaign.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </span>
                        {/* Leads */}
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: leads.bg, color: leads.color, fontSize: 11 }}
                        >
                          {leads.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-1 break-all">{campaign.url}</p>
                    </div>

                    {isOwn && (
                      <button
                        onClick={() => deleteCampaign(campaign.id)}
                        className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 transition-colors text-base"
                        aria-label="Supprimer"
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  {/* Action buttons — stacked on mobile, side-by-side on sm */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => copyUrl(campaign.url, campaign.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-[#E8E8E3] text-[#6B6B6B] font-semibold rounded-xl hover:border-[#6C47FF]/40 transition-colors text-sm"
                      style={{ minHeight: 44 }}
                    >
                      {copied === campaign.id ? '✓ Copié !' : '📋 Copier le lien'}
                    </button>
                    <button
                      onClick={() => setQrModal(campaign)}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-[#E8E8E3] text-[#6B6B6B] font-semibold rounded-xl hover:border-[#6C47FF]/40 transition-colors text-sm"
                      style={{ minHeight: 44 }}
                    >
                      📱 QR Code
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
