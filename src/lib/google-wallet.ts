import { createSign } from 'crypto'

function cfg() {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID ?? ''
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? ''

  // Approach 1 (preferred): key stored as base64 in GOOGLE_PRIVATE_KEY_BASE64
  // → avoids all \n-escaping issues entirely.
  // To generate: in a terminal run:
  //   node -e "process.stdout.write(Buffer.from(require('fs').readFileSync('key.pem','utf8')).toString('base64'))"
  // Then paste the result as the Vercel env var value.
  let key: string
  const b64 = process.env.GOOGLE_PRIVATE_KEY_BASE64
  if (b64) {
    key = Buffer.from(b64, 'base64').toString('utf-8').trim()
  } else {
    // Approach 2 (fallback): raw PEM with literal \n sequences from Vercel
    const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? ''
    key = rawKey
      .replace(/\\n/g, '\n') // literal \n → real newline (most common Vercel format)
      .replace(/\\r/g, '')   // strip any literal \r so they don't corrupt the PEM
      .trim()
  }

  return { issuerId, email, key }
}

export function isConfigured(): boolean {
  const c = cfg()
  return !!(c.issuerId && c.email && c.key)
}

function b64url(data: object | string): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data)
  return Buffer.from(str).toString('base64url')
}

function signJWT(payload: object): string {
  const { key } = cfg()
  const header = b64url({ alg: 'RS256', typ: 'JWT' })
  const body = b64url(payload)
  const sign = createSign('RSA-SHA256')
  sign.update(`${header}.${body}`)
  return `${header}.${body}.${sign.sign(key, 'base64url')}`
}

async function getAccessToken(): Promise<string> {
  const { email } = cfg()
  const now = Math.floor(Date.now() / 1000)
  const jwt = signJWT({
    iss: email,
    scope: 'https://www.googleapis.com/auth/wallet_object.issuer',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`Google OAuth: ${JSON.stringify(data)}`)
  return data.access_token
}

const API = 'https://walletobjects.googleapis.com/walletobjects/v1'

function classId(merchantId: string): string {
  return `${cfg().issuerId}.merchant_${merchantId.replace(/-/g, '_')}`
}

function objectId(cardId: string): string {
  return `${cfg().issuerId}.c_${cardId.replace(/-/g, '_')}`
}

function classBody(cId: string, p: { merchantName: string; loyaltyRule: string; primaryColor: string; logoUrl?: string | null }) {
  const body: Record<string, unknown> = {
    id: cId,
    issuerName: p.merchantName,
    programName: p.loyaltyRule || 'Carte de fidélité',
    reviewStatus: 'UNDER_REVIEW',
    hexBackgroundColor: /^#[0-9a-f]{6}$/i.test(p.primaryColor) ? p.primaryColor : '#4f46e5',
  }
  if (p.logoUrl) {
    body.programLogo = {
      sourceUri: { uri: p.logoUrl },
      contentDescription: { defaultValue: { language: 'fr', value: p.merchantName } },
    }
  }
  return body
}

function objectBody(oId: string, cId: string, p: {
  cardId: string
  customerName: string
  stampsCount: number
  stampsRequired: number
  walletMessage?: string | null
  heroImageUrl?: string | null
  cardExpiryMonths?: number | null
  instagramHandle?: string | null
  showInstagram?: boolean
}) {
  const textModules: Array<{ header: string; body: string; id: string }> = [
    { header: 'Progression', body: `${p.stampsCount} tampon(s) sur ${p.stampsRequired}`, id: 'stamps_progress' },
  ]
  if (p.walletMessage) {
    textModules.push({ header: 'Message', body: p.walletMessage, id: 'wallet_message' })
  }

  const obj: Record<string, unknown> = {
    id: oId,
    classId: cId,
    state: 'ACTIVE',
    accountId: p.cardId,
    accountName: p.customerName,
    loyaltyPoints: {
      balance: { string: `${p.stampsCount}/${p.stampsRequired}` },
      label: 'Tampons',
    },
    barcode: {
      type: 'QR_CODE',
      value: p.cardId,
      alternateText: p.cardId,
    },
    textModulesData: textModules,
  }

  if (p.heroImageUrl) {
    obj.heroImage = {
      sourceUri: { uri: p.heroImageUrl },
      contentDescription: { defaultValue: { language: 'fr', value: 'Bannière' } },
    }
  }

  if (p.showInstagram && p.instagramHandle) {
    obj.linksModuleData = {
      uris: [{
        uri: `https://instagram.com/${p.instagramHandle}`,
        description: `@${p.instagramHandle}`,
        id: 'instagram',
      }],
    }
  }

  if (p.cardExpiryMonths) {
    const expiryMs = Date.now() + p.cardExpiryMonths * 30 * 24 * 60 * 60 * 1000
    obj.validTimeInterval = {
      end: { date: new Date(expiryMs).toISOString() },
    }
  }

  return obj
}

async function ensureClass(
  token: string,
  cId: string,
  p: { merchantName: string; loyaltyRule: string; primaryColor: string; logoUrl?: string | null },
) {
  const getRes = await fetch(`${API}/loyaltyClass/${encodeURIComponent(cId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  console.log('[google-wallet] ensureClass GET status:', getRes.status)
  if (getRes.ok) return

  // Class not found — create it
  const body = classBody(cId, p)
  console.log('[google-wallet] creating loyaltyClass…', JSON.stringify({ id: cId, issuerName: p.merchantName }))
  const postRes = await fetch(`${API}/loyaltyClass`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!postRes.ok) {
    const detail = await postRes.text()
    console.error('[google-wallet] loyaltyClass POST failed:', postRes.status, detail)
    throw new Error(`Failed to create LoyaltyClass (${postRes.status}): ${detail}`)
  }
  console.log('[google-wallet] loyaltyClass created, status:', postRes.status)
}

async function upsertObject(
  token: string,
  oId: string,
  cId: string,
  p: {
    cardId: string; customerName: string; stampsCount: number; stampsRequired: number
    walletMessage?: string | null; heroImageUrl?: string | null; cardExpiryMonths?: number | null
    instagramHandle?: string | null; showInstagram?: boolean
  },
) {
  const body = objectBody(oId, cId, p)
  console.log('[google-wallet] upsertObject:', oId, 'state:', body.state)

  // Try GET first to decide between POST (create) and PUT (update)
  const getRes = await fetch(`${API}/loyaltyObject/${encodeURIComponent(oId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  console.log('[google-wallet] loyaltyObject GET status:', getRes.status)

  if (getRes.ok) {
    // Object exists — update it
    const putRes = await fetch(`${API}/loyaltyObject/${encodeURIComponent(oId)}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!putRes.ok) {
      const detail = await putRes.text()
      console.error('[google-wallet] loyaltyObject PUT failed:', putRes.status, detail)
      throw new Error(`Failed to update LoyaltyObject (${putRes.status}): ${detail}`)
    }
    console.log('[google-wallet] loyaltyObject updated, status:', putRes.status)
  } else {
    // Object does not exist — create it
    const postRes = await fetch(`${API}/loyaltyObject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!postRes.ok) {
      const detail = await postRes.text()
      console.error('[google-wallet] loyaltyObject POST failed:', postRes.status, detail)
      throw new Error(`Failed to create LoyaltyObject (${postRes.status}): ${detail}`)
    }
    console.log('[google-wallet] loyaltyObject created, status:', postRes.status)
  }
}

/**
 * Ensures the loyalty class and object exist in Google Wallet, then returns
 * the "Add to Google Wallet" URL.
 */
export async function buildGoogleWalletURL(params: {
  cardId: string
  merchantId: string
  customerName: string
  merchantName: string
  loyaltyRule: string
  primaryColor: string
  logoUrl?: string | null
  stampsCount: number
  stampsRequired: number
  heroImageUrl?: string | null
  walletMessage?: string | null
  cardExpiryMonths?: number | null
  instagramHandle?: string | null
  showInstagram?: boolean
}): Promise<string> {
  const token = await getAccessToken()
  const cId = classId(params.merchantId)
  const oId = objectId(params.cardId)

  await ensureClass(token, cId, params)
  await upsertObject(token, oId, cId, {
    cardId: params.cardId,
    customerName: params.customerName,
    stampsCount: params.stampsCount,
    stampsRequired: params.stampsRequired,
    walletMessage: params.walletMessage,
    heroImageUrl: params.heroImageUrl,
    cardExpiryMonths: params.cardExpiryMonths,
    instagramHandle: params.instagramHandle,
    showInstagram: params.showInstagram,
  })

  const { email } = cfg()
  const jwt = signJWT({
    iss: email,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    payload: {
      loyaltyObjects: [{ id: oId, classId: cId }],
    },
  })
  return `https://pay.google.com/gp/v/save/${jwt}`
}

/**
 * Updates the LoyaltyClass for a merchant — used when logo or branding changes.
 * Silent no-op if the class doesn't exist or Google Wallet is not configured.
 */
export async function updateWalletClass(params: {
  merchantId: string
  merchantName: string
  loyaltyRule: string
  primaryColor: string
  logoUrl?: string | null
}): Promise<void> {
  if (!isConfigured()) return
  try {
    const token = await getAccessToken()
    const cId = classId(params.merchantId)
    const getRes = await fetch(`${API}/loyaltyClass/${encodeURIComponent(cId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!getRes.ok) return // class doesn't exist yet, nothing to update
    const body = classBody(cId, params)
    await fetch(`${API}/loyaltyClass/${encodeURIComponent(cId)}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (err) {
    console.error('[google-wallet] updateWalletClass failed (non-fatal):', err)
  }
}

/**
 * Pushes an updated stamp count to an already-saved Google Wallet pass.
 * Silent no-op if the object doesn't exist yet (user hasn't saved the pass).
 */
export async function updateWalletPass(
  cardId: string,
  stampsCount: number,
  stampsRequired: number,
): Promise<void> {
  const token = await getAccessToken()
  const oId = objectId(cardId)
  await fetch(`${API}/loyaltyObject/${encodeURIComponent(oId)}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      loyaltyPoints: {
        balance: { string: `${stampsCount}/${stampsRequired}` },
        label: 'Tampons',
      },
      textModulesData: [{
        header: 'Progression',
        body: `${stampsCount} tampon(s) sur ${stampsRequired}`,
        id: 'stamps_progress',
      }],
    }),
  })
}
