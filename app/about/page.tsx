'use client'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { Star, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { StructuredData } from '@/components/StructuredData'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <Star className="h-16 w-16 text-brand-700 mx-auto mb-6" fill="currentColor" />
            <h1 className="text-4xl md:text-5xl font-bold text-brand-700 mb-6">
              Built for Tech, Fintech & Modern Legal Teams
            </h1>
            <div className="w-24 h-1 bg-brand-600 mx-auto mb-8"></div>
            <div className="max-w-4xl mx-auto space-y-6">
              <p className="text-lg md:text-xl text-brand-700 leading-relaxed">
                Legalease was created to solve a real problem: legal teams and founders burdened by recurring
                contract reviews and operational legal work while strategic priorities wait on the sidelines. We
                combine domain expertise in fintech and technology with a flexible delivery model that feels like
                an extension of your team, not a traditional law firm.
              </p>
              <p className="text-lg md:text-xl text-brand-700 leading-relaxed">
                We value clarity, responsiveness, and deep industry knowledge — because legal should
                accelerate your business, not slow it down.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24 bg-brand-50 rounded-2xl p-8 md:p-12 shadow-sm border border-brand-100"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-4 block relative h-[400px] w-full rounded-xl overflow-hidden shadow-lg xl:h-[500px]">
                <Image
                  src="/founder.jpg"
                  alt="Ayobami Omisakin - Founder"
                  fill
                  className="object-cover object-top"
                />
              </div>

              <div className="lg:col-span-8">
                <h2 className="text-3xl md:text-4xl font-bold text-brand-700 mb-2">
                  Ayobami Omisakin
                </h2>
                <h3 className="text-xl text-brand-600 font-semibold mb-6">Founder & Managing Partner</h3>
                <div className="w-16 h-1 bg-brand-600 mb-8"></div>
                
                <div className="space-y-6 text-lg text-brand-700 leading-relaxed">
                  <p>
                    Ayobami Omisakin is a commercial and transactional lawyer with over ten years experience advising technology and financial services companies on complex commercial transactions, enterprise contracts and cross-border deals.
                  </p>
                  <p>
                    He has supported fintech and technology companies while working in law firms and served as in-house counsel at two of Africa&apos;s most prominent technology unicorns, Interswitch and Moniepoint, where he operated as legal partner to commercial, product, finance and executive teams across Nigeria, the United Kingdom, the United States and East Africa. In those roles, he carried full ownership of the legal cycle for enterprise SaaS and software licensing negotiations, payment infrastructure agreements, data protection compliance, M&A transactions and structured debt financings across a transaction range of USD 2 million to USD 200 million.
                  </p>
                  <p>
                    His transactional experience spans the full commercial lifecycle, from negotiating and closing enterprise software agreements with global technology vendors, to advising on acquisitions, joint ventures and public-private partnerships across multiple jurisdictions. He has advised founders at early-stage companies and C-suite executives at some of the fastest-growing businesses on the continent, bringing the same rigour and commercial judgment to each engagement.
                  </p>
                  <p className="font-medium text-brand-800 bg-white p-6 rounded-lg border border-brand-100 shadow-sm">
                    Ayobami founded Legalease to make that standard of legal expertise accessible to technology and finance companies at every stage of growth — delivering contract review, fractional general counsel services, legal function advisory, and recruitment and training support on terms that reflect the way modern businesses actually operate.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card mb-12 max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-brand-700 mb-6">Our Services</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Contract review for NDAs, SLAs, MSAs, service agreements, and key operational contracts
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Fractional general counsel — compliance, risk, governance, and strategic advisory
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  In-house legal team recruitment & training
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Transparent pricing, reliable delivery, secure communication
                </p>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/services"
              className="btn btn-primary-beige text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Explore Our Services
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
