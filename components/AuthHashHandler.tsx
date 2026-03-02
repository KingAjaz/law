'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

/**
 * Global component mounted in the root layout that intercepts
 * Supabase auth redirects landing on the wrong page (homepage).
 *
 * When Supabase rejects the `redirectTo` URL, it falls back to the
 * Site URL (homepage). This component handles:
 *
 *  1. Hash fragment with type=recovery  → redirect to password reset form
 *  2. Hash fragment with type=signup    → redirect to KYC / dashboard
 *  3. PKCE ?code= on homepage           → exchange client-side + redirect
 *  4. Error params (?error=...)         → show toast + redirect
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
                    toast.error('Link is invalid or expired. Please try again.', { duration: 6000 })
                    router.replace('/login')
                    return
                }

                // Check if this was a recovery flow
                if (data.user?.recovery_sent_at) {
                    const recoverySentAt = new Date(data.user.recovery_sent_at)
                    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
                    if (recoverySentAt > tenMinutesAgo) {
                        router.replace('/auth/reset-password-confirm')
                        return
                    }
                }

                // Email verification — go to client info form
                router.replace('/kyc')
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
                toast.error('Your link has expired. Please request a new one.', { duration: 6000 })
                router.replace('/login')
            } else {
                toast.error(errorDesc?.replace(/\+/g, ' ') || 'Authentication error. Please try again.', { duration: 6000 })
                router.replace('/login')
            }
            return
        }

        // ── 3. Hash fragment (implicit flow) ─────────────────────────────
        const hash = window.location.hash
        if (!hash || hash.length < 2) return

        const hashParams = new URLSearchParams(hash.substring(1))
        const hashError = hashParams.get('error')
        const hashErrCode = hashParams.get('error_code')

        // Hash errors
        if (hashError) {
            handled.current = true
            if (hashErrCode === 'otp_expired') {
                toast.error('Your link has expired. Please request a new one.', { duration: 6000 })
            } else {
                toast.error(hashParams.get('error_description')?.replace(/\+/g, ' ') || 'Authentication error.', { duration: 6000 })
            }
            router.replace('/login')
            return
        }

        const type = hashParams.get('type')
        const accessToken = hashParams.get('access_token')

        if (accessToken) {
            handled.current = true

            if (type === 'recovery') {
                // Password recovery → go to "Set New Password" page
                // Preserve the hash so the Supabase client on that page picks up the session
                window.location.replace('/auth/reset-password-confirm' + hash)
                return
            }

            if (type === 'signup' || type === 'email') {
                // Email verification → let Supabase client process the hash, then go to KYC/dashboard
                const supabase = createSupabaseClient()
                // The Supabase client with detectSessionInUrl will auto-process the hash
                supabase.auth.getSession().then(({ data: { session } }) => {
                    if (session?.user?.email_confirmed_at) {
                        toast.success('Email verified successfully!', { duration: 3000 })
                        router.replace('/kyc')
                    } else {
                        // Wait a moment for session to be established from hash
                        setTimeout(async () => {
                            const { data: { session: s } } = await supabase.auth.getSession()
                            if (s) {
                                toast.success('Email verified successfully!', { duration: 3000 })
                                router.replace('/kyc')
                            } else {
                                router.replace('/login')
                            }
                        }, 2000)
                    }
                })
                return
            }

            // Generic auth (e.g. magic link) — go to dashboard
            const supabase = createSupabaseClient()
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) {
                    router.replace('/dashboard')
                } else {
                    setTimeout(async () => {
                        const { data: { session: s } } = await supabase.auth.getSession()
                        router.replace(s ? '/dashboard' : '/login')
                    }, 2000)
                }
            })
        }
    }, [router, params, pathname])

    return null
}
