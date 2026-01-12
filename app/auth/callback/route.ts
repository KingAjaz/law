import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendWelcomeEmail, sendNewUserSignupEmailToAdmin, getAdminEmails } from '@/lib/email'
import { logger } from '@/lib/logger'

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

      // Helper function to send signup notifications (non-blocking)
      const sendSignupNotifications = async (userId: string, userEmail: string, userName: string) => {
        try {
          // Check if this is a new user (profile created within last 5 minutes)
          const { data: profile } = await supabase
            .from('profiles')
            .select('created_at, full_name, email')
            .eq('id', userId)
            .single()
          
          if (profile) {
            const profileCreatedAt = new Date(profile.created_at)
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
            
            // Only send notifications if profile was created recently (new signup)
            if (profileCreatedAt > fiveMinutesAgo) {
              const displayName = profile.full_name || userName || profile.email.split('@')[0]
              
              // Send welcome email to user
              sendWelcomeEmail(profile.email, displayName).catch((error) => {
                logger.error('Failed to send welcome email', { userId, error })
              })
              
              // Send admin notification
              const adminEmails = await getAdminEmails()
              for (const adminEmail of adminEmails) {
                sendNewUserSignupEmailToAdmin(
                  adminEmail,
                  profile.email,
                  displayName,
                  profile.created_at
                ).catch((error) => {
                  logger.error('Failed to send new user signup email to admin', { adminEmail, userId, error })
                })
              }
              
              logger.logAuthEvent('user_signup', {
                userId,
                email: profile.email,
              })
            }
          }
        } catch (error) {
          logger.error('Error sending signup notifications', { userId, error })
          // Don't fail the auth flow if email fails
        }
      }

      if (type === 'signup' || type === 'email') {
        // Email verification flow
        // If session exists and email is verified, redirect to KYC (new users need to complete KYC)
        if (data.session?.user.email_confirmed_at) {
          // Send signup notifications for new users
          if (data.session.user.email) {
            sendSignupNotifications(
              data.session.user.id,
              data.session.user.email,
              data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || ''
            )
          }
          
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
        // Check if this might be a new OAuth user (profile doesn't exist or very new)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('kyc_completed, created_at, full_name, email')
          .eq('id', data.session.user.id)
          .maybeSingle()
        
        // Send signup notifications if this is a new user
        if (data.session.user.email) {
          // Check if profile is new (created within last 5 minutes)
          if (profile) {
            const profileCreatedAt = new Date(profile.created_at)
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
            
            if (profileCreatedAt > fiveMinutesAgo) {
              sendSignupNotifications(
                data.session.user.id,
                data.session.user.email,
                profile.full_name || data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || ''
              )
            }
          } else if (profileError) {
            // Profile doesn't exist yet, might be a very new OAuth signup
            // Will be created by the database trigger, but we can still check and send notification
            setTimeout(() => {
              sendSignupNotifications(
                data.session.user.id,
                data.session.user.email,
                data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || ''
              )
            }, 2000) // Wait 2 seconds for trigger to create profile
          }
        }
        
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
