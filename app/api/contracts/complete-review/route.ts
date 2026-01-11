import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from '@/lib/env'
import { sendReviewCompletionEmail } from '@/lib/email'
import { rateLimiters, createRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

/**
 * API route to complete contract review
 * This endpoint sends email notifications to the user
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimiters.contract(request, '/api/contracts/complete-review')
  if (!rateLimitResult.success) {
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429, headers }
    )
  }
  try {
    const body = await request.json()
    const { contractId, reviewedFileUrl } = body

    if (!contractId || !reviewedFileUrl) {
      return NextResponse.json(
        { error: 'Contract ID and reviewed file URL are required' },
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

    // Get contract details with user and lawyer info
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('title, user_id, lawyer_id')
      .eq('id', contractId)
      .single()

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }

    // Get user details
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', contract.user_id)
      .single()

    // Get lawyer details
    let lawyerName = 'Your lawyer'
    if (contract.lawyer_id) {
      const { data: lawyerProfile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', contract.lawyer_id)
        .single()

      if (lawyerProfile) {
        lawyerName = lawyerProfile.full_name || lawyerProfile.email.split('@')[0]
      }
    }

    // Update contract status
    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        reviewed_file_url: reviewedFileUrl,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Failed to update contract' },
        { status: 500 }
      )
    }

    logger.logContractEvent('contract_review_completed', {
      contractId,
      userId: contract.user_id,
      lawyerId: contract.lawyer_id,
      status: 'completed',
    })

    // Send email notification to user
    if (userProfile && contract) {
      await sendReviewCompletionEmail(
        userProfile.email,
        userProfile.full_name || userProfile.email.split('@')[0],
        contract.title,
        lawyerName
      ).catch((error) => {
        logger.error('Failed to send review completion email', { contractId, error }, error instanceof Error ? error : new Error(error.message))
        // Don't fail the request if email fails
      })
    }

    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      {
        message: 'Contract review completed successfully',
        contract: {
          id: contractId,
          status: 'completed',
          reviewed_file_url: reviewedFileUrl,
        },
      },
      { headers }
    )
  } catch (error: any) {
    logger.error('Contract review completion error', { contractId, error }, error instanceof Error ? error : new Error(error.message))
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers }
    )
  }
}
