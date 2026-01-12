import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getEnvVar } from '@/lib/env'
import { rateLimiters, createRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimiters.payment(request, '/api/paystack/initialize')
  if (!rateLimitResult.success) {
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: 'Too many payment requests, please try again later' },
      { status: 429, headers }
    )
  }
  try {
    const { email, amount, reference, metadata } = await request.json()

    // Validate required environment variables
    const paystackSecretKey = getEnvVar('PAYSTACK_SECRET_KEY')
    const appUrl = getEnvVar('NEXT_PUBLIC_APP_URL')

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount,
        reference,
        metadata,
        callback_url: `${appUrl}/dashboard`,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      logger.warn('Payment initialization failed', {
        email,
        amount,
        reference,
        error: data.message,
        status: response.status,
      })
      return NextResponse.json(
        { error: data.message || 'Failed to initialize payment' },
        { status: response.status }
      )
    }

    logger.logPaymentEvent('payment_initialized', {
      reference: data.data?.reference || reference,
      amount,
      email,
      status: 'initialized',
    })

    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(data, { headers })
  } catch (error: any) {
    // Don't reference email/amount/reference here as they may not be in scope if error occurs before destructuring
    logger.error('Payment initialization error', { error }, error instanceof Error ? error : new Error(error.message))
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers }
    )
  }
}
