'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase/client'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import toast from 'react-hot-toast'
import { Upload, FileText, Download, Trash2, CreditCard, Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { EmptyState, ErrorMessage } from '@/components/ErrorFallback'
import { PRICING_TIERS, CONTRACT_STATUS_LABELS } from '@/lib/constants'
import type { Contract, PricingTier } from '@/lib/types'
import { initializePayment } from '@/lib/paystack'
import { validateFile, getAllowedFileTypesString, formatFileSize } from '@/lib/file-validation'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [kycCompleted, setKycCompleted] = useState<boolean | null>(null)
  const [kycSubmitted, setKycSubmitted] = useState<boolean>(false)
  const [uploading, setUploading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null)
  const [paymentStep, setPaymentStep] = useState<'selection' | 'invoice'>('selection')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [uploadingContractId, setUploadingContractId] = useState<string | null>(null)
  const [deletingContract, setDeletingContract] = useState<string | null>(null)
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [userName, setUserName] = useState<string>('')
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadContracts()
    checkKYCStatus()
  }, [])

  useEffect(() => {
    if (showPaymentModal) {
      setPaymentStep('selection')
      setSelectedTier(null)
    }
  }, [showPaymentModal])

  const checkKYCStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Check profile for kyc_completed status
      const { data: profile } = await supabase
        .from('profiles')
        .select('kyc_completed, full_name')
        .eq('id', user.id)
        .single()

      // Check if KYC has been submitted (even if not approved yet)
      const { data: kycData } = await supabase
        .from('kyc_data')
        .select('id, status')
        .eq('user_id', user.id)
        .maybeSingle()

      setKycCompleted(profile?.kyc_completed || false)
      setUserName(profile?.full_name || user.email || 'Client')
      setKycSubmitted(!!kycData) // KYC has been submitted if kyc_data exists
    } catch (error: any) {
      console.error('Failed to check KYC status:', error)
      setKycCompleted(false)
      setKycSubmitted(false)
    }
  }

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

  // Handle payment initiation (before file upload)

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return

    setIsGeneratingPdf(true)

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Invoice-${selectedTier}-${Date.now()}.pdf`)

      toast.success('Invoice downloaded successfully')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handlePaymentInitiation = async () => {
    if (!selectedTier) {
      toast.error('Please select a pricing tier')
      return
    }

    // Check KYC status
    if (!kycCompleted) {
      toast.error('Please complete KYC verification before making a payment. Your KYC is awaiting admin review.')
      return
    }

    setProcessingPayment(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Create contract record with tier but no file yet
      const paymentRef = `payment-${Date.now()}-${user.id}`

      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .insert({
          user_id: user.id,
          title: `Contract - ${PRICING_TIERS[selectedTier].name}`,
          pricing_tier: selectedTier,
          status: 'awaiting_payment',
          payment_status: 'pending',
          payment_id: paymentRef,
        })
        .select()
        .single()

      if (contractError) throw contractError

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

      // Initialize payment with Paystack
      const paymentData = await initializePayment(
        user.email!,
        PRICING_TIERS[selectedTier].price,
        paymentRef,
        {
          contract_id: contract.id,
          pricing_tier: selectedTier,
        }
      )

      // Redirect to Paystack
      window.location.href = paymentData.data.authorization_url
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize payment')
      setProcessingPayment(false)
    }
  }

  // Handle file upload for contract (after payment)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, contractId: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check KYC status
    if (!kycCompleted) {
      toast.error('Please complete KYC verification before uploading files. Your KYC is awaiting admin review.')
      return
    }

    // Validate file with strict rules
    const validation = validateFile(file, 'contract')
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file')
      return
    }

    setUploadingContractId(contractId)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('contractId', contractId)

      const response = await fetch('/api/contracts/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file')
      }

      toast.success('File uploaded successfully!')
      setShowUploadModal(false)
      loadContracts() // Reload contracts to show updated status
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file')
    } finally {
      setUploading(false)
      setUploadingContractId(null)
    }
  }

  const handleDelete = async (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId)
    if (!contract) return

    setContractToDelete(contract)
  }

  const confirmDelete = async () => {
    if (!contractToDelete) return

    setDeletingContract(contractToDelete.id)

    try {
      const response = await fetch(`/api/contracts/delete?contractId=${contractToDelete.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete contract')
      }

      toast.success('Contract deleted successfully')
      setContractToDelete(null)
      loadContracts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete contract')
    } finally {
      setDeletingContract(null)
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
        return <CreditCard className="h-5 w-5 text-yellow-600" />
      case 'awaiting_upload':
        return <Upload className="h-5 w-5 text-orange-600" />
      case 'payment_confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
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
              onClick={() => setShowPaymentModal(true)}
              disabled={!kycCompleted}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              title={!kycCompleted ? 'Please complete KYC verification first' : ''}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              New Contract Review
            </motion.button>
          </div>

          {/* KYC Status Banner */}
          {kycCompleted === false && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 border rounded-lg p-4 ${kycSubmitted
                ? 'bg-blue-50 border-blue-200'
                : 'bg-yellow-50 border-yellow-200'
                }`}
            >
              <div className="flex items-start">
                {kycSubmitted ? (
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`text-sm font-semibold mb-1 ${kycSubmitted ? 'text-blue-800' : 'text-yellow-800'
                    }`}>
                    {kycSubmitted
                      ? 'KYC Submission Received'
                      : 'KYC Verification Required'}
                  </h3>
                  <p className={`text-sm mb-3 ${kycSubmitted ? 'text-blue-700' : 'text-yellow-700'
                    }`}>
                    {kycSubmitted
                      ? 'Your KYC submission has been received and is awaiting review by our admin team. We\'ll notify you via email once it\'s been reviewed and approved. You won\'t be able to make payments or upload files until your KYC is approved.'
                      : 'Please complete your KYC (Know Your Customer) verification to continue. You won\'t be able to make payments or upload files until your KYC is approved.'}
                  </p>
                  {!kycSubmitted && (
                    <button
                      onClick={() => router.push('/kyc')}
                      className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Complete KYC Verification
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment Modal - Select Tier / Invoice / Pay */}
          {showPaymentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {paymentStep === 'selection' ? (
                  <>
                    <h2 className="text-2xl font-semibold mb-6">Select Pricing Tier</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Select Service *</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(PRICING_TIERS)
                            .filter(([_, details]) => !details.deprecated)
                            .map(([tier, details]) => (
                              <button
                                key={tier}
                                type="button"
                                onClick={() => setSelectedTier(tier as PricingTier)}
                                className={`p-4 border-2 rounded-lg text-left transition-all ${selectedTier === tier
                                  ? 'border-primary-700 bg-primary-50'
                                  : 'border-gray-200 hover:border-primary-300'
                                  }`}
                              >
                                <h3 className="font-semibold mb-1">{details.name}</h3>
                                <p className="text-2xl font-bold text-primary-700 mb-2">
                                  ₦{details.price.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600 line-clamp-2">{details.description}</p>
                              </button>
                            ))}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            setShowPaymentModal(false)
                            setSelectedTier(null)
                          }}
                          className="btn btn-secondary flex-1"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => setPaymentStep('invoice')}
                          disabled={!selectedTier}
                          className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Generate Invoice
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold mb-6">Proforma Invoice</h2>

                    {selectedTier && (
                      <div className="space-y-6">
                        <div ref={invoiceRef} className="bg-white border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                            <div>
                              <h1 className="text-xl font-bold text-primary-900 mb-1">LegalEase</h1>
                              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Invoice Preview</p>
                              <p className="text-xs text-gray-400">Date: {new Date().toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <div className="relative w-32 h-10">
                                <Image
                                  src="/LegalEase Logo backless.png"
                                  alt="LegalEase Logo"
                                  fill
                                  className="object-contain object-right"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="p-6">
                            <div className="flex justify-between items-start mb-8">
                              <div>
                                <h3 className="text-lg font-bold mb-1">Bill To:</h3>
                                <p className="text-gray-600 font-medium">{userName}</p>
                                <p className="text-sm text-gray-500">User ID: {contracts[0]?.user_id || 'Current User'}</p>
                              </div>
                            </div>

                            <table className="w-full mb-8">
                              <thead>
                                <tr className="border-b-2 border-gray-200">
                                  <th className="text-left py-2 font-semibold text-gray-600">Service Description</th>
                                  <th className="text-right py-2 font-semibold text-gray-600">Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-gray-100">
                                  <td className="py-4">
                                    <p className="font-medium">{PRICING_TIERS[selectedTier].name}</p>
                                    <p className="text-sm text-gray-500">{PRICING_TIERS[selectedTier].description}</p>
                                  </td>
                                  <td className="text-right py-4 font-medium">
                                    ₦{PRICING_TIERS[selectedTier].price.toLocaleString()}
                                  </td>
                                </tr>
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td className="pt-4 text-right font-bold text-lg">Total Due:</td>
                                  <td className="pt-4 text-right font-bold text-lg text-primary-700">
                                    ₦{PRICING_TIERS[selectedTier].price.toLocaleString()}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>

                            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800 mb-4">
                              <p><strong>Note:</strong> This is a generated invoice preview. Proceeding to payment constitutes acceptance of these charges.</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={() => setPaymentStep('selection')}
                            className="btn btn-secondary flex-1"
                            disabled={processingPayment}
                          >
                            Back to Selection
                          </button>
                          <button
                            onClick={handleDownloadPdf}
                            disabled={isGeneratingPdf}
                            className="btn btn-secondary flex-1"
                          >
                            {isGeneratingPdf ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2 inline-block"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2 inline" />
                                Download Invoice PDF
                              </>
                            )}
                          </button>
                          <button
                            onClick={handlePaymentInitiation}
                            disabled={processingPayment || !kycCompleted}
                            className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={!kycCompleted ? 'Please complete KYC verification first' : ''}
                          >
                            {processingPayment ? 'Processing Payment...' : (
                              <>
                                <CreditCard className="h-5 w-5 mr-2 inline" />
                                Proceed to Checkout
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </div>
          )}

          {/* Upload Modal - Upload File for Paid Contract */}
          {showUploadModal && uploadingContractId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-semibold mb-6">Upload Contract File</h2>

                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <strong>Payment Confirmed!</strong> Please upload your contract file for review.
                    </p>
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
                              accept={getAllowedFileTypesString('contract')}
                              onChange={(e) => handleFileUpload(e, uploadingContractId)}
                              disabled={uploading}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX up to {formatFileSize(10 * 1024 * 1024)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setShowUploadModal(false)
                        setUploadingContractId(null)
                      }}
                      className="btn btn-secondary flex-1"
                      disabled={uploading}
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
            <ErrorBoundary
              fallback={
                <EmptyState
                  title="Unable to load contracts"
                  message="There was an error loading your contracts. Please try again."
                  action={{
                    label: 'Retry',
                    onClick: loadContracts,
                  }}
                  icon={<FileText className="h-16 w-16 text-gray-400 mx-auto" />}
                />
              }
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card text-center py-12"
              >
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No contracts yet</h3>
                <p className="text-gray-600 mb-6">Select a pricing tier and make payment to get started</p>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={!kycCompleted}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!kycCompleted ? 'Please complete KYC verification first' : ''}
                >
                  <CreditCard className="h-5 w-5 mr-2 inline" />
                  Start Contract Review
                </button>
              </motion.div>
            </ErrorBoundary>
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
                      {contract.status === 'awaiting_upload' && (
                        <button
                          onClick={() => {
                            if (!kycCompleted) {
                              toast.error('Please complete KYC verification before uploading files. Your KYC is awaiting admin review.')
                              return
                            }
                            setUploadingContractId(contract.id)
                            setShowUploadModal(true)
                          }}
                          disabled={!kycCompleted}
                          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          title={!kycCompleted ? 'Please complete KYC verification first' : 'Upload contract file'}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </button>
                      )}
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
                        disabled={deletingContract === contract.id}
                        className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete contract"
                      >
                        {deletingContract === contract.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {contractToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delete Contract</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this contract?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-sm">{contractToDelete.title}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Status: {CONTRACT_STATUS_LABELS[contractToDelete.status]}
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                This will permanently delete:
              </p>
              <ul className="text-sm text-gray-600 mt-2 list-disc list-inside space-y-1">
                <li>The contract record</li>
                <li>The original document file</li>
                {contractToDelete.reviewed_file_url && (
                  <li>The reviewed document file</li>
                )}
                <li>All associated payment records</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setContractToDelete(null)}
                disabled={deletingContract !== null}
                className="btn btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingContract !== null}
                className="btn bg-red-600 hover:bg-red-700 text-white flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingContract ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Contract'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  )
}
