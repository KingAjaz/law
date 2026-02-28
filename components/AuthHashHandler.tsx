'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'

/**
 * Global component that handles two Supabase auth redirect scenarios:
 *
 * 1. RECOVERY HASH: Supabase sends user to homepage with
 *    #access_token=...&type=recovery  → redirect to password reset form.
 *
 * 2. ERROR PARAMS: Supabase sends user to homepage with
 *    ?error=access_denied&error_code=otp_expired  → show friendly toast
 *    and redirect to the "Request New Link" page.
 */
export function AuthHashHandler() {
    const router = useRouter()
    const params = useSearchParams()
    const pathname = usePathname()

    useEffect(() => {
        // ── Handle error query params from Supabase ──────────────────────
        const error = params.get('error')
        const errorCode = params.get('error_code')
        const errorDesc = params.get('error_description')

        if (error) {
            if (errorCode === 'otp_expired') {
                toast.error('Your password reset link has expired. Please request a new one.', { duration: 6000 })
                router.replace('/reset-password')
                return
            }
            // Generic auth error
            toast.error(errorDesc?.replace(/\+/g, ' ') || 'Authentication error. Please try again.', { duration: 6000 })
            router.replace('/login')
            return
        }

        // ── Handle recovery hash fragment ────────────────────────────────
        const hash = window.location.hash
        if (!hash || hash.length < 2) return

        const hashParams = new URLSearchParams(hash.substring(1))
        const type = hashParams.get('type')
        const accessToken = hashParams.get('access_token')
        const hashError = hashParams.get('error')
        const hashErrCode = hashParams.get('error_code')

        // Hash can also carry errors (Supabase puts them in both places)
        if (hashError) {
            if (hashErrCode === 'otp_expired') {
                toast.error('Your password reset link has expired. Please request a new one.', { duration: 6000 })
                router.replace('/reset-password')
            } else {
                toast.error(hashParams.get('error_description')?.replace(/\+/g, ' ') || 'Authentication error.', { duration: 6000 })
                router.replace('/login')
            }
            return
        }

        if (type === 'recovery' && accessToken) {
            // Already on the reset page? Let the page handle it.
            if (pathname === '/auth/reset-password-confirm') return

            // Redirect immediately, PRESERVING the hash so the destination
            // page's Supabase client can pick up the token and establish a session.
            window.location.replace('/auth/reset-password-confirm' + hash)
        }
    }, [router, params, pathname])

    return null
}
