import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define public paths that don't require authentication
  const isPublicPath =
    pathname.startsWith('/_next') || // Next.js internals
    pathname.startsWith('/api/') || // API routes
    pathname === '/' || // Homepage
    pathname.startsWith('/auth/') || // Auth pages (sign-in, sign-up, password reset, etc.)
    pathname.startsWith('/auth/password-reset') || // Password reset flow
    pathname.startsWith('/api/auth/') || // NextAuth if used
    pathname.startsWith('/favicon.ico') // Favicon

  // If it's a public path, allow access immediately
  if (isPublicPath) {
    return NextResponse.next()
  }

  // For all other routes (including /protected/*), check authentication
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient()

    // CRITICAL: Always use getUser() instead of getSession() in Next.js Middleware
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    // If no user or auth error occurs, redirect to sign-in
    if (error || !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/sign-in'
      // Optional: store intended destination for after login
      url.searchParams.set('callbackUrl', encodeURIComponent(request.url))
      return NextResponse.redirect(url)
    }

    // User is authenticated, continue to protected route
    return NextResponse.next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    // If there's a critical crash checking session, redirect to sign-in
    const url = request.nextUrl.clone()
    url.pathname = '/auth/sign-in'
    url.searchParams.set('callbackUrl', encodeURIComponent(request.url))
    return NextResponse.redirect(url)
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}