'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import toast from 'react-hot-toast'
import { Upload, FileText, Download, Trash2, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react'
import { PRICING_TIERS, CONTRACT_STATUS_LABELS } from '@/lib/constants'
import type { Contract, PricingTier } from '@/lib/types'
import { initializePayment } from '@/lib/paystack'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setContracts(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load contracts')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!selectedTier) {
      toast.error('Please select a pricing tier')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setUploading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `contracts/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('documents').getPublicUrl(filePath)

      // Create contract record
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .insert({
          user_id: user.id,
          title: file.name,
          original_file_url: publicUrl,
          pricing_tier: selectedTier,
          status: 'awaiting_payment',
          payment_status: 'pending',
        })
        .select()
        .single()

      if (contractError) throw contractError

      // Initialize payment
      const paymentRef = `contract-${contract.id}-${Date.now()}`
      const paymentData = await initializePayment(
        user.email!,
        PRICING_TIERS[selectedTier].price,
        paymentRef
      )

      // Create payment record
      const { error: paymentError } = await supabase.from('payments').insert({
        user_id: user.id,
        contract_id: contract.id,
        amount: PRICING_TIERS[selectedTier].price,
        currency: 'NGN',
        paystack_reference: paymentRef,
        status: 'pending',
      })

      if (paymentError) throw paymentError

      // Update contract with payment ID
      await supabase
        .from('contracts')
        .update({ payment_id: paymentRef })
        .eq('id', contract.id)

      // Redirect to Paystack
      window.location.href = paymentData.data.authorization_url
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload contract')
    } finally {
      setUploading(false)
      setShowUploadModal(false)
      setSelectedTier(null)
    }
  }

  const handleDelete = async (contractId: string) => {
    if (!confirm('Are you sure you want to delete this contract?')) return

    try {
      const { error } = await supabase.from('contracts').delete().eq('id', contractId)

      if (error) throw error

      toast.success('Contract deleted successfully')
      loadContracts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete contract')
    }
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'awaiting_payment':
      case 'payment_confirmed':
        return <CreditCard className="h-5 w-5 text-yellow-600" />
      case 'under_review':
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-primary-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your contract reviews</p>
            </motion.div>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Contract
            </motion.button>
          </div>

          {/* Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-semibold mb-6">Upload Contract</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Pricing Tier *</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(PRICING_TIERS).map(([tier, details]) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setSelectedTier(tier as PricingTier)}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            selectedTier === tier
                              ? 'border-primary-700 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <h3 className="font-semibold mb-1">{details.name}</h3>
                          <p className="text-2xl font-bold text-primary-700 mb-2">
                            ₦{details.price.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">{details.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Document *</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer rounded-md font-medium text-primary-700 hover:text-primary-800">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileUpload}
                              disabled={uploading || !selectedTier}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setShowUploadModal(false)
                        setSelectedTier(null)
                      }}
                      className="btn btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Contracts List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card text-center py-12"
            >
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No contracts yet</h3>
              <p className="text-gray-600 mb-6">Upload your first contract to get started</p>
              <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
                Upload Contract
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract, index) => (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-primary-700" />
                        <h3 className="text-lg font-semibold">{contract.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <span>
                          Tier: <span className="font-medium">{PRICING_TIERS[contract.pricing_tier].name}</span>
                        </span>
                        <span>
                          Amount: <span className="font-medium">₦{PRICING_TIERS[contract.pricing_tier].price.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          Status: {getStatusIcon(contract.status)}
                          <span className="font-medium">{CONTRACT_STATUS_LABELS[contract.status]}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Uploaded: {new Date(contract.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {contract.reviewed_file_url && (
                        <button
                          onClick={() => handleDownload(contract.reviewed_file_url!, `${contract.title}-reviewed.pdf`)}
                          className="btn btn-outline"
                          title="Download reviewed document"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(contract.id)}
                        className="btn btn-secondary"
                        title="Delete contract"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
