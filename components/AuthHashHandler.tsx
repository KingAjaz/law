'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

/**
 * Global component mounted in the root layout that intercepts
 * Supabase auth redirects landing on the wrong page.
 *
 * When Supabase rejects the `redirectTo` URL, it falls back to the
 * Site URL (homepage) with `?code=xxx`. This component:
 *
 *  1. Exchanges the code for a session CLIENT-SIDE (important — the
 *     PKCE code_verifier lives in the browser, so the server can't
 *     do this exchange)
 *  2. Detects if the code was for a password recovery
 *  3. Redirects to the appropriate page
 *  4. Also handles error params and hash fragment tokens
 */
export function AuthHashHandler() {
    const router = useRouter()
    const params = useSearchParams()
    const pathname = usePathname()
    const handled = useRef(false)

    useEffect(() => {
        // Only act on the homepage — other pages have their own handlers
        if (pathname !== '/') return
        // Guard against double-processing
        if (handled.current) return

        // ── 1. PKCE code on homepage → exchange client-side ──────────────
        const code = params.get('code')
        if (code) {
            handled.current = true
            const supabase = createSupabaseClient()

            supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
                if (error) {
                    console.error('Code exchange failed:', error)
                    toast.error('Password reset link is invalid or expired. Please request a new one.', { duration: 6000 })
                    router.replace('/reset-password')
                    return
                }

                // Check if this was a recovery flow
                if (data.user?.recovery_sent_at) {
                    const recoverySentAt = new Date(data.user.recovery_sent_at)
                    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)

                    if (recoverySentAt > tenMinutesAgo) {
                        // Recovery — go to the password reset form
                        router.replace('/auth/reset-password-confirm')
                        return
                    }
                }

                // Not a recovery, or recovery was old — go to dashboard
                router.replace('/dashboard')
            })
            return
        }

        // ── 2. Error params from Supabase ────────────────────────────────
        const error = params.get('error')
        const errorCode = params.get('error_code')
        const errorDesc = params.get('error_description')

        if (error) {
            handled.current = true
            if (errorCode === 'otp_expired') {
                toast.error('Your password reset link has expired. Please request a new one.', { duration: 6000 })
                router.replace('/reset-password')
            } else {
                toast.error(errorDesc?.replace(/\+/g, ' ') || 'Authentication error. Please try again.', { duration: 6000 })
                router.replace('/login')
            }
            return
        }

        // ── 3. Hash fragment (implicit flow fallback) ────────────────────
        const hash = window.location.hash
        if (!hash || hash.length < 2) return

        const hashParams = new URLSearchParams(hash.substring(1))
        const hashError = hashParams.get('error')
        const hashErrCode = hashParams.get('error_code')

        if (hashError) {
            handled.current = true
            if (hashErrCode === 'otp_expired') {
                toast.error('Your password reset link has expired. Please request a new one.', { duration: 6000 })
                router.replace('/reset-password')
            } else {
                toast.error(hashParams.get('error_description')?.replace(/\+/g, ' ') || 'Authentication error.', { duration: 6000 })
                router.replace('/login')
            }
            return
        }

        const type = hashParams.get('type')
        const accessToken = hashParams.get('access_token')
        if (type === 'recovery' && accessToken) {
            handled.current = true
            window.location.replace('/auth/reset-password-confirm' + hash)
        }
    }, [router, params, pathname])

    return null
}
