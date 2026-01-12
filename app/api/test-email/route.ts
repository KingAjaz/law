import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

/**
 * Test endpoint to verify email service is working
 * Only available in development
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Test sending a welcome email
    const result = await sendWelcomeEmail(email, 'Test User')

    if (result) {
      logger.logAuthEvent('test_email_sent', { email })
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully. Check your inbox and console logs.',
        email,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Email service returned false. Check console logs and environment variables.',
          email,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    logger.error('Test email failed', { error }, error instanceof Error ? error : new Error(error.message))
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send test email',
      },
      { status: 500 }
    )
  }
}
