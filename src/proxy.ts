import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_EMAIL = 'sullycartal@gmail.com'

export async function proxy(request: NextRequest) {
  // PWA standalone redirect: SW adds x-pwa-standalone header to navigation requests.
  // If customer cookie exists, skip landing page and go straight to wallet.
  if (
    request.nextUrl.pathname === '/' &&
    request.headers.get('x-pwa-standalone') === '1' &&
    request.cookies.has('vancart_customer_id')
  ) {
    return NextResponse.redirect(new URL('/wallet', request.url))
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (request.nextUrl.pathname.startsWith('/admin') && user.email !== ADMIN_EMAIL) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/admin/:path*'],
}
