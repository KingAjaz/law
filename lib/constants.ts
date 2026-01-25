import { PricingTier } from './types'

export const PRICING_TIERS: Record<PricingTier, { name: string; price: number; description: string; features: string[]; deprecated?: boolean }> = {
  nda_basic: {
    name: 'NDA Review (Basic)',
    price: 60000,
    description: 'Basic Non-Disclosure Agreement review',
    features: [
      '1 review',
    ],
  },
  nda_premium: {
    name: 'NDA Review (Premium)',
    price: 120000,
    description: 'Premium Non-Disclosure Agreement review with negotiation',
    features: [
      '2 reviews',
      '30 min contract negotiation call with counterparty',
    ],
  },
  sla_basic: {
    name: 'SLA Review (Basic)',
    price: 160000,
    description: 'Basic Service Level Agreement review',
    features: [
      '2 reviews',
    ],
  },
  sla_premium: {
    name: 'SLA Review (Premium)',
    price: 240000,
    description: 'Premium Service Level Agreement review with negotiation',
    features: [
      '3 reviews',
      '60 min contract negotiation call with counterparty',
    ],
  },
  tech_msa_basic: {
    name: 'SaaS/MSA Review (Basic)',
    price: 220000,
    description: 'Basic SaaS Order Form or MSA review',
    features: [
      '2 reviews',
    ],
  },
  tech_msa_premium: {
    name: 'SaaS/MSA Review (Premium)',
    price: 300000,
    description: 'Premium SaaS Order Form or MSA review with negotiation',
    features: [
      '3 reviews',
      '60 min contract negotiation call with counterparty',
    ],
  },
  // Legacy Tiers (approximated for display)
  nda: {
    name: 'NDA Review (Legacy)',
    price: 60000,
    description: 'Non-Disclosure Agreement review',
    features: ['Legacy'],
    deprecated: true,
  },
  sla: {
    name: 'SLA Review (Legacy)',
    price: 100000,
    description: 'Service Level Agreement review',
    features: ['Legacy'],
    deprecated: true,
  },
  tech_msa: {
    name: 'Tech MSA (Legacy)',
    price: 150000,
    description: 'Technology Master Service Agreements',
    features: ['Legacy'],
    deprecated: true,
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
