'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { updatePassword } from '@/lib/auth'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import toast from 'react-hot-toast'
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react'

function ResetPasswordConfirmForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [verifyingLink, setVerifyingLink] = useState(true)
  const [linkError, setLinkError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    // Check if there's a valid session (user must be authenticated via the reset link)
    const { createSupabaseClient } = require('@/lib/supabase/client')
    const supabase = createSupabaseClient()
    let settled = false

    // Listen for the PASSWORD_RECOVERY event fired when the Supabase
    // client processes the #access_token hash fragment.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string) => {
        if (event === 'PASSWORD_RECOVERY') {
          settled = true
          setVerifyingLink(false)
        }
      }
    )

    // Also poll for an existing session (covers the PKCE / code flow)
    const checkSession = async () => {
      try {
        if (typeof window !== 'undefined' && window.location.hash.includes('error=')) {
          setLinkError(true)
          setVerifyingLink(false)
          toast.error('This link is invalid or has already been used.')
          return
        }

        // Manually parse the hash to guarantee session establishment
        // This bypasses any race conditions with Providers or Next.js routers
        let sessionEstablished = false
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
          const params = new URLSearchParams(window.location.hash.substring(1))
          const access_token = params.get('access_token')
          const refresh_token = params.get('refresh_token')
          if (access_token && refresh_token) {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token
            })
            if (!setSessionError) {
              sessionEstablished = true
            }
          }
        }

        // Try multiple times over 5 seconds to verify session is active
        for (let i = 0; i < 5; i++) {
          if (settled || sessionEstablished) {
             setVerifyingLink(false)
             return
          }
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            settled = true
            setVerifyingLink(false)
            return
          }
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        // If still no session after retries, show error state
        if (!settled) {
          setLinkError(true)
          setVerifyingLink(false)
          toast.error('Invalid or expired reset link. Please request a new one.')
        }
      } catch (error) {
        console.error('Session check error:', error)
        if (!settled) {
          setLinkError(true)
          setVerifyingLink(false)
          toast.error('An error occurred. Please try again.')
        }
      }
    }

    checkSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await updatePassword(password)
      setSuccess(true)
      toast.success('Password updated successfully!')

      // Send password reset completion email (non-blocking)
      fetch('/api/auth/password-reset-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch((error) => {
        console.error('Failed to send password reset completion email', error)
        // Don't fail the password reset if email fails
      })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  if (verifyingLink) {
    return (
      <div className="min-h-screen flex flex-col bg-dark-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center card">
            <h2 className="text-2xl font-bold mb-4">Verifying secure link...</h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-400 mt-4 text-sm">Please wait while we verify your password reset safely.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (linkError) {
    return (
      <div className="min-h-screen flex flex-col bg-dark-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center card">
            <h2 className="text-xl font-bold text-red-500 mb-4">Link Expired or Invalid</h2>
            <p className="text-gray-400 mb-6 text-sm">Your password reset link was not properly loaded or has expired. Please request a new reset link.</p>
            <Link href="/reset-password" className="btn btn-primary w-full">Request New Link</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-dark-950">
        <Navbar />

        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full space-y-8 text-center"
          >
            <div className="card">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Password Updated!</h2>
              <p className="text-gray-400 mb-6">
                Your password has been successfully updated. Redirecting to login...
              </p>
              <Link href="/login" className="btn btn-primary">
                Go to Login
              </Link>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-center text-white">Set New Password</h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Enter your new password below
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Updating password...' : 'Update Password'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-primary-400 hover:text-primary-300">
                Back to Login
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-dark-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="card">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-primary-700 rounded w-3/4"></div>
                <div className="h-10 bg-primary-700 rounded"></div>
                <div className="h-10 bg-primary-700 rounded"></div>
                <div className="h-10 bg-primary-700 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ResetPasswordConfirmForm />
    </Suspense>
  )
}