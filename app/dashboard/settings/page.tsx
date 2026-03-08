'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, AlertTriangle, AlertCircle } from 'lucide-react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Link from 'next/link'

export default function SettingsPage() {
    const router = useRouter()
    const supabase = createSupabaseClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const [email, setEmail] = useState('')
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        address: '',
        city: '',
        state: '',
        country: '',
    })

    const [deleteConfirmation, setDeleteConfirmation] = useState('')

    useEffect(() => {
        loadUserData()
    }, [])

    const loadUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            setEmail(user.email || '')

            const [profileResult, kycResult] = await Promise.all([
                supabase.from('users').select('*').eq('id', user.id).single(),
                supabase.from('kyc_data').select('*').eq('user_id', user.id).single()
            ])

            const profile = profileResult.data
            const kyc = kycResult.data

            setFormData({
                full_name: profile?.full_name || (kyc ? `${kyc.first_name || ''} ${kyc.last_name || ''}`.trim() : ''),
                phone_number: kyc?.phone_number || '',
                address: kyc?.address || '',
                city: kyc?.city || '',
                state: kyc?.state || '',
                country: kyc?.country || '',
            })
        } catch (error) {
            console.error('Error loading user data:', error)
            toast.error('Failed to load profile data')
        } finally {
            setLoading(false)
        }
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update profile')
            }

            toast.success('Profile updated successfully')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== email) {
            toast.error('Confirmation email does not match')
            return
        }

        if (!window.confirm('Are you absolutely sure? This action cannot be undone and will delete all your contracts, history, and profile data.')) {
            return
        }

        setDeleting(true)

        try {
            const response = await fetch('/api/user/delete', { method: 'DELETE' })
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete account')
            }

            toast.success('Account successfully deleted')
            router.push('/')
        } catch (error: any) {
            toast.error(error.message)
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">Loading settings...</p>
            </div>
        )
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />

                <main className="flex-grow container max-w-4xl mx-auto px-4 py-8">
                    <div className="mb-8">
                        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 flex items-center inline-flex mb-4">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                        <p className="text-gray-600 mt-1">Manage your personal information and account preferences.</p>
                    </div>

                    <div className="space-y-8">
                        {/* Edit Profile Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={email}
                                                disabled
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.full_name}
                                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={formData.phone_number}
                                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                                            <input
                                                type="text"
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                            <input
                                                type="text"
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4 border-t border-gray-100">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn btn-primary flex items-center"
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-50 rounded-xl border border-red-200 overflow-hidden">
                            <div className="px-6 py-5 border-b border-red-200 flex items-center">
                                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                                <h2 className="text-xl font-semibold text-red-700">Danger Zone</h2>
                            </div>
                            <div className="p-6">
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">Delete Account</h3>
                                    <p className="text-sm text-gray-600">
                                        Once you delete your account, there is no going back. Please be certain. All of your contracts, history, payments, and KYC documents will be permanently eradicated.
                                    </p>
                                </div>

                                <div className="bg-white p-4 rounded-lg border border-red-100 mb-6">
                                    <div className="flex items-start mb-4">
                                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-600 font-medium">
                                            To confirm deletion, type your email <strong className="break-all">{email}</strong> below:
                                        </p>
                                    </div>
                                    <input
                                        type="text"
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                        placeholder={email}
                                        className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                    />
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={deleting || deleteConfirmation !== email}
                                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {deleting ? 'Deleting Account...' : 'Permanently Delete Account'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </ErrorBoundary>
    )
}
