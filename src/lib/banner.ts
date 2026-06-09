// Fire-and-forget trigger that asks the banner generator to refresh a merchant's
// interactive banner after a stamp. Non-blocking: the stamp response is never
// delayed and any failure is swallowed (the banner simply stays as-is).
//
// Skips merchants without an interactive banner pattern so uploaded photos are
// never overwritten.
export function triggerBannerRegen(params: {
  merchantId: string
  primaryColor: string | null
  bannerPattern: string | null
  stampsCount?: number
  stampsRequired?: number | null
}): void {
  const { merchantId, primaryColor, bannerPattern, stampsCount, stampsRequired } = params
  if (!bannerPattern) return

  const base = process.env.NEXT_PUBLIC_APP_URL
  const internalKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!base || !internalKey) return

  fetch(`${base}/api/merchant/generate-banner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-internal-key': internalKey },
    body: JSON.stringify({ merchantId, primaryColor, bannerPattern, stampsCount, stampsRequired }),
  }).catch(() => {})
}
