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
  try {
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

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.error || 'Failed to initialize payment'
      throw new Error(errorMessage)
    }

    return data
  } catch (error: any) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error while initializing payment')
  }
}

export async function verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
  try {
    // Validate reference parameter
    if (!reference || reference.trim() === '') {
      throw new Error('Payment reference is required')
    }

    const response = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    let data: any
    try {
      data = await response.json()
    } catch (parseError) {
      throw new Error('Invalid response from payment verification service')
    }

    if (!response.ok) {
      // Extract error message from response
      const errorMessage = data.error || 
        (response.status === 404 ? 'Payment reference not found' :
         response.status >= 500 ? 'Payment verification service is temporarily unavailable' :
         'Failed to verify payment')
      
      const error = new Error(errorMessage)
      // Attach additional error details if available
      if (data.details) {
        (error as any).details = data.details
      }
      throw error
    }

    // Validate response structure
    if (!data || !data.status || !data.data) {
      throw new Error('Invalid payment verification response')
    }

    return data
  } catch (error: any) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network error while verifying payment')
  }
}
