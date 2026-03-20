import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from '@/lib/env'
import { sendPasswordResetRequestEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

/**
 * API endpoint to send a professional password reset email via Resend
 * instead of Supabase's basic built-in template.
 *
 * 1. Uses Supabase Admin API to generate a recovery link
 * 2. Sends a branded email with the link via Resend
 */
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

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

        // Security: Don't reveal whether email exists.
        // Always return the same response shape.
        const { data: users, error: getUserError } = await supabase.auth.admin.listUsers()

        if (getUserError) {
            logger.error('Failed to list users for reset', { error: getUserError }, getUserError)
            // Still return success to prevent enumeration
            return NextResponse.json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.',
            })
        }

        const user = users.users.find(u => u.email === email)

        if (!user) {
            // Don't reveal that email doesn't exist
            return NextResponse.json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.',
            })
        }

        // Generate recovery link via Supabase Admin API
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://legaleaseadvisory.com'
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email,
            options: {
                redirectTo: `${appUrl}/auth/reset-password-confirm`,
            },
        })

        if (linkError) {
            logger.error('Failed to generate recovery link', { email, error: linkError }, linkError)
            return NextResponse.json(
                { error: 'Failed to generate reset link' },
                { status: 500 }
            )
        }

        const resetLink = linkData.properties?.action_link

        if (!resetLink) {
            return NextResponse.json(
                { error: 'Failed to generate reset link' },
                { status: 500 }
            )
        }

        // Create the securely wrapped link that forces manual interaction
        const secureResetLink = `${appUrl}/auth/secure-link?type=reset&url=${encodeURIComponent(resetLink)}`

        // Get user display name
        const userName = user.user_metadata?.full_name
            || user.user_metadata?.name
            || email.split('@')[0]

        // Send the professional email via Resend
        const emailSent = await sendPasswordResetRequestEmail(email, userName, secureResetLink)

        if (!emailSent) {
            logger.error('Failed to send password reset email via Resend', { email })
            return NextResponse.json(
                { error: 'Failed to send reset email. Please try again.' },
                { status: 500 }
            )
        }

        logger.logAuthEvent('password_reset_email_sent', { email, userId: user.id, via: 'resend' })

        return NextResponse.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.',
        })
    } catch (error: any) {
        logger.error('Send reset email failed', { error }, error instanceof Error ? error : new Error(error.message))
        return NextResponse.json(
            { error: error.message || 'Failed to send reset email' },
            { status: 500 }
        )
    }
}
