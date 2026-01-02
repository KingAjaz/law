export type UserRole = 'user' | 'admin' | 'lawyer'

export type ContractStatus =
  | 'awaiting_payment'
  | 'payment_confirmed'
  | 'assigned_to_lawyer'
  | 'under_review'
  | 'completed'

export type PricingTier = 'basic' | 'standard' | 'premium'

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
  created_at: string
  updated_at: string
}

export interface Contract {
  id: string
  user_id: string
  lawyer_id: string | null
  title: string
  original_file_url: string
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
