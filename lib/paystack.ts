// Paystack integration utilities

export interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    amount: number
    currency: string
    reference: string
    status: string
    customer: {
      email: string
    }
  }
}

export async function initializePayment(
  email: string,
  amount: number,
  reference: string,
  metadata?: Record<string, any>
): Promise<PaystackInitializeResponse> {
  const response = await fetch('/api/paystack/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: amount * 100, // Convert to kobo
      reference,
      metadata,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to initialize payment')
  }

  return response.json()
}

export async function verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
  const response = await fetch(`/api/paystack/verify?reference=${reference}`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error('Failed to verify payment')
  }

  return response.json()
}
