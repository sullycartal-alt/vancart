import { cookies } from 'next/headers'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/service'

// Secret de signature des cookies caisse — server-only, jamais exposé.
const SECRET =
  process.env.CAISSE_SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'vancart-caisse-dev-secret'

export interface CaissePayload {
  sessionId: string
  merchantId: string
  serveurName: string
  expiresAt: string
}

export function caisseCookieName(slug: string): string {
  return `caisse_session_${slug}`
}

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Signe un payload de session en token `data.signature` (HMAC-SHA256). */
export function signCaisseToken(payload: CaissePayload): string {
  const data = b64url(Buffer.from(JSON.stringify(payload)))
  const sig = b64url(crypto.createHmac('sha256', SECRET).update(data).digest())
  return `${data}.${sig}`
}

/** Vérifie la signature HMAC d'un token et renvoie le payload, ou null si invalide. */
export function verifyCaisseToken(token: string): CaissePayload | null {
  const [data, sig] = token.split('.')
  if (!data || !sig) return null
  const expected = b64url(crypto.createHmac('sha256', SECRET).update(data).digest())
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length) return null
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null
  try {
    const json = Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    return JSON.parse(json) as CaissePayload
  } catch {
    return null
  }
}

/**
 * Lit et valide la session caisse pour un slug donné.
 * - vérifie la signature HMAC du cookie
 * - vérifie l'expiration côté payload
 * - vérifie que la session existe toujours en base et n'est pas expirée
 *   (permet au commerçant de déconnecter toutes les sessions actives)
 */
export async function getCaisseSession(slug: string): Promise<CaissePayload | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(caisseCookieName(slug))?.value
  if (!raw) return null

  const payload = verifyCaisseToken(raw)
  if (!payload) return null
  if (new Date(payload.expiresAt).getTime() < Date.now()) return null

  const service = createServiceClient()
  const { data } = await service
    .from('caisse_sessions')
    .select('id, expires_at')
    .eq('id', payload.sessionId)
    .single()

  if (!data) return null
  if (new Date(data.expires_at).getTime() < Date.now()) return null

  return payload
}
