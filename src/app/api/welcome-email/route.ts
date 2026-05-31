import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM_EMAIL ?? 'VanCart <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vancart.fr'
const BRAND_COLOR = '#6C47FF'

export async function POST(request: Request) {
  const { email, businessName, firstName } = await request.json()
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const name = (firstName as string) || (businessName as string) || 'commerçant'

  const steps = [
    {
      num: '01',
      icon: '🏪',
      title: 'Configurez votre commerce',
      desc: "Logo, couleur, règle de fidélité — rendez-vous dans Mon commerce.",
      link: `${APP_URL}/dashboard/settings`,
      linkLabel: 'Configurer →',
    },
    {
      num: '02',
      icon: '📲',
      title: 'Posez votre QR code en caisse',
      desc: 'Téléchargez-le depuis le dashboard et affichez-le sur votre comptoir.',
      link: `${APP_URL}/dashboard`,
      linkLabel: 'Aller au dashboard →',
    },
    {
      num: '03',
      icon: '🎯',
      title: 'Suivez vos clients fidèles',
      desc: 'Consultez vos statistiques, tamponnez en 1 clic, regardez votre clientèle grandir.',
      link: `${APP_URL}/dashboard/guide`,
      linkLabel: 'Voir le guide →',
    },
  ]

  const stepsHtml = steps.map(({ num, icon, title, desc, link, linkLabel }) => `
    <tr>
      <td style="padding:20px 0;border-bottom:1px solid #f3f4f6;vertical-align:top">
        <table cellpadding="0" cellspacing="0" style="width:100%">
          <tr>
            <td style="width:48px;vertical-align:top;padding-right:16px">
              <div style="width:40px;height:40px;background:${BRAND_COLOR}15;border-radius:12px;text-align:center;line-height:40px;font-size:18px">${icon}</div>
            </td>
            <td>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <span style="font-size:10px;font-weight:700;color:${BRAND_COLOR};text-transform:uppercase;letter-spacing:0.5px">Étape ${num}</span>
              </div>
              <p style="margin:0 0 4px;font-weight:700;font-size:15px;color:#111827">${title}</p>
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.6">${desc}</p>
              <a href="${link}" style="font-size:13px;color:${BRAND_COLOR};font-weight:600;text-decoration:none">${linkLabel}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827">
  <table cellpadding="0" cellspacing="0" style="max-width:580px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">

    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,${BRAND_COLOR},#8b6bff);padding:48px 40px;text-align:center">
        <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:16px;padding:12px 20px;margin-bottom:20px">
          <span style="color:white;font-size:28px;font-weight:900;letter-spacing:-1px">VanCart</span>
        </div>
        <h1 style="margin:0;color:white;font-size:26px;font-weight:800;line-height:1.3">
          Bienvenue, ${name}&nbsp;! 🎉
        </h1>
        <p style="margin:12px 0 0;color:rgba(255,255,255,0.85);font-size:15px;line-height:1.6">
          Votre programme de fidélité digital est prêt à démarrer.
        </p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:40px">
        <p style="margin:0 0 8px;font-size:16px;color:#374151;line-height:1.7">
          Votre compte VanCart vient d'être créé. En quelques minutes, vous aurez un QR code unique à poser en caisse&nbsp;— et vos clients pourront collecter leurs tampons directement depuis leur smartphone, sans application.
        </p>

        <div style="margin:32px 0;padding:20px;background:#f9fafb;border-radius:12px;border:1px solid #f3f4f6">
          <p style="margin:0 0 16px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280">Vos 3 premières étapes</p>
          <table cellpadding="0" cellspacing="0" style="width:100%">${stepsHtml}</table>
        </div>

        <div style="text-align:center;margin:32px 0">
          <a href="${APP_URL}/dashboard"
            style="display:inline-block;padding:14px 36px;background:${BRAND_COLOR};color:white;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;box-shadow:0 4px 16px ${BRAND_COLOR}40">
            Accéder à mon dashboard →
          </a>
        </div>

        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:0">
          <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6">
            <strong>💡 Bon à savoir :</strong> Vous bénéficiez d'1 mois gratuit sans carte bancaire. Vous pouvez accueillir jusqu'à 50 clients fidèles. À la fin du mois, Sullivan &amp; Audrey vous contactent pour faire le point ensemble.
          </p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:24px 40px;background:#f9fafb;border-top:1px solid #f3f4f6">
        <table cellpadding="0" cellspacing="0" style="width:100%">
          <tr>
            <td style="text-align:center">
              <p style="margin:0 0 8px;font-size:13px;color:#374151;font-weight:600">L'équipe VanCart</p>
              <p style="margin:0 0 12px;font-size:12px;color:#9ca3af;line-height:1.6">
                Des questions ? Répondez à cet email ou écrivez-nous à&nbsp;
                <a href="mailto:contact@vancart.fr" style="color:${BRAND_COLOR};text-decoration:none">contact@vancart.fr</a>
              </p>
              <p style="margin:0;font-size:11px;color:#d1d5db">
                <a href="${APP_URL}/politique-confidentialite" style="color:#d1d5db;text-decoration:underline">Politique de confidentialité</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}/cgu" style="color:#d1d5db;text-decoration:underline">CGU</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Bienvenue sur VanCart, ${name} ! 🎴 Votre carte de fidélité vous attend`,
      html,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[welcome-email] send failed:', err)
    return NextResponse.json({ ok: true }) // never break registration
  }
}
