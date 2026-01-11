/**
 * TypeScript types for API request/response bodies
 * Provides type safety for all API endpoints
 */

import type { Contract, Payment, KYCData } from './types'

// ============================================================================
// Common Response Types
// ============================================================================

/**
 * Standard error response structure
 */
export interface ApiErrorResponse {
  error: string
  details?: unknown
}

/**
 * Standard success response structure
 */
export interface ApiSuccessResponse<T = unknown> {
  message?: string
  data?: T
  [key: string]: unknown
}

// ============================================================================
// Contact API Types
// ============================================================================

export interface ContactFormRequest {
  name: string
  email: string
  message: string
  company?: string | null
  phone?: string | null
  service?: string | null
}

export interface ContactFormResponse extends ApiSuccessResponse {
  message: string
}

// ============================================================================
// Payment API Types
// ============================================================================

export interface PaymentInitializeRequest {
  email: string
  amount: number
  reference: string
  metadata?: Record<string, unknown>
}

/**
 * Paystack initialize response structure
 */
export interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

/**
 * Paystack verification response structure
 */
export interface PaystackVerificationResponse {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string | null
    gateway_response: string
    paid_at: string | null
    created_at: string
    channel: string
    currency: string
    ip_address: string | null
    metadata: Record<string, unknown>
    log: unknown
    fees: number | null
    fees_split: unknown | null
    authorization: {
      authorization_code: string
      bin: string
      last4: string
      exp_month: string
      exp_year: string
      channel: string
      card_type: string
      bank: string
      country_code: string
      brand: string
      reusable: boolean
      signature: string
      account_name: string | null
      receiver_bank_account_number: string | null
      receiver_bank: string | null
    }
    customer: {
      id: number
      first_name: string | null
      last_name: string | null
      email: string
      customer_code: string
      phone: string | null
      metadata: Record<string, unknown> | null
      risk_action: string
      international_format_phone: string | null
    }
    plan: unknown
    split: unknown
    order_id: string | null
    paidAt: string | null
    createdAt: string
    requested_amount: number
    pos_transaction_data: unknown | null
    source: unknown | null
    fees_breakdown: unknown | null
  }
}

/**
 * Paystack webhook event structure
 */
export interface PaystackWebhookEvent {
  event: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string | null
    gateway_response: string
    paid_at: string | null
    created_at: string
    channel: string
    currency: string
    ip_address: string | null
    metadata: Record<string, unknown>
    log: unknown
    fees: number | null
    fees_split: unknown | null
    authorization: Record<string, unknown>
    customer: {
      id: number
      email: string
      customer_code: string
      [key: string]: unknown
    }
    plan: unknown
    split: unknown
    order_id: string | null
    paidAt: string | null
    createdAt: string
    requested_amount: number
    [key: string]: unknown
  }
}

export interface PaymentWebhookResponse {
  received: boolean
}

// ============================================================================
// Contract API Types
// ============================================================================

export interface ContractAssignRequest {
  contractId: string
  lawyerId: string
}

export interface ContractAssignResponse extends ApiSuccessResponse {
  message: string
  contract: {
    id: string
    lawyer_id: string
    status: string
  }
}

export interface ContractCompleteReviewRequest {
  contractId: string
  reviewedFileUrl: string
}

export interface ContractCompleteReviewResponse extends ApiSuccessResponse {
  message: string
  contract: {
    id: string
    status: string
    reviewed_file_url: string
  }
}

export interface ContractDeleteRequest {
  contractId: string
}

export interface ContractDeleteResponse extends ApiSuccessResponse {
  message: string
  filesDeleted: {
    original: boolean
    reviewed: boolean
  }
}

// ============================================================================
// KYC API Types
// ============================================================================

export interface KYCVerifyRequest {
  userId: string
  action: 'approve' | 'reject'
  reason?: string
}

export interface KYCVerifyResponse extends ApiSuccessResponse {
  message: string
  status: 'approved' | 'rejected'
}

// ============================================================================
// Health Check API Types
// ============================================================================

export interface HealthCheckResponse {
  status: 'ok' | 'error'
  message: string
  errors?: string[]
  warnings?: string[]
}

// ============================================================================
// Database Query Response Types
// ============================================================================

/**
 * Supabase query response type
 */
export interface SupabaseQueryResponse<T> {
  data: T | null
  error: {
    message: string
    details?: string
    hint?: string
    code?: string
  } | null
}

/**
 * Supabase single row query response
 */
export interface SupabaseSingleResponse<T> {
  data: T | null
  error: {
    message: string
    details?: string
    hint?: string
    code?: string
  } | null
}

/**
 * Partial contract data (for selects with limited fields)
 */
export interface ContractSummary {
  id: string
  title: string
  status: Contract['status']
  pricing_tier: Contract['pricing_tier']
  payment_status: Contract['payment_status']
  user_id: string
  lawyer_id: string | null
  created_at: string
  updated_at: string
}

/**
 * Contract with user and lawyer details
 */
export interface ContractWithDetails extends Contract {
  user?: {
    email: string
    full_name: string | null
  }
  lawyer?: {
    email: string
    full_name: string | null
  }
}

/**
 * Payment with contract details
 */
export interface PaymentWithContract extends Payment {
  contract?: {
    title: string
    pricing_tier: string
  }
}

/**
 * KYC data with user details
 */
export interface KYCDataWithUser extends KYCData {
  user?: {
    email: string
    full_name: string | null
  }
}

// ============================================================================
// Profile/User API Types
// ============================================================================

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: 'user' | 'admin' | 'lawyer'
  kyc_completed: boolean
  created_at: string
  updated_at: string
}

export interface ProfileUpdateRequest {
  full_name?: string
  phone?: string
  address?: string
  [key: string]: unknown
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract the data type from a successful API response
 */
export type ApiResponseData<T> = T extends ApiSuccessResponse<infer U>
  ? U
  : never

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(
  response: unknown
): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as ApiErrorResponse).error === 'string'
  )
}

/**
 * Type guard to check if response is a success response
 */
export function isSuccessResponse<T = unknown>(
  response: unknown
): response is ApiSuccessResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    !('error' in response) &&
    ('message' in response || 'data' in response || Object.keys(response).length > 0)
  )
}
