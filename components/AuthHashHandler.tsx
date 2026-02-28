'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import toast from 'react-hot-toast'

/**
 * Global component mounted in the root layout that intercepts
 * Supabase auth redirects landing on the wrong page.
 *
 * Supabase may ignore our `redirectTo` if the URL isn't whitelisted, 
 * falling back to the Site URL (homepage). This catches three scenarios:
 *
 *  1. ?code=xxx        → PKCE auth code on homepage → forward to /auth/callback
 *  2. #access_token=…  → Implicit flow token        → forward to reset page
 *  3. ?error=…         → Expired / invalid link      → show toast + redirect
 */
export function AuthHashHandler() {
    const router = useRouter()
    const params = useSearchParams()
    const pathname = usePathname()

    useEffect(() => {
        // Only act on the homepage — other pages have their own handlers
        if (pathname !== '/') return

        // ── 1. PKCE code on homepage ─────────────────────────────────────
        const code = params.get('code')
        if (code) {
            // Forward to the callback route which will exchange the code
            window.location.replace(`/auth/callback?code=${encodeURIComponent(code)}`)
            return
        }

        // ── 2. Error params from Supabase ────────────────────────────────
        const error = params.get('error')
        const errorCode = params.get('error_code')
        const errorDesc = params.get('error_description')

        if (error) {
            if (errorCode === 'otp_expired') {
                toast.error('Your password reset link has expired. Please request a new one.', { duration: 6000 })
                router.replace('/reset-password')
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

        const type = hashParams.get('type')
        const accessToken = hashParams.get('access_token')
        if (type === 'recovery' && accessToken) {
            window.location.replace('/auth/reset-password-confirm' + hash)
        }
    }, [router, params, pathname])

    return null
}
