import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cookieStore = await cookies()
  const customerId = cookieStore.get('vancart_customer_id')?.value ?? null
  return NextResponse.json({ customerId })
}
