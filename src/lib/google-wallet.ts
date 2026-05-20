import { createSign } from 'crypto'

function cfg() {
  return {
    issuerId: process.env.GOOGLE_WALLET_ISSUER_ID ?? '',
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '',
    key: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
  }
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
  return `${cfg().issuerId}.m_${merchantId.replace(/-/g, '_')}`
}

function objectId(cardId: string): string {
  return `${cfg().issuerId}.c_${cardId.replace(/-/g, '_')}`
}

function classBody(cId: string, p: { merchantName: string; loyaltyRule: string; primaryColor: string }) {
  return {
    id: cId,
    issuerName: p.merchantName,
    programName: p.loyaltyRule || 'Carte de fidélité',
    reviewStatus: 'UNDER_REVIEW',
    hexBackgroundColor: /^#[0-9a-f]{6}$/i.test(p.primaryColor) ? p.primaryColor : '#4f46e5',
  }
}

function objectBody(oId: string, cId: string, p: {
  cardId: string
  stampsCount: number
  stampsRequired: number
}) {
  return {
    id: oId,
    classId: cId,
    state: 'ACTIVE',
    loyaltyPoints: {
      balance: { string: `${p.stampsCount}/${p.stampsRequired}` },
      label: 'Tampons',
    },
    barcode: {
      type: 'QR_CODE',
      value: p.cardId,
      alternateText: p.cardId,
    },
    textModulesData: [{
      header: 'Progression',
      body: `${p.stampsCount} tampon(s) sur ${p.stampsRequired}`,
      id: 'stamps_progress',
    }],
  }
}

async function ensureClass(
  token: string,
  cId: string,
  p: { merchantName: string; loyaltyRule: string; primaryColor: string },
) {
  const res = await fetch(`${API}/loyaltyClass/${encodeURIComponent(cId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.ok) return
  await fetch(`${API}/loyaltyClass`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(classBody(cId, p)),
  })
}

async function upsertObject(
  token: string,
  oId: string,
  cId: string,
  p: { cardId: string; stampsCount: number; stampsRequired: number },
) {
  const body = objectBody(oId, cId, p)
  const putRes = await fetch(`${API}/loyaltyObject/${encodeURIComponent(oId)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!putRes.ok) {
    await fetch(`${API}/loyaltyObject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }
}

/**
 * Ensures the loyalty class and object exist in Google Wallet, then returns
 * the "Add to Google Wallet" URL.
 */
export async function buildGoogleWalletURL(params: {
  cardId: string
  merchantId: string
  merchantName: string
  loyaltyRule: string
  primaryColor: string
  stampsCount: number
  stampsRequired: number
}): Promise<string> {
  const token = await getAccessToken()
  const cId = classId(params.merchantId)
  const oId = objectId(params.cardId)

  await ensureClass(token, cId, params)
  await upsertObject(token, oId, cId, params)

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
