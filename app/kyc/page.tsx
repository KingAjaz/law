'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import toast from 'react-hot-toast'
import { validateFile, getAllowedFileTypesString, formatFileSize } from '@/lib/file-validation'
import { Upload, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const kycSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().default('Nigeria'),
  idType: z.enum(['nin', 'passport', 'drivers_license']),
  idNumber: z.string().min(1, 'ID number is required'),
  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms'),
  privacyAccepted: z.boolean().refine((val) => val === true, 'You must accept the privacy policy'),
})

type KYCFormData = z.infer<typeof kycSchema>

export default function KYCPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [idDocument, setIdDocument] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<KYCFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      country: 'Nigeria',
      termsAccepted: false,
      privacyAccepted: false,
    },
  })

  useEffect(() => {
    // Check if user is already KYC verified
    const checkKYC = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('kyc_completed')
          .eq('id', user.id)
          .single()

        if (profile?.kyc_completed) {
          router.push('/dashboard')
        }
      }
    }

    checkKYC()
  }, [router, supabase])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file with strict rules
    const validation = validateFile(file, 'kyc')
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file')
      return
    }

    setUploading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `kyc-documents/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      setIdDocument(file)
      toast.success('Document uploaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: KYCFormData) => {
    if (!idDocument) {
      toast.error('Please upload your ID document')
      return
    }

    setSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Upload ID document if not already uploaded
      let idDocumentUrl = null
      if (idDocument) {
        const fileExt = idDocument.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `kyc-documents/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, idDocument)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('documents').getPublicUrl(filePath)
        idDocumentUrl = publicUrl
      }

      // Save KYC data
      const { error: kycError } = await supabase.from('kyc_data').insert({
        user_id: user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        id_type: data.idType,
        id_number: data.idNumber,
        id_document_url: idDocumentUrl,
        terms_accepted: data.termsAccepted,
        privacy_accepted: data.privacyAccepted,
      })

      if (kycError) throw kycError

      // Set status to 'pending' for admin review (default, but explicit)
      const { error: updateStatusError } = await supabase
        .from('kyc_data')
        .update({ status: 'pending' })
        .eq('user_id', user.id)

      if (updateStatusError) throw updateStatusError

      toast.success('KYC submission received! It will be reviewed by our team shortly.')
      // Show message but stay on page - user can see status
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit KYC')
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
            <h1 className="text-3xl font-bold text-primary-900 mb-2">KYC Verification</h1>
            <p className="text-gray-600">
              Complete your Know Your Customer verification to access the dashboard
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <input
                      {...register('firstName')}
                      className="input"
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <input
                      {...register('lastName')}
                      className="input"
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <input
                      {...register('phoneNumber')}
                      type="tel"
                      className="input"
                      placeholder="+234 XXX XXX XXXX"
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-600 text-sm mt-1">{errors.phoneNumber.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Address *</label>
                    <input
                      {...register('address')}
                      className="input"
                      placeholder="Street address"
                    />
                    {errors.address && (
                      <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
                    )}
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

              {/* ID Verification */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Identity Verification</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ID Type *</label>
                    <select {...register('idType')} className="input">
                      <option value="">Select ID type</option>
                      <option value="nin">National Identification Number (NIN)</option>
                      <option value="passport">International Passport</option>
                      <option value="drivers_license">Driver's License</option>
                    </select>
                    {errors.idType && (
                      <p className="text-red-600 text-sm mt-1">{errors.idType.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ID Number *</label>
                    <input
                      {...register('idNumber')}
                      className="input"
                      placeholder="Enter your ID number"
                    />
                    {errors.idNumber && (
                      <p className="text-red-600 text-sm mt-1">{errors.idNumber.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ID Document *</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer rounded-md font-medium text-primary-700 hover:text-primary-800">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept={getAllowedFileTypesString('kyc')}
                              onChange={handleFileUpload}
                              disabled={uploading}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, JPG, PNG up to {formatFileSize(5 * 1024 * 1024)}
                        </p>
                        {idDocument && (
                          <p className="text-sm text-green-600 mt-2">
                            <CheckCircle className="inline h-4 w-4 mr-1" />
                            {idDocument.name}
                          </p>
                        )}
                      </div>
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
                disabled={submitting || uploading}
                className="btn btn-primary w-full"
              >
                {submitting ? 'Submitting...' : 'Complete Verification'}
              </button>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
