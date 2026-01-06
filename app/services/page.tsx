'use client'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4">
              Services / Expertise
            </h1>
            <div className="w-24 h-1 bg-brand-600 mx-auto mb-6"></div>
            <h2 className="text-2xl md:text-3xl font-semibold text-brand-700 mb-4">
              On-Demand Contract Review
            </h2>
            <p className="text-xl md:text-2xl text-brand-700 font-medium mb-8">
              Precise Contract Reviews — Fast Turnaround
            </p>
            <p className="text-lg md:text-xl text-brand-700 leading-relaxed max-w-4xl mx-auto mb-8">
              We focus on the contracts that matter to your operations. We review operational agreements
              such as:
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-8"
          >
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  NDAs & Confidentiality Agreements
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Service Level Agreements (SLAs)
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Master Service Agreements (MSAs)
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Vendor & Partnership Agreements
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Other operational documents
                </p>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-lg md:text-xl text-brand-700 leading-relaxed max-w-4xl mx-auto mb-8">
              Our reviews give you clear summaries, risk flags, and concise advice — all delivered securely
              on your schedule.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/signup"
              className="btn btn-primary-beige text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Request Contract Review
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
