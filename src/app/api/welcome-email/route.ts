import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM_EMAIL ?? 'VanCart <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vancart.fr'

export async function POST(request: Request) {
  const { email, businessName } = await request.json()
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const name = (businessName as string) || 'commerçant'

  const steps = [
    ['01', 'Configurez votre commerce', 'Logo, couleur, règle de fidélité — 2 minutes chrono.', `${APP_URL}/dashboard/settings`],
    ['02', 'Imprimez votre QR code', 'Téléchargez-le depuis le dashboard et posez-le en caisse.', `${APP_URL}/dashboard`],
    ['03', 'Partagez avec vos clients', 'Envoyez le lien de votre carte sur vos réseaux sociaux.', `${APP_URL}/dashboard/guide`],
  ]

  const stepsHtml = steps.map(([num, title, desc, link]) => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #f3f4f6;vertical-align:top">
        <table cellpadding="0" cellspacing="0" style="width:100%">
          <tr>
            <td style="width:40px;vertical-align:top;padding-right:12px">
              <div style="width:32px;height:32px;background:#eef2ff;border-radius:50%;text-align:center;line-height:32px;font-size:12px;font-weight:700;color:#6366f1">${num}</div>
            </td>
            <td>
              <p style="margin:0 0 4px;font-weight:600;font-size:14px;color:#111827">${title}</p>
              <p style="margin:0 0 6px;color:#6b7280;font-size:13px;line-height:1.5">${desc}</p>
              <a href="${link}" style="font-size:13px;color:#6366f1;font-weight:500;text-decoration:none">${link.replace(APP_URL, '') || '/'} →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif;color:#111827">
  <table cellpadding="0" cellspacing="0" style="max-width:560px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <tr>
      <td style="background:#6366f1;padding:40px 32px;text-align:center">
        <h1 style="margin:0;color:white;font-size:24px;font-weight:800;letter-spacing:-0.5px">VanCart</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:15px">Cartes de fidélité dématérialisées</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px">
        <h2 style="margin:0 0 8px;font-size:20px;font-weight:700">Bienvenue, ${name}&nbsp;! 👋</h2>
        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6">
          Votre compte VanCart est prêt. Voici comment lancer votre programme de fidélité en moins de 10 minutes.
        </p>
        <table cellpadding="0" cellspacing="0" style="width:100%">${stepsHtml}</table>
        <div style="margin-top:32px;text-align:center">
          <a href="${APP_URL}/dashboard/guide"
            style="display:inline-block;padding:12px 28px;background:#6366f1;color:white;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none">
            Voir le guide de démarrage →
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;text-align:center">
        <p style="margin:0;font-size:12px;color:#9ca3af">
          VanCart &middot; <a href="${APP_URL}/politique-confidentialite" style="color:#9ca3af">Politique de confidentialité</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`

  try {
    await resend.emails.send({ from: FROM, to: email, subject: `Bienvenue sur VanCart, ${name} ! 🎴`, html })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[welcome-email] send failed:', err)
    return NextResponse.json({ ok: true }) // never break registration
  }
}
