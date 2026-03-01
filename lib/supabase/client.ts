import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Client-side Supabase client
// Using createClientComponentClient which properly integrates with Next.js cookies
export const createSupabaseClient = () => {
  return createClientComponentClient()
}

// Server-side Supabase client with service role
import { createClient } from '@supabase/supabase-js'

export const createSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
