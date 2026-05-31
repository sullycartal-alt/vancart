import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'

const schema = z.object({
  prenom: z.string().min(1).max(80),
  commerce: z.string().min(1).max(120),
  email: z.string().email(),
  tel: z.string().max(30).optional(),
  message: z.string().max(1000).optional(),
  campaign: z.string().max(100).optional(),
})

// In-memory rate limit: 3 requests / IP / hour
const ipTimestamps = new Map<string, number[]>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const window = 60 * 60 * 1000
  const timestamps = (ipTimestamps.get(ip) ?? []).filter(t => now - t < window)
  if (timestamps.length >= 3) return false
  timestamps.push(now)
  ipTimestamps.set(ip, timestamps)
  return true
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Trop de demandes. Réessayez dans une heure.' },
      { status: 429 },
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })
  }

  const { prenom, commerce, email, tel, message, campaign } = parsed.data

  if (!process.env.RESEND_API_KEY) {
    console.log('[demo-contact] RESEND_API_KEY not set, skipping email')
    return NextResponse.json({ ok: true })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const FROM = process.env.RESEND_FROM_EMAIL ?? 'VanCart <onboarding@resend.dev>'

  const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:24px">
  <h2 style="color:#6C47FF;margin:0 0 16px">🎯 Nouvelle demande de démo</h2>
  ${campaign ? `<p style="background:#6C47FF15;border-left:3px solid #6C47FF;padding:8px 12px;border-radius:4px;font-size:13px;color:#6C47FF;margin-bottom:16px">Campagne : <strong>${campaign}</strong></p>` : ''}
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr><td style="padding:8px 0;color:#6B6B6B;width:100px">Prénom</td><td style="padding:8px 0;font-weight:600;color:#1A1A1A">${prenom}</td></tr>
    <tr><td style="padding:8px 0;color:#6B6B6B">Commerce</td><td style="padding:8px 0;font-weight:600;color:#1A1A1A">${commerce}</td></tr>
    <tr><td style="padding:8px 0;color:#6B6B6B">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#6C47FF">${email}</a></td></tr>
    <tr><td style="padding:8px 0;color:#6B6B6B">Téléphone</td><td style="padding:8px 0;color:#1A1A1A">${tel || '—'}</td></tr>
  </table>
  ${message ? `<div style="margin-top:16px;background:#F7F6F3;border-radius:12px;padding:12px;font-size:13px;color:#1A1A1A;line-height:1.6"><strong>Message :</strong><br>${message}</div>` : ''}
  <p style="margin-top:20px;font-size:12px;color:#9CA3AF">IP : ${ip}</p>
</div>`

  try {
    await resend.emails.send({
      from: FROM,
      to: 'sullivan@vancart.fr',
      replyTo: email,
      subject: `🎯 Démo demandée — ${prenom} (${commerce})${campaign ? ` [${campaign}]` : ''}`,
      html,
    })
  } catch (err) {
    console.error('[demo-contact] send failed:', err)
    // Don't surface email errors to the user
  }

  return NextResponse.json({ ok: true })
}
