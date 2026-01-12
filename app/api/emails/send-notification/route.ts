import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getAdminEmails, sendKYCSubmissionEmailToAdmin } from '@/lib/email'
import { rateLimiters, createRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

/**
 * API route to send email notifications (server-side only)
 * Used for notifications that need to be sent from client-side code
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimiters.kyc(request, '/api/emails/send-notification')
  if (!rateLimitResult.success) {
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429, headers }
    )
  }

  try {
    const supabase = createSupabaseServer()
    
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, data } = body

    if (type === 'kyc_submission') {
      // Send KYC submission notification to admin
      const { kycId } = data
      
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.id)
        .single()

      if (profile) {
        const adminEmails = await getAdminEmails()
        for (const adminEmail of adminEmails) {
          await sendKYCSubmissionEmailToAdmin(
            adminEmail,
            profile.email,
            profile.full_name || profile.email.split('@')[0],
            kycId
          ).catch((error) => {
            logger.error('Failed to send KYC submission email to admin', { adminEmail, error })
          })
        }
      }
    }

    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json({ success: true }, { headers })
  } catch (error: any) {
    logger.error('Email notification error', { error }, error instanceof Error ? error : new Error(error.message))
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
