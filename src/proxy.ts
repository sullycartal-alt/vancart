import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminEmail } from '@/lib/admin-config'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // PWA standalone redirect: SW adds x-pwa-standalone header to navigation requests.
  // If customer cookie exists, skip landing page and go straight to wallet.
  if (
    pathname === '/' &&
    request.headers.get('x-pwa-standalone') === '1' &&
    request.cookies.has('vancart_customer_id')
  ) {
    return NextResponse.redirect(new URL('/wallet', request.url))
  }

  // Auth guard only applies to merchant-facing protected routes.
  // /wallet and /carte/* are customer-facing public routes — no Supabase account needed.
  const isProtectedRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  if (!isProtectedRoute) {
    return NextResponse.next()
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

    if (pathname.startsWith('/admin') && !isAdminEmail(user.email)) {
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

