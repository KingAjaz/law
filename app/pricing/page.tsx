'use client'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
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

          {/* Contract Review Plans */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h3 className="text-3xl font-bold text-brand-700 mb-8 text-center">
              Contract Review Plans
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* NDA Review */}
              <div className="card">
                <h4 className="text-xl font-bold text-brand-700 mb-4">NDA Review</h4>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-brand-700">NGN60,000</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-brand-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-brand-700 text-sm">2 reviews</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-brand-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-brand-700 text-sm">30-min virtual review call with counterparty</span>
                  </li>
                </ul>
                <Link href="/signup" className="btn btn-primary-beige w-full text-center">
                  Get Started
                </Link>
              </div>

              {/* SLA and Service Agreement Reviews */}
              <div className="card border-2 border-brand-600">
                <div className="badge badge-info mb-4 mx-auto w-fit">Popular</div>
                <h4 className="text-xl font-bold text-brand-700 mb-4">SLA and Service Agreement Reviews</h4>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-brand-700">NGN100,000</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-brand-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-brand-700 text-sm">2 reviews</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-brand-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-brand-700 text-sm">30-min virtual review call with counterparty</span>
                  </li>
                </ul>
                <Link href="/signup" className="btn btn-primary-beige w-full text-center">
                  Get Started
                </Link>
              </div>

              {/* Tech MSAs and Order Forms */}
              <div className="card">
                <h4 className="text-xl font-bold text-brand-700 mb-4">Tech MSAs and Order Forms</h4>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-brand-700">NGN150,000</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-brand-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-brand-700 text-sm">2 reviews</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-brand-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-brand-700 text-sm">1-hour virtual review call with counterparty</span>
                  </li>
                </ul>
                <Link href="/signup" className="btn btn-primary-beige w-full text-center">
                  Get Started
                </Link>
              </div>
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
              Fractional GC Plans
            </h3>
            <div className="card max-w-4xl mx-auto">
              <h4 className="text-2xl font-bold text-brand-700 mb-4">Half-Yearly/Annual Support</h4>
              <div className="mb-6">
                <span className="text-3xl font-bold text-brand-700">NGN18,000</span>
                <span className="text-brand-700 ml-2">per hour</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-brand-700 text-sm">
                    <strong>Legal Advisory & Strategy:</strong> Provide proactive, sound, and pragmatic legal advice
                    to the CEO, Board of Directors, and all internal departments on a wide range of
                    legal and regulatory matters.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-brand-700 text-sm">
                    <strong>Contract Management:</strong> Draft, review, and negotiate commercial agreements, including vendor contracts, partnership agreements, licensing agreements, API agreements, master services agreements and terms of service.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-brand-700 text-sm">
                    <strong>Product Development Support:</strong> Partner with product and engineering teams to ensure new products and services (e.g., lending, payments, etc.) are structured in line with regulatory expectations from the outset.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-brand-700 text-sm">
                    <strong>Risk Management:</strong> Identify potential legal and regulatory risks, developing strategies and internal controls to mitigate exposure and protect the company's interests.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-brand-700 text-sm">
                    <strong>Data Privacy:</strong> Advise on data protection and security issues, ensuring compliance with the Nigeria Data Protection Act (NDPA).
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-brand-700 text-sm">
                    <strong>IP:</strong> Advise on IP protection framework.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-brand-700 text-sm">
                    <strong>Litigation & Dispute Resolution:</strong> Manage all disputes, regulatory inquiries, and litigation matters, coordinating with external counsel when necessary.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-brand-700 text-sm">
                    <strong>Team Leadership:</strong> Develop and mentor an in-house legal team, fostering a strong culture of compliance and ethical conduct across the organisation.
                  </span>
                </li>
              </ul>
              <Link href="/signup" className="btn btn-primary-beige w-full text-center mt-6">
                Get Started
              </Link>
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
              <h4 className="text-2xl font-bold text-brand-700 mb-4">Grow Your Legal Team — With Support</h4>
              <p className="text-brand-700 mb-6">
                Need to recruit or train your in-house legal team? We support you with:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-brand-700 text-sm">Hiring guidance for legal roles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-brand-700 text-sm">Onboarding and training frameworks</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-brand-700 text-sm">Practical workshops for contract management and legal operations</span>
                </li>
              </ul>
              <div className="mb-6">
                <span className="text-2xl font-bold text-brand-700">Customized per request</span>
              </div>
              <Link href="/contact" className="btn btn-primary-beige w-full text-center">
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
