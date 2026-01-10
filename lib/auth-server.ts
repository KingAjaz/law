import { createSupabaseServer } from './supabase/server'
import type { AuthUser } from './auth'
import type { UserRole } from './types'

/**
 * Get current authenticated user (server-side only)
 * Use this in Server Components, Route Handlers, or Server Actions
 */
export async function getCurrentUserServer(): Promise<AuthUser | null> {
  const supabase = createSupabaseServer()
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