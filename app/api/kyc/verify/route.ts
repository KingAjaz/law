import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from '@/lib/env'
import { rateLimiters, createRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

/**
 * API route to verify (approve or reject) KYC submission
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimiters.kyc(request, '/api/kyc/verify')
  if (!rateLimitResult.success) {
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429, headers }
    )
  }
  try {
    const body = await request.json()
    const { userId, action, reason } = body

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      )
    }

    if (action === 'reject' && !reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
    const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get admin user info (should be passed from frontend auth)
    // For now, we'll get it from the request or use a service role
    // In production, you'd want to verify the admin role from the session

    // Get KYC data
    const { data: kycData, error: kycError } = await supabase
      .from('kyc_data')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (kycError || !kycData) {
      return NextResponse.json(
        { error: 'KYC submission not found' },
        { status: 404 }
      )
    }

    // Update KYC status
    const status = action === 'approve' ? 'approved' : 'rejected'
    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
    }

    if (action === 'reject') {
      updateData.rejection_reason = reason
    }

    // Update KYC data
    const { error: updateError } = await supabase
      .from('kyc_data')
      .update(updateData)
      .eq('user_id', userId)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Failed to update KYC status' },
        { status: 500 }
      )
    }

    // If approved, update profile kyc_completed status
    if (action === 'approve') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ kyc_completed: true })
        .eq('id', userId)

      if (profileError) {
        logger.error('Failed to update profile kyc_completed', { userId, action, error: profileError })
        // Don't fail the request, but log the error
      }
    } else {
      // If rejected, ensure kyc_completed is false
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ kyc_completed: false })
        .eq('id', userId)

      if (profileError) {
        logger.error('Failed to update profile kyc_completed', { userId, action, error: profileError })
      }
    }

    logger.logKycEvent(`kyc_${action}ed`, {
      userId,
      status,
      reviewedBy: 'admin', // TODO: Get actual admin ID from session
      rejectionReason: action === 'reject' ? reason : undefined,
    })

    // TODO: Send email notification to user about KYC status change
    // This should use the email service we created earlier

    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      {
        message: `KYC submission ${action}d successfully`,
        status,
      },
      { headers }
    )
  } catch (error: any) {
    // Don't reference userId/action here as they may not be in scope if error occurs before destructuring
    logger.error('KYC verification error', { error }, error instanceof Error ? error : new Error(error.message))
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers }
    )
  }
}
