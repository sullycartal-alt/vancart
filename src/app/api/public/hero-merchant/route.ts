import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FALLBACK = {
  business_name: 'Café des Arts',
  primary_color: '#6C47FF',
  loyalty_type: 'stamps',
  stamps_required: 9,
  loyalty_rule: '1 café offert',
}

export async function GET() {
  const supabase = createServiceClient()

  const { data: users } = await supabase.auth.admin.listUsers()
  const userId = users?.users?.find(u => u.email === 'sullycartal@gmail.com')?.id

  if (!userId) {
    return NextResponse.json(FALLBACK)
  }

  const { data } = await supabase
    .from('merchants')
    .select('business_name, primary_color, logo_url, banner_url, loyalty_type, stamps_required, points_required, loyalty_rule')
    .eq('user_id', userId)
    .single()

  return NextResponse.json(data || FALLBACK)
}
