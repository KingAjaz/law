import { PricingTier } from './types'

export const PRICING_TIERS: Record<PricingTier, { name: string; price: number; description: string; features: string[] }> = {
  basic: {
    name: 'Basic Review',
    price: 25000,
    description: 'Essential contract review for simple agreements',
    features: [
      'Review of key terms and conditions',
      'Identification of potential risks',
      'Basic recommendations',
      '5-7 business days turnaround',
    ],
  },
  standard: {
    name: 'Standard Review',
    price: 50000,
    description: 'Comprehensive review for standard business contracts',
    features: [
      'Detailed term analysis',
      'Risk assessment and mitigation',
      'Detailed recommendations',
      '3-5 business days turnaround',
      'Follow-up consultation (30 min)',
    ],
  },
  premium: {
    name: 'Premium Review',
    price: 100000,
    description: 'In-depth review with expert consultation',
    features: [
      'Comprehensive contract analysis',
      'Full risk assessment',
      'Detailed recommendations with alternatives',
      '1-3 business days turnaround',
      'Follow-up consultation (1 hour)',
      'Contract revision support',
    ],
  },
}

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  awaiting_payment: 'Awaiting Payment',
  payment_confirmed: 'Payment Confirmed',
  assigned_to_lawyer: 'Assigned to Lawyer',
  under_review: 'Under Review',
  completed: 'Completed',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
}
