/**
 * Rate limiting utility for API routes
 * Uses in-memory storage (suitable for single-instance deployments)
 * For production with multiple instances, consider using Redis
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (reset on server restart)
// In production with multiple instances, use Redis or similar
const store: RateLimitStore = {}

// Cleanup old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    })
  }, 60000) // Clean up every minute
}

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum number of requests per window
  message?: string // Custom error message
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (for production behind proxy)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'

  return ip
}

/**
 * Create a rate limit key
 */
function getRateLimitKey(identifier: string, route: string): string {
  return `${route}:${identifier}`
}

/**
 * Rate limit middleware function
 */
export function rateLimit(
  config: RateLimitConfig
): (request: Request, route: string) => RateLimitResult {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
  } = config

  return (request: Request, route: string): RateLimitResult => {
    const identifier = getClientIdentifier(request)
    const key = getRateLimitKey(identifier, route)
    const now = Date.now()

    // Get or initialize rate limit entry
    let entry = store[key]

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: now + windowMs,
      }
      store[key] = entry
    }

    // Increment count
    entry.count++

    const remaining = Math.max(0, maxRequests - entry.count)
    const success = entry.count <= maxRequests

    return {
      success,
      limit: maxRequests,
      remaining,
      reset: entry.resetTime,
      retryAfter: success ? undefined : Math.ceil((entry.resetTime - now) / 1000),
    }
  }
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const rateLimiters = {
  // Contact form - 5 requests per 15 minutes
  contact: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many contact form submissions. Please try again in 15 minutes.',
  }),

  // Payment initialization - 10 requests per minute
  payment: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many payment requests. Please try again in a minute.',
  }),

  // Payment verification - 20 requests per minute
  paymentVerify: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    message: 'Too many verification requests. Please try again in a minute.',
  }),

  // Contract operations - 30 requests per minute
  contract: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many requests. Please try again in a minute.',
  }),

  // KYC verification (admin) - 50 requests per minute
  kyc: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,
    message: 'Too many requests. Please try again in a minute.',
  }),

  // Health check - 100 requests per minute
  health: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many health check requests.',
  }),

  // Default - 60 requests per minute
  default: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Too many requests. Please try again in a minute.',
  }),
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers()
  headers.set('X-RateLimit-Limit', result.limit.toString())
  headers.set('X-RateLimit-Remaining', result.remaining.toString())
  headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString())
  if (result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString())
  }
  return headers
}
