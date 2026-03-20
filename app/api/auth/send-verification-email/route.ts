import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from '@/lib/env'
import { sendEmailVerificationEmail, sendNewUserSignupEmailToAdmin, getAdminEmails } from '@/lib/email'
import { logger } from '@/lib/logger'

/**
 * API endpoint to send email verification email using our email service
 * This is a fallback when Supabase SMTP fails
 */
export async function POST(request: NextRequest) {
  try {
    const { email, fullName } = await request.json()

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
    const { data: usersData, error: getUserError } = await supabase.auth.admin.listUsers()

    const user = usersData?.users?.find(u => u.email === email)

    if (getUserError || !user) {
      // Security: Don't reveal whether email exists or not
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email and is unverified, a verification email has been sent.',
      })
    }

    // Note: We intentionally do NOT check email_confirmed_at here.
    // Even if Supabase auto-confirms the email, we still send our
    // branded verification email via Resend for a better user experience.

    // Generate verification link using Supabase Admin API
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { data: generateLinkData, error: generateLinkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${appUrl}/auth/callback?type=signup`,
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

    // Create the securely wrapped link that forces manual interaction
    const secureVerificationLink = `${appUrl}/auth/secure-link?type=verify&url=${encodeURIComponent(verificationLink)}`

    // Send verification email via our email service
    const userName = fullName || email.split('@')[0]
    const emailSent = await sendEmailVerificationEmail(email, userName, secureVerificationLink)

    if (!emailSent) {
      logger.error('Failed to send verification email via our service', { email })
      return NextResponse.json(
        {
          error: 'Failed to send verification email',
          verificationLink, // Return link as fallback
          note: 'Email service failed, but here is your verification link',
        },
        { status: 500 }
      )
    }

    logger.logAuthEvent('verification_email_sent', { email, userId: user.id, via: 'custom_service' })

    // Send admin notification immediately after signup verification email is triggered!
    try {
      const adminEmails = await getAdminEmails()
      for (const adminEmail of adminEmails) {
        await sendNewUserSignupEmailToAdmin(
          adminEmail,
          email,
          userName,
          new Date().toISOString()
        )
      }
      logger.info('Admin signup notification sent successfully.')
    } catch (adminNotifyError) {
      logger.error('Failed to notify admins of new signup', { error: adminNotifyError })
      // Don't fail the complete verification request if admin notify fails
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully via our email service. Please check your inbox and spam folder.',
      email,
      verified: false,
    })
  } catch (error: any) {
    logger.error('Send verification email failed', { error }, error instanceof Error ? error : new Error(error.message))
    return NextResponse.json(
      {
        error: error.message || 'Failed to send verification email',
      },
      { status: 500 }
    )
  }
}
