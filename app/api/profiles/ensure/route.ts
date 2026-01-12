import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from '@/lib/env'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

/**
 * API endpoint to ensure a user's profile exists
 * Uses service role key to bypass RLS and create profile if needed
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from client
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Create admin client to bypass RLS
    const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
    const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
    
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (checkError) {
      logger.error('Failed to check profile', { userId: user.id, error: checkError }, checkError)
      return NextResponse.json(
        { error: 'Failed to check profile', details: checkError.message },
        { status: 500 }
      )
    }

    // If profile exists, return success
    if (existingProfile) {
      return NextResponse.json({
        success: true,
        message: 'Profile already exists',
        profile: existingProfile,
      })
    }

    // Create profile using admin client (bypasses RLS)
    // Use upsert to handle race conditions where profile might be created between check and insert
    const { data: newProfile, error: createError } = await adminSupabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
        role: 'user',
      }, {
        onConflict: 'id',
      })
      .select()
      .single()

    if (createError) {
      logger.error('Failed to create profile', { userId: user.id, error: createError }, createError)
      
      // If it's a unique constraint violation, profile might have been created by trigger
      // Check again to see if it exists now
      if (createError.code === '23505' || createError.message.includes('duplicate')) {
        const { data: existingProfileAfterError } = await adminSupabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()
        
        if (existingProfileAfterError) {
          return NextResponse.json({
            success: true,
            message: 'Profile already exists (created by trigger)',
            profile: existingProfileAfterError,
          })
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to create profile', details: createError.message },
        { status: 500 }
      )
    }

    logger.logAuthEvent('profile_created', { userId: user.id, email: user.email })

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      profile: newProfile,
    })
  } catch (error: any) {
    logger.error('Ensure profile failed', { error }, error instanceof Error ? error : new Error(error.message))
    return NextResponse.json(
      {
        error: error.message || 'Failed to ensure profile exists',
      },
      { status: 500 }
    )
  }
}
