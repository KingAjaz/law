import { PricingTier } from './types'

export const PRICING_TIERS: Record<PricingTier, { name: string; price: number; description: string; features: string[] }> = {
  nda: {
    name: 'NDA Review',
    price: 60000,
    description: 'Non-Disclosure Agreement review with counterparty consultation',
    features: [
      '2 reviews',
      '30-min virtual review call with counterparty',
    ],
  },
  sla: {
    name: 'SLA and Service Agreement Reviews',
    price: 100000,
    description: 'Service Level Agreement and service agreement review with consultation',
    features: [
      '2 reviews',
      '30-min virtual review call with counterparty',
    ],
  },
  tech_msa: {
    name: 'Tech MSAs and Order Forms',
    price: 150000,
    description: 'Technology Master Service Agreements and order forms review',
    features: [
      '2 reviews',
      '1-hour virtual review call with counterparty',
    ],
  },
}

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  awaiting_payment: 'Awaiting Payment',
  awaiting_upload: 'Payment Confirmed - Upload File',
  payment_confirmed: 'Payment Confirmed',
  assigned_to_lawyer: 'Assigned to Lawyer',
  under_review: 'Under Review',
  completed: 'Completed',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  success: 'Completed', // For payments table
  completed: 'Completed', // For contracts.payment_status
  failed: 'Failed',
}

export const CONTACT_INFO = {
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+234 XXX XXX XXXX',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@legalease.com',
  address: 'Lagos, Nigeria',
}

export const SOCIAL_MEDIA_LINKS = {
  facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || null,
  twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || null,
  instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || null,
  linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || null,
}
