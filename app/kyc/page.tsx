'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import toast from 'react-hot-toast'
import { CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const clientInfoSchema = z.object({
  nameOrCompany: z.string().min(1, 'Name or Company Name is required'),
  email: z.string().email('Invalid email address'),
  officeAddress: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().default('Nigeria'),
  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms'),
  privacyAccepted: z.boolean().refine((val) => val === true, 'You must accept the privacy policy'),
})

type ClientInfoFormData = z.infer<typeof clientInfoSchema>

export default function ClientInfoPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [submitting, setSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<'none' | 'completed' | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<ClientInfoFormData>({
    resolver: zodResolver(clientInfoSchema),
    defaultValues: {
      country: 'Nigeria',
      termsAccepted: false,
      privacyAccepted: false,
    },
  })

  useEffect(() => {
    const checkStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Pre-fill email
        if (!getValues('email') && user.email) {
          setValue('email', user.email)
        }
        // Check profile for kyc_completed status
        const { data: profile } = await supabase
          .from('profiles')
          .select('kyc_completed')
          .eq('id', user.id)
          .single()

        // If already completed, redirect to dashboard
        if (profile?.kyc_completed) {
          router.push('/dashboard')
          return
        }

        // Check if data has been submitted
        const { data: existingData } = await supabase
          .from('kyc_data')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (existingData) {
          setFormStatus('completed')
        } else {
          setFormStatus('none')
        }
      }
    }

    checkStatus()
  }, [router, supabase])

  const onSubmit = async (data: ClientInfoFormData) => {
    setSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Save client information
      const { error: insertError } = await supabase.from('kyc_data').insert({
        user_id: user.id,
        first_name: data.nameOrCompany,
        contact_email: data.email,
        phone_number: '',
        address: data.officeAddress || '',
        city: data.city,
        state: data.state,
        country: data.country,
        terms_accepted: data.termsAccepted,
        privacy_accepted: data.privacyAccepted,
        status: 'approved',
      })

      if (insertError) throw insertError

      // Auto-approve: mark KYC as completed in the profile immediately
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ kyc_completed: true })
        .eq('id', user.id)

      if (profileError) throw profileError

      toast.success('Information saved successfully! Redirecting to your dashboard...')
      setFormStatus('completed')

      // Redirect to dashboard after a brief moment
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit information')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-primary-900 mb-2">Client Information Form</h1>
            <p className="text-gray-600">
              Please fill in your details below to complete your account setup and access the dashboard.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card relative"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Personal / Company Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name / Company Name *</label>
                    <input
                      {...register('nameOrCompany')}
                      className="input"
                      placeholder="John Doe or Acme Corp"
                    />
                    {errors.nameOrCompany && (
                      <p className="text-red-600 text-sm mt-1">{errors.nameOrCompany.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <input
                      {...register('email')}
                      className="input"
                      type="email"
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Office Address</label>
                    <input
                      {...register('officeAddress')}
                      className="input"
                      placeholder="Street address (optional)"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City *</label>
                      <input
                        {...register('city')}
                        className="input"
                        placeholder="Lagos"
                      />
                      {errors.city && (
                        <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State *</label>
                      <input
                        {...register('state')}
                        className="input"
                        placeholder="Lagos"
                      />
                      {errors.state && (
                        <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Country *</label>
                      <input
                        {...register('country')}
                        className="input"
                        value="Nigeria"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Privacy */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Terms & Privacy</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      {...register('termsAccepted')}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      I accept the{' '}
                      <a href="/terms" className="text-primary-700 hover:underline">
                        Terms of Service
                      </a>
                      *
                    </label>
                  </div>
                  {errors.termsAccepted && (
                    <p className="text-red-600 text-sm">{errors.termsAccepted.message}</p>
                  )}

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      {...register('privacyAccepted')}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      I accept the{' '}
                      <a href="/privacy" className="text-primary-700 hover:underline">
                        Privacy Policy
                      </a>
                      *
                    </label>
                  </div>
                  {errors.privacyAccepted && (
                    <p className="text-red-600 text-sm">{errors.privacyAccepted.message}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full"
              >
                {submitting ? 'Submitting...' : 'Submit & Continue to Dashboard'}
              </button>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
