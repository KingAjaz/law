import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from '@/lib/env'
import { rateLimiters, createRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimiters.paymentVerify(request, '/api/paystack/verify')
  if (!rateLimitResult.success) {
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: 'Too many verification requests, please try again later' },
      { status: 429, headers }
    )
  }
  try {
    const searchParams = request.nextUrl.searchParams
    const reference = searchParams.get('reference')

    // Validate reference parameter
    if (!reference || reference.trim() === '') {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    // Validate required environment variables
    const paystackSecretKey = getEnvVar('PAYSTACK_SECRET_KEY')

    // Call Paystack verification API
    let response: Response
    try {
      response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      )
    } catch (networkError: any) {
      logger.error('Network error verifying payment', { reference, error: networkError }, networkError instanceof Error ? networkError : new Error(networkError.message))
      return NextResponse.json(
        { error: 'Failed to connect to payment gateway. Please try again.' },
        { status: 503 }
      )
    }

    // Parse response
    let data: any
    try {
      data = await response.json()
    } catch (parseError: any) {
      logger.error('Error parsing Paystack response', { reference, error: parseError }, parseError instanceof Error ? parseError : new Error(parseError.message))
      return NextResponse.json(
        { error: 'Invalid response from payment gateway' },
        { status: 502 }
      )
    }

    // Handle Paystack API errors
    if (!response.ok) {
      logger.warn('Paystack API error', {
        status: response.status,
        message: data.message,
        reference,
      })

      // Handle specific error cases
      if (response.status === 404) {
        logger.warn('Payment reference not found', { reference })
        return NextResponse.json(
          { error: 'Payment reference not found' },
          { status: 404 }
        )
      }

      if (response.status === 401 || response.status === 403) {
        logger.error('Paystack authentication error', { reference, status: response.status })
        return NextResponse.json(
          { error: 'Payment gateway authentication failed' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          error: data.message || 'Failed to verify payment',
          details: data.errors || null,
        },
        { status: response.status >= 500 ? 502 : response.status }
      )
    }

    // Validate response structure
    if (!data || !data.status || !data.data) {
      logger.error('Invalid Paystack response structure', { reference, data })
      return NextResponse.json(
        { error: 'Invalid payment verification response' },
        { status: 502 }
      )
    }

    // Sync database with successful verification
    if (data.data.status === 'success') {
      try {
        const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
        const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        })

        // Update payment status
        await supabase
          .from('payments')
          .update({
            status: 'success',
            updated_at: new Date().toISOString(),
          })
          .eq('paystack_reference', reference)

        // Find associated payment
        const { data: payment } = await supabase
          .from('payments')
          .select('contract_id')
          .eq('paystack_reference', reference)
          .single()

        if (payment) {
          // Find associated contract
          const { data: existingContract } = await supabase
            .from('contracts')
            .select('id, original_file_url')
            .eq('id', payment.contract_id)
            .single()

          if (existingContract) {
            // Update contract status
            const newStatus = existingContract.original_file_url
              ? 'payment_confirmed'
              : 'awaiting_upload'

            await supabase
              .from('contracts')
              .update({
                payment_status: 'completed',
                status: newStatus,
                updated_at: new Date().toISOString(),
              })
              .eq('id', payment.contract_id)
          }
        }
      } catch (dbError) {
        // Log but do not fail the verification process since Paystack confirmed it
        logger.error('Database sync failed during payment verification', { reference, error: dbError })
      }
    }

    logger.logPaymentEvent('payment_verified', {
      reference,
      status: data.data.status,
      amount: data.data.amount,
    })

    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(data, { headers })
  } catch (error: any) {
    // Don't reference reference here as it may not be in scope if error occurs before destructuring
    logger.error('Unexpected error in payment verification', { error }, error instanceof Error ? error : new Error(error.message))
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while verifying payment' },
      { status: 500, headers }
    )
  }
}
