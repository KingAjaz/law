import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from '@/lib/env'
import { sendContractUnderReviewEmail } from '@/lib/email'
import { rateLimiters, createRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

/**
 * API route to update contract status
 * Sends email notifications when status changes to 'under_review'
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimiters.contract(request, '/api/contracts/update-status')
  if (!rateLimitResult.success) {
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429, headers }
    )
  }
  try {
    const body = await request.json()
    const { contractId, status, previousStatus } = body

    if (!contractId || !status) {
      return NextResponse.json(
        { error: 'Contract ID and status are required' },
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
      .select('title, user_id, lawyer_id, status')
      .eq('id', contractId)
      .single()

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }

    // Update contract status
    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Failed to update contract status' },
        { status: 500 }
      )
    }

    logger.logContractEvent('contract_status_updated', {
      contractId,
      userId: contract.user_id,
      lawyerId: contract.lawyer_id,
      previousStatus: contract.status,
      newStatus: status,
    })

    // Send email notification when status changes to 'under_review'
    if (status === 'under_review' && previousStatus !== 'under_review') {
      try {
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

        if (userProfile && contract) {
          await sendContractUnderReviewEmail(
            userProfile.email,
            userProfile.full_name || userProfile.email.split('@')[0],
            contract.title,
            lawyerName
          ).catch((error) => {
            logger.error('Failed to send contract under review email', { contractId, error }, error instanceof Error ? error : new Error(error.message))
            // Don't fail the request if email fails
          })
        }
      } catch (emailError) {
        logger.error('Error sending contract under review email', { contractId, error: emailError })
        // Don't fail the request if email fails
      }
    }

    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      {
        message: 'Contract status updated successfully',
        contract: {
          id: contractId,
          status,
        },
      },
      { headers }
    )
  } catch (error: any) {
    logger.error('Contract status update error', { error }, error instanceof Error ? error : new Error(error.message))
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers }
    )
  }
}
