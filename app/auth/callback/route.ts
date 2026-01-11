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
        // Email verification flow
        // If session exists and email is verified, redirect to KYC (new users need to complete KYC)
        if (data.session?.user.email_confirmed_at) {
          // Check if user has completed KYC
          // Use maybeSingle() to handle case where profile doesn't exist yet
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('kyc_completed')
            .eq('id', data.session.user.id)
            .maybeSingle()
          
          // If profile doesn't exist or KYC not completed, redirect to KYC page
          if (profileError || !profile || !profile.kyc_completed) {
            return NextResponse.redirect(new URL('/kyc', requestUrl.origin))
          }
          // If KYC completed, redirect to intended destination or dashboard
          return NextResponse.redirect(new URL(redirect, requestUrl.origin))
        } else {
          // Email not verified yet, redirect to verification page
          return NextResponse.redirect(new URL('/auth/verify-email', requestUrl.origin))
        }
      }

      // OAuth or magic link (OTP) - session should be created
      if (data.session) {
        // For new OAuth users, check KYC status
        // Use maybeSingle() to handle case where profile doesn't exist yet
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('kyc_completed')
          .eq('id', data.session.user.id)
          .maybeSingle()
        
        // If profile doesn't exist (new OAuth user), redirect to KYC
        // If profile exists but KYC not completed, redirect to KYC
        if (profileError || !profile || !profile.kyc_completed) {
          return NextResponse.redirect(new URL('/kyc', requestUrl.origin))
        }
        // If KYC completed, redirect to intended destination
        return NextResponse.redirect(new URL(redirect, requestUrl.origin))
      }

      // Fallback: redirect to login if no session
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
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
