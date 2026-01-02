'use client'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { Scale, Target, Users, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Navbar />

      <main className="flex-1 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Scale className="h-16 w-16 text-gold-500 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              About LawTech NG
            </h1>
            <p className="text-xl text-gray-200 font-medium">
              Connecting clients with licensed Nigerian lawyers for professional contract review
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card mb-8 bg-primary-800 border-primary-700"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-gray-100 mb-4 leading-relaxed text-base">
              LawTech NG was founded to make professional legal contract review accessible to individuals,
              startups, SMEs, and companies across Nigeria. We believe that everyone should have access to
              quality legal services without the need to hire a full-time lawyer.
            </p>
            <p className="text-gray-100 leading-relaxed text-base">
              Our platform facilitates the connection between clients and licensed Nigerian lawyers,
              ensuring that all contract reviews are performed by qualified legal professionals.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card mb-8 bg-primary-800 border-primary-700"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Our Commitment</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <Award className="h-6 w-6 text-gold-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-white mb-2 text-lg">Licensed Lawyers Only</h3>
                  <p className="text-gray-200 leading-relaxed">
                    All contract reviews are performed exclusively by licensed Nigerian lawyers.
                    No AI or automation is used for legal review.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Target className="h-6 w-6 text-gold-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-white mb-2 text-lg">Quality Assurance</h3>
                  <p className="text-gray-200 leading-relaxed">
                    We maintain high standards for all reviews and ensure timely delivery of reviewed documents.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="h-6 w-6 text-gold-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-white mb-2 text-lg">Client-Focused</h3>
                  <p className="text-gray-200 leading-relaxed">
                    We prioritize our clients' needs and provide transparent, secure, and efficient services.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="card bg-primary-900 border-primary-700"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Legal Disclaimer</h2>
            <p className="text-gray-200 mb-4 leading-relaxed text-base">
              LawTech NG is a platform that facilitates contract review services. All reviews are performed
              by licensed Nigerian lawyers. This service is not a substitute for comprehensive legal
              representation or legal advice for complex matters.
            </p>
            <p className="text-gray-200 leading-relaxed text-base">
              We do not use AI or automation for contract review. All legal analysis is performed by
              qualified legal professionals.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
