'use client'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { PRICING_TIERS } from '@/lib/constants'
import { Check } from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Navbar />

      <main className="flex-1 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="text-white">OUR</span>{' '}
              <span className="text-gradient">PRICING PLANS</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Choose the right plan for your contract review needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {Object.entries(PRICING_TIERS).map(([tier, details], index) => (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`card ${tier === 'standard' ? 'border-2 border-primary-600 scale-105' : ''}`}
              >
                {tier === 'standard' && (
                  <div className="badge badge-info mb-4 mx-auto w-fit">Most Popular</div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-white">{details.name}</h3>
                <p className="text-gray-400 mb-6 text-sm">{details.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    ₦{details.price.toLocaleString()}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">/review</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {details.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-primary-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`btn w-full text-center ${
                    tier === 'standard' ? 'btn-primary' : 'btn-outline'
                  }`}
                >
                  PURCHASE NOW
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="card bg-primary-900/20 border-primary-800/50 text-center"
          >
            <h2 className="text-2xl font-semibold mb-4 text-white">All Reviews by Licensed Lawyers</h2>
            <p className="text-gray-300">
              Every contract review is performed by a licensed Nigerian lawyer. No AI or automation is used
              for legal review. Our platform ensures quality, professional legal analysis.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
