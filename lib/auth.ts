import { createSupabaseClient } from './supabase/client'
import type { UserRole } from './types'

export async function getCurrentUser() {
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
      }
    : null
}

export async function signOut() {
  const supabase = createSupabaseClient()
  await supabase.auth.signOut()
}
