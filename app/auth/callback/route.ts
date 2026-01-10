import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard'
  const type = requestUrl.searchParams.get('type')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const errorUrl = new URL('/login', requestUrl.origin)
    errorUrl.searchParams.set('error', error || 'oauth_error')
    if (errorDescription) {
      errorUrl.searchParams.set('error_description', errorDescription)
    }
    return NextResponse.redirect(errorUrl)
  }

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Session exchange error:', exchangeError)
        const errorUrl = new URL('/login', requestUrl.origin)
        errorUrl.searchParams.set('error', 'session_exchange_failed')
        return NextResponse.redirect(errorUrl)
      }

      // Handle different authentication types
      if (type === 'recovery' || type === 'reset') {
        // Password reset flow - redirect to password reset confirmation
        return NextResponse.redirect(new URL('/auth/reset-password-confirm', requestUrl.origin))
      }

      if (type === 'signup' || type === 'email') {
        // Email verification - check if email is verified
        if (data.session?.user.email_confirmed_at) {
          // Email is verified, redirect to dashboard
          return NextResponse.redirect(new URL(redirect, requestUrl.origin))
        } else {
          // Email not verified yet, redirect to verification page
          return NextResponse.redirect(new URL('/auth/verify-email', requestUrl.origin))
        }
      }

      // OAuth or magic link - redirect to intended destination
      return NextResponse.redirect(new URL(redirect, requestUrl.origin))
    } catch (err) {
      console.error('Auth callback error:', err)
      const errorUrl = new URL('/login', requestUrl.origin)
      errorUrl.searchParams.set('error', 'callback_error')
      return NextResponse.redirect(errorUrl)
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
