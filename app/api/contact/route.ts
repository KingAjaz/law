import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from '@/lib/env'
import { rateLimiters, createRateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimiters.contact(request, '/api/contact')
  if (!rateLimitResult.success) {
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429, headers }
    )
  }
  try {
    const body = await request.json()
    const { name, company, email, phone, service, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Validate required environment variables
    const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
    const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Insert contact message into database
    const { error } = await supabase.from('contact_messages').insert({
      name,
      company: company || null,
      email,
      phone: phone || null,
      service: service || null,
      message,
    })

    if (error) {
      logger.error('Error saving contact message', { email, name, error })
      return NextResponse.json(
        { error: 'Failed to save message. Please try again.' },
        { status: 500 }
      )
    }

    logger.info('Contact form submission received', {
      email,
      name,
      company,
      service,
    })

    // TODO: Send email notification to admin (implement when email service is configured)
    // This could use Resend, SendGrid, or Supabase's email service

    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { message: 'Message sent successfully! We will get back to you soon.' },
      { status: 200, headers }
    )
  } catch (error: any) {
    logger.error('Contact form error', { email, name, error }, error instanceof Error ? error : new Error(error.message))
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
