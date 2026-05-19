import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const customerSchema = z.object({
  phone: z.string().min(8),
  first_name: z.string().min(1),
})

export async function POST(request: Request) {
  const supabase = await createClient()

  const body = await request.json()
  const parsed = customerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Check if customer with this phone already exists
  const { data: existing } = await supabase
    .from('customers')
    .select('id, phone, first_name')
    .eq('phone', parsed.data.phone)
    .single()

  if (existing) {
    return NextResponse.json(existing)
  }

  const { data, error } = await supabase
    .from('customers')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
