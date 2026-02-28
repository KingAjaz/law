'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'

/**
 * Global component that detects Supabase auth hash fragments in the URL.
 * 
 * When Supabase sends a password recovery email, the link redirects to
 * a URL with a hash fragment like:
 *   #access_token=...&type=recovery
 * 
 * If Supabase's redirect URL whitelist rejects the app's preferred
 * destination, it falls back to the Site URL (homepage). This component
 * catches that scenario on ANY page and redirects the user to the
 * correct password reset form.
 */
export function AuthHashHandler() {
    const router = useRouter()

    useEffect(() => {
        const hash = window.location.hash
        if (!hash || hash.length < 2) return

        // Parse the hash fragment into key-value pairs
        const params = new URLSearchParams(hash.substring(1))
        const type = params.get('type')
        const accessToken = params.get('access_token')

        if (type === 'recovery' && accessToken) {
            // Let the Supabase client pick up the hash and establish the session
            const supabase = createSupabaseClient()

            // onAuthStateChange will fire once the client processes the hash
            const { data: { subscription } } = supabase.auth.onAuthStateChange(
                (event) => {
                    if (event === 'PASSWORD_RECOVERY') {
                        // Session is established — navigate to the reset form
                        router.push('/auth/reset-password-confirm')
                    }
                }
            )

            // Cleanup listener on unmount
            return () => {
                subscription.unsubscribe()
            }
        }
    }, [router])

    return null // This component renders nothing
}
