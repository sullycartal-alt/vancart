import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'

const schema = z.object({
  prenom: z.string().min(1, 'Le prénom est requis.').max(80),
  commerce: z.string().min(1, 'Le nom du commerce est requis.').max(120),
  email: z.string().min(1, "L'email est requis.").email("L'adresse email n'est pas valide."),
  telephone: z.string().max(30).optional(),
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
    const firstError = parsed.error.issues[0]?.message ?? 'Données invalides.'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const { prenom, commerce, email, telephone, message, campaign } = parsed.data

  if (!process.env.RESEND_API_KEY) {
    console.log('[demo-contact] RESEND_API_KEY not set — skipping email')
    return NextResponse.json({ ok: true })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const FROM = process.env.RESEND_FROM_EMAIL ?? 'VanCart <onboarding@resend.dev>'
  const campaignLabel = campaign ?? 'accès direct'

  // Mobile-friendly HTML email (Sullivan reads it on his phone)
  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table cellpadding="0" cellspacing="0" style="max-width:480px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">

    <tr>
      <td style="background:linear-gradient(135deg,#6C47FF,#8b6bff);padding:28px 24px">
        <p style="margin:0;color:rgba(255,255,255,0.8);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Nouveau lead VanCart</p>
        <h1 style="margin:6px 0 0;color:white;font-size:22px;font-weight:800;line-height:1.3">🎯 ${prenom} — ${commerce}</h1>
      </td>
    </tr>

    <tr>
      <td style="padding:24px">
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;width:110px;vertical-align:top">Prénom</td>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:600">${prenom}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;vertical-align:top">Commerce</td>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:600">${commerce}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;vertical-align:top">Email</td>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px"><a href="mailto:${email}" style="color:#6C47FF;font-weight:600">${email}</a></td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;vertical-align:top">Téléphone</td>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px">${telephone || '—'}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#6b7280;font-size:14px;vertical-align:top">📍 Campagne</td>
            <td style="padding:10px 0;font-size:14px"><span style="background:#6C47FF15;color:#6C47FF;padding:2px 8px;border-radius:6px;font-weight:600;font-size:13px">${campaignLabel}</span></td>
          </tr>
        </table>

        ${message ? `
        <div style="margin-top:16px;background:#f9fafb;border-radius:12px;padding:14px">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Message</p>
          <p style="margin:0;font-size:14px;color:#111827;line-height:1.6">${message.replace(/\n/g, '<br>')}</p>
        </div>` : ''}

        <div style="margin-top:20px;text-align:center">
          <a href="mailto:${email}" style="display:inline-block;padding:12px 24px;background:#6C47FF;color:white;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none">
            Répondre à ${prenom} →
          </a>
        </div>
      </td>
    </tr>

    <tr>
      <td style="padding:14px 24px;background:#f9fafb;border-top:1px solid #f3f4f6">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">IP : ${ip}</p>
      </td>
    </tr>

  </table>
</body>
</html>`

  try {
    await resend.emails.send({
      from: FROM,
      to: 'sullivan@vancart.fr',
      replyTo: email,
      subject: `🎯 Lead VanCart — ${commerce}${campaign ? ` [${campaign}]` : ''}`,
      html,
    })
  } catch (err) {
    console.error('[demo-contact] Resend failed:', err)
  }

  return NextResponse.json({ ok: true })
}
