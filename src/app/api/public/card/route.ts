import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const service = createServiceClient()
  const { data, error } = await service
    .from('loyalty_cards')
    .select('id, stamps_count, points, rewards_unlocked, merchants(business_name, logo_url, primary_color, merchant_color_2, loyalty_rule, stamps_required, loyalty_type, points_required, banner_url), customers(first_name)')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
