import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from '@/lib/env'
import { sendWelcomeEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

/**
 * API endpoint called after signup to:
 * 1. Auto-confirm the user's email via Supabase Admin API
 * 2. Send a branded welcome email via Resend
 *
 * This bypasses Supabase's unreliable built-in SMTP for Gmail delivery.
 */
export async function POST(request: NextRequest) {
    try {
        const { email, fullName } = await request.json()

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // Create Supabase admin client
        const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
        const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        })

        // Find the user
        const { data: usersData, error: getUserError } = await supabase.auth.admin.listUsers()
        const user = usersData?.users?.find(u => u.email === email)

        if (getUserError || !user) {
            // Security: Don't reveal whether email exists
            return NextResponse.json({
                success: true,
                message: 'Account setup completed.',
            })
        }

        // Auto-confirm the user's email so they can log in immediately
        if (!user.email_confirmed_at) {
            const { error: confirmError } = await supabase.auth.admin.updateUserById(
                user.id,
                { email_confirm: true }
            )

            if (confirmError) {
                logger.error('Failed to auto-confirm email', { email, error: confirmError }, confirmError)
                return NextResponse.json(
                    { error: 'Failed to confirm email' },
                    { status: 500 }
                )
            }
        }

        // Send branded welcome email via Resend
        const userName = fullName || user.user_metadata?.full_name || email.split('@')[0]
        await sendWelcomeEmail(email, userName)

        logger.logAuthEvent('email_auto_confirmed', { email, userId: user.id })

        return NextResponse.json({
            success: true,
            message: 'Email confirmed and welcome email sent.',
            confirmed: true,
        })
    } catch (error: any) {
        logger.error('Auto-confirm email failed', { error }, error instanceof Error ? error : new Error(error.message))
        return NextResponse.json(
            { error: error.message || 'Failed to confirm email' },
            { status: 500 }
        )
    }
}
