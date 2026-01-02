'use client'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { FileText, Briefcase, Handshake, Building2 } from 'lucide-react'

export default function ServicesPage() {
  const services = [
    {
      icon: FileText,
      title: 'Employment Contracts',
      description: 'Review employment agreements, non-disclosure agreements, and employment terms.',
    },
    {
      icon: Briefcase,
      title: 'Business Contracts',
      description: 'Review partnership agreements, service contracts, and vendor agreements.',
    },
    {
      icon: Handshake,
      title: 'Commercial Agreements',
      description: 'Review sales agreements, distribution contracts, and licensing agreements.',
    },
    {
      icon: Building2,
      title: 'Corporate Documents',
      description: 'Review shareholder agreements, board resolutions, and corporate governance documents.',
    },
  ]

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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Services
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto font-medium">
              Professional contract review services by licensed Nigerian lawyers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {services.map((service, index) => {
              const IconComponent = service.icon
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card bg-primary-800 border-primary-700 hover:border-gold-600 hover:shadow-xl transition-all"
                >
                  <IconComponent className="h-12 w-12 text-gold-500 mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
                  <p className="text-gray-200 leading-relaxed">{service.description}</p>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="card bg-primary-900 border-primary-700"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Important Notice</h2>
            <p className="text-gray-200 mb-4 leading-relaxed text-base">
              All contract reviews on this platform are performed exclusively by licensed Nigerian lawyers.
              We do not use AI or automation for contract review. Our platform facilitates the connection
              between clients and licensed legal professionals.
            </p>
            <p className="text-gray-200 leading-relaxed text-base">
              This service is not a substitute for comprehensive legal representation. For complex legal
              matters, we recommend consulting with a lawyer directly.
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
