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
              Our Services
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



          {/* Legal Function Review Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-700 mb-4">
                Legal Function Review
              </h2>
              <div className="w-24 h-1 bg-brand-600 mx-auto mb-6"></div>
              <h3 className="text-xl md:text-2xl font-semibold text-brand-700 mb-4">
                Is Your In-House Legal Function Built to Scale?
              </h3>
              <p className="text-lg md:text-xl text-brand-700 leading-relaxed max-w-4xl mx-auto">
                A structured assessment of your legal team&apos;s operations — identifying gaps, inefficiencies, and opportunities so you can build a function that keeps pace with your business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
              {/* Essential Review */}
              <div className="bg-brand-50 rounded-xl p-8 border border-brand-100 flex flex-col h-full hover:shadow-md transition-shadow">
                <h4 className="text-2xl font-bold text-brand-700 mb-2">Essential Review</h4>
                <p className="text-brand-600 font-medium mb-6">For early-stage companies (Seed to Series A)</p>

                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Document review of existing contracts and legal policies</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">2–3 stakeholder interviews</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Assessment across 4 core areas: structure, workflows, risk exposure, and talent</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Prioritised action plan with timelines</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">1-hour advisory session to walk through findings</span>
                  </li>
                </ul>

                <div className="bg-white p-4 rounded-lg inline-block self-start border border-brand-100">
                  <span className="font-semibold text-brand-800">Timeline:</span> <span className="text-gray-700">2 weeks</span>
                </div>
              </div>

              {/* Comprehensive Assessment */}
              <div className="bg-white rounded-xl p-8 border border-brand-200 ring-1 ring-brand-100 flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-brand-100 text-brand-800 text-xs font-bold px-3 py-1 rounded-bl-lg">
                  PREMIUM
                </div>
                <h4 className="text-2xl font-bold text-brand-700 mb-2">Comprehensive Assessment</h4>
                <p className="text-brand-600 font-medium mb-6">For growth-stage companies (Series B and beyond)</p>

                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Full document review across legal and operational functions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">5–7 stakeholder interviews across legal and business teams</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Assessment across 7 areas: structure, headcount, workflows, contract management, regulatory posture, external counsel management, and investment/expansion readiness</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Full roadmap with phased milestones and executive summary</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">2-hour advisory session + 30-day follow-up check-in</span>
                  </li>
                </ul>

                <div className="bg-brand-50 p-4 rounded-lg inline-block self-start border border-brand-100">
                  <span className="font-semibold text-brand-800">Timeline:</span> <span className="text-gray-700">3–4 weeks</span>
                </div>
              </div>
            </div>


          </motion.div>

          {/* Fractional General Counsel Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-700 mb-4">
                Fractional General Counsel
              </h2>
              <div className="w-24 h-1 bg-brand-600 mx-auto mb-6"></div>
              <h3 className="text-xl md:text-2xl font-semibold text-brand-700 mb-4">
                Strategic Counsel — Fractional & Scalable
              </h3>
              <p className="text-lg md:text-xl text-brand-700 leading-relaxed max-w-4xl mx-auto">
                Not ready for a full-time GC? We provide flexible counsel.
              </p>
            </div>

            <div className="max-w-4xl mx-auto mb-12">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-brand-700 leading-relaxed text-base">
                    Regulatory advisory
                  </p>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-brand-700 leading-relaxed text-base">
                    Contract review
                  </p>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-brand-700 leading-relaxed text-base">
                    Legal strategy
                  </p>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-brand-700 leading-relaxed text-base">
                    Data and IP Protection
                  </p>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-brand-700 leading-relaxed text-base">
                    Cross-functional risk alignment
                  </p>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-brand-700 leading-relaxed text-base">
                    Legal operations
                  </p>
                </li>
              </ul>
            </div>
            

          </motion.div>

          {/* Recruitment & Training Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-700 mb-4">
                Recruitment & Training
              </h2>
              <div className="w-24 h-1 bg-brand-600 mx-auto mb-6"></div>
              <h3 className="text-xl md:text-2xl font-semibold text-brand-700 mb-4">
                Grow Your Legal Team — With Support
              </h3>
              <p className="text-lg md:text-xl text-brand-700 leading-relaxed max-w-4xl mx-auto">
                Need to recruit or train your in-house legal team? We support you with:
              </p>
            </div>

            <div className="max-w-4xl mx-auto mb-12">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-brand-700 leading-relaxed text-base">
                    Hiring guidance for legal roles
                  </p>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-brand-700 leading-relaxed text-base">
                    Onboarding and training frameworks
                  </p>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-brand-700 leading-relaxed text-base">
                    Practical workshops for contract management and legal operations
                  </p>
                </li>
              </ul>
            </div>
            
          </motion.div>

          {/* Single Universal CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              href="/contact"
              className="btn btn-primary-beige text-lg px-12 py-4 inline-flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              Reach out to discuss your needs — no commitment required.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
