'use client'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { CONTACT_INFO } from '@/lib/constants'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-primary-900 mb-8">Privacy Policy</h1>

            <div className="card space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                <p className="text-gray-700 mb-2">
                  We collect the following information:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Personal information (name, email, phone number)</li>
                  <li>KYC verification data</li>
                  <li>Uploaded documents and contracts</li>
                  <li>Payment information (processed securely through Paystack)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-700">
                  We use your information to provide contract review services, process payments, verify identity,
                  and communicate with you about your contracts. We do not share your information with third parties
                  except as necessary to provide our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
                <p className="text-gray-700">
                  We use encrypted storage and secure authentication to protect your data. All documents are stored
                  securely and are only accessible to you and the assigned lawyer.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Document Access</h2>
                <p className="text-gray-700">
                  Your uploaded contracts are accessible only to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>You (the account owner)</li>
                  <li>The assigned licensed lawyer</li>
                  <li>Platform administrators (for support purposes only)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                <p className="text-gray-700">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Access your personal data</li>
                  <li>Delete your uploaded documents</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
                <p className="text-gray-700">
                  If you have questions about this Privacy Policy, please contact us at{' '}
                  <a href={`mailto:${CONTACT_INFO.email}`} className="text-primary-600 hover:text-primary-700 underline">
                    {CONTACT_INFO.email}
                  </a>
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
