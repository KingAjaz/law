'use client'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-primary-900 mb-8">Terms of Service</h1>

            <div className="card space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700">
                  By accessing and using LegalEase, you accept and agree to be bound by these Terms of Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
                <p className="text-gray-700">
                  LegalEase is a platform that facilitates contract review services. All contract reviews are
                  performed exclusively by licensed Nigerian lawyers. We do not use AI or automation for contract review.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
                <p className="text-gray-700">
                  Users are responsible for providing accurate information, completing KYC verification, and
                  ensuring uploaded documents are legitimate and authorized for review.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
                <p className="text-gray-700">
                  Payment is required before contract review begins. All payments are processed securely through Paystack.
                  Refund policies are handled on a case-by-case basis.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Legal Disclaimer</h2>
                <p className="text-gray-700">
                  This service is not a substitute for comprehensive legal representation. For complex legal matters,
                  we recommend consulting with a lawyer directly. All reviews are performed by licensed lawyers,
                  but the platform itself does not provide legal advice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
                <p className="text-gray-700">
                  LegalEase shall not be liable for any indirect, incidental, special, or consequential damages
                  arising from the use of our services.
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
