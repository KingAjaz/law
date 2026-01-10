import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/services',
    '/pricing',
    '/about',
    '/faqs',
    '/contact',
    '/login',
    '/signup',
    '/reset-password',
    '/auth',
    '/terms',
    '/privacy',
    '/disclaimer',
  ]

  // Check if Supabase env variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // If env variables are missing, allow public routes only
    if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route))) {
      return NextResponse.next()
    }
    
    // Redirect protected routes to login
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Auth routes (redirect if already logged in)
    const authRoutes = ['/login', '/signup', '/reset-password']
    
    // Auth callback routes (public, but handle differently)
    const authCallbackRoutes = ['/auth']

    // Protected routes
    const protectedRoutes = ['/dashboard', '/kyc']
    const adminRoutes = ['/admin']
    const lawyerRoutes = ['/lawyer']

    // Check if route is public
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
    const isLawyerRoute = lawyerRoutes.some((route) => pathname.startsWith(route))

    // If user is not authenticated and trying to access protected route
    if (!session && (isProtectedRoute || isAdminRoute || isLawyerRoute)) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is authenticated and trying to access auth routes
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Check role-based access
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, kyc_completed')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        // Admin routes - only admins
        if (isAdminRoute && profile.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }

        // Lawyer routes - only lawyers
        if (isLawyerRoute && profile.role !== 'lawyer') {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }

        // User dashboard - check KYC
        if (isProtectedRoute && profile.role === 'user' && !profile.kyc_completed) {
          if (pathname !== '/kyc') {
            return NextResponse.redirect(new URL('/kyc', req.url))
          }
        }
      }
    }
  } catch (error) {
    // If Supabase client creation fails, allow public routes only
    if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route))) {
      return NextResponse.next()
    }
    
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
