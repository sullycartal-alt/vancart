import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const customerSchema = z.object({
  phone: z.string().min(8),
  first_name: z.string().min(1),
})

export async function POST(request: Request) {
  // Use service role to bypass RLS — this is a public endpoint (QR scan flow)
  const service = createServiceClient()

  const body = await request.json()
  const parsed = customerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data: existing } = await service
    .from('customers')
    .select('id, phone, first_name')
    .eq('phone', parsed.data.phone)
    .single()

  if (existing) return NextResponse.json(existing)

  const { data, error } = await service
    .from('customers')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
