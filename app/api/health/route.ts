import { NextResponse } from 'next/server'
import { validateEnv } from '@/lib/env'
import { rateLimiters, createRateLimitHeaders } from '@/lib/rate-limit'

/**
 * Health check endpoint that validates environment variables
 * Useful for deployment checks and monitoring
 */
export async function GET(request: Request) {
  // Rate limiting (lenient for health checks)
  const rateLimitResult = rateLimiters.health(request, '/api/health')
  if (!rateLimitResult.success) {
    const headers = createRateLimitHeaders(rateLimitResult)
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers }
    )
  }
  const validation = validateEnv(true) // Server-side validation

  const headers = createRateLimitHeaders(rateLimitResult)

  if (!validation.valid) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Environment validation failed',
        errors: validation.errors,
        warnings: validation.warnings,
      },
      { status: 503, headers }
    )
  }

  return NextResponse.json(
    {
      status: 'ok',
      message: 'Environment variables validated successfully',
      warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
    },
    { headers }
  )
}
