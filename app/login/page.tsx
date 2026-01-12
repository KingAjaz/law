'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { signInWithEmail, signInWithMagicLink, signInWithOAuth, resendEmailConfirmation } from '@/lib/auth'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import toast from 'react-hot-toast'
import { Mail, Lock, ArrowRight, KeyRound } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLinkLoading, setMagicLinkLoading] = useState(false)
  const [resendingVerification, setResendingVerification] = useState(false)
  const [showResendVerification, setShowResendVerification] = useState(false)
  const [authMethod, setAuthMethod] = useState<'password' | 'magic-link'>('password')
  
  // Handle error messages from query params (e.g., OAuth errors)
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  useEffect(() => {
    if (error) {
      toast.error(errorDescription || 'Authentication error occurred')
      // Clean up URL
      router.replace('/login')
    }
  }, [error, errorDescription, router])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signInWithEmail(email, password)
      toast.success('Login successful!')
      router.push(redirect)
    } catch (error: any) {
      // Check if error is due to unverified email
      const errorMessage = error.message || ''
      const isEmailNotConfirmed = 
        errorMessage.includes('email not confirmed') || 
        errorMessage.includes('Email not confirmed') ||
        errorMessage.includes('email_not_confirmed') ||
        errorMessage === 'EMAIL_NOT_CONFIRMED' ||
        error.status === 400 && errorMessage.includes('Invalid login credentials')
      
      if (isEmailNotConfirmed) {
        toast.error('Please verify your email before logging in. Check your inbox for the verification link.', {
          duration: 6000,
        })
        setShowResendVerification(true)
        // Optionally redirect to verification page after a delay
        setTimeout(() => {
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
        }, 3000)
      } else if (errorMessage.includes('Invalid login credentials') || 
                 errorMessage.includes('invalid_credentials') ||
                 errorMessage.includes('Invalid credentials')) {
        toast.error('Invalid email or password. Please check your credentials. If you just signed up, verify your email first.', {
          duration: 6000,
        })
        // Show resend verification option in case they haven't verified
        setShowResendVerification(true)
      } else {
        toast.error(errorMessage || 'Failed to login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMagicLinkLoading(true)

    try {
      await signInWithMagicLink(email, `${window.location.origin}/auth/callback?redirect=${redirect}`)
      toast.success('Check your email for the magic link!')
      setAuthMethod('password')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send magic link')
    } finally {
      setMagicLinkLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google') => {
    try {
      await signInWithOAuth(provider, `${window.location.origin}/auth/callback?redirect=${redirect}`)
    } catch (error: any) {
      toast.error(error.message || `Failed to login with ${provider}`)
    }
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
            <h2 className="text-3xl font-bold text-center text-white">Sign in to your account</h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Or{' '}
              <Link href="/signup" className="font-medium text-primary-400 hover:text-primary-300">
                create a new account
              </Link>
            </p>
          </div>

          <div className="card">
            {/* Toggle between password and magic link */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setAuthMethod('password')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  authMethod === 'password'
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                }`}
              >
                <Lock className="h-4 w-4 inline mr-2" />
                Password
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('magic-link')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  authMethod === 'magic-link'
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                }`}
              >
                <KeyRound className="h-4 w-4 inline mr-2" />
                Magic Link
              </button>
            </div>

            {authMethod === 'password' ? (
              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-10"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pl-10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/reset-password" className="font-medium text-primary-400 hover:text-primary-300">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {showResendVerification && (
                  <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                    <p className="text-sm text-yellow-300 mb-2">
                      Haven't verified your email yet?
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!email) {
                          toast.error('Please enter your email address first')
                          return
                        }
                        setResendingVerification(true)
                        try {
                          await resendEmailConfirmation(email)
                          toast.success('Verification email sent! Check your inbox.')
                          setShowResendVerification(false)
                        } catch (error: any) {
                          toast.error(error.message || 'Failed to resend verification email')
                        } finally {
                          setResendingVerification(false)
                        }
                      }}
                      disabled={resendingVerification || !email}
                      className="text-sm text-primary-400 hover:text-primary-300 underline disabled:opacity-50"
                    >
                      {resendingVerification ? 'Sending...' : 'Resend verification email'}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? 'Signing in...' : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4 inline" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleMagicLinkLogin} className="space-y-6">
                <div>
                  <label htmlFor="magic-email" className="block text-sm font-medium mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="magic-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-10"
                      placeholder="you@example.com"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-400">
                    We'll send you a magic link to sign in without a password.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={magicLinkLoading}
                  className="btn btn-primary w-full"
                >
                  {magicLinkLoading ? 'Sending link...' : (
                    <>
                      Send magic link
                      <KeyRound className="ml-2 h-4 w-4 inline" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-dark-900 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleOAuthLogin('google')}
                  className="w-full flex justify-center items-center px-4 py-2 border border-dark-700 rounded-lg shadow-sm bg-dark-800 text-sm font-medium text-gray-300 hover:bg-dark-700 transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  )
}
