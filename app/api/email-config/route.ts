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

  // Extract domain from EMAIL_FROM
  const emailFromDomain = config.emailFrom.includes('@') 
    ? config.emailFrom.split('@')[1].replace(/[<>]/g, '').trim()
    : null

  const recommendations = [
    ...(config.emailService === 'console' 
      ? ['ℹ️ Using console logging. Emails will be logged to server console.']
      : []),
    ...(config.emailService === 'resend' && !config.hasResendApiKey
      ? ['⚠️ Set RESEND_API_KEY environment variable to use Resend']
      : []),
    ...(config.emailService === 'resend' && config.hasResendApiKey
      ? [
          '✅ Resend is configured.',
          emailFromDomain 
            ? `⚠️ CRITICAL: Verify that "${emailFromDomain}" is verified in Resend Dashboard → Domains`
            : '⚠️ CRITICAL: EMAIL_FROM must use your verified domain (e.g., noreply@yourdomain.com)',
          '⚠️ If domain not verified, emails will go to spam or not be delivered',
        ]
      : []),
    'ℹ️ Supabase verification emails are sent by Supabase, not this app.',
    'ℹ️ Check Supabase Dashboard → Project Settings → Auth → SMTP Settings',
    'ℹ️ Use /api/test-email to test custom email service',
    'ℹ️ Use /api/auth/resend-verification to manually trigger verification emails',
    '',
    '📧 For Outlook/Gmail issues:',
    '1. Verify EMAIL_FROM domain matches verified domain in Resend',
    '2. Wait 24-48 hours for DNS propagation',
    '3. Mark emails as "Not Spam" in Outlook',
    '4. Check Gmail spam folder',
    '5. Use Mail-Tester: https://www.mail-tester.com',
  ]

  return NextResponse.json({
    status: 'Email Configuration Diagnostic',
    config: {
      ...config,
      emailFromDomain,
    },
    resendStatus,
    recommendations,
    criticalChecks: {
      emailFromMatchesVerifiedDomain: emailFromDomain 
        ? `Verify "${emailFromDomain}" in Resend Dashboard → Domains`
        : 'EMAIL_FROM must use verified domain',
      dnsPropagation: 'Wait 24-48 hours after adding DNS records',
      outlookSpam: 'Mark emails as "Not Junk" and add to Safe Senders',
      gmailNotReceiving: 'Check spam folder, use Gmail Postmaster Tools',
    },
  })
}
