import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from '@/lib/env'

/**
 * Ensures a profile exists for the authenticated user.
 * Uses the service role to bypass RLS.
 */
export async function POST(request: NextRequest) {
    try {
        const { userId, email, fullName } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        const supabase = createClient(
            getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
            getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        // Check if profile already exists
        const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .maybeSingle()

        if (existing) {
            return NextResponse.json({ success: true, existed: true })
        }

        // Create profile using service role (bypasses RLS)
        const { error } = await supabase.from('profiles').insert({
            id: userId,
            email: email || '',
            full_name: fullName || '',
            role: 'user',
            kyc_completed: false,
        })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, existed: false })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
