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

interface Lead {
  id: string
  created_at: string
  nom: string
  commerce: string
  adresse_commerce: string | null
  email: string | null
  telephone: string | null
  campaign_slug: string | null
  lu: boolean
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
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !url) return
    QRCode.toCanvas(canvasRef.current, url, {
      width: 224,
      margin: 2,
      color: { dark: '#1A1A1A', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    })
  }, [url])

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
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
          <canvas ref={canvasRef} className="rounded-xl border border-[#E8E8E3]" />
        </div>

        <div className="bg-[#F7F6F3] rounded-xl px-3 py-2">
          <p className="text-xs text-[#6B6B6B] break-all">{url}</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={download}
            className="w-full py-3 bg-[#6C47FF] text-white text-sm font-bold rounded-xl hover:bg-[#5835e0] transition-colors"
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
  const [tab, setTab] = useState<'campagnes' | 'leads'>('campagnes')

  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [qrModal, setQrModal] = useState<Campaign | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadsLoading, setLeadsLoading] = useState(true)

  const unreadCount = leads.filter(l => !l.lu).length

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
      await Promise.all([loadCampaigns(), loadLeads()])
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadCampaigns() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/prospection')
      const json = await res.json()
      if (!res.ok) {
        setError(`Erreur chargement : ${json.error ?? res.statusText}${json.code ? ` (code: ${json.code})` : ''}`)
      } else {
        setCampaigns(json.campaigns ?? [])
      }
    } catch (e: unknown) {
      setError(`Erreur réseau : ${e instanceof Error ? e.message : String(e)}`)
    }
    setLoading(false)
  }

  async function loadLeads() {
    setLeadsLoading(true)
    try {
      const res = await fetch('/api/admin/prospection/leads')
      const json = await res.json()
      if (res.ok) setLeads(json.leads ?? [])
    } catch { /* silent */ }
    setLeadsLoading(false)
  }

  async function createCampaign() {
    const trimmed = name.trim()
    if (!trimmed) return
    setError(null)
    setCreating(true)

    const slug = generateSlug(trimmed)
    const url = `${APP_URL}/demo/${slug}`

    try {
      const res = await fetch('/api/admin/prospection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: trimmed, slug, url }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(`Erreur Supabase : ${json.error ?? res.statusText}${json.code ? ` (code: ${json.code})` : ''}`)
      } else {
        setName('')
        await loadCampaigns()
      }
    } catch (e: unknown) {
      setError(`Erreur inattendue : ${e instanceof Error ? e.message : String(e)}`)
    }
    setCreating(false)
  }

  async function deleteCampaign(id: string) {
    try {
      await fetch('/api/admin/prospection', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setCampaigns(prev => prev.filter(c => c.id !== id))
    } catch { /* silent */ }
  }

  async function markLeadAsRead(id: string) {
    try {
      await fetch(`/api/demo-contact/${id}`, { method: 'PATCH' })
      setLeads(prev => prev.map(l => l.id === id ? { ...l, lu: true } : l))
    } catch { /* silent */ }
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
            Campagnes terrain et leads entrants.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#F7F6F3] rounded-xl p-1">
          <button
            onClick={() => setTab('campagnes')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              tab === 'campagnes' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
            }`}
          >
            🎯 Campagnes
          </button>
          <button
            onClick={() => setTab('leads')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'leads' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
            }`}
          >
            📬 Leads
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#6C47FF] text-white font-bold" style={{ fontSize: 11 }}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* ── CAMPAGNES TAB ─────────────────────────────── */}
        {tab === 'campagnes' && (
          <>
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
                  {creating ? 'Génération…' : 'Générer'}
                </button>
              </div>
              {previewSlug && (
                <p className="mt-2 text-xs text-[#9CA3AF] break-all">
                  → {APP_URL}/demo/{previewSlug}
                </p>
              )}
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  ⚠️ {error}
                </div>
              )}
              {error?.includes('does not exist') && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                  <p className="font-semibold">Migration SQL manquante</p>
                  <p className="mt-0.5">La table <code className="font-mono bg-amber-100 px-1 rounded">prospection_campaigns</code> n&apos;existe pas encore. Va dans Supabase → SQL Editor et exécute le fichier <code className="font-mono bg-amber-100 px-1 rounded">supabase/migrations/20260531_prospection_campaigns.sql</code>.</p>
                </div>
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
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-[#1A1A1A] text-base leading-tight">{campaign.nom}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-white font-semibold"
                              style={{ backgroundColor: badge.bg, fontSize: 11 }}
                            >
                              {badge.label}
                            </span>
                            <span className="text-xs text-[#9CA3AF]">
                              {new Date(campaign.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric', month: 'long', year: 'numeric',
                              })}
                            </span>
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

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => window.open(campaign.url, '_blank')}
                          className="flex-1 flex items-center justify-center gap-1.5 border border-[#E8E8E3] text-[#6B6B6B] font-semibold rounded-xl hover:border-[#6C47FF]/40 transition-colors text-sm"
                          style={{ minHeight: 44 }}
                        >
                          🔗 Ouvrir
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
          </>
        )}

        {/* ── LEADS TAB ─────────────────────────────────── */}
        {tab === 'leads' && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#9CA3AF] font-semibold uppercase tracking-wide">
                {leads.length} lead{leads.length > 1 ? 's' : ''}
                {unreadCount > 0 && (
                  <span className="ml-2 text-[#6C47FF]">· {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}</span>
                )}
              </p>
              <button
                onClick={loadLeads}
                className="text-xs text-[#6C47FF] hover:underline"
              >
                Rafraîchir
              </button>
            </div>

            {leadsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-white border border-[#E8E8E3] rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : leads.length === 0 ? (
              <div className="bg-white border border-[#E8E8E3] rounded-2xl p-10 text-center">
                <div className="text-4xl mb-3">📬</div>
                <p className="text-sm text-[#6B6B6B]">
                  Aucune soumission reçue pour le moment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map(lead => (
                  <div
                    key={lead.id}
                    className={`bg-white border rounded-2xl p-4 sm:p-5 ${!lead.lu ? 'border-[#6C47FF]/30 bg-[#6C47FF]/[0.02]' : 'border-[#E8E8E3]'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-[#1A1A1A] text-sm">{lead.nom}</h3>
                          {!lead.lu && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#6C47FF] text-white font-bold" style={{ fontSize: 10 }}>
                              NOUVEAU
                            </span>
                          )}
                          {lead.campaign_slug && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#F7F6F3] text-[#6B6B6B] font-semibold" style={{ fontSize: 10 }}>
                              {lead.campaign_slug}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-[#1A1A1A] mt-0.5">{lead.commerce}</p>
                        {lead.adresse_commerce && (
                          <p className="text-xs text-[#6B6B6B] mt-0.5">📍 {lead.adresse_commerce}</p>
                        )}
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="text-xs text-[#6C47FF] hover:underline">
                              {lead.email}
                            </a>
                          )}
                          {lead.telephone && (
                            <a href={`tel:${lead.telephone}`} className="text-xs text-[#6B6B6B]">
                              📞 {lead.telephone}
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-[#9CA3AF] mt-1">
                          {new Date(lead.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {!lead.lu && (
                        <button
                          onClick={() => markLeadAsRead(lead.id)}
                          className="flex-shrink-0 px-3 py-1.5 border border-[#E8E8E3] text-[#6B6B6B] text-xs font-semibold rounded-lg hover:bg-[#F7F6F3] transition-colors whitespace-nowrap"
                        >
                          ✓ Lu
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
