import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from '@/lib/env'
import { sendContractAssignmentEmail } from '@/lib/email'
import { rateLimiters, createRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

/**
 * API route to assign a contract to a lawyer
 * This endpoint sends email notifications to the lawyer
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimiters.contract(request, '/api/contracts/assign')
  if (!rateLimitResult.success) {
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429, headers }
    )
  }
  try {
    const body = await request.json()
    const { contractId, lawyerId } = body

    if (!contractId || !lawyerId) {
      return NextResponse.json(
        { error: 'Contract ID and lawyer ID are required' },
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

    // Get contract details
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('title, pricing_tier, user_id')
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
    const { data: lawyerProfile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', lawyerId)
      .single()

    if (!lawyerProfile) {
      return NextResponse.json(
        { error: 'Lawyer not found' },
        { status: 404 }
      )
    }

    // Update contract assignment
    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        lawyer_id: lawyerId,
        status: 'assigned_to_lawyer',
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Failed to assign contract' },
        { status: 500 }
      )
    }

    logger.logContractEvent('contract_assigned', {
      contractId,
      userId: contract.user_id,
      lawyerId,
      tier: contract.pricing_tier,
      status: 'assigned_to_lawyer',
    })

    // Send email notification to lawyer
    if (lawyerProfile && contract) {
      await sendContractAssignmentEmail(
        lawyerProfile.email,
        lawyerProfile.full_name || lawyerProfile.email.split('@')[0],
        contract.title,
        contractId,
        userProfile?.full_name || userProfile?.email.split('@')[0] || 'Client',
        contract.pricing_tier
      ).catch((error) => {
        logger.error('Failed to send contract assignment email', { contractId, lawyerId, error }, error instanceof Error ? error : new Error(error.message))
        // Don't fail the request if email fails
      })
    }

    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      {
        message: 'Contract assigned successfully',
        contract: {
          id: contractId,
          lawyer_id: lawyerId,
          status: 'assigned_to_lawyer',
        },
      },
      { headers }
    )
  } catch (error: any) {
    // Don't reference contractId/lawyerId here as they may not be in scope if error occurs before destructuring
    logger.error('Contract assignment error', { error }, error instanceof Error ? error : new Error(error.message))
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers }
    )
  }
}
