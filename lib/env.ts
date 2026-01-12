/**
 * Environment variable validation
 * Validates all required environment variables at startup
 */

type EnvVar = {
  name: string
  required: boolean
  description: string
  validate?: (value: string) => boolean | string
}

const ENV_VARS: EnvVar[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
    validate: (value) => {
      if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
        return 'Must be a valid Supabase URL (https://*.supabase.co)'
      }
      return true
    },
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous/public key',
    validate: (value) => {
      if (value.length < 50) {
        return 'Supabase anon key appears to be invalid'
      }
      return true
    },
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase service role key (server-side only)',
    validate: (value) => {
      if (value.length < 50) {
        return 'Supabase service role key appears to be invalid'
      }
      return true
    },
  },
  {
    name: 'PAYSTACK_SECRET_KEY',
    required: true,
    description: 'Paystack secret key (server-side only)',
    validate: (value) => {
      if (!value.startsWith('sk_')) {
        return 'Paystack secret key should start with "sk_"'
      }
      return true
    },
  },
  {
    name: 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
    required: false, // Optional if not using client-side payment init
    description: 'Paystack public key',
    validate: (value) => {
      if (value && !value.startsWith('pk_')) {
        return 'Paystack public key should start with "pk_"'
      }
      return true
    },
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    description: 'Application URL for callbacks',
    validate: (value) => {
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        return 'App URL must start with http:// or https://'
      }
      return true
    },
  },
  {
    name: 'NEXT_PUBLIC_CONTACT_PHONE',
    required: false,
    description: 'Contact phone number (optional, has default)',
  },
  {
    name: 'NEXT_PUBLIC_CONTACT_EMAIL',
    required: false,
    description: 'Contact email (optional, has default)',
  },
  {
    name: 'EMAIL_SERVICE',
    required: false,
    description: 'Email service to use (console, resend, sendgrid) - defaults to console for development',
  },
  {
    name: 'RESEND_API_KEY',
    required: false,
    description: 'Resend API key (required if using Resend email service)',
  },
  {
    name: 'SENDGRID_API_KEY',
    required: false,
    description: 'SendGrid API key (required if using SendGrid email service)',
  },
  {
    name: 'EMAIL_FROM',
    required: false,
    description: 'Email sender address (optional, has default)',
  },
  {
    name: 'ADMIN_EMAIL',
    required: false,
    description: 'Admin email address for notifications (optional, defaults to NEXT_PUBLIC_CONTACT_EMAIL)',
  },
  {
    name: 'RESEND_API_KEY',
    required: false,
    description: 'Resend API key for sending emails (required if EMAIL_SERVICE=resend)',
  },
  {
    name: 'NEXT_PUBLIC_SOCIAL_FACEBOOK',
    required: false,
    description: 'Facebook page URL (optional)',
  },
  {
    name: 'NEXT_PUBLIC_SOCIAL_TWITTER',
    required: false,
    description: 'Twitter profile URL (optional)',
  },
  {
    name: 'NEXT_PUBLIC_SOCIAL_INSTAGRAM',
    required: false,
    description: 'Instagram profile URL (optional)',
  },
  {
    name: 'NEXT_PUBLIC_SOCIAL_LINKEDIN',
    required: false,
    description: 'LinkedIn profile URL (optional)',
  },
  {
    name: 'GOOGLE_OAUTH_CLIENT_ID',
    required: false,
    description: 'Google OAuth Client ID (for reference only - must be configured in Supabase Dashboard → Authentication → Providers → Google)',
  },
  {
    name: 'GOOGLE_OAUTH_CLIENT_SECRET',
    required: false,
    description: 'Google OAuth Client Secret (for reference only - must be configured in Supabase Dashboard → Authentication → Providers → Google)',
  },
]

export interface EnvValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validates environment variables
 * @param isServerSide - Whether this is running on the server (can check server-only vars)
 * @returns Validation result with errors and warnings
 */
export function validateEnv(isServerSide: boolean = false): EnvValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name]

    // Skip server-only variables if running client-side
    if (!isServerSide && !envVar.name.startsWith('NEXT_PUBLIC_')) {
      continue
    }

    // Check required variables
    if (envVar.required && (!value || value.trim() === '')) {
      errors.push(
        `❌ ${envVar.name} is required but not set. ${envVar.description}`
      )
      continue
    }

    // Validate value if validator exists and value is provided
    if (value && envVar.validate) {
      const validationResult = envVar.validate(value)
      if (validationResult !== true) {
        errors.push(
          `❌ ${envVar.name}: ${validationResult}`
        )
      }
    }

    // Warn about optional but recommended variables
    if (!envVar.required && (!value || value.trim() === '')) {
      warnings.push(
        `⚠️  ${envVar.name} is not set. ${envVar.description}`
      )
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validates and throws if invalid (for server-side use)
 * Call this at the top of server-side entry points
 */
export function requireEnv(isServerSide: boolean = false): void {
  const result = validateEnv(isServerSide)

  if (!result.valid) {
    console.error('\n❌ Environment Variable Validation Failed:\n')
    result.errors.forEach((error) => console.error(`  ${error}`))
    if (result.warnings.length > 0) {
      console.warn('\n⚠️  Warnings:\n')
      result.warnings.forEach((warning) => console.warn(`  ${warning}`))
    }
    console.error('\nPlease set the required environment variables in .env.local\n')
    throw new Error('Environment variable validation failed')
  }

  if (result.warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('\n⚠️  Environment Variable Warnings:\n')
    result.warnings.forEach((warning) => console.warn(`  ${warning}`))
  }
}

/**
 * Get validated environment variable
 * Throws if variable is required but not set
 */
export function getEnvVar(name: string, defaultValue?: string): string {
  const envVar = ENV_VARS.find((v) => v.name === name)
  const value = process.env[name] || defaultValue

  if (envVar?.required && !value) {
    throw new Error(`${name} is required but not set`)
  }

  return value || ''
}
