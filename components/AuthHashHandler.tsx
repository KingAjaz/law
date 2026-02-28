'use client'

import { useEffect } from 'react'

/**
 * Global component that detects Supabase auth hash fragments in the URL.
 * 
 * When Supabase sends a password recovery email, the link redirects with
 * a hash fragment like:  #access_token=...&type=recovery
 * 
 * If Supabase's redirect URL whitelist rejects the app's preferred
 * destination, it falls back to the Site URL (homepage). This component
 * catches that on ANY page and immediately redirects the user to the
 * password reset form — carrying the hash fragment along so the
 * Supabase client on the destination page can establish the session.
 */
export function AuthHashHandler() {
    useEffect(() => {
        const hash = window.location.hash
        if (!hash || hash.length < 2) return

        // Parse the hash fragment
        const params = new URLSearchParams(hash.substring(1))
        const type = params.get('type')
        const accessToken = params.get('access_token')

        if (type === 'recovery' && accessToken) {
            // Already on the reset page? Let the page handle it.
            if (window.location.pathname === '/auth/reset-password-confirm') return

            // Redirect immediately, PRESERVING the hash so the destination
            // page's Supabase client can pick up the token and establish a session.
            window.location.replace('/auth/reset-password-confirm' + hash)
        }
    }, [])

    return null
}
