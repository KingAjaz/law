'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { PRICING_TIERS } from '@/lib/constants'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function PricingPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    setIsAuthenticated(!!session)
  }

  const handleGetStarted = (e: React.MouseEvent<HTMLAnchorElement>, tier?: string) => {
    e.preventDefault()
    if (isAuthenticated) {
      // User is logged in, redirect to dashboard where they can upload and pay
      router.push('/dashboard')
    } else {
      // User is not logged in, redirect to signup
      router.push('/signup')
    }
  }
  // Group pricing tiers by category
  const categories = [
    {
      id: 'nda',
      title: 'NDA Review',
      tiers: ['nda_basic', 'nda_premium']
    },
    {
      id: 'sla',
      title: 'SLA and Service Agreement',
      tiers: ['sla_basic', 'sla_premium']
    },
    {
      id: 'tech_msa',
      title: 'SaaS Order Forms and MSAs',
      tiers: ['tech_msa_basic', 'tech_msa_premium']
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4">
              Pricing
            </h1>
            <div className="w-24 h-1 bg-brand-600 mx-auto mb-6"></div>
            <h2 className="text-2xl md:text-3xl font-semibold text-brand-700 mb-4">
              Transparent, Predictable Pricing
            </h2>
            <p className="text-lg md:text-xl text-brand-700 max-w-4xl mx-auto">
              We offer service plans designed for clarity and scalability:
            </p>
          </motion.div>

          {/* Legal Process Outsourcing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h3 className="text-3xl font-bold text-brand-700 mb-8 text-center">
              Legal Process Outsourcing
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <div key={category.id} className="flex flex-col gap-6">
                  <div className="bg-brand-50 rounded-xl p-6 h-full flex flex-col border border-brand-100">
                    <h4 className="text-xl font-bold text-brand-700 mb-6 text-center h-14 flex items-center justify-center">
                      {category.title}
                    </h4>

                    <div className="space-y-6 flex-1">
                      {category.tiers.map((tierKey) => {
                        // Cast to handle the string indexing, though in a real app better typing is preferred
                        // @ts-ignore
                        const tier = PRICING_TIERS[tierKey]
                        if (!tier) return null

                        const isPremium = tierKey.includes('premium')

                        return (
                          <div
                            key={tierKey}
                            className={`bg-white rounded-lg p-6 shadow-sm border ${isPremium ? 'border-brand-400 ring-1 ring-brand-100' : 'border-gray-100'}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-sm font-bold px-2 py-1 rounded ${isPremium ? 'bg-brand-100 text-brand-800' : 'bg-gray-100 text-gray-600'}`}>
                                {isPremium ? 'Premium' : 'Basic'}
                              </span>
                            </div>

                            <div className="mb-4">
                              <span className="text-2xl font-bold text-brand-700">
                                ₦{tier.price.toLocaleString()}
                              </span>
                            </div>

                            <ul className="space-y-2 mb-6 min-h-[80px]">
                              {tier.features.map((feature: string, idx: number) => (
                                <li key={idx} className="flex items-start">
                                  <CheckCircle className="h-4 w-4 text-brand-600 mr-2 mt-1 flex-shrink-0" />
                                  <span className="text-gray-600 text-sm leading-snug">{feature}</span>
                                </li>
                              ))}
                            </ul>

                            <Link
                              href={isAuthenticated ? "/dashboard" : "/signup"}
                              onClick={(e) => handleGetStarted(e, tierKey)}
                              className={`btn w-full text-center text-sm ${isPremium ? 'btn-primary-beige' : 'btn-secondary'}`}
                            >
                              Get Started
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Fractional GC Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h3 className="text-3xl font-bold text-brand-700 mb-4 text-center">
              Fractional GC Services
            </h3>
            <div className="card max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-100 pb-6">
                <div>
                  <h4 className="text-2xl font-bold text-brand-700 mb-2">Half-Yearly/Annual Support</h4>
                  <p className="text-gray-600">Comprehensive legal support for your growing business</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Link
                    href="/contact"
                    className="btn btn-primary-beige px-8"
                  >
                    Get a Quote
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-brand-700 block mb-1">Legal Advisory & Strategy</strong>
                    <span className="text-gray-600 text-sm leading-relaxed">
                      Provide proactive, sound, and pragmatic legal advice to the CEO, Board of Directors, and all internal departments.
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-brand-700 block mb-1">Contract Management</strong>
                    <span className="text-gray-600 text-sm leading-relaxed">
                      Draft, review, and negotiate commercial agreements, including vendor contracts, partnership agreements, licensing agreements, and MSAs.
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-brand-700 block mb-1">Product Development Support</strong>
                    <span className="text-gray-600 text-sm leading-relaxed">
                      Partner with product teams to ensure new products (lending, payments, etc.) are structured in line with regulatory expectations.
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-brand-700 block mb-1">Risk Management</strong>
                    <span className="text-gray-600 text-sm leading-relaxed">
                      Identify potential legal and regulatory risks, developing strategies and internal controls to mitigate exposure.
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-brand-700 block mb-1">Data Privacy</strong>
                    <span className="text-gray-600 text-sm leading-relaxed">
                      Advise on data protection and security issues, ensuring compliance with the Nigeria Data Protection Act (NDPA).
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-brand-700 block mb-1">IP Protection</strong>
                    <span className="text-gray-600 text-sm leading-relaxed">
                      Advise on IP protection framework and strategy.
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-brand-700 block mb-1">Litigation & Dispute Resolution</strong>
                    <span className="text-gray-600 text-sm leading-relaxed">
                      Manage all disputes, regulatory inquiries, and litigation matters, coordinating with external counsel when necessary.
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-brand-700 block mb-1">Team Leadership</strong>
                    <span className="text-gray-600 text-sm leading-relaxed">
                      Develop and mentor an in-house legal team, fostering a strong culture of compliance and ethical conduct.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recruitment & Training */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h3 className="text-3xl font-bold text-brand-700 mb-4 text-center">
              Recruitment & Training
            </h3>
            <div className="card max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h4 className="text-2xl font-bold text-brand-700 mb-2">Grow Your Legal Team — With Support</h4>
                <p className="text-brand-700">
                  Need to recruit or train your in-house legal team? We support you with:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-brand-50 rounded-lg p-6 text-center">
                  <h5 className="font-semibold text-brand-700 mb-2">Hiring Guidance</h5>
                  <p className="text-sm text-gray-600">Expert support for legal roles</p>
                </div>
                <div className="bg-brand-50 rounded-lg p-6 text-center">
                  <h5 className="font-semibold text-brand-700 mb-2">Onboarding</h5>
                  <p className="text-sm text-gray-600">Training frameworks & workshops</p>
                </div>
                <div className="bg-brand-50 rounded-lg p-6 text-center">
                  <h5 className="font-semibold text-brand-700 mb-2">Operations</h5>
                  <p className="text-sm text-gray-600">Contract management best practices</p>
                </div>
              </div>

              <div className="text-center">
                <Link href="/contact" className="btn btn-primary-beige px-10">
                  Get a Quote
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
