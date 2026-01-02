'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import toast from 'react-hot-toast'
import { Users, FileText, DollarSign, UserPlus, CheckCircle, Clock } from 'lucide-react'
import type { Contract, User } from '@/lib/types'
import { CONTRACT_STATUS_LABELS, PRICING_TIERS } from '@/lib/constants'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [users, setUsers] = useState<User[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [lawyers, setLawyers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'contracts' | 'lawyers'>('overview')

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

      // Load lawyers
      const { data: lawyersData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'lawyer')
        .order('created_at', { ascending: false })

      setLawyers(lawyersData || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const assignContract = async (contractId: string, lawyerId: string) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .update({
          lawyer_id: lawyerId,
          status: 'assigned_to_lawyer',
          updated_at: new Date().toISOString(),
        })
        .eq('id', contractId)

      if (error) throw error

      toast.success('Contract assigned successfully')
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign contract')
    }
  }

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
              {contracts.map((contract) => (
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
                      <div className="flex gap-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              assignContract(contract.id, e.target.value)
                            }
                          }}
                          className="input"
                          defaultValue=""
                        >
                          <option value="">Assign to lawyer...</option>
                          {lawyers.map((lawyer) => (
                            <option key={lawyer.id} value={lawyer.id}>
                              {lawyer.full_name || lawyer.email}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Lawyers Tab */}
          {activeTab === 'lawyers' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="text-xl font-semibold mb-4">All Lawyers</h2>
              <div className="space-y-4">
                {lawyers.map((lawyer) => {
                  const assignedContracts = contracts.filter((c) => c.lawyer_id === lawyer.id)
                  return (
                    <div key={lawyer.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{lawyer.full_name || lawyer.email}</h3>
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
        </div>
      </main>

      <Footer />
    </div>
  )
}
