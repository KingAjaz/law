import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from '@/lib/env'
import { sendEmailVerificationEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

/**
 * API endpoint to manually resend email verification using Supabase Admin API
 * This bypasses client-side limitations and uses the service role key
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Create Supabase admin client
    const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
    const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get user by email
    const { data: users, error: getUserError } = await supabase.auth.admin.listUsers()
    
    if (getUserError) {
      logger.error('Failed to list users', { error: getUserError }, getUserError)
      return NextResponse.json(
        { error: 'Failed to find user' },
        { status: 500 }
      )
    }

    const user = users.users.find(u => u.email === email)

    if (!user) {
      // Security: Don't reveal whether email exists or not
      // Return generic message to prevent email enumeration
      return NextResponse.json(
        { 
          success: true,
          message: 'If an account exists with this email and is unverified, a verification email has been sent.',
        },
        { status: 200 }
      )
    }

    // Check if email is already verified
    if (user.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        message: 'Email is already verified',
        email,
        verified: true,
      })
    }

    // Generate a new confirmation token and send email
    // Using admin API to generate confirmation link
    // For existing users, use 'magiclink' type which doesn't require password
    const { data: generateLinkData, error: generateLinkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?type=signup`,
      },
    })

    if (generateLinkError) {
      logger.error('Failed to generate verification link', { email, error: generateLinkError }, generateLinkError)
      return NextResponse.json(
        { 
          error: 'Failed to generate verification link',
          details: generateLinkError.message,
        },
        { status: 500 }
      )
    }

    const verificationLink = generateLinkData.properties?.action_link

    if (!verificationLink) {
      return NextResponse.json(
        { error: 'Failed to generate verification link' },
        { status: 500 }
      )
    }

    // Send verification email via our email service (fallback when Supabase SMTP fails)
    const userName = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0]
    const emailSent = await sendEmailVerificationEmail(email, userName, verificationLink)

    if (!emailSent) {
      logger.error('Failed to send verification email via our service', { email })
      // Still return the link so user can manually verify
      return NextResponse.json({
        success: true,
        message: 'Verification link generated. Email service failed, but here is your verification link.',
        email,
        verified: false,
        verificationLink,
        note: 'Please use the verification link below to verify your email',
      })
    }

    logger.logAuthEvent('verification_email_sent', { email, userId: user.id, via: 'custom_service' })

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully via our email service. Please check your inbox and spam folder.',
      email,
      verified: false,
    })
  } catch (error: any) {
    logger.error('Resend verification failed', { error }, error instanceof Error ? error : new Error(error.message))
    return NextResponse.json(
      {
        error: error.message || 'Failed to resend verification email',
      },
      { status: 500 }
    )
  }
}
