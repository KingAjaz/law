export type UserRole = 'user' | 'admin' | 'lawyer'

export type ContractStatus =
  | 'awaiting_payment'
  | 'awaiting_upload'      // Payment confirmed, waiting for file upload
  | 'payment_confirmed'    // File uploaded, payment confirmed
  | 'assigned_to_lawyer'
  | 'under_review'
  | 'completed'

export type PricingTier = 'nda' | 'sla' | 'tech_msa'

export interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  kyc_completed: boolean
  created_at: string
  updated_at: string
}

export interface KYCData {
  id: string
  user_id: string
  first_name: string
  last_name: string
  phone_number: string
  address: string
  city: string
  state: string
  country: string
  id_type: 'nin' | 'passport' | 'drivers_license'
  id_number: string
  id_document_url: string | null
  terms_accepted: boolean
  privacy_accepted: boolean
  status?: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string | null
  reviewed_at?: string | null
  rejection_reason?: string | null
  created_at: string
  updated_at: string
}

export interface Contract {
  id: string
  user_id: string
  lawyer_id: string | null
  title: string
  original_file_url: string | null  // Nullable: can be created after payment, before upload
  reviewed_file_url: string | null
  status: ContractStatus
  pricing_tier: PricingTier
  payment_id: string | null
  payment_status: 'pending' | 'completed' | 'failed'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  contract_id: string
  amount: number
  currency: string
  paystack_reference: string
  status: 'pending' | 'success' | 'failed'
  created_at: string
  updated_at: string
}

export interface Pricing {
  id: string
  tier: PricingTier
  name: string
  description: string
  price: number
  currency: string
  features: string[]
  active: boolean
  created_at: string
  updated_at: string
}

/**
 * Contact message from contact form
 */
export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  service: string | null
  message: string
  created_at: string
  updated_at: string
}

/**
 * Payment status type
 */
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'completed'

/**
 * KYC status type
 */
export type KYCStatus = 'pending' | 'approved' | 'rejected'
