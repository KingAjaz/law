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
      emailRedirectTo: `${window.location.origin}/auth/verify-email`,
    },
  })

  if (error) throw error
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

  if (error) throw error
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
 */
export async function resendEmailConfirmation(email: string) {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/verify-email`,
    },
  })

  if (error) throw error
  return data
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
