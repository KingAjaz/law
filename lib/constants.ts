import { PricingTier } from './types'

export const PRICING_TIERS: Record<PricingTier, { name: string; price: number; description: string; features: string[]; deprecated?: boolean }> = {
  // --- NDA Reviews & Drafts ---
  nda_draft_basic: {
    name: 'NDA Draft (Basic)',
    price: 100000,
    description: 'Basic Non-Disclosure Agreement drafting',
    features: ['Standard drafting'],
    deprecated: true,
  },
  nda_draft_premium: {
    name: 'NDA Draft (Premium)',
    price: 150000,
    description: 'Premium Non-Disclosure Agreement drafting',
    features: ['24-hour response time'],
    deprecated: true,
  },
  nda_review_basic: {
    name: 'NDA Review (Basic Plan)',
    price: 90000,
    description: 'Basic Non-Disclosure Agreement review',
    features: ['1 review'],
    deprecated: true,
  },
  nda_review_premium: {
    name: 'NDA Review (Premium Plan)',
    price: 180000,
    description: 'Premium Non-Disclosure Agreement review',
    features: ['2 reviews', '30 min contract negotiation call with counterparty'],
    deprecated: true,
  },

  // --- SLA Reviews & Drafts ---
  sla_draft_basic: {
    name: 'SLA Draft (Basic)',
    price: 200000,
    description: 'Basic Service Level Agreement drafting',
    features: ['Standard drafting'],
    deprecated: true,
  },
  sla_draft_premium: {
    name: 'SLA Draft (Premium)',
    price: 250000,
    description: 'Premium Service Level Agreement drafting',
    features: ['24-hour response time'],
    deprecated: true,
  },
  sla_review_basic: {
    name: 'SLA Review (Basic Plan)',
    price: 180000,
    description: 'Basic Service Level Agreement review',
    features: ['1 review'],
    deprecated: true,
  },
  sla_review_premium: {
    name: 'SLA Review (Premium Plan)',
    price: 360000,
    description: 'Premium Service Level Agreement review',
    features: ['3 reviews', '30 min contract negotiation call with counterparty'],
    deprecated: true,
  },

  // --- MSA & Order Forms ---
  tech_msa_draft_basic: {
    name: 'MSA/SaaS Draft (Basic)',
    price: 350000,
    description: 'Basic Master Service Agreement / Order Form drafting',
    features: ['Standard drafting'],
    deprecated: true,
  },
  tech_msa_draft_premium: {
    name: 'MSA/SaaS Draft (Premium)',
    price: 400000,
    description: 'Premium Master Service Agreement / Order Form drafting',
    features: ['24-hour response time'],
    deprecated: true,
  },
  tech_msa_review_basic: {
    name: 'MSA/SaaS Review (Basic Plan)',
    price: 330000,
    description: 'Basic Master Service Agreement / Order Form review',
    features: ['1 review'],
    deprecated: true,
  },
  tech_msa_review_premium: {
    name: 'MSA/SaaS Review (Premium Plan)',
    price: 600000,
    description: 'Premium Master Service Agreement / Order Form review',
    features: ['3 reviews', '30 min contract negotiation call with counterparty'],
    deprecated: true,
  },

  // --- Privacy Policy ---
  privacy_draft_basic: {
    name: 'Privacy Policy Draft (Basic)',
    price: 120000,
    description: 'Basic Privacy Policy drafting',
    features: ['Standard drafting'],
    deprecated: true,
  },
  privacy_draft_premium: {
    name: 'Privacy Policy Draft (Premium)',
    price: 200000,
    description: 'Premium Privacy Policy drafting',
    features: ['24-hour response time'],
    deprecated: true,
  },

  // --- Terms & Conditions ---
  tnc_draft_basic: {
    name: 'Terms & Conditions Draft (Basic)',
    price: 500000,
    description: 'Terms & Conditions drafting for websites and apps',
    features: ['Standard drafting'],
    deprecated: true,
  },

  // --- Legacy Tiers (approximated for display) ---
  nda_basic: {
    name: 'NDA Review (Legacy Basic)',
    price: 60000,
    description: 'Legacy Non-Disclosure Agreement review',
    features: ['Legacy'],
    deprecated: true,
  },
  nda_premium: {
    name: 'NDA Review (Legacy Premium)',
    price: 120000,
    description: 'Legacy Premium Non-Disclosure Agreement review',
    features: ['Legacy'],
    deprecated: true,
  },
  sla_basic: {
    name: 'SLA Review (Legacy Basic)',
    price: 160000,
    description: 'Legacy Basic Service Level Agreement review',
    features: ['Legacy'],
    deprecated: true,
  },
  sla_premium: {
    name: 'SLA Review (Legacy Premium)',
    price: 240000,
    description: 'Legacy Premium Service Level Agreement review',
    features: ['Legacy'],
    deprecated: true,
  },
  tech_msa_basic: {
    name: 'SaaS/MSA Review (Legacy Basic)',
    price: 220000,
    description: 'Legacy Basic SaaS Order Form or MSA review',
    features: ['Legacy'],
    deprecated: true,
  },
  tech_msa_premium: {
    name: 'SaaS/MSA Review (Legacy Premium)',
    price: 300000,
    description: 'Legacy Premium SaaS Order Form or MSA review',
    features: ['Legacy'],
    deprecated: true,
  },
  // --- Existing Tiers matching DB Constraint ---
  nda: {
    name: 'NDA Review',
    price: 60000,
    description: 'Non-Disclosure Agreement review',
    features: ['Standard Review'],
  },
  sla: {
    name: 'SLA Review',
    price: 100000,
    description: 'Service Level Agreement review',
    features: ['Standard Review'],
  },
  tech_msa: {
    name: 'Tech MSA',
    price: 150000,
    description: 'Technology Master Service Agreements',
    features: ['Standard Review'],
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
  linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || 'https://www.linkedin.com/company/legalease',
}
