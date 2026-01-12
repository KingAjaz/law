import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { sendPasswordResetCompletionEmail } from '@/lib/email'
import { rateLimiters, createRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

/**
 * API route to send password reset completion email
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimiters.auth(request, '/api/auth/password-reset-complete')
  if (!rateLimitResult.success) {
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429, headers }
    )
  }

  try {
    const supabase = createSupabaseServer()
    
    // Get authenticated user (must be authenticated to complete password reset)
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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    if (profile) {
      await sendPasswordResetCompletionEmail(
        profile.email,
        profile.full_name || profile.email.split('@')[0]
      ).catch((error) => {
        logger.error('Failed to send password reset completion email', { userId: user.id, error })
        // Don't fail the request if email fails
      })
    }

    logger.logAuthEvent('password_reset_completed', {
      userId: user.id,
      email: user.email,
    })

    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json({ success: true }, { headers })
  } catch (error: any) {
    logger.error('Password reset completion email error', { error }, error instanceof Error ? error : new Error(error.message))
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
