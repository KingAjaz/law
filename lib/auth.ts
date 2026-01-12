import { createSupabaseClient } from './supabase/client'
import type { UserRole } from './types'

export interface AuthUser {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  kyc_completed: boolean
  email_verified?: boolean
}

/**
 * Get current authenticated user (client-side)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return profile
    ? {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role as UserRole,
        kyc_completed: profile.kyc_completed,
        email_verified: session.user.email_confirmed_at !== null,
      }
    : null
}


/**
 * Sign out current user
 */
export async function signOut() {
  const supabase = createSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split('@')[0],
      },
      emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
    },
  })

  if (error) throw error
  
  // Also send verification email via our email service as a fallback
  // This ensures emails are sent even if Supabase SMTP fails
  if (data.user && !data.user.email_confirmed_at) {
    try {
      await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName: fullName || email.split('@')[0] }),
      })
    } catch (emailError) {
      // Don't fail signup if our email service fails, Supabase might have sent it
      console.warn('Failed to send verification email via our service:', emailError)
    }
  }
  
  return data
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Supabase returns "Invalid login credentials" for unverified emails
    // We'll handle this in the UI layer with better messaging
    throw error
  }
  return data
}

/**
 * Sign in with magic link (passwordless)
 */
export async function signInWithMagicLink(email: string, redirectTo?: string) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
    },
  })

  if (error) throw error
  return data
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(
  provider: 'google',
  redirectTo?: string
) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
    },
  })

  if (error) throw error
  return data
}

/**
 * Reset password for email
 */
export async function resetPassword(email: string) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password-confirm`,
  })

  if (error) throw error
  return data
}

/**
 * Update user password (must be authenticated)
 */
export async function updatePassword(newPassword: string) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
  return data
}

/**
 * Resend email confirmation
 * Note: Supabase's resend() may send emails even for non-existent users
 * Use server-side /api/auth/resend-verification instead for better security
 */
export async function resendEmailConfirmation(email: string) {
  const supabase = createSupabaseClient()
  
  // Use server-side API instead for better security (checks if user exists)
  try {
    const response = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to resend verification email')
    }
    
    return data
  } catch (error: any) {
    // Fallback to client-side method if server-side fails
    // But note: this may send emails for non-existent users
    const { data, error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
      },
    })

    if (resendError) throw resendError
    return data
  }
}

/**
 * Update user profile
 */
export async function updateProfile(updates: { full_name?: string }) {
  const supabase = createSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', session.user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Check if user email is verified
 */
export async function isEmailVerified(): Promise<boolean> {
  const supabase = createSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return false
  return session.user.email_confirmed_at !== null
}

/**
 * Get current session
 */
export async function getSession() {
  const supabase = createSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}
