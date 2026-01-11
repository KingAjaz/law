import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { getEnvVar } from '@/lib/env'
import { sendPaymentConfirmationEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Validate required environment variables
    const paystackSecretKey = getEnvVar('PAYSTACK_SECRET_KEY')
    const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
    const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', paystackSecretKey)
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      logger.warn('Invalid webhook signature', { event: 'paystack_webhook' })
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)
    logger.info('Paystack webhook received', { event: event.event, eventData: event.data })

    // Handle payment success
    if (event.event === 'charge.success') {
      const { reference, amount, customer } = event.data

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })

      // Update payment status
      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'success',
          updated_at: new Date().toISOString(),
        })
        .eq('paystack_reference', reference)

      if (paymentError) {
        logger.error('Payment update error', { reference, error: paymentError })
      }

      // Get payment and update contract status
      const { data: payment } = await supabase
        .from('payments')
        .select('contract_id, user_id, amount')
        .eq('paystack_reference', reference)
        .single()

      if (payment) {
        // Check if contract already exists (should exist if created before payment)
        const { data: existingContract } = await supabase
          .from('contracts')
          .select('id, original_file_url')
          .eq('id', payment.contract_id)
          .single()

        if (existingContract) {
          // Contract exists - update status
          // If no file uploaded yet, status should be 'awaiting_upload'
          // If file already uploaded, status should be 'payment_confirmed'
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

        // Get user and contract details for email notification
        const { data: contract } = await supabase
          .from('contracts')
          .select('title, pricing_tier')
          .eq('id', payment.contract_id)
          .single()

        const { data: userProfile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', payment.user_id)
          .single()

        // Send payment confirmation email
        if (userProfile && contract) {
          const amountInNaira = Number(payment.amount) / 100 // Convert from kobo
          logger.logPaymentEvent('payment_success', {
            reference,
            amount: amountInNaira,
            userId: payment.user_id,
            contractId: payment.contract_id,
            status: 'success',
          })
          await sendPaymentConfirmationEmail(
            userProfile.email,
            userProfile.full_name || userProfile.email.split('@')[0],
            amountInNaira,
            contract.title,
            reference
          ).catch((error) => {
            logger.error('Failed to send payment confirmation email', { reference, error })
            // Don't fail the webhook if email fails
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    logger.error('Webhook error', { error }, error instanceof Error ? error : new Error(error.message))
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
