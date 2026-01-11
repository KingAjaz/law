import { NextRequest, NextResponse } from 'next/server'
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

    logger.logPaymentEvent('payment_verified', {
      reference,
      status: data.data.status,
      amount: data.data.amount,
    })

    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(data, { headers })
  } catch (error: any) {
    logger.error('Unexpected error in payment verification', { reference, error }, error instanceof Error ? error : new Error(error.message))
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while verifying payment' },
      { status: 500, headers }
    )
  }
}
