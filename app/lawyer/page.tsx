'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import toast from 'react-hot-toast'
import { FileText, Upload, CheckCircle, Clock, Download } from 'lucide-react'
import type { Contract } from '@/lib/types'
import { CONTRACT_STATUS_LABELS, PRICING_TIERS } from '@/lib/constants'
import { validateFile, getAllowedFileTypesString, formatFileSize } from '@/lib/file-validation'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { EmptyState } from '@/components/ErrorFallback'

export default function LawyerPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<{ contractId: string; file: File | null }>({
    contractId: '',
    file: null,
  })

  useEffect(() => {
    checkLawyerAccess()
    loadContracts()
  }, [])

  const checkLawyerAccess = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'lawyer') {
      router.push('/dashboard')
      return
    }
  }

  const loadContracts = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('lawyer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setContracts(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load contracts')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (contractId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file with strict rules
    const validation = validateFile(file, 'reviewed')
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file')
      return
    }

    setSelectedFile({ contractId, file })
  }

  const handleUploadReviewed = async (contractId: string) => {
    if (!selectedFile.file || selectedFile.contractId !== contractId) {
      toast.error('Please select a file first')
      return
    }

    setUploading(contractId)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Upload reviewed file
      const fileExt = selectedFile.file.name.split('.').pop()
      const fileName = `reviewed-${contractId}-${Date.now()}.${fileExt}`
      const filePath = `reviewed-contracts/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile.file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('documents').getPublicUrl(filePath)

      // Use API route to complete review (sends email notification)
      const response = await fetch('/api/contracts/complete-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId,
          reviewedFileUrl: publicUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete review')
      }

      toast.success('Reviewed document uploaded successfully')
      setSelectedFile({ contractId: '', file: null })
      loadContracts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload reviewed document')
    } finally {
      setUploading(null)
    }
  }

  const updateStatus = async (contractId: string, status: string) => {
    setUpdatingStatus(contractId)
    try {
      const { error } = await supabase
        .from('contracts')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contractId)

      if (error) throw error

      toast.success('Status updated successfully')
      await loadContracts()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-primary-900">Lawyer Dashboard</h1>
            <p className="text-gray-600 mt-1">Review assigned contracts</p>
          </motion.div>

          {contracts.length === 0 ? (
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
                <h3 className="text-xl font-semibold mb-2">No contracts assigned</h3>
                <p className="text-gray-600">You don't have any contracts assigned yet</p>
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
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-primary-700" />
                        <h3 className="text-lg font-semibold">{contract.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                        <span>
                          Tier: <span className="font-medium">{PRICING_TIERS[contract.pricing_tier].name}</span>
                        </span>
                        <span>
                          Status: <span className="font-medium">{CONTRACT_STATUS_LABELS[contract.status]}</span>
                        </span>
                        <span>
                          Assigned: <span className="font-medium">{new Date(contract.updated_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                      {contract.notes && (
                        <p className="text-sm text-gray-600 mt-2">Notes: {contract.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => handleDownload(contract.original_file_url, contract.title)}
                      className="btn btn-outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Original
                    </button>

                    {contract.status !== 'under_review' && contract.status !== 'completed' && (
                      <button
                        onClick={() => updateStatus(contract.id, 'under_review')}
                        disabled={updatingStatus === contract.id}
                        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingStatus === contract.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 mr-2" />
                            Mark as Under Review
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Upload Reviewed Document */}
                  {contract.status === 'under_review' && !contract.reviewed_file_url && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="font-semibold mb-2">Upload Reviewed Document</h4>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept={getAllowedFileTypesString('reviewed')}
                            onChange={(e) => handleFileSelect(contract.id, e)}
                            className="input"
                          />
                          {selectedFile.contractId === contract.id && selectedFile.file && (
                            <p className="text-sm text-green-600 mt-1">
                              <CheckCircle className="inline h-4 w-4 mr-1" />
                              {selectedFile.file.name}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleUploadReviewed(contract.id)}
                          disabled={!selectedFile.file || selectedFile.contractId !== contract.id || uploading === contract.id}
                          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploading === contract.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Reviewed
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {contract.reviewed_file_url && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Review completed</span>
                      </div>
                      <button
                        onClick={() => handleDownload(contract.reviewed_file_url!, `${contract.title}-reviewed.pdf`)}
                        className="btn btn-outline mt-2"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Reviewed Document
                      </button>
                    </div>
                  )}
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
