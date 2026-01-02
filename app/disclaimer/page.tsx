'use client'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <h1 className="text-4xl font-bold text-primary-900">Legal Disclaimer</h1>
            </div>

            <div className="card space-y-6 bg-yellow-50 border-yellow-200">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Important Notice</h2>
                <p className="text-gray-700 mb-4">
                  LawTech NG is a platform that facilitates contract review services. This service is designed
                  to connect clients with licensed Nigerian lawyers for professional contract review.
                </p>
                <p className="text-gray-700">
                  <strong>All contract reviews are performed exclusively by licensed Nigerian lawyers.</strong>
                  We do not use artificial intelligence (AI) or automation for contract review. Our platform
                  only facilitates the workflow, payment processing, and document handling.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Not Legal Advice</h2>
                <p className="text-gray-700">
                  This service is not a substitute for comprehensive legal representation or legal advice for
                  complex matters. Contract review services are limited to the analysis of the documents you
                  provide and do not constitute ongoing legal representation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">AI Usage</h2>
                <p className="text-gray-700">
                  Artificial intelligence is used <strong>ONLY</strong> for:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                  <li>FAQ chatbot assistance</li>
                  <li>Onboarding guidance</li>
                </ul>
                <p className="text-gray-700 mt-4">
                  <strong>AI is NOT used for contract review, legal analysis, or any legal advice.</strong>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
                <p className="text-gray-700">
                  While we ensure that all reviews are performed by licensed lawyers, LawTech NG is not responsible
                  for the specific legal opinions or recommendations provided by individual lawyers. The platform
                  serves as a facilitator and does not guarantee specific outcomes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Nigerian Law</h2>
                <p className="text-gray-700">
                  All services are provided in accordance with Nigerian law. Lawyers on our platform are licensed
                  to practice law in Nigeria.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
