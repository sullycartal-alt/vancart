import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single()
  if (!merchant) {
    return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
  }

  const period = new URL(request.url).searchParams.get('period') ?? '7d'
  let since: string | null = null
  if (period === '7d') since = new Date(Date.now() - 7 * 86400_000).toISOString()
  else if (period === '30d') since = new Date(Date.now() - 30 * 86400_000).toISOString()

  let query = supabase.from('stamps').select('serveur_name, given_at').eq('merchant_id', merchant.id)
  if (since) query = query.gte('given_at', since)
  const { data: stamps } = await query

  const counts = new Map<string, number>()
  for (const s of stamps ?? []) {
    const raw = (s as { serveur_name?: string | null }).serveur_name
    const name = raw && raw.trim() ? raw.trim() : 'Dashboard'
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }

  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0)
  const rows = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count, pct: total ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json({ rows, total })
}
