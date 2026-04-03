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
  // Features are managed in the table directly to match the precise PDF document types

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

            <div className="bg-white rounded-xl shadow-sm border border-brand-100 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-brand-50 border-b border-brand-100">
                    <th className="p-5 font-bold text-brand-800 w-1/5">Document Type</th>
                    <th className="p-5 font-bold text-brand-800 w-1/5">Draft (Basic Plan)</th>
                    <th className="p-5 font-bold text-brand-800 w-1/5">Draft (Premium Plan)</th>
                    <th className="p-5 font-bold text-brand-800 w-1/5">Review (Basic Plan)</th>
                    <th className="p-5 font-bold text-brand-800 w-1/5">Review (Premium Plan)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Row 1: NDA */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 font-semibold text-brand-700">Non Disclosure Agreements</td>
                    <td className="p-5">
                      <div className="font-bold text-brand-700">₦100,000 ($61)</div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-brand-700">₦150,000 ($100)</div>
                      <div className="text-xs text-gray-500 mt-1">(24-hour response time)</div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-brand-700">₦90,000 ($60)</div>
                      <div className="text-xs text-gray-500 mt-1">(1 review)</div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-brand-700">₦180,000 ($120)</div>
                      <div className="text-xs text-gray-500 mt-1">(2 reviews + 30 mins call)</div>
                    </td>
                  </tr>

                  {/* Row 2: SLA */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 font-semibold text-brand-700">Service Level Agreements or Service Agreements</td>
                    <td className="p-5">
                      <div className="font-bold text-brand-700">₦200,000 ($133)</div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-brand-700">₦250,000 ($167)</div>
                      <div className="text-xs text-gray-500 mt-1">(24-hour response time)</div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-brand-700">₦180,000 ($120)</div>
                      <div className="text-xs text-gray-500 mt-1">(1 review)</div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-brand-700">₦360,000 ($240)</div>
                      <div className="text-xs text-gray-500 mt-1">(3 reviews + 30 mins call)</div>
                    </td>
                  </tr>

                  {/* Row 3: MSA */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 font-semibold text-brand-700">Master Service Agreements (SaaS) & Order Forms</td>
                    <td className="p-5">
                      <div className="font-bold text-brand-700">₦350,000 ($233)</div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-brand-700">₦400,000 ($267)</div>
                      <div className="text-xs text-gray-500 mt-1">(24-hour response time)</div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-brand-700">₦330,000 ($220)</div>
                      <div className="text-xs text-gray-500 mt-1">(1 review)</div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-brand-700">₦600,000 ($400)</div>
                      <div className="text-xs text-gray-500 mt-1">(3 reviews + 30 mins call)</div>
                    </td>
                  </tr>

                  {/* Row 4: Privacy Policy */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 font-semibold text-brand-700">Privacy Policy</td>
                    <td className="p-5">
                      <div className="font-bold text-brand-700">₦120,000 ($80)</div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-brand-700">₦200,000 ($133)</div>
                      <div className="text-xs text-gray-500 mt-1">(24-hour response time)</div>
                    </td>
                    <td className="p-5 text-gray-400 italic text-sm text-center">Not available</td>
                    <td className="p-5 text-gray-400 italic text-sm text-center">Not available</td>
                  </tr>

                  {/* Row 5: Terms & Conditions */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 font-semibold text-brand-700">Terms & Conditions (Website and Software Apps)</td>
                    <td className="p-5">
                      <div className="font-bold text-brand-700">₦500,000 ($333)</div>
                    </td>
                    <td className="p-5 text-gray-400 italic text-sm text-center">Not available</td>
                    <td className="p-5 text-gray-400 italic text-sm text-center">Not available</td>
                    <td className="p-5 text-gray-400 italic text-sm text-center">Not available</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Single universal CTA */}
            <div className="mt-10 text-center">
              <a
                href="#"
                onClick={(e) => handleGetStarted(e, 'lpo')}
                className="btn btn-primary-beige px-12 py-3 text-lg inline-flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </a>
              <p className="text-sm text-gray-500 mt-3">
                Select your service after signing up — no commitment required.
              </p>
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
