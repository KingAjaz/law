'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import toast from 'react-hot-toast'
import { Users, FileText, DollarSign, UserPlus, CheckCircle, Clock, Search, Filter, ChevronRight, ChevronLeft, Shield, XCircle } from 'lucide-react'
import type { Contract, User, KYCData } from '@/lib/types'
import { CONTRACT_STATUS_LABELS, PRICING_TIERS } from '@/lib/constants'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { EmptyState, ErrorMessage } from '@/components/ErrorFallback'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [users, setUsers] = useState<User[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [lawyers, setLawyers] = useState<User[]>([])
  const [kycSubmissions, setKycSubmissions] = useState<(KYCData & { email: string; full_name: string | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [assigningContract, setAssigningContract] = useState<string | null>(null)
  const [verifyingKyc, setVerifyingKyc] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'contracts' | 'lawyers' | 'kyc'>('overview')
  
  // Filtering and pagination state for contracts
  const [contractSearch, setContractSearch] = useState('')
  const [contractStatusFilter, setContractStatusFilter] = useState<string>('all')
  const [contractTierFilter, setContractTierFilter] = useState<string>('all')
  const [contractPaymentFilter, setContractPaymentFilter] = useState<string>('all')
  const [contractsPage, setContractsPage] = useState(1)
  const contractsPerPage = 10

  useEffect(() => {
    checkAdminAccess()
    loadData()
  }, [])

  const checkAdminAccess = async () => {
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

    if (profile?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      // Load users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      setUsers(usersData || [])

      // Load contracts
      const { data: contractsData } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false })

      setContracts(contractsData || [])

      // Load lawyers and admins (since admins can also act as lawyers)
      const { data: lawyersData } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['lawyer', 'admin'])
        .order('created_at', { ascending: false })

      setLawyers(lawyersData || [])

      // Load KYC submissions with user info
      const { data: kycData } = await supabase
        .from('kyc_data')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })

      // Transform KYC data to include email and full_name
      const kycWithUserInfo = (kycData || []).map((kyc: any) => ({
        ...kyc,
        email: kyc.profiles?.email || '',
        full_name: kyc.profiles?.full_name || null,
      }))

      setKycSubmissions(kycWithUserInfo)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyKyc = async (userId: string, action: 'approve' | 'reject', reason?: string) => {
    setVerifyingKyc(userId)
    try {
      const response = await fetch('/api/kyc/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action, reason }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} KYC`)
      }

      toast.success(`KYC ${action}d successfully`)
      await loadData()
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} KYC`)
    } finally {
      setVerifyingKyc(null)
    }
  }

  const assignContract = async (contractId: string, lawyerId: string) => {
    setAssigningContract(contractId)
    try {
      // Use API route to assign contract (sends email notification)
      const response = await fetch('/api/contracts/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractId, lawyerId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign contract')
      }

      toast.success('Contract assigned successfully')
      await loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign contract')
    } finally {
      setAssigningContract(null)
    }
  }

  // Filter contracts based on search and filters
  const filteredContracts = contracts.filter((contract) => {
    // Search filter
    if (contractSearch && !contract.title.toLowerCase().includes(contractSearch.toLowerCase())) {
      return false
    }
    
    // Status filter
    if (contractStatusFilter !== 'all' && contract.status !== contractStatusFilter) {
      return false
    }
    
    // Tier filter
    if (contractTierFilter !== 'all' && contract.pricing_tier !== contractTierFilter) {
      return false
    }
    
    // Payment status filter
    if (contractPaymentFilter !== 'all' && contract.payment_status !== contractPaymentFilter) {
      return false
    }
    
    return true
  })

  // Pagination for contracts
  const totalPages = Math.ceil(filteredContracts.length / contractsPerPage)
  const startIndex = (contractsPage - 1) * contractsPerPage
  const endIndex = startIndex + contractsPerPage
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setContractsPage(1)
  }, [contractSearch, contractStatusFilter, contractTierFilter, contractPaymentFilter])

  const stats = {
    totalUsers: users.length,
    totalContracts: contracts.length,
    pendingContracts: contracts.filter((c) => c.status === 'payment_confirmed').length,
    totalRevenue: contracts
      .filter((c) => c.payment_status === 'completed')
      .reduce((sum, c) => sum + PRICING_TIERS[c.pricing_tier].price, 0),
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
            <h1 className="text-3xl font-bold text-primary-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage users, contracts, and lawyers</p>
          </motion.div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'users', label: 'Users' },
                { id: 'contracts', label: 'Contracts' },
                { id: 'lawyers', label: 'Lawyers' },
                { id: 'kyc', label: 'KYC Verification' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-700 text-primary-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card"
                >
                  <Users className="h-8 w-8 text-primary-700 mb-2" />
                  <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                  <p className="text-gray-600">Total Users</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="card"
                >
                  <FileText className="h-8 w-8 text-primary-700 mb-2" />
                  <h3 className="text-2xl font-bold">{stats.totalContracts}</h3>
                  <p className="text-gray-600">Total Contracts</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card"
                >
                  <Clock className="h-8 w-8 text-yellow-600 mb-2" />
                  <h3 className="text-2xl font-bold">{stats.pendingContracts}</h3>
                  <p className="text-gray-600">Pending Assignment</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="card"
                >
                  <DollarSign className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</h3>
                  <p className="text-gray-600">Total Revenue</p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <h2 className="text-xl font-semibold mb-4">Recent Contracts</h2>
                <div className="space-y-3">
                  {contracts.slice(0, 5).map((contract) => (
                    <div key={contract.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{contract.title}</p>
                        <p className="text-sm text-gray-600">{CONTRACT_STATUS_LABELS[contract.status]}</p>
                      </div>
                      <span className="badge badge-info">{PRICING_TIERS[contract.pricing_tier].name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="text-xl font-semibold mb-4">All Users</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KYC</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.full_name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="badge badge-info">{user.role}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.kyc_completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Contracts Tab */}
          {activeTab === 'contracts' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Filters and Search */}
              <div className="card">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search contracts by title..."
                      value={contractSearch}
                      onChange={(e) => setContractSearch(e.target.value)}
                      className="input pl-10 w-full"
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={contractStatusFilter}
                      onChange={(e) => setContractStatusFilter(e.target.value)}
                      className="input pl-10 pr-8"
                    >
                      <option value="all">All Statuses</option>
                      {Object.entries(CONTRACT_STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Tier Filter */}
                  <select
                    value={contractTierFilter}
                    onChange={(e) => setContractTierFilter(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Tiers</option>
                    {Object.entries(PRICING_TIERS).map(([key, tier]) => (
                      <option key={key} value={key}>
                        {tier.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Payment Status Filter */}
                  <select
                    value={contractPaymentFilter}
                    onChange={(e) => setContractPaymentFilter(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Payment Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                
                {/* Results count */}
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredContracts.length)} of {filteredContracts.length} contracts
                  {filteredContracts.length !== contracts.length && (
                    <span> (filtered from {contracts.length} total)</span>
                  )}
                </div>
              </div>

              {/* Contracts List */}
              {paginatedContracts.length === 0 ? (
                <EmptyState
                  title="No contracts found"
                  message={
                    filteredContracts.length === 0 && contracts.length > 0
                      ? 'Try adjusting your filters'
                      : 'No contracts have been uploaded yet'
                  }
                  icon={<FileText className="h-16 w-16 text-gray-400 mx-auto" />}
                />
              ) : (
                <>
                  {paginatedContracts.map((contract) => (
                <div key={contract.id} className="card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{contract.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                        <span>Status: <span className="font-medium">{CONTRACT_STATUS_LABELS[contract.status]}</span></span>
                        <span>Tier: <span className="font-medium">{PRICING_TIERS[contract.pricing_tier].name}</span></span>
                        <span>Payment: <span className="font-medium">{contract.payment_status}</span></span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(contract.created_at).toLocaleString()}
                      </p>
                    </div>
                    {contract.status === 'payment_confirmed' && !contract.lawyer_id && (
                      <div className="flex gap-2 items-center">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              assignContract(contract.id, e.target.value)
                            }
                          }}
                          className="input"
                          defaultValue=""
                          disabled={assigningContract === contract.id}
                        >
                          <option value="">Assign to lawyer...</option>
                          {lawyers.map((lawyer) => (
                            <option key={lawyer.id} value={lawyer.id}>
                              {lawyer.full_name || lawyer.email}
                              {lawyer.role === 'admin' ? ' (Admin)' : ''}
                            </option>
                          ))}
                        </select>
                        {assigningContract === contract.id && (
                          <div className="flex items-center text-primary-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-700"></div>
                            <span className="ml-2 text-sm">Assigning...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                  ))}
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-gray-600">
                        Page {contractsPage} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setContractsPage((prev) => Math.max(1, prev - 1))}
                          disabled={contractsPage === 1}
                          className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </button>
                        <button
                          onClick={() => setContractsPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={contractsPage === totalPages}
                          className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Lawyers Tab */}
          {activeTab === 'lawyers' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="text-xl font-semibold mb-4">All Lawyers & Admins</h2>
              <div className="space-y-4">
                {lawyers.map((lawyer) => {
                  const assignedContracts = contracts.filter((c) => c.lawyer_id === lawyer.id)
                  return (
                    <div key={lawyer.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{lawyer.full_name || lawyer.email}</h3>
                            {lawyer.role === 'admin' && (
                              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{lawyer.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{assignedContracts.length}</p>
                          <p className="text-sm text-gray-600">Assigned Contracts</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* KYC Verification Tab */}
          {activeTab === 'kyc' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-primary-700" />
                  <h2 className="text-xl font-semibold">KYC Verification</h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Review and verify user KYC submissions. Approve or reject based on document verification.
                </p>
              </div>

              {kycSubmissions.length === 0 ? (
                <div className="card text-center py-12">
                  <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No KYC submissions</h3>
                  <p className="text-gray-600">No KYC submissions pending review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {kycSubmissions.map((kyc) => (
                    <div key={kyc.id} className="card">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Shield className="h-5 w-5 text-primary-700" />
                            <h3 className="text-lg font-semibold">
                              {kyc.full_name || kyc.email}
                            </h3>
                            <span
                              className={`badge ${
                                kyc.status === 'approved'
                                  ? 'badge-success'
                                  : kyc.status === 'rejected'
                                  ? 'badge-error'
                                  : 'badge-warning'
                              }`}
                            >
                              {kyc.status === 'pending' ? 'Pending' : kyc.status === 'approved' ? 'Approved' : 'Rejected'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{kyc.email}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Name</p>
                              <p className="font-medium">{kyc.first_name} {kyc.last_name}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Phone</p>
                              <p className="font-medium">{kyc.phone_number}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Address</p>
                              <p className="font-medium">{kyc.address}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">City, State</p>
                              <p className="font-medium">{kyc.city}, {kyc.state}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Country</p>
                              <p className="font-medium">{kyc.country}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">ID Type</p>
                              <p className="font-medium capitalize">{kyc.id_type.replace('_', ' ')}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">ID Number</p>
                              <p className="font-medium">{kyc.id_number}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Submitted</p>
                              <p className="font-medium">
                                {new Date(kyc.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {kyc.rejection_reason && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                              <p className="text-sm text-red-700">{kyc.rejection_reason}</p>
                            </div>
                          )}

                          {kyc.reviewed_at && (
                            <p className="text-xs text-gray-500 mt-4">
                              Reviewed: {new Date(kyc.reviewed_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        {kyc.id_document_url && (
                          <a
                            href={kyc.id_document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View ID Document
                          </a>
                        )}
                        
                        {kyc.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleVerifyKyc(kyc.user_id, 'approve')}
                              disabled={verifyingKyc === kyc.user_id}
                              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {verifyingKyc === kyc.user_id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Please provide a reason for rejection:')
                                if (reason && reason.trim()) {
                                  handleVerifyKyc(kyc.user_id, 'reject', reason.trim())
                                }
                              }}
                              disabled={verifyingKyc === kyc.user_id}
                              className="btn bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
