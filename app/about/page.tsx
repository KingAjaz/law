'use client'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { Star, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
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
            className="card mb-8"
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
