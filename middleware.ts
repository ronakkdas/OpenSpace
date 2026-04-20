import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options as Parameters<typeof res.cookies.set>[2]))
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const path = req.nextUrl.pathname
  const protectedPaths = ['/dashboard', '/onboarding', '/saved', '/account']
  const isProtected = protectedPaths.some(p => path.startsWith(p))

  // Not logged in → send to login
  if (isProtected && !session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based gating: check once for business-only / student-only paths
  if (session && (path.startsWith('/dashboard') || path.startsWith('/onboarding') || path.startsWith('/saved'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()

    const role = profile?.role

    // Business-only routes
    if ((path.startsWith('/dashboard') || path.startsWith('/onboarding')) && role !== 'business') {
      return NextResponse.redirect(new URL('/explore', req.url))
    }

    // Student-only routes
    if (path.startsWith('/saved') && role === 'business') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/saved', '/account'],
}
