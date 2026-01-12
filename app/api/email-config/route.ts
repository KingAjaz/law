import { NextRequest, NextResponse } from 'next/server'
import { getEnvVar } from '@/lib/env'

/**
 * Diagnostic endpoint to check email configuration
 * Only available in development
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  const config = {
    emailService: process.env.EMAIL_SERVICE || 'console',
    hasResendApiKey: !!process.env.RESEND_API_KEY,
    resendApiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10) || 'not set',
    emailFrom: process.env.EMAIL_FROM || getEnvVar('NEXT_PUBLIC_CONTACT_EMAIL', 'not set'),
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set',
    nodeEnv: process.env.NODE_ENV,
  }

  // Check if Resend is properly configured
  const resendStatus = config.emailService === 'resend' 
    ? (config.hasResendApiKey ? '✅ Configured' : '❌ Missing RESEND_API_KEY')
    : 'Not using Resend'

  return NextResponse.json({
    status: 'Email Configuration Diagnostic',
    config,
    resendStatus,
    recommendations: [
      ...(config.emailService === 'console' 
        ? ['ℹ️ Using console logging. Emails will be logged to server console.']
        : []),
      ...(config.emailService === 'resend' && !config.hasResendApiKey
        ? ['⚠️ Set RESEND_API_KEY environment variable to use Resend']
        : []),
      ...(config.emailService === 'resend' && config.hasResendApiKey
        ? ['✅ Resend is configured. Make sure EMAIL_FROM is a verified domain in Resend.']
        : []),
      'ℹ️ Supabase verification emails are sent by Supabase, not this app.',
      'ℹ️ Check Supabase Dashboard → Project Settings → Auth → SMTP Settings',
      'ℹ️ Use /api/test-email to test custom email service',
      'ℹ️ Use /api/auth/resend-verification to manually trigger verification emails',
    ],
  })
}
