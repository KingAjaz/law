'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase/client'
import { resendEmailConfirmation, getCurrentUser } from '@/lib/auth'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import toast from 'react-hot-toast'
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const type = searchParams.get('type')
  const supabase = createSupabaseClient()
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [resending, setResending] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      // Check if user is already verified (from callback route)
      try {
        const user = await getCurrentUser()
        if (user?.email_verified) {
          setVerified(true)
          toast.success('Email verified successfully!')
          
          // Check KYC status and redirect accordingly
          const { data: profile } = await supabase
            .from('profiles')
            .select('kyc_completed')
            .eq('id', user.id)
            .single()
          
          // Redirect to KYC if not completed, otherwise dashboard
          const redirectPath = profile?.kyc_completed ? '/dashboard' : '/kyc'
          setTimeout(() => {
            router.push(redirectPath)
          }, 2000)
        } else if (user) {
          // User is logged in but email not verified
          setEmail(user.email || '')
        }
        setLoading(false)
      } catch (error: any) {
        setLoading(false)
        // If no user, they need to sign up or log in first
      }
    }

    verifyEmail()
  }, [router, supabase])

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setResending(true)
    try {
      await resendEmailConfirmation(email)
      toast.success('Verification email sent! Check your inbox.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email')
    } finally {
      setResending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-dark-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="card">
              <div className="animate-pulse space-y-4 text-center">
                <div className="h-16 bg-primary-700 rounded-full w-16 mx-auto"></div>
                <div className="h-6 bg-primary-700 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-primary-700 rounded w-full"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (verified) {
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
              <h2 className="text-2xl font-bold mb-4">Email Verified!</h2>
              <p className="text-gray-400 mb-6">
                Your email has been successfully verified. Redirecting...
              </p>
              <Link href="/kyc" className="btn btn-primary">
                Complete KYC
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
            <h2 className="text-3xl font-bold text-center text-white">Verify Your Email</h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              We've sent a verification link to your email
            </p>
          </div>

          <div className="card">
            <div className="text-center space-y-6">
              <Mail className="h-16 w-16 text-primary-500 mx-auto" />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Check your inbox</h3>
                <p className="text-gray-400 text-sm">
                  We've sent a verification link to your email address. Click the link in the email to verify your account.
                </p>
              </div>

              <div className="border-t border-dark-700 pt-6">
                <p className="text-sm text-gray-400 mb-4">
                  Didn't receive the email?
                </p>
                <div className="space-y-3">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="input w-full"
                    />
                  </div>
                  <button
                    onClick={handleResendEmail}
                    disabled={resending}
                    className="btn btn-secondary w-full"
                  >
                    {resending ? (
                      <>
                        <RefreshCw className="h-4 w-4 inline mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 inline mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-500 space-y-2">
                <p>• Check your spam folder</p>
                <p>• Make sure you entered the correct email address</p>
                <p>• The link expires in 1 hour</p>
              </div>

              <div className="pt-4 border-t border-dark-700">
                <Link href="/login" className="text-sm text-primary-400 hover:text-primary-300">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

export default function VerifyEmailPage() {
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
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}